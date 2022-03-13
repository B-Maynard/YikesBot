const fs = require('fs');
const Discord = require('discord.js');
const config = require('./config.json');
const token = require('./token.json')
const data = require('./storage/data.json')

const client = new Discord.Client();
client.commands = new Discord.Collection();
var commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

var testMode = false;

// Can enable a test mode so that we don't intentionally break normal yikesbot.
// Just call the method with "test" as an argument (no hyphens or anything like that)
if (process.argv.length > 2) {
    if (process.argv[2] == "test") {
        testMode = true;
    }
}


for (const file of commandFiles) {
	const command = require(`./commands/${file}`);

	// set a new item in the Collection
	// with the key as the command name and the value as the exported module
	client.commands.set(command.name, command);
}

client.on('message', message => {
    var prefix = testMode ? "#" : config.prefix;

    if (message.author.bot) return;
    // Set up the bot to automatically add spoiler tags for things inside certain spoiler channels
    else if (!message.content.startsWith(prefix) && data.spoilerChannels[message.channel.id]) {
        message.delete()
        .then(msg => { return msg.channel.send(`${msg.author} says: \|\| ${msg.content} \|\|`) })
        .catch(console.error);
    } 
    else if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    if (!client.commands.has(command)) return;

    try {
        client.commands.get(command).execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply('there was an error trying to execute that command!');
    }

});

client.login(token.token);
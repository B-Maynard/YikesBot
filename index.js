const Commando = require('discord.js-commando');
const bot = new Commando.Client();

//Registers the different groups of commands
bot.registry.registerGroup('simple', 'Simple');
bot.registry.registerGroup('music', 'Music');
bot.registry.registerGroup('memes', 'Memes');
bot.registry.registerDefaults();
bot.registry.registerCommandsIn(__dirname + '/commands');


//List of servers the bot is currently apart of
global.servers = {};

bot.on('message', function(message) {
  if (message.content == "Hello") {
    //How to send a message with a mention to the author of the command
    message.channel.sendMessage('Hello ' + message.author + ', how are you?');
  }
});

bot.on('ready', function() {
  console.log("Ready");
})

bot.login(process.env.BOT_TOKEN);

//file reader
const fs = require('fs');

//Open userdata file
var userData = JSON.parse(fs.readFileSync('storage/userData.json', 'utf8'));

module.exports = {
	name: 'yikes',
	description: 'Give a yike to a user if there being yikes.',
	execute(message, args) {
        // If they didn't mention anyone, then we can't do anything
        if (!message.mentions.users.size) {
            return message.reply('You need to tag a user in order to use this command.');
        }

        // Attempt to grab the tagged user and also grab the value saved in the json for how many yikes they have
        const taggedUser = message.mentions.users.first();
        var taggedUsersYikes = 0;

        // YikesBot's userid
        if (taggedUser.id == '389625464144003083') {
            return message.channel.send(`Don't fucking try to yikes me bitch I'll kill you.`, {files:['../YikesBot/imgs/middlefinger.png']});
        }
        
        //Find if the user has a value in the storage file
        if (!userData.users[taggedUser.id]) userData.users[taggedUser.id] = {
            yikes: 0
        }

        //Increment the users yikes counter
        userData.users[taggedUser.id].yikes++;

        //Write the yikes counter to the file
        fs.writeFile('storage/userData.json', JSON.stringify(userData), (err) => {
            if (err) console.err(err);
        });

        message.channel.send(`${taggedUser.username} has received 1 yike. They now have ${userData.users[taggedUser.id].yikes} yike(s).`, {files:['../YikesBot/imgs/yikes.JPG']});
	},
};
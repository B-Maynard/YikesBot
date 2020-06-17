//file reader
const fs = require('fs');

//Open annoy file
var canAnnoyJson = JSON.parse(fs.readFileSync('storage/annoy.json', 'utf8'));

module.exports = {
	name: 'annoy',
	description: 'Annoy the tagged user until they respond with the !stop command',
	execute(message, args) {

        if ((message.author.id == '189200564020707328' || message.author.id == '150043535884681216') && args[0] === 'false') {
            // Hard set it to false so that it can't be run
            canAnnoyJson["canAnnoy"] = 0;
            fs.writeFile('storage/annoy.json', JSON.stringify(canAnnoyJson), (err) => {
                if (err) console.err(err);
            });
            return message.channel.send('Annoy set to false');
        }
        else if ((message.author.id == '189200564020707328' || message.author.id == '150043535884681216') && args[0] === 'true') {
            // Hard set it to true so that it can be run
            canAnnoyJson["canAnnoy"] = 1;
            fs.writeFile('storage/annoy.json', JSON.stringify(canAnnoyJson), (err) => {
                if (err) console.err(err);
            });
            return message.channel.send('Annoy set to true');
        }

        // If they didn't mention anyone, then we can't do anything
        if (!message.mentions.users.size) {
            return message.reply('You need to tag a user in order to use this command.');
        }

        // Attempt to grab the tagged user
        const taggedUser = message.mentions.users.first();
        var userID = taggedUser.id.toString().trim();

        var authorID = message.author.id.toString().trim();

        // YikesBot's userid
        if (taggedUser.id == '389625464144003083') {
            return message.channel.send(`Don't fucking try to annoy me bitch I'll kill you.`, {files:['../YikesBot/imgs/middlefinger.png']});
        }

        // If you can't run the annoy command atm, just return. We don't want to have to run the command for multiple people at the same time
        if (canAnnoyJson["canAnnoy"] == 0) return;

        // Set the annoy info to be false, so that no one can run the command while it's currently running
        canAnnoyJson["canAnnoy"] = 0;
        fs.writeFile('storage/annoy.json', JSON.stringify(canAnnoyJson), (err) => {
            if (err) console.err(err);
        });

        // Grab the timestamp of the message so we can determine if the user trying to stop the annoy did so after the command was first ran
        var messageTimestamp = message.createdTimestamp;



        // Start an interval that will run every 2 seconds
        var interval = setInterval(function() {

            // Need to implement some failsafes, so that we can stop the command if the tagged user doesn't respond fast enough
            // Calvin or I can stop the command regardless of who's tagged. Otherwise, the creator or the taggee need to stop the command
            var baileyMessage = message.guild.members.find(u => u.id == '189200564020707328').lastMessage != null
                                && message.guild.members.find(u => u.id == '189200564020707328').lastMessage.createdTimestamp > messageTimestamp 
                                ? message.guild.members.find(u => u.id == '189200564020707328').lastMessage.content 
                                : "";
            var calvinMessage = message.guild.members.find(u => u.id == '150043535884681216').lastMessage != null
                                && message.guild.members.find(u => u.id == '150043535884681216').lastMessage.createdTimestamp > messageTimestamp 
                                ? message.guild.members.find(u => u.id == '150043535884681216').lastMessage.content 
                                : "";
            var userMessage = message.guild.members.find(u => u.id == userID).lastMessage != null
                                && message.guild.members.find(u => u.id == userID).lastMessage.createdTimestamp > messageTimestamp
                                ? message.guild.members.find(u => u.id == userID).lastMessage.content 
                                : "";
            var authorMessage = message.guild.members.find(u => u.id == authorID).lastMessage != null
                                && message.guild.members.find(u => u.id == authorID).lastMessage.createdTimestamp > messageTimestamp
                                ? message.guild.members.find(u => u.id == authorID).lastMessage.content 
                                : "";

            // Search the content of the message using regex to see if the message contains the stop command. (Format for regex: /!stop/ is the matching case, i is 
            // specifying case insensitive)
            if (calvinMessage.search(/!stop/i) != -1 ||  baileyMessage.search(/!stop/i) != -1 || userMessage.search(/!stop/i) != -1 || authorMessage.search(/!stop/i) != -1) {
                clearInterval(interval);
                
                // If the stop command was run, set the annoy json back to true
                canAnnoyJson["canAnnoy"] = 1;
                fs.writeFile('storage/annoy.json', JSON.stringify(canAnnoyJson), (err) => {
                    if (err) console.err(err);
                });

                return;
            }

            // Send the annoying message
            message.channel.send(`${taggedUser}, come play games`);
        }, 2000);
	},
};
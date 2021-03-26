const Util = require("../utils/util.js");
const fs = require('fs');

var userData = JSON.parse(fs.readFileSync('storage/userData.json', 'utf8'));

module.exports = {
	name: 'bloons',
	description: 'Add your bloons score to the leaderboard.',
	execute(message, args) {

        var user = message.author;
        var url = "";
        var users = message.guild.members;

        if (message.attachments.size != 1 && args.length != 1) return message.channel.send('You need to supply 1 screenshot of your bloons score. You can do the entire screen or just the "Game Over" dialog box.');

        if (!args[0]) {
            // I don't really like doing it this way, but whatever. it will only ever allow you to have 1 attachment so just get the url from the item.
            message.attachments.forEach(function(item) {
                url = item.url;
            });

            var roundCount = Util.convertBloonsImageToRoundCount(url);
            roundCount = roundCount.replace(/\D/g, "");

            if (isNaN(roundCount)) {
                return message.channel.send("There was an error parsing data from the image provided.");
            }

            //Find if the user has a value in the storage file
            if (!userData.users[user.id]) {
                userData.users[user.id] = {
                    currentBloonScore: roundCount
                }
            }
            // If the user doesn't have a current score at all, just add whatever they give
            else if (!userData.users[user.id].currentBloonScore) {
                userData.users[user.id].currentBloonScore = roundCount;
            }
            // Otherwise, check to make sure they're not trying to put in a lower score
            else if (userData.users[user.id].currentBloonScore < roundCount) {
                userData.users[user.id].currentBloonScore = roundCount;
            }

            //Write the bloon score to the file
            fs.writeFile('storage/userData.json', JSON.stringify(userData), (err) => {
                if (err) console.err(err);
            });

            return message.channel.send("Scores updated! Run !bloons leaderboard to see your current standing!");
        }
        else if (args[0].toUpperCase() == 'LEADERBOARD') {
            var listOfBloonScores = [];
            var stringBuilder = "";
    
            // Get a list of all the bloons scores, keyed by user id
            Object.keys(userData.users).forEach(function(userID) {
                if (userData.users[userID].currentBloonScore)
                    listOfBloonScores.push({
                        "id": userID,
                        "score": userData.users[userID].currentBloonScore
                    });
            });
    
            // Sort the list by score
            listOfBloonScores.sort((a,b) => (a.score < b.score ? 1 : -1));
    
            // Build out the string with the current leaderboard.
            // If we can't find the user in the server anymore, then we'll just skip them. (they must not matter much)
            var count = 1;
            listOfBloonScores.forEach(function(item) {
                var username = users.find(user => user.id == item.id);
                if (username) {
                    stringBuilder += count + ": " + username + " (" + item.score + ")\n";
                    count++;
                }
            });
    
            return message.channel.send(`CURRENT BLOONS LEADERBOARD`, {embed: {
                description: stringBuilder
            }});
        }
        else {
            return message.channel.send("Invalid arguments.");
        }
	},
};
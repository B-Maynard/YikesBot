const fs = require('fs');

module.exports = {
	name: 'spoilers',
	description: 'Sets/unsets a text server to a spoiler server',
	execute(message, args) {
        var baileyID = '189200564020707328';

		if (message.author.id != baileyID) return message.channel.send("You do not have permissions to use this command.");

		if (args.length != 1) return message.channel.send("Invalid arguments. !spoilers [true/false] to set/unset a server for spoilers.");

		var dataFile = JSON.parse(fs.readFileSync('storage/data.json', 'utf8'));

		// Remove the item if that's what we're trying to do
		if (args[0].toUpperCase() == "FALSE") {
			try {
				delete dataFile.spoilerChannels[message.channel.id];

				fs.writeFile('storage/data.json', JSON.stringify(dataFile), (err) => {
					if (err) console.err(err);
				});

				return message.channel.send("Spoilers set to false for server.");
			}
			catch(err) {
				return message.channel.send("Could not remove channel from spoilers.");
			}
		}
		else if (args[0].toUpperCase() == "TRUE") {
			if (!dataFile.spoilerChannels[message.channel.id]) {
				dataFile.spoilerChannels[message.channel.id] = message.channel.id;
				fs.writeFile('storage/data.json', JSON.stringify(dataFile), (err) => {
					if (err) console.err(err);
				});
				return message.channel.send("Spoilers set to true for server.");
			}
			else
				return message.channel.send("Server spoilers already set to true.");
		}
	},
};
const Util = require("../utils/util.js");

module.exports = {
	name: 'zombies',
	description: 'Gets the current records for whatever zombie game/map youd like. Parameters: zombie-game-appreviation, name-of-map-with-hyphens',
	execute(message, args) {
		
		if (args.length != 2) return message.channel.send('Incorrect amount of arguments.  Parameters required: zombie-game-appreviation (bocw), name-of-map-with-hyphens (die-maschine)');

		var jsonObject = Util.getZombiesWorldRecordsData(args[0], args[1]);
		try {
			var result = JSON.parse(jsonObject);

			// we have the data returning in the result object as a dictionary
			// we need to just send it back to the channel in a nice format of some sort, probably usingthe embeds below
			var stringBuilder = "";
			var keyNames = Object.keys(result);

			for (var i = 0; i < keyNames.length; i++) {
				// Add the key name to the start of the string
				stringBuilder += keyNames[i] + ": \n";
				// Loop through all the entries in the current list, and add a new line at the end.
				for (var j = 0; j < result[keyNames[i]][0].length; j++) {
					stringBuilder += result[keyNames[i]][0][j] + "\n";

					// If this is the last item in the list, then add another new line character to separate the 
					// next list
					if (j == result[keyNames[i]][0].length - 1) {
						stringBuilder += "\n";
					}
				}
			}

			return message.channel.send(`Current Leaderboard for ${args[1]}`, {embed: {
				description: stringBuilder
			}});
		}
		catch (err) {
			return message.channel.send('Could not find the specified info given the parameters.');
		}
        
	},
};
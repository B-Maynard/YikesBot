//file reader
const fs = require('fs');

module.exports = {
	name: 'serverstatus',
	description: 'serverstatus',
	execute(message, args) {
        //Open annoy file
        var dataFile = JSON.parse(fs.readFileSync('storage/data.json', 'utf8'));

        // Input validation
		if (message.author.id != "189200564020707328") return message.channel.send("You cannot use this command.");

        // Make sure that we're only using valid arguments
        if (args.length != 0 && args.length != 2) return message.channel.send("Invalid arguments. !serverstatus [nameOfServer] [true/false], or !serverstatus to see status of current servers.");

        if (args.length == 2) {

            // Do some input validation
            if (args[1] != 1 && args[1] != 0 && args[1].toUpperCase() != "TRUE" && args[1].toUpperCase() != "FALSE") return message.channel.send("Invalid arguments. Can only set server active to true/false.");

            // Change true/false to 1/0
            switch(args[1].toUpperCase()) {
                case "TRUE":
                    args[1] = 1;
                    break;
                case "FALSE":
                    args[1] = 0;
                    break;
            }

            // Remove the item if that's what we're trying to do
            if (args[0].toUpperCase() == "RM") {
                try {
                    delete dataFile.activeservers[args[1]];

                    fs.writeFile('storage/data.json', JSON.stringify(dataFile), (err) => {
                        if (err) console.err(err);
                    });

                    return message.channel.send("Entry deleted.");
                }
                catch(err) {
                    return message.channel.send("Could not delete specified entry.");
                }
            }

            //Find if the user has a value in the storage file
            if (!dataFile.activeservers[args[0]]) {
                dataFile.activeservers[args[0]] = {
                    active: args[1]
                }
            }
            // If the user doesn't have a current score at all, just add whatever they give
            else {
                dataFile.activeservers[args[0]] = {
                    active: args[1]
                }
            }

            fs.writeFile('storage/data.json', JSON.stringify(dataFile), (err) => {
                if (err) console.err(err);
            });

            return message.channel.send("Updated list. Use !serverstatus to see current list of servers. Make sure to update the data.json file for the script needed to run the server, and add in the CD line from the notes into the script file.");
        }
        else {
            var stringBuilder = "";
    
            Object.keys(dataFile.activeservers).forEach(function(server) {
                stringBuilder += server + " - Active: " + dataFile.activeservers[server].active + "\n";
            });
            
    
            return message.channel.send(`Current Active Servers`, {embed: {
                description: stringBuilder
            }});
        }
        
	},
};
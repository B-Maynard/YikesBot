//file reader
const fs = require('fs');
const shell = require('shelljs');
const path = require('path');
const { VT, VTexec } = require('open-term');

/*
*       NEED TO HAVE XTERM INSTALLED FOR THIS TO WORK PROPERLY
*       PUT THIS LINE IN THE TOP OF THE SCRIPT THAT STARTS THE SERVER: cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd
*/

module.exports = {
	name: 'serverstart',
	description: 'Starts up a specific server thats currently active.',
	execute(message, args) {
        //Open annoy file

        return message.channel.send("No longer a viable command.");
        // var dataFile = JSON.parse(fs.readFileSync('storage/data.json', 'utf8'));
		
        // // Make sure that we're only using valid arguments
        // if (args.length != 0 && args.length != 1) return message.channel.send("Invalid arguments. !serverstart [serverName] to start a server. Run !serverstart to see what servers are available.");

        // if (args.length == 1) {
        //     // Determine that the server actually exists and a script is attached to it
        //     console.log(args[0]);
        //     if (dataFile.activeservers[args[0]] && (dataFile.activeservers[args[0]].active == "1" || dataFile.activeservers[args[0]].active == 1)) {
        //         if (dataFile.activeservers[args[0]].script) {
        //             var serverScriptFileName = path.basename(dataFile.activeservers[args[0]].script);

        //             // This script will check to see if the script supplied is already running or not.
        //             var scriptFilesRunning = shell.exec('utils/checkRunningScripts.sh ' + serverScriptFileName);
    
        //             if (scriptFilesRunning.includes(serverScriptFileName))
        //                 return message.channel.send("Server already running/starting up.");
        //             else {
        //                 VT.linux.xterm(dataFile.activeservers[args[0]].script);
        //             }
        //         }
        //         else {
        //             return message.channel.send("There is no script attached to the server.");
        //         }
        //     }
        //     // If the server isn't a thing, return
        //     else {
        //         return message.channel.send("Server not found.");
        //     }
        // }
        // else {
        //     var stringBuilder = "";
    
        //     Object.keys(dataFile.activeservers).forEach(function(server) {
        //         if (dataFile.activeservers[server].active == "1") {
        //             stringBuilder += server + "\n";
        //         }
        //     });
    
        //     if (stringBuilder) {
        //         return message.channel.send('Current ready servers', {embed: {
        //             description: stringBuilder
        //         }});
        //     }
        //     else {
        //         return message.channel.send('All servers are currently running/inactive.');
        //     }
        // }
	},
};
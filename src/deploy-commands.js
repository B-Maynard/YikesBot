const { REST, Routes } = require('discord.js');
const config  = require('./config.json');
const botUtil = require('./util');

const args = process.argv.slice(2);

const clientId = args[0] === "test" ? config.test.clientId : config.prod.clientId;
const token = args[0] === "test" ? config.test.token : config.prod.token;
const guildId = args[0] === "test" ? config.test.guildId : config.prod.guildId;

const commands = [];


let commandObjs = botUtil.getAllCommandsAndFilepaths();

commandObjs.forEach(obj => {
	const command = require(obj.path);
	if ('data' in command && 'execute' in command) {
		commands.push(command.data.toJSON());
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
});

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();
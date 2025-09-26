const { SlashCommandBuilder } = require('discord.js');
const shopUtil = require('../../helpers/shopHelpers');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('shop')
		.setDescription('General shop commands')
		.addStringOption(option => 
			option.setName('balance')
				.setDescription('Displays the current users balance')
				.setRequired(false)
		)
		.addUserOption(option => 
			option.setName('target')
				.setDescription('A user to target')
				.setRequired(false)
		),

	async execute(interaction) {
		
		let user = interaction.options.getUser('target') || interaction.user;
		let balanceOption = interaction.options.getString('balance');

		if (balanceOption) {
			return interaction.reply(`${user.tag} has ${shopUtil.getBalance(user.id)}`);
		}
	},
};
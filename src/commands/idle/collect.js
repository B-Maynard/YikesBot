const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const shopUtil = require('../../helpers/shopHelpers');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('collect')
		.setDescription('Collect your passive income'),
	async execute(interaction) {
		await interaction.deferReply();

		const yieldData = await shopUtil.calculateYield(interaction.user.id);
		if (!yieldData || yieldData === 0) {
			await shopUtil.addBalance(interaction.user.id, 0); // Initialize user if they don't exist
			return interaction.editReply("Your tracking has just started! Check back later.");
		}

		if (yieldData.earned > 0) {
			await shopUtil.addBalance(interaction.user.id, yieldData.earned);
			yieldData.user.last_collection = new Date();
			await yieldData.user.save();
		} else if (yieldData.secondsPassed === 0) {
			return interaction.editReply(`Tracking started! Wait a bit to collect your income.\n**Current Rate:** ${yieldData.newTotalRate}💰/sec`);
		} else {
			return interaction.editReply(`You haven't earned anything yet! Buy some items from the market, or go exploring.\n**Current Rate:** 0💰/sec`);
		}

		const embed = new EmbedBuilder()
			.setTitle('💰 Income Collected!')
			.setDescription(`You have collected **${yieldData.earned}💰**!\nTime elapsed: ${yieldData.secondsPassed} seconds.\n\n**Current Rate:** ${yieldData.newTotalRate}💰/sec`)
			.setColor(0x00FF00);

		return interaction.editReply({ embeds: [embed] });
	},
};

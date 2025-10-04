const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { BathroomEntry } = require('../../../db/saltsmandashboard/dbObjects');
const QuickChart = require('quickchart-js');

const validIdsForEntry = [
    "396342900683833344",
    "189200564020707328"
];

const validActions = [
    1,
    2
];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('potty')
		.setDescription('Log for saltsmans bathroom usage.')
        .addSubcommand(sub => 
            sub.setName('addentry')
                .setDescription('Adds an entry for a potty break.')
                .addIntegerOption(option =>
                    option.setName('action')
                        .setDescription('The type of potty you did.')
                        .setRequired(true)
                )
        )
        .addSubcommand(sub => 
            sub.setName('log')
                .setDescription('See the current potty log.')
        ),
	async execute(interaction) {
        let subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case "addentry":
                let interactionUserId = interaction.user.id;
                if (!validIdsForEntry.includes(interactionUserId.toString())) return interaction.reply("Only saltsman is allowed to use this.");
                let actionValue = interaction.options.getInteger('action');

                if (!validActions.includes(actionValue)) {
                    return interaction.reply("Only valid actions are 1 or 2.");
                }

                await BathroomEntry.create({ action: actionValue });

                return interaction.reply("Entry added to the log.");
        
            case "log":

                let bathroomEntries = await BathroomEntry.findAll();
                let pees = bathroomEntries?.filter(entry => entry?.dataValues?.action === 1) ?? [];
                let poos = bathroomEntries?.filter(entry => entry?.dataValues?.action === 2)  ?? [];

                const chart = new QuickChart();
                chart.setConfig({
                    type: 'bar',
                    data: {
                        labels: ['Pees', 'Poos'],
                        datasets: [{
                            label: 'Amount',
                            data: [pees.length, poos.length]
                        }]
                    }
                });

                const chartUrl = await chart.getShortUrl();

                const embed = new EmbedBuilder()
                    .setTitle('Potty Log')
                    .setURL(chartUrl)
                    .setImage(chartUrl)

                    return interaction.reply({embeds: [embed]});

            default:
                break;
        }
		
	},
};
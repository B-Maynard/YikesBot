const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ComponentType, MessageFlags } = require('discord.js');
const { Users, CurrencyShop } = require('../../../db/currencyshop/dbObjects');

const finalCrafts = {
	0: 'Arcane Core',
	1: 'Astral Engine',
	2: 'Wyrm Soul',
	3: 'Dragon Fire',
	4: 'Godly Core',
	5: 'The End'
};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('prestige')
		.setDescription('Reset your progress to reach the next tier of items!'),
	async execute(interaction) {
		await interaction.deferReply();
		
		const dbUser = await Users.findOne({ where: { user_id: interaction.user.id } });
		if (!dbUser) {
			return interaction.editReply('You do not have an account! Use `/market open` to start.');
		}

		const currentPrestige = dbUser.prestige;
		const requiredItemName = finalCrafts[currentPrestige];

		if (!requiredItemName) {
			return interaction.editReply('You have reached the maximum prestige level!');
		}

		const userItems = await dbUser.getItems();
		const hasRequired = userItems.find(inv => inv.item.name === requiredItemName && inv.amount > 0);

		if (!hasRequired) {
			return interaction.editReply(`You cannot prestige yet! You must craft **${requiredItemName}** first.`);
		}

		const embed = new EmbedBuilder()
			.setTitle('🌟 Ready to Prestige?')
			.setDescription(`You are about to advance to **Prestige ${currentPrestige + 1}**!\n\n**WARNING:** This will wipe your 💰 and all your items **EXCEPT** your **${requiredItemName}**, which you will keep as a permanent boost in the next tier.\n\nAre you sure you want to proceed?`)
			.setColor(0xFF0000);

		const confirmBtn = new ButtonBuilder()
			.setCustomId('prestige_confirm')
			.setLabel('PRESTIGE')
			.setStyle(ButtonStyle.Danger)
			.setEmoji('🌟');
		
		const cancelBtn = new ButtonBuilder()
			.setCustomId('prestige_cancel')
			.setLabel('Cancel')
			.setStyle(ButtonStyle.Secondary);

		const row = new ActionRowBuilder().addComponents(confirmBtn, cancelBtn);

		const message = await interaction.editReply({ embeds: [embed], components: [row] });

		const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000 });

		collector.on('collect', async i => {
			if (i.user.id !== interaction.user.id) {
				return i.reply({ content: 'This is not your prestige prompt!', flags: MessageFlags.Ephemeral });
			}

			if (i.customId === 'prestige_cancel') {
				await i.update({ content: 'Prestige cancelled.', embeds: [], components: [] });
			} else if (i.customId === 'prestige_confirm') {
				// Execute Prestige
				
				// 1. Wipe money
				dbUser.balance = 0;
				dbUser.last_collection = new Date(); // Reset clock
				dbUser.prestige += 1;
				await dbUser.save();

				// 2. Wipe inventory except required item
				for (const inv of userItems) {
					if (inv.item.name !== requiredItemName) {
						await inv.destroy();
					} else if (inv.amount > 1) {
						// If they crafted multiple, we just leave 1 and delete the rest, or let them keep all? 
						// Let's let them keep all of the final tier items they managed to grind!
					}
				}

				const successEmbed = new EmbedBuilder()
					.setTitle('🎉 Prestige Successful!')
					.setDescription(`Congratulations!\nYou are now **Prestige ${currentPrestige + 1}**.\nYour progress was reset, but you kept your **${requiredItemName}**!`)
					.setColor(0x00FF00);

				await i.update({ embeds: [successEmbed], components: [] });
			}
			collector.stop();
		});

		collector.on('end', collected => {
			if (message.editable && message.components.length > 0) {
				interaction.editReply({ components: [] }).catch(() => {});
			}
		});
	},
};

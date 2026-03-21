const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ComponentType, MessageFlags } = require('discord.js');
const { CurrencyShop, Users } = require('../../../db/currencyshop/dbObjects');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('craft')
		.setDescription('Combine items in the crafting pot to create higher tier artifacts'),
	async execute(interaction) {
		await interaction.deferReply();
		
		const dbUser = await Users.findOne({ where: { user_id: interaction.user.id } });
		if (!dbUser) {
			return interaction.editReply('You do not have an account! Use `/market open` to start.');
		}

		// Fetch user's actual inventory
		const userItems = await dbUser.getItems();
		if (userItems.length === 0) {
			return interaction.editReply('You have no items to craft with! Buy some from the `/market`.');
		}

		// Parse all recipes
		const allShopItems = await CurrencyShop.findAll();
		const availableRecipes = allShopItems
			.filter(item => item.recipe && item.prestige_tier <= dbUser.prestige)
			.map(item => ({
				result: item,
				ingredients: JSON.parse(item.recipe)
			}));

		let pot = {}; // Dictionary mapping item name to amount in pot, e.g. { "Mana Dust": 2 }
		
		const generateUI = async () => {
			// Find if pot matches exactly any recipe
			let matchedRecipe = null;
			for (const recipe of availableRecipes) {
				let isMatch = true;
				const ingredients = Object.keys(recipe.ingredients);
				const potItems = Object.keys(pot);
				
				if (ingredients.length !== potItems.length) continue;
				
				for (const ing of ingredients) {
					if (pot[ing] !== recipe.ingredients[ing]) {
						isMatch = false;
						break;
					}
				}
				if (isMatch) {
					matchedRecipe = recipe.result;
					break;
				}
			}

			// Embed description
			let potDesc = Object.entries(pot).map(([name, count]) => `${count}x ${name}`).join('\n');
			if (!potDesc) potDesc = "The pot is empty.\nSelect items below to add them!";

			const embed = new EmbedBuilder()
				.setTitle('⚗️ Crafting Pot')
				.setColor(matchedRecipe ? 0x00FF00 : 0xFFA500)
				.addFields(
					{ name: 'Pot Contents', value: potDesc },
					{ name: 'Status', value: matchedRecipe ? `Valid Recipe! You can craft **${matchedRecipe.name}**!` : "Invalid Recipe." }
				)
				.setFooter({ text: 'Select an item to add 1 to the pot.' });

			// Select Menu for Inventory
			const options = [];
			for (const inv of userItems) {
				const inPot = pot[inv.item.name] || 0;
				const available = inv.amount - inPot;
				if (available > 0) {
					options.push(
						new StringSelectMenuOptionBuilder()
							.setLabel(inv.item.name)
							.setDescription(`Available: ${available}`)
							.setValue(inv.item.name)
					);
				}
			}

			const components = [];
			if (options.length > 0) {
				// Discord max options is 25
				const selectMenu = new StringSelectMenuBuilder()
					.setCustomId('craft_select')
					.setPlaceholder('Add an item to the pot')
					.addOptions(options.slice(0, 25));
				components.push(new ActionRowBuilder().addComponents(selectMenu));
			}

			// Buttons
			const craftButton = new ButtonBuilder()
				.setCustomId('craft_confirm')
				.setLabel('Craft!')
				.setEmoji('⚒️')
				.setStyle(ButtonStyle.Success)
				.setDisabled(!matchedRecipe);

			const clearButton = new ButtonBuilder()
				.setCustomId('craft_clear')
				.setLabel('Clear Pot')
				.setStyle(ButtonStyle.Danger)
				.setDisabled(Object.keys(pot).length === 0);

			components.push(new ActionRowBuilder().addComponents(craftButton, clearButton));

			return { embeds: [embed], components, matchedRecipe };
		};

		const initialUI = await generateUI();
		const message = await interaction.editReply({ embeds: initialUI.embeds, components: initialUI.components });

		const collector = message.createMessageComponentCollector({ time: 120000 });

		collector.on('collect', async i => {
			if (i.user.id !== interaction.user.id) {
				return i.reply({ content: 'This crafting session is not yours!', flags: MessageFlags.Ephemeral });
			}

			if (i.customId === 'craft_select') {
				const selectedName = i.values[0];
				pot[selectedName] = (pot[selectedName] || 0) + 1;
				
				const ui = await generateUI();
				await i.update({ embeds: ui.embeds, components: ui.components });
			} 
			else if (i.customId === 'craft_clear') {
				pot = {};
				const ui = await generateUI();
				await i.update({ embeds: ui.embeds, components: ui.components });
			}
			else if (i.customId === 'craft_confirm') {
				// Verify again
				const ui = await generateUI();
				if (!ui.matchedRecipe) {
					return i.reply({ content: 'The recipe became invalid!', flags: MessageFlags.Ephemeral });
				}

				// Deduct items
				for (const [name, count] of Object.entries(pot)) {
					const invItem = userItems.find(u => u.item.name === name);
					for (let j = 0; j < count; j++) {
						await dbUser.removeItem(invItem.item);
					}
				}
				
				// Add crafted item
				await dbUser.addItem(ui.matchedRecipe);

				const successEmbed = new EmbedBuilder()
					.setTitle('🎉 Crafting Successful!')
					.setDescription(`You crafted **${ui.matchedRecipe.name}**!\nIt yields ${ui.matchedRecipe.yield}💰/sec.`)
					.setColor(0x00FF00);

				await i.update({ embeds: [successEmbed], components: [] });
				collector.stop();
			}
		});

		collector.on('end', collected => {
			// If it timed out without crafting successfully
			if (message.editable && message.components.length > 0) {
				interaction.editReply({ components: [] }).catch(() => {});
			}
		});
	},
};

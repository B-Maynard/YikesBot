const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, EmbedBuilder, ComponentType, codeBlock, MessageFlags, ButtonBuilder, ButtonStyle } = require('discord.js');
const shopUtil = require('../../helpers/shopHelpers');
const { CurrencyShop, Users } = require('../../../db/currencyshop/dbObjects');
const { Op } = require('sequelize');

async function handleShopOpen(interaction) {
	await interaction.deferReply();
	const shopItems = await CurrencyShop.findAll();

	let dbUser = await Users.findOne({ where: { user_id: interaction.user.id } });
	if (!dbUser) {
		dbUser = await shopUtil.addBalance(interaction.user.id, 0);
	}

	const generateEmbedAndComponents = async () => {
		const yieldData = await shopUtil.calculateYield(interaction.user.id);
		const balance = await shopUtil.getBalance(interaction.user.id);
		const inventoryItems = await dbUser.getItems();

		const buyableItems = shopItems.filter(i => i.cost >= 0 && i.prestige_tier <= dbUser.prestige && i.prestige_tier !== -1);
		const availableRecipes = shopItems.filter(i => i.recipe !== null && i.prestige_tier <= dbUser.prestige);

		const embed = new EmbedBuilder()
			.setTitle('🛒 Item Market')
			.setDescription(`Welcome, ${interaction.user.username} (Prestige ${dbUser.prestige})!\n**Balance:** ${balance}💰\n**Income Rate:** ${yieldData ? yieldData.newTotalRate : 0}💰/sec`)
			.setColor(0x00FF00)
			.addFields(
				{ name: 'Your Inventory', value: inventoryItems.length > 0 ? inventoryItems.map(i => `${i.amount}x **${i.item.name}** (+${i.item.yield}💰/sec)`).join('\n') : 'Your inventory is empty.' },
				{ name: 'Crafting Recipes', value: availableRecipes.length > 0 ? availableRecipes.map(i => `**${i.name}** (+${i.yield}💰/sec) \n↳ Requires: ${Object.entries(JSON.parse(i.recipe)).map(([req, amt]) => `${amt}x ${req}`).join(', ')}`).join('\n') : 'No recipes unlocked.' }
			)
			.setFooter({ text: 'Select an item below to buy or sell!' });

		const components = [];

		if (buyableItems.length > 0) {
			const buyMenu = new StringSelectMenuBuilder()
				.setCustomId('shop_buy')
				.setPlaceholder('Select an item to buy')
				.addOptions(buyableItems.map(item =>
					new StringSelectMenuOptionBuilder()
						.setLabel(item.name)
						.setDescription(`Costs ${item.cost}💰 | Yields $+${item.yield}/sec`)
						.setValue(item.id.toString())
				));
			components.push(new ActionRowBuilder().addComponents(buyMenu));
		}

		if (inventoryItems.length > 0) {
			const sellMenu = new StringSelectMenuBuilder()
				.setCustomId('shop_sell')
				.setPlaceholder('Select an item to sell 1x')
				.addOptions(inventoryItems.slice(0, 25).map(invItem =>
					new StringSelectMenuOptionBuilder()
						.setLabel(invItem.item.name)
						.setDescription(`Sells for ${invItem.item.prestige_tier === -1 ? invItem.item.cost : Math.floor(invItem.item.cost * 0.5)}💰 (Have: ${invItem.amount})`)
						.setValue(invItem.item.id.toString())
				));
			components.push(new ActionRowBuilder().addComponents(sellMenu));

			const sellAllOptions = [
				new StringSelectMenuOptionBuilder()
					.setLabel('Sell EVERYTHING')
					.setDescription('Sell your entire inventory at once!')
					.setValue('sell_everything')
			];

			inventoryItems.slice(0, 24).forEach(invItem => {
				const sellPrice = invItem.item.prestige_tier === -1 ? invItem.item.cost : Math.floor(invItem.item.cost * 0.5);
				sellAllOptions.push(
					new StringSelectMenuOptionBuilder()
						.setLabel(`Sell ALL ${invItem.item.name}`)
						.setDescription(`Sell all ${invItem.amount} for ${sellPrice * invItem.amount}💰`)
						.setValue(invItem.item.id.toString())
				);
			});

			const sellAllMenu = new StringSelectMenuBuilder()
				.setCustomId('shop_sell_all')
				.setPlaceholder('Select an item to sell ALL of')
				.addOptions(sellAllOptions);
			components.push(new ActionRowBuilder().addComponents(sellAllMenu));
		}

		return { embeds: [embed], components };
	};

	const initialMessage = await interaction.editReply(await generateEmbedAndComponents());

	const collector = initialMessage.createMessageComponentCollector({
		time: 60000
	});

	collector.on('collect', async i => {
		if (i.user.id !== interaction.user.id) {
			return i.reply({ content: 'This menu is not for you!', flags: MessageFlags.Ephemeral });
		}

		const action = i.customId;

		if (i.isButton()) {
			if (action === 'confirm_sell_all') {
				const inventory = await dbUser.getItems();
				let totalProfit = 0;
				for (const inv of inventory) {
					const price = inv.item.prestige_tier === -1 ? inv.item.cost : Math.floor(inv.item.cost * 0.5);
					totalProfit += (price * inv.amount);
					await inv.destroy();
				}
				if (totalProfit > 0) {
					await shopUtil.addBalance(interaction.user.id, totalProfit);
				}
				await i.update(await generateEmbedAndComponents());
				await interaction.followUp({ content: `✅ You sold your entire inventory for **${totalProfit}💰**!`, flags: MessageFlags.Ephemeral });
				return;
			} else if (action === 'cancel_sell_all') {
				await i.update(await generateEmbedAndComponents());
				return;
			}
		}

		if (!i.isStringSelectMenu()) return;

		const selectedItemId = i.values[0];

		if (action === 'shop_sell_all' && selectedItemId === 'sell_everything') {
			const inventory = await dbUser.getItems();
			let totalProfit = 0;
			for (const inv of inventory) {
				const price = inv.item.prestige_tier === -1 ? inv.item.cost : Math.floor(inv.item.cost * 0.5);
				totalProfit += (price * inv.amount);
			}

			if (totalProfit === 0) {
				return i.reply({ content: 'Your inventory is already empty!', flags: MessageFlags.Ephemeral });
			}

			const confirmEmbed = new EmbedBuilder()
				.setTitle('⚠️ Confirm Sell All')
				.setDescription(`Are you sure you want to sell **EVERYTHING** in your inventory?\nYou will receive **${totalProfit}💰**. This cannot be undone!`)
				.setColor(0xFF0000);

			const confirmRow = new ActionRowBuilder().addComponents(
				new ButtonBuilder()
					.setCustomId('confirm_sell_all')
					.setLabel('Yes, Sell Everything')
					.setStyle(ButtonStyle.Danger),
				new ButtonBuilder()
					.setCustomId('cancel_sell_all')
					.setLabel('Cancel')
					.setStyle(ButtonStyle.Secondary)
			);

			await i.update({ embeds: [confirmEmbed], components: [confirmRow] });
			return;
		}

		const item = shopItems.find(shopItem => shopItem.id.toString() === selectedItemId);

		if (!item) {
			return i.reply({ content: 'Item not found.', flags: MessageFlags.Ephemeral });
		}

		if (action === 'shop_buy') {
			const currentBalance = await shopUtil.getBalance(interaction.user.id);
			if (currentBalance < item.cost) {
				return i.reply({ content: `You don't have enough money for ${item.name}! Need ${item.cost}💰, but you have ${currentBalance}💰.`, flags: MessageFlags.Ephemeral });
			}
			await shopUtil.addBalance(interaction.user.id, -item.cost);
			await dbUser.addItem(item);
			await i.reply({ content: `You bought **${item.name}** for ${item.cost}💰!`, flags: MessageFlags.Ephemeral });
		} else if (action === 'shop_sell') {
			const sellPrice = item.prestige_tier === -1 ? item.cost : Math.floor(item.cost * 0.5);
			const inventory = await dbUser.getItems();
			const hasItem = inventory.find(inv => inv.item.id.toString() === selectedItemId && inv.amount > 0);
			if (!hasItem) {
				return i.reply({ content: `You don't have a ${item.name} to sell!`, flags: MessageFlags.Ephemeral });
			}
			await shopUtil.addBalance(interaction.user.id, sellPrice);
			await dbUser.removeItem(item);
			await i.reply({ content: `You sold **1x ${item.name}** for ${sellPrice}💰!`, flags: MessageFlags.Ephemeral });
		} else if (action === 'shop_sell_all') {
			const sellPrice = item.prestige_tier === -1 ? item.cost : Math.floor(item.cost * 0.5);
			const inventory = await dbUser.getItems();
			const hasItem = inventory.find(inv => inv.item.id.toString() === selectedItemId && inv.amount > 0);
			if (!hasItem) {
				return i.reply({ content: `You don't have a ${item.name} to sell!`, flags: MessageFlags.Ephemeral });
			}
			const totalProfit = sellPrice * hasItem.amount;
			await shopUtil.addBalance(interaction.user.id, totalProfit);
			await hasItem.destroy(); // Properly destroys the entire row in the UserItem table
			await i.reply({ content: `You sold all **${hasItem.amount}x ${item.name}** for ${totalProfit}💰!`, flags: MessageFlags.Ephemeral });
		}

		await interaction.editReply(await generateEmbedAndComponents());
	});

	collector.on('end', () => {
		interaction.editReply({ components: [] }).catch(() => { });
	});
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('market')
		.setDescription('General market / shop commands')
		.addSubcommand(sub =>
			sub.setName('balance')
				.setDescription('Show a users balance')
				.addUserOption(option =>
					option.setName('target')
						.setDescription('A user to target')
						.setRequired(false)
				)
		)
		.addSubcommand(sub =>
			sub.setName('open')
				.setDescription('Opens the interactive shop menu')
		)
		.addSubcommand(sub =>
			sub.setName('leaderboard')
				.setDescription('Opens the leaderboard')
		),
	async execute(interaction) {
		let user = interaction.options.getUser('target') || interaction.user;
		let subCommand = interaction.options.getSubcommand();

		switch (subCommand) {
			case "balance":
				return interaction.reply(`${user.tag} has ${await shopUtil.getBalance(user.id)}💰`);
			case "open":
				return handleShopOpen(interaction);
			case "leaderboard":
				const users = await Users.findAll();
				return interaction.reply(
					codeBlock(
						users
							.filter(currentUser => {
								const cacheUser = interaction.client.users.cache.get(currentUser.user_id);
								return cacheUser && !cacheUser.bot;
							})
							.sort((a, b) => b.balance - a.balance)
							.map((currentUser, position) => {
								const cacheUser = interaction.client.users.cache.get(currentUser.user_id);
								return `(${position + 1}) ${cacheUser.tag}: ${currentUser.balance}💰`;
							})
							.join('\n')
					)
				);
			default:
				break;
		}
	},
};
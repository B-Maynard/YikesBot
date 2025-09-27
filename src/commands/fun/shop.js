const { StringSelectMenuOptionBuilder, MessageFlags, StringSelectMenuBuilder, ContainerBuilder, ActionRowBuilder, ButtonStyle, ButtonBuilder, SlashCommandBuilder } = require('discord.js');
const shopUtil = require('../../helpers/shopHelpers');
const { CurrencyShop, Users } = require('../../../db/currencyshop/dbObjects');
const { codeBlock } = require('discord.js');

const { Op } = require('sequelize');



module.exports = {
	data: new SlashCommandBuilder()
		.setName('shop')
		.setDescription('General shop commands')
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
				.setDescription('Opens the shop')
		)
		.addSubcommand(sub =>
			sub.setName('leaderboard')
				.setDescription('Opens the leaderboard')
		)
		.addSubcommand(sub =>
			sub.setName('buy')
				.setDescription('Buy items from the shop')
				.addStringOption(option =>
					option.setName('item')
						.setDescription('The item to buy')
						.setRequired(true)
				)
		),
	async execute(interaction) {

		let user = interaction.options.getUser('target') || interaction.user;
		let subCommand = interaction.options.getSubcommand();

		switch (subCommand) {
			case "balance":
				return interaction.reply(`${user.tag} has ${await shopUtil.getBalance(user.id)}💰`);
			case "open":
				const items = await CurrencyShop.findAll();
				let options = [];

				items.forEach(item => {
					options.push(new StringSelectMenuOptionBuilder()
						.setLabel(item.dataValues.name)
						.setDescription(`Cost: ${item.dataValues.cost}`)
						.setValue(item.dataValues.id.toString()));
				});

				const exampleContainer = new ContainerBuilder()
					.setAccentColor(0x0099FF)
					.addActionRowComponents(
						actionRow => actionRow
							.setComponents(
								new StringSelectMenuBuilder()
									.setCustomId('shop')
									.setPlaceholder('Choose item for purchase')
									.addOptions(options)
							),
					)
					.addSeparatorComponents(
						separator => separator,
					)
					.addSectionComponents(
						section => section
							.setButtonAccessory(
								button => button
									.setCustomId('buyButton')
									.setLabel('Purchase')
									.setStyle(ButtonStyle.Primary),
							),
					);

				const response = await interaction.reply({
					components: [exampleContainer],
					flags: MessageFlags.IsComponentsV2,
					withResponse: true
				});

				const collectorFilter = i => i.user.id === interaction.user.id;
				try {
					const confirmation = await response.resource.message.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });

					if (confirmation.customId === 'confirm') {
						await confirmation.update({ content: `test`, components: [] });
					} else if (confirmation.customId === 'cancel') {
						await confirmation.update({ content: 'test2', components: [] });
					}
				} catch {
					await interaction.editReply({ content: 'Confirmation not received within 1 minute, cancelling', components: [] });
				}
				break;
			// return interaction.reply(codeBlock(items.map(i => `${i.name}: ${i.cost}💰`).join('\n')));
			case "leaderboard":
				const users = await Users.findAll();
				return interaction.reply(
					codeBlock(
						users
							.filter(currentUser => !interaction.client.users.cache.get(currentUser.user_id).bot)
							.sort((a, b) => b.balance - a.balance)
							.map((currentUser, position) => `(${position + 1}) ${interaction.client.users.cache.get(currentUser.user_id).tag}: ${currentUser.balance}💰`)
							.join('\n')
					)
				);
			case "buy":
				let itemString = interaction.options.getString('item');

				if (!itemString) {
					return interaction.reply("An item is required for this command.");
				}

				const item = await CurrencyShop.findOne({ where: { name: { [Op.like]: itemString } } })

				if (!item) return interaction.reply("Item does not exist in the shop.");

				if (item.cost > await shopUtil.getBalance(interaction.user.id)) {
					return interaction.reply(`You currently have ${await shopUtil.getBalance(interaction.user.id)}💰, but ${item.name} costs ${item.cost}💰`);
				}

				const dbUser = await Users.findOne({ where: { user_id: interaction.user.id } });
				shopUtil.addBalance(interaction.user.id, -item.cost);
				await dbUser.addItem(item);

				return interaction.reply(`You've bought: ${item.name}`);

			default:
				break;
		}
	},
};

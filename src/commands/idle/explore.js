const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { Users, CurrencyShop } = require('../../../db/currencyshop/dbObjects');

// Store active explorers. Map: UserId -> { startTime, lootCollected: {} }
const activeExplorers = new Map();

// Global interval to process all exploring users (runs every 1 minute)
const exploreInterval = setInterval(async () => {
	if (activeExplorers.size === 0) return;

	try {
		const baseItems = await CurrencyShop.findAll({
			where: {
				cost: { [require('sequelize').Op.gt]: 0 },
				prestige_tier: -1
			}
		});

		if (baseItems.length === 0) return;

		const rarityWeights = {
			'common': 80,
			'uncommon': 19,
			'rare': 1
		};

		const getRandomItem = () => {
			let totalWeight = 0;
			for (const item of baseItems) {
				totalWeight += (rarityWeights[item.rarity?.toLowerCase()] || 50);
			}

			let random = Math.floor(Math.random() * totalWeight);
			for (const item of baseItems) {
				const weight = rarityWeights[item.rarity?.toLowerCase()] || 50;
				if (random < weight) {
					return item;
				}
				random -= weight;
			}
			return baseItems[0];
		};

		// Process each active user
		for (const [userId, session] of activeExplorers.entries()) {
			// 60% chance to find absolutely nothing
			if (Math.random() < 0.60) continue;

			const dbUser = await Users.findOne({ where: { user_id: userId } });
			if (!dbUser) continue;

			// Find 1-3 items
			const numItemsFound = Math.floor(Math.random() * 3) + 1;
			for (let i = 0; i < numItemsFound; i++) {
				const randomItem = getRandomItem();
				await dbUser.addItem(randomItem);

				// Track it for their summary
				session.lootCollected[randomItem.name] = (session.lootCollected[randomItem.name] || 0) + 1;
			}
		}
	} catch (err) {
		console.error("Error in explore interval:", err);
	}
}, 10000);

exploreInterval.unref();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('explore')
		.setDescription('Explore the wilderness to find basic gathering materials!')
		.addSubcommand(sub =>
			sub.setName('start')
				.setDescription('Start exploring the wilderness in the background.')
		)
		.addSubcommand(sub =>
			sub.setName('stop')
				.setDescription('Stop exploring and see what you found.')
		),
	async execute(interaction) {
		await interaction.deferReply();

		const userId = interaction.user.id;
		const subCommand = interaction.options.getSubcommand();

		if (subCommand === 'start') {
			if (activeExplorers.has(userId)) {
				return interaction.editReply({
					content: 'You are already exploring! Use `/explore stop` to return and see your loot.',
					flags: MessageFlags.Ephemeral
				});
			}

			// Ensure user exists
			let dbUser = await Users.findOne({ where: { user_id: userId } });
			if (!dbUser) {
				const shopUtil = require('../../helpers/shopHelpers');
				dbUser = await shopUtil.addBalance(userId, 0);
			}

			activeExplorers.set(userId, {
				startTime: Date.now(),
				lootCollected: {}
			});

			return interaction.editReply('🚶‍♂️ You venture out into the wilderness... Your character is now exploring in the background! Run `/explore stop` when you are ready to come back.');
		}
		else if (subCommand === 'stop') {
			const session = activeExplorers.get(userId);
			if (!session) {
				return interaction.editReply({
					content: 'You are not currently exploring. Use `/explore start` to begin!',
					flags: MessageFlags.Ephemeral
				});
			}

			activeExplorers.delete(userId);

			const timeExploredMs = Date.now() - session.startTime;
			const timeExploredMins = Math.floor(timeExploredMs / 60000);

			if (Object.keys(session.lootCollected).length === 0) {
				return interaction.editReply(`🏕️ You return from the wilderness after **${timeExploredMins} minute(s)**.\n\nUnfortunately, you didn't find anything this time!`);
			}

			let lootDesc = Object.entries(session.lootCollected)
				.map(([name, count]) => `**${count}x ${name}**`)
				.join('\n');

			const embed = new EmbedBuilder()
				.setTitle('🏕️ Return from the Wilderness!')
				.setDescription(`You explored for **${timeExploredMins} minute(s)** and found:\n\n${lootDesc}\n\nYou can sell these items on the \`/market open\` menu!`)
				.setColor(0x00FF00);

			return interaction.editReply({ embeds: [embed] });
		}
	},
};

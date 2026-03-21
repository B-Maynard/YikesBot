const {Users, CurrencyShop} = require('../../db/currencyshop/dbObjects.js');

async function addBalance(id, amount) {
	const user = await Users.findOne({ where: { user_id: id } });

	if (user) {
		user.balance += Number(amount);
		return user.save();
	}

	const newUser = await Users.create({ user_id: id, balance: amount });
	return newUser;
}

async function getBalance(id) {
	const user = await Users.findOne({where: {user_id: id}});
	return user ? user.balance : 0;
}

async function initBalances(guildMembers) {

	guildMembers.forEach(async user => {
		let currentUserValue = await Users.findOne({
					where: { user_id: user.id},
				});

		if (!currentUserValue) {
			await Users.create({user_id: user.id, balance: 0}).then(() => {
				console.log(`Created entry in balances for user ${user.tag}`);
			});
		}
	});

}

async function calculateYield(id) {
	const user = await Users.findOne({ where: { user_id: id } });
	if (!user) return 0;

	// If never collected before, set last_collection to now and return 0
	if (!user.last_collection) {
		user.last_collection = new Date();
		await user.save();
		return { earned: 0, newTotalRate: 0, secondsPassed: 0 };
	}

	const now = new Date();
	const secondsPassed = Math.floor((now - new Date(user.last_collection)) / 1000);
	
	if (secondsPassed < 0) return { earned: 0, newTotalRate: 0, secondsPassed: 0 }; // Failsafe

	const inventory = await user.getItems();
	let totalYieldPerSecond = 0;

	for (const inv of inventory) {
		if (inv.item && inv.item.yield > 0) {
			totalYieldPerSecond += (inv.item.yield * inv.amount);
		}
	}

	const earnedMoney = secondsPassed * totalYieldPerSecond;

	return {
		earned: earnedMoney,
		newTotalRate: totalYieldPerSecond,
		secondsPassed: secondsPassed,
		user: user
	};
}

module.exports = {addBalance, getBalance, initBalances, calculateYield}
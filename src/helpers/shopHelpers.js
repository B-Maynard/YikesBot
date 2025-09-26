const {Users, CurrencyShop} = require('../../db/currencyshop/dbObjects.js');

async function addBalance(id, amount) {
	const user = currency.get(id);

	if (user) {
		user.balance += Number(amount);
		return user.save();
	}

	const newUser = await Users.create({ user_id: id, balance: amount });
	currency.set(id, newUser);

	return newUser;
}

function getBalance(id) {
	const user = currency.get(id);
	return user ? user.balance : 0;
}

async function initBalances(guildMembers) {

	const members = guildMembers;

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

module.exports = {addBalance, getBalance, initBalances}
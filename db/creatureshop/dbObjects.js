const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'username', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite',
});

const Users = require('./models/Users.js')(sequelize, Sequelize.DataTypes);
const CreatureItems = require('./models/Items.js')(sequelize, Sequelize.DataTypes);
const Creatures = require('./models/Creatures.js')(sequelize, Sequelize.DataTypes);
const UserCreatures = require('./models/UserCreatures.js')(sequelize, Sequelize.DataTypes);

UserCreatures.belongsTo(Creatures, { foreignKey: 'creature_name', as: 'name' });

Reflect.defineProperty(Users.prototype, 'addCreature', {
	value: async creature => {
		return UserCreatures.create({ user_id: this.user_id, creature_name: creature.name });
	},
});

Reflect.defineProperty(Users.prototype, 'getCreatures', {
	value: () => {
		return UserCreatures.findAll({
			where: { user_id: this.user_id },
			include: ['creature'],
		});
	},
});

Reflect.defineProperty(UserCreatures.prototype, 'addItem', {
	value: async item => {
		let currentCreatureItems = this.items;

		currentCreatureItems.push(item.name);

		await this.update({items: currentCreatureItems});

		return this.save();
	},
});

module.exports = { Users, CreatureItems, Creatures, UserCreatures };
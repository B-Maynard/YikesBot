module.exports = (sequelize, DataTypes) => {
	return sequelize.define('currency_shop', {
		name: {
			type: DataTypes.STRING,
			unique: true,
		},
		cost: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		yield: {
			type: DataTypes.FLOAT,
			defaultValue: 0,
			allowNull: false,
		},
		recipe: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		prestige_tier: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
			allowNull: false,
		},
		rarity: {
			type: DataTypes.STRING,
			allowNull: true,
		},
	}, {
		timestamps: false,
	});
};
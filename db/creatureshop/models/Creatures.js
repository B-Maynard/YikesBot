module.exports = (sequelize, DataTypes) => {
	return sequelize.define('creatures', {
		name: {
			type: DataTypes.STRING,
			unique: true,
		},
		shop_cost: {
			type: DataTypes.INTEGER,
			allowNull: true
		},
		base_rate: {
			type: DataTypes.FLOAT,
			allowNull: false
		},
		rarity: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		icon: {
			path: DataTypes.STRING,
			allowNull: false
		}
	}, {
		timestamps: false,
	});
};
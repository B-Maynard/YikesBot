module.exports = (sequelize, DataTypes) => {
	return sequelize.define('items', {
		name: {
			type: DataTypes.STRING,
			unique: true,
		},
		shop_cost: {
			type: DataTypes.INTEGER,
			allowNull: true
		},
        effect: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        value: {
            type: DataTypes.STRING,
            allowNull: false
        },
        qty: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
	}, {
		timestamps: false,
	});
};
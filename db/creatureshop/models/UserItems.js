module.exports = (sequelize, DataTypes) => {
	return sequelize.define('user_items', {
		user_id: DataTypes.STRING,
        item_name: DataTypes.STRING
	}, {
		timestamps: false,
	});
};
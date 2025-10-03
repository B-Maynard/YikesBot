module.exports = (sequelize, DataTypes) => {
	return sequelize.define('user_creature', {
		user_id: DataTypes.STRING,
		creature_name: DataTypes.STRING,
		items: DataTypes.ARRAY(DataTypes.STRING)
	}, {
		timestamps: false,
	});
};
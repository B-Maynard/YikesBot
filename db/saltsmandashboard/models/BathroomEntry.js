module.exports = (sequelize, DataTypes) => {
	return sequelize.define('bathroom_entry', {
		action: {
			type: DataTypes.INTEGER,
			allowNull: false,
		}
		
	}, {
		timestamps: true
	});
};
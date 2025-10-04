module.exports = (sequelize, DataTypes) => {
	return sequelize.define('user_creature', {
		user_id: DataTypes.STRING,
		creature_name: DataTypes.STRING,
		items: {
			type: DataTypes.TEXT,
			allowNull: false,
			defaultValue: '[]',
			get() {
				const raw = this.getDataValue('items');
				try { return raw ? JSON.parse(raw) : []; } catch { return []; }
			},
			set(val) {
				this.setDataValue('items', JSON.stringify(Array.isArray(val) ? val : []));
			},
		}
	}, {
		timestamps: false,
	});
};
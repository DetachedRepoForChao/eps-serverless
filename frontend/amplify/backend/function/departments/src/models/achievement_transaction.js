/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('achievementTransaction', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			field: 'id',
			autoIncrement: true
		},
		type: {
			type: DataTypes.STRING(45),
			allowNull: false,
			defaultValue: 'Add',
			field: 'type'
		},
		amount: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'amount'
		},
		userAchievementId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			references: {
				model: 'user_achievement_progress',
				key: 'id'
			},
			field: 'user_achievement_id'
		},
		description: {
			type: DataTypes.STRING(255),
			allowNull: true,
			field: 'description'
		},
		createdAt: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
			field: 'createdAt'
		},
		updatedAt: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
			field: 'updatedAt'
		}
	}, {
		tableName: 'achievement_transaction'
	});
};

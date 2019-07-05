/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('userAchievementProgress', {
		userId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			references: {
				model: 'user',
				key: 'id'
			},
			field: 'user_id'
		},
		achievementId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			references: {
				model: 'achievement',
				key: 'id'
			},
			field: 'achievement_id'
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
		},
		goalProgress: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: '0',
			field: 'goalProgress'
		},
		id: {
			type: DataTypes.STRING(255),
			allowNull: true,
			unique: true,
			field: 'id'
		},
		status: {
			type: DataTypes.STRING(45),
			allowNull: false,
			defaultValue: 'not started',
			field: 'status'
		}
	}, {
		tableName: 'user_achievement_progress'
	});
};

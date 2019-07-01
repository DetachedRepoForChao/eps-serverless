/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('pointPool', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			field: 'id',
			autoIncrement: true
		},
		pointsRemaining: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: '5000',
			field: 'points_remaining'
		},
		managerId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			references: {
				model: 'user',
				key: 'id'
			},
			field: 'managerId'
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
		tableName: 'point_pool'
	});
};

/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('pointTransaction', {
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
		sourceUserId: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			references: {
				model: 'user',
				key: 'id'
			},
			field: 'sourceUserId'
		},
		targetUserId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			references: {
				model: 'user',
				key: 'id'
			},
			unique: true,
			field: 'targetUserId'
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
		},
		pointItemId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			references: {
				model: 'point_item',
				key: 'id'
			},
			field: 'point_item_id'
		}
	}, {
		tableName: 'point_transaction'
	});
};

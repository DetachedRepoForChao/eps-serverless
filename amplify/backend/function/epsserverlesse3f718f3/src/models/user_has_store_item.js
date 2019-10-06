/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('userHasStoreItem', {
		userId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: false,
			references: {
				model: 'user',
				key: 'id'
			},
			field: 'user_id'
		},
		storeItemId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: false,
			references: {
				model: 'storeItem',
				key: 'id'
			},
			field: 'store_item_id'
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
		id: {
			type: DataTypes.STRING(255),
			allowNull: false,
			unique: true,
      autoIncrement: true,
			field: 'id'
		},
		status: {
			type: DataTypes.STRING(45),
			allowNull: false,
			defaultValue: 'pending',
			field: 'status'
		},
    cancelDescription: {
		  type: DataTypes.STRING,
      allowNull: true,
      field: 'cancel_description'
    }
	}, {
		tableName: 'user_has_store_item'
	});
};

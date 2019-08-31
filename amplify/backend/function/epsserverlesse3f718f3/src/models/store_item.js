/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('storeItem', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			field: 'id',
			autoIncrement: true
		},
		name: {
			type: DataTypes.STRING(255),
			allowNull: false,
			field: 'name'
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
		cost: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'cost'
		},
    imagePath: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'image_path',
      defaultValue: 'store/placeholder.jpg'
    }
	}, {
		tableName: 'store_item'
	});
};

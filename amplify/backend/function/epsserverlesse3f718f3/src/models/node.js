/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('node', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			field: 'id',
			autoIncrement: true
		},
		name: {
			type: DataTypes.STRING(45),
			allowNull: false,
			field: 'name'
		},
		route: {
			type: DataTypes.STRING(45),
			allowNull: true,
			field: 'route'
		},
		method: {
			type: DataTypes.STRING(45),
			allowNull: true,
			field: 'method'
		},
		securityRoleId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			references: {
				model: 'securityrole',
				key: 'id'
			},
			field: 'securityRoleId'
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
		tableName: 'node'
	});
};

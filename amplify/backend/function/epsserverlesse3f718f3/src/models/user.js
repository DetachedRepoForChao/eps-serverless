/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('user', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			field: 'id',
			autoIncrement: true
		},
		username: {
			type: DataTypes.STRING(20),
			allowNull: false,
			unique: true,
			field: 'username'
		},
		password: {
			type: DataTypes.STRING(255),
			allowNull: true,
			field: 'password'
		},
		firstName: {
			type: DataTypes.STRING(100),
			allowNull: false,
			field: 'firstname'
		},
		lastName: {
			type: DataTypes.STRING(100),
			allowNull: false,
			field: 'lastName'
		},
		middleName: {
			type: DataTypes.STRING(100),
			allowNull: true,
			field: 'middleName'
		},
		preferredName: {
			type: DataTypes.STRING(255),
			allowNull: true,
			field: 'preferredName'
		},
		prefix: {
			type: DataTypes.STRING(20),
			allowNull: true,
			field: 'prefix'
		},
		suffix: {
			type: DataTypes.STRING(20),
			allowNull: true,
			field: 'suffix'
		},
		position: {
			type: DataTypes.STRING(100),
			allowNull: true,
			field: 'position'
		},
		address1: {
			type: DataTypes.STRING(200),
			allowNull: true,
			field: 'address1'
		},
		address2: {
			type: DataTypes.STRING(200),
			allowNull: true,
			field: 'address2'
		},
		city: {
			type: DataTypes.STRING(100),
			allowNull: true,
			field: 'city'
		},
		state: {
			type: DataTypes.STRING(45),
			allowNull: true,
			field: 'state'
		},
		country: {
			type: DataTypes.STRING(45),
			allowNull: true,
			field: 'country'
		},
		zip: {
			type: DataTypes.STRING(45),
			allowNull: true,
			field: 'zip'
		},
		points: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: '0',
			field: 'points'
		},
		dateOfBirth: {
			type: DataTypes.DATEONLY,
			allowNull: true,
			field: 'dateOfBirth'
		},
		preferredPronoun: {
			type: DataTypes.STRING(45),
			allowNull: true,
			field: 'preferredPronoun'
		},
		sex: {
			type: DataTypes.STRING(45),
			allowNull: true,
			field: 'sex'
		},
		gender: {
			type: DataTypes.STRING(45),
			allowNull: true,
			field: 'gender'
		},
		dateOfHire: {
			type: DataTypes.DATE,
			allowNull: true,
			field: 'dateOfHire'
		},
		dateOfTermination: {
			type: DataTypes.DATE,
			allowNull: true,
			field: 'dateOfTermination'
		},
		departmentId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			references: {
				model: 'department',
				key: 'id'
			},
			field: 'departmentId'
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
		email: {
			type: DataTypes.STRING(255),
			allowNull: false,
			field: 'email'
		},
		avatarUrl: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue: 'public/avatars/placeholder.svg',
			field: 'avatarUrl'
		},
		saltSecret: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'saltSecret'
    },
    phone: {
      type: DataTypes.STRING(45),
      allowNull: true,
      field: 'phone'
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
	}, {
		tableName: 'user'
	});
};

/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('session', {
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
            type: DataTypes.STRING(36),
            allowNull: false,
            unique: false,
            primaryKey: true,
            field: 'id'
        },
        routeStack: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'routeStack'
        },
        windowStack: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'windowStack'
        },
        clickStack: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'clickStack'
        },
        heartbeatAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
            field: 'heartbeatAt'
        }
    }, {
        tableName: 'session'
    });
};

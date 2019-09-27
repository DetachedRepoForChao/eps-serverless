module.exports = function (sequelize, DataTypes) {
    return sequelize.define('notification', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            field: 'id',
            primaryKey: true,
            autoIncrement: true,
        },
        title: {
            type: DataTypes.STRING(100),
            allowNull: false,
            field: 'title'
        },
        audience: {
            //Three Types:  Persoanl Group Global
            type: DataTypes.STRING(45),
            allowNull: false,
            field: 'audience'
        },
        event: {
            // Archiev Point
            type: DataTypes.STRING(100),
            allowNull: false,
            field: 'event'
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
            field: 'createdAt'
        },
        description: {
            type: DataTypes.STRING(45),
            allowNull: true,
            field: 'description'
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
            field: 'updatedAt'
        },
        timeSeen: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'timeSeen'
        },
        targetUserId:{
            type: DataTypes.STRING(20),
            allowNull:false,
            field: 'targetUserId'
        }
    }, {
            tableName: 'notification'
        });
};

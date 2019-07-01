module.exports = function(sequelize, DataTypes) {
    return sequelize.define('like_info', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            field: 'id',
            primaryKey: true,
            primaryKey: true,
            autoIncrement: true,

        },
        postId: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            references: {
                model: 'point_transaction',
                key: 'id'
            },
            field: 'post_id'
        },
        userId:{
            type: DataTypes.INTEGER(11),
            allowNull: false,
            references: {
                model: 'user',
                key: 'id'
            },
            field: 'user_id'
        },
        likeTime: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
            field: 'like_time'
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
        tableName: 'like_info'
    });
};

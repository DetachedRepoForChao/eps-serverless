module.exports = function(sequelize, DataTypes) {
    return sequelize.define('like_info', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            field: 'id',
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
        username:{
            type: DataTypes.STRING(45),
            allowNull: false,
            references: {
                model: 'user',
                key: 'username'
            },
            field: 'username'
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

import SqlModel from '../sequelize';
const _ = require('lodash');
const sqlPointItemModel = SqlModel.PointItem;
const sqlPointPoolModel = SqlModel.PointPool;
const ctrlPointPool = require('./point_pool.controller');

var getPointItems = function (req, res, next) {
    console.log('getPointItems');

    return sqlPointItemModel.findAll({
        attributes: ['id', 'name', 'description', 'amount']
    })
        .then(pointItems => {
            return res.status(200).json({ status: true, pointItems : pointItems });
        })
        .catch(err => {
            console.log('Database error');
            console.log(err);
            return res.status(500).json({status: false, message: err});
        });

};

module.exports.getPointItems = getPointItems;

var getPointItemLocal = function (pointItemId) {
    console.log('getPointItem: ' + pointItemId);

    return sqlPointItemModel.findOne({
        attributes: ['id', 'name', 'description', 'amount'],
        where: {
            id: pointItemId
        }
    })
        .then(pointItem => {
            if(!pointItem) {
                console.log('Point Item record not found');
                return { status: false, message : 'Point Item record not found' }
            } else {
                console.log('Success');
                return { status: true, pointItem : pointItem };
            }
        })
        .catch(err => {
            console.log('Database error');
            console.log(err);
            return {status: false, message: err};
        });
}

var addPointsToEmployee = function (req, res, next) {
    console.log('addPointToEmployee');

    const data = {
        sourceUserId: req.body.sourceUserId,
        targetUserId: req.body.targetUserId,
        pointItemId: req.body.pointItemId,
        amount: req.body.amount,
        description: req.body.description
    };

    // Create New Points Transaction
    newPointsTransaction('Add', data.sourceUserId, data.targetUserId, data.pointItemId, data.amount, data.description);

    // Add Points To Employee
    SqlModel.sequelize.query('UPDATE `user` SET `points` = `points` + ' + data.amount + ' WHERE `user`.`id` = ' + data.targetUserId + ';', { type: SqlModel.sequelize.QueryTypes.UPDATE})
        .then(result => {
            if(!result) {
                console.log('Something went wrong');
                return res.status(404).json({ status: false, message: 'Something went wrong'});
            } else {
                console.log('User points updated successfully');
                return res.status(200).json({ status: true, message: 'Success' });
            }
        })
        .catch(err => {
            console.log('Database error');
            console.log(err);
            return res.status(500).json({ status: false, message: err});
    });
};

module.exports.addPointsToEmployee = addPointsToEmployee;

var addPointsToEmployeeLocal = function(sourceUserId, targetUserId, pointItemId, amount, description) {
    console.log('addPointToEmployeeLocal');

    const data = {
        sourceUserId: sourceUserId,
        targetUserId: targetUserId,
        pointItemId: pointItemId,
        amount: amount,
        description: description
    };

    // Create New Points Transaction
    newPointsTransaction('Add', data.sourceUserId, data.targetUserId, data.pointItemId, data.amount, data.description);

    // Add Points To Employee
    return SqlModel.sequelize.query('UPDATE `user` SET `points` = `points` + ' + data.amount + ' WHERE `user`.`id` = ' + data.targetUserId + ';', { type: SqlModel.sequelize.QueryTypes.UPDATE})
        .then(queryResult => {
            if(!queryResult) {
                console.log('Something went wrong');
                return { status: false , message: 'Something went wrong'};
            } else {
                console.log('User points updated successfully');
                return {status: true, message: 'User points updated successfully'};
            }
        })
        .catch(err => {
            console.log('Error with the database');
            return {status: false, message: err};
        });
};

var giftPointsToEmployee = function (req, res, next) {
    console.log('giftPointsToEmployee');

    const data = {
        sourceUserId: req.body.sourceUserId,
        targetUserId: req.body.targetUserId,
        pointItemId: req.body.pointItemId,
        amount: 0,
        description: req.body.description
    };

    // Look up point item value
    return getPointItemLocal(data.pointItemId)
        .then(result => {
            if(!result) {
               console.log('GetPointItemLocal did not return a result. Something went very wrong');
               return res.status(500).json({status: false, message: 'Error. Something went very wrong'});
            } else {
                if(result.status !== true) {
                    console.log('GetPointItemLocal returned an error: ' + result.message);
                    return res.status(400).json({status: false, message: result.status});
                } else {
                    console.log('Success');
                    data.amount = result.pointItem.amount;

                    // Remove points from the point pool
                    return ctrlPointPool.removePointsFromPointPoolLocal(data.sourceUserId, data.amount)
                        .then(result => {
                            if ( result.status === false) {
                                console.log('Something went wrong with removing points from the point pool');
                                console.log(result.message);
                                return res.status(400).json({status: false, message: 'Error removing points from the points pool: ' + result.message});
                            } else {
                                console.log('Successfully removed points from the point pool');
                                console.log(result.message);

                                // Create new point removal transaction
                                //newPointsTransaction('Remove', data.sourceUserId, data.targetUserId, data.pointItemId, data.amount, data.description);

                                // Add points to employee
                                return addPointsToEmployeeLocal(data.sourceUserId, data.targetUserId, data.pointItemId, data.amount, data.description)
                                    .then( result => {
                                        if ( result.status !== true) {
                                            console.log('Something went wrong with adding points to the employee');
                                            console.log(result.message);
                                            return res.status(400).json({ status: false, message: 'Something went wrong with adding points to the employee: ' + result.message });
                                        } else {
                                            console.log('Successfully added points to the employee');
                                            console.log(result.message);
                                            return res.status(200).json({status: true, message: 'Success: ' + result.message});
                                        }
                                    })
                                    .catch(err => {
                                        console.log('addPointsToEmployeeLocal Error');
                                        console.log(err);
                                        return res.status(500).json({status: false, message: err});
                                    });
                            }
                        })
                        .catch(err => {
                            console.log('removePointsFromPointPoolLocal Error');
                            console.log(err);
                            return res.status(500).json({status: false, message: err});
                        });
                }
            }
        })
        .catch(err => {
            console.log('Error');
            console.log(err);
            return res.status(500).json({status: false, message: err});
        });

};

module.exports.giftPointsToEmployee = giftPointsToEmployee;


var newPointsTransaction = function (type, sourceUserId, targetUserId, pointItemId, amount, description) {
    console.log('newPointsTransaction');
    console.log('type: ' + type);
    console.log('sourceUserId: ' + sourceUserId);
    console.log('targetUserId: ' + targetUserId);
    console.log('pointItemId: ' + pointItemId);
    console.log('amount: ' + amount);
    console.log('description: ' + description);

    SqlModel.sequelize.query(
        "INSERT INTO `point_transaction` (`type`, `amount`, `sourceUserId`, `targetUserId`, `description`, `point_item_id`) " +
        "VALUES ('" + type + "', " + amount + ", " + sourceUserId + ", " + targetUserId + ", '" + description + "', " + pointItemId + ")", { type: SqlModel.sequelize.QueryTypes.INSERT})
        .then(res => {
            if(!res) {
                console.log('Something went wrong');
                return false;
            } else {
                console.log('Success');
                return true;
            }
        })
        .catch(err => {
            console.log(err);
        });
};

/*
module.exports.newAchievementTransaction = (req, res, next) => {
    console.log('newAchievementTransaction:');
    console.log(req.body);

    const data = {
        type: req.body.type,
        amount: req.body.amount,
        userAchievementId: req.body.userAchievementId,
        description: req.body.description
    };


    sqlUserAchievementProgressModel.findOne({
        where: {
            id: data.userAchievementId
        },
    })
        .then(userAchievementProgress => {
            console.log('newAchievementTransaction userAchievementProgress:');
            if(!userAchievementProgress) {
                console.log('Unable to find User Achievement Progress record for userAchievementId: ' + data.userAchievementId);
                //return userAchievementProgress.status(404).json({ status: false, message: 'Unable to find User Achievement Progress record for userAchievementId: ' + data.userAchievementId});
            } else {
                console.log('Found User Achievement Progress record for userId: ' + data.userAchievementId);
                console.log('User Id: ' + userAchievementProgress['userId']);
                console.log('Achievement Id: ' + userAchievementProgress['achievementId']);

                //return res.status(200).json({ status: true, userAchievementProgress : _.pick(userAchievementProgress,['userId','achievementId', 'goalProgress', 'id']) });
                //sqlAchievementModel.findOne()
                sqlAchievementTransactionModel.create({
                    type: data.type,
                    amount: data.amount,
                    description: data.description,
                    userAchievementId: data.userAchievementId
                }).then(res => {
                    console.log('Achievement Transaction created in db');
                    if(!res) {
                        //return res.status(404).json({ status: false, message: 'Update failed.' });
                        return JSON.stringify({ status: false, message: 'Transaction Creation failed.' });
                    } else {
                        console.log(res);
                        return JSON.stringify({ status: true, message: 'Transaction Creation succeeded.' });
                    }
                });
            }
        });
};
*/

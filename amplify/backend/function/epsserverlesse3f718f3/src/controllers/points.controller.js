const SqlModel = require('../db');
const Models = SqlModel().Models;
const sqlPointItemModel = Models.PointItem;
const sqlPointPoolModel = Models.PointPool;
const sqlUserModel = Models.User;
const sqlPointTransactionModel = Models.PointTransaction;
const ctrlPointPool = require('./point_pool.controller');
const ctrlUser = require('./user.controller');

const getPointItems = function () {
    console.log('getPointItems');

    return sqlPointItemModel.findAll({
        attributes: ['id', 'name', 'description', 'amount', 'coreValues']
    })
        .then(pointItems => {
            return {status: 200, pointItems: pointItems };
        })
        .catch(err => {
            console.log('Database error');
            console.log(err);
            return {status: 500, message: err};
        });
};

module.exports.getPointItems = getPointItems;

const getPointItem = function (pointItemId) {
    console.log('getPointItem: ' + pointItemId);

    return sqlPointItemModel.findOne({
        attributes: ['id', 'name', 'description', 'amount', 'coreValues'],
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
};

const addPointsToEmployee = function (sourceUserId, targetUserId, pointItemId, amount, description) {
  console.log('addPointToEmployee');

  // Create New Points Transaction
  newPointsTransaction('Add', sourceUserId, targetUserId, pointItemId, amount, description);

  // Get user's current points amount
  return sqlUserModel.findOne({
    attributes: ['id', 'username', 'points'],
    where: {
      id: targetUserId
    }
  })
    .then(user => {
      // Add Points To Employee
      const newAmount = user.points + amount;
      return sqlUserModel.update({
        points: newAmount,
      }, {
        where: {
          id: targetUserId,
        }
      })
        .then(result => {
          if(!result) {
            console.log('Something went wrong');
            return {status: 404, message: 'Something went wrong'};
          } else {
            console.log('User points updated successfully');
            return {status: 200, message: 'Success' };
          }
        })
        .catch(err => {
          console.log('Database error');
          console.log(err);
          return {status: 500, message: err};
        });
    })
    .catch(err => {
      console.log(`Database error`);
      console.log(err);
      return {status: 500, message: err};
    });
};

module.exports.addPointsToEmployee = addPointsToEmployee;


const giftPointsToEmployee = function (sourceUserId, targetUserId, pointItemId, description) {
    console.log('giftPointsToEmployee');

    // Look up point item value
    return getPointItem(pointItemId)
        .then(result => {
            if(!result) {
               console.log('GetPointItemLocal did not return a result. Something went very wrong');
               return {status: 500, message: 'Error. Something went very wrong'};
            } else {
                if(result.status !== true) {
                    console.log('GetPointItemLocal returned an error: ' + result.message);
                    return {status: 400, message: result.status};
                } else {
                    console.log('Success');
                    const amount = result.pointItem.amount;

                    // Remove points from the point pool
                    return ctrlPointPool.removePointsFromPointPool(sourceUserId, amount)
                        .then(result => {
                            if ( result.status === false) {
                                console.log('Something went wrong with removing points from the point pool');
                                console.log(result.message);
                                return {status: 400, message: 'Error removing points from the points pool: ' + result.message};
                            } else {
                                console.log('Successfully removed points from the point pool');
                                console.log(result.message);

                                // Create new point removal transaction
                                //newPointsTransaction('Remove', data.sourceUserId, data.targetUserId, data.pointItemId, data.amount, data.description);

                                // Add points to employee
                                return addPointsToEmployee(sourceUserId, targetUserId, pointItemId, amount, description)
                                    .then( result => {
                                        if ( result.status !== 200) {
                                            console.log('Something went wrong with adding points to the employee');
                                            console.log(result.message);
                                            return {status: 400, message: 'Something went wrong with adding points to the employee: ' + result.message };
                                        } else {
                                            console.log('Successfully added points to the employee');
                                            console.log(result.message);
                                            return {status: 200, message: 'Success: ' + result.message};
                                        }
                                    })
                                    .catch(err => {
                                        console.log('addPointsToEmployee Error');
                                        console.log(err);
                                        return {status: 500, message: err};
                                    });
                            }
                        })
                        .catch(err => {
                            console.log('removePointsFromPointPool Error');
                            console.log(err);
                            return {status: 500, message: err};
                        });
                }
            }
        })
        .catch(err => {
            console.log('Error');
            console.log(err);
            return {status: 500, message: err};
        });

};

module.exports.giftPointsToEmployee = giftPointsToEmployee;


const newPointsTransaction = function (type, sourceUserId, targetUserId, pointItemId, amount, description) {
    console.log('newPointsTransaction');
    console.log('type: ' + type);
    console.log('sourceUserId: ' + sourceUserId);
    console.log('targetUserId: ' + targetUserId);
    console.log('pointItemId: ' + pointItemId);
    console.log('amount: ' + amount);
    console.log('description: ' + description);

/*    SqlModel.sequelize.query(
        "INSERT INTO `point_transaction` (`type`, `amount`, `sourceUserId`, `targetUserId`, `description`, `point_item_id`) " +
        "VALUES ('" + type + "', " + amount + ", " + sourceUserId + ", " + targetUserId + ", '" + description + "', " + pointItemId + ")", { type: SqlModel.sequelize.QueryTypes.INSERT})*/
  sqlPointTransactionModel.create({
    type: type,
    amount: amount,
    sourceUserId: sourceUserId,
    targetUserId: targetUserId,
    pointItemId: pointItemId,
    description: description
  })
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

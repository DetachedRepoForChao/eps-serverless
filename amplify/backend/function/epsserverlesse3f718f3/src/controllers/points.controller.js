const SqlModel = require('../db');
const Models = SqlModel().Models;
const sqlPointItemModel = Models.PointItem;
const sqlPointPoolModel = Models.PointPool;
const sqlUserModel = Models.User;
const sqlPointTransactionModel = Models.PointTransaction;
const ctrlPointPool = require('./point_pool.controller');
const ctrlUser = require('./user.controller');

const componentName = 'points.controller';

const getPointItems = function () {
  const functionName = 'getPointItems';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  return sqlPointItemModel.findAll({
    attributes: ['id', 'name', 'description', 'amount', 'coreValues']
  })
    .then(pointItems => {
      if(!pointItems) {
        console.log(`${functionFullName}: No point item records found`);
        return {status: 404, message: "No point item records found" };
      } else {
        console.log(`${functionFullName}: Retrieved point item records successfully`);
        return {status: 200, pointItems: pointItems };
      }
    })
    .catch(err => {
      console.log(`${functionFullName}: Database error`);
      console.log(err);
      return {status: 500, message: err};
    });
};

module.exports.getPointItems = getPointItems;

const getPointItem = function (pointItemId) {
  const functionName = 'getPointItem';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  console.log(`${functionFullName}: pointItemId: ${pointItemId}`);

  return sqlPointItemModel.findOne({
    attributes: ['id', 'name', 'description', 'amount', 'coreValues'],
    where: {
      id: pointItemId
    }
  })
    .then(pointItem => {
      if(!pointItem) {
        console.log(`${functionFullName}: Point Item record not found`);
        return { status: false, message : 'Point Item record not found' }
      } else {
        console.log(`${functionFullName}: Retrieved point item record successfully`);
        return { status: true, pointItem : pointItem };
      }
    })
    .catch(err => {
      console.log(`${functionFullName}: Database error`);
      console.log(err);
      return {status: false, message: err};
    });
};

const addPointsToEmployee = function (sourceUserId, targetUserId, pointItemId, amount, description) {
  const functionName = 'addPointsToEmployee';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

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
            console.log(`${functionFullName}: Error updating user points`);
            return {status: 404, message: 'Error updating user points'};
          } else {
            console.log(`${functionFullName}: User points updated successfully`);
            return {status: 200, message: 'Success' };
          }
        })
        .catch(err => {
          console.log(`${functionFullName}: Database error`);
          console.log(err);
          return {status: 500, message: err};
        });
    })
    .catch(err => {
      console.log(`${functionFullName}: Database error`);
      console.log(err);
      return {status: 500, message: err};
    });
};

module.exports.addPointsToEmployee = addPointsToEmployee;


const giftPointsToEmployee = function (sourceUserId, targetUserId, pointItemId, description) {
  const functionName = 'giftPointsToEmployee';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  // Look up point item value
  return getPointItem(pointItemId)
    .then(result => {
      if(!result) {
        console.log(`${functionFullName}: getPointItem did not return a result. Something went very wrong`);
        return {status: 500, message: 'Error. Something went very wrong'};
      } else {
        if(result.status !== true) {
          console.log(`${functionFullName}: getPointItem returned an error: ${result.message}`);
          return {status: 400, message: result.status};
        } else {
          console.log(`${functionFullName}: Success`);
          const amount = result.pointItem.amount;

          // Remove points from the point pool
          return ctrlPointPool.removePointsFromPointPool(sourceUserId, amount)
            .then(result => {
              if ( result.status === false) {
                console.log(`${functionFullName}: Something went wrong with removing points from the point pool`);
                console.log(result.message);
                return {status: 400, message: `Error removing points from the points pool: ${result.message}`};
              } else {
                console.log(`${functionFullName}: Successfully removed points from the point pool`);
                console.log(result.message);

                // Create new point removal transaction
                //newPointsTransaction('Remove', data.sourceUserId, data.targetUserId, data.pointItemId, data.amount, data.description);

                // Add points to employee
                return addPointsToEmployee(sourceUserId, targetUserId, pointItemId, amount, description)
                  .then( result => {
                    if ( result.status !== 200) {
                      console.log(`${functionFullName}: Something went wrong with adding points to the employee`);
                      console.log(result.message);
                      return {status: 400, message: `Something went wrong with adding points to the employee: ${result.message}` };
                    } else {
                      console.log(`${functionFullName}: Successfully added points to the employee`);
                      console.log(result.message);
                      return {status: 200, message: `Success: ${result.message}`};
                    }
                  })
                  .catch(err => {
                    console.log(`${functionFullName}: Database error`);
                    console.log(err);
                    return {status: 500, message: err};
                  });
              }
            })
            .catch(err => {
              console.log(`${functionFullName}: Database error`);
              console.log(err);
              return {status: 500, message: err};
            });
        }
      }
    })
    .catch(err => {
      console.log(`${functionFullName}: Database error`);
      console.log(err);
      return {status: 500, message: err};
    });

};

module.exports.giftPointsToEmployee = giftPointsToEmployee;


const newPointsTransaction = function (type, sourceUserId, targetUserId, pointItemId, amount, description) {
  const functionName = 'newPointsTransaction';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  console.log(`${functionFullName}: type: ${type}`);
  console.log(`${functionFullName}: sourceUserId: ${sourceUserId}`);
  console.log(`${functionFullName}: targetUserId: ${targetUserId}`);
  console.log(`${functionFullName}: pointItemId: ${pointItemId}`);
  console.log(`${functionFullName}: amount: ${amount}`);
  console.log(`${functionFullName}: description: ${description}`);

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
        console.log(`${functionFullName}: Something went wrong`);
        return false;
      } else {
        console.log(`${functionFullName}: Success`);
        return true;
      }
    })
    .catch(err => {
      console.log(`${functionFullName}: Database error`);
      console.log(err);
      console.log(err);
    });
};

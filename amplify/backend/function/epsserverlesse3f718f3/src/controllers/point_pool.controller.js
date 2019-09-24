const SqlModel = require('../db');
const Models = SqlModel().Models;
const sqlPointPoolModel = Models.PointPool;
const ctrlUser = require('./user.controller');

const getRemainingPointPool = function (managerId) {
  console.log('getRemainingPointPool');

  /*    return ctrlUser.getUserProfile(userId)
        .then(result => {
          const user = result.user;
          // console.log('user: ');
          // console.log(user.id);*/
  return sqlPointPoolModel.findOne({
    where: {
      managerId: managerId,
    }
  })
    .then(pointPoolResult => {
      // console.log('pointPool: ');
      // console.log(pointPool);
      if (!pointPoolResult) {
        return {status: 404, message: 'Point Pool record not found.'};
      } else {
        return {status: 200, pointsRemaining: pointPoolResult.pointsRemaining};
      }
    })
    .catch(err => {
      console.log('problem communicating with db');
      console.log(err);
      return {status: 500, message: err};
    });
  // });
};

module.exports.getRemainingPointPool = getRemainingPointPool;


/*var getRemainingPointPoolLocal = function (managerId) {
    console.log('getRemainingPointPoolLocal');
    console.log('managerId: ' + managerId);

    return SqlModel.sequelize.query("SELECT * FROM `point_pool` WHERE `point_pool`.`managerId` = " + managerId + ";",
        {type: SqlModel.sequelize.QueryTypes.SELECT})
        .then(pointPool => {
            //console.log(pointPool);
            if (!pointPool) {
                //console.log('fail');
                return JSON.stringify({status: false, message: 'Unable to find Point Pool record'});
            } else {
                return ({status: true, pointsRemaining: pointPool[0].points_remaining});
            }
        })
        .catch(err => {
            console.log('problem communicating with db');
            console.log(err);
            return JSON.stringify({status: false, message: err});
        });
};

module.exports.getRemainingPointPoolLocal = getRemainingPointPoolLocal;*/

const removePointsFromPointPool = function (managerId, amount) {
  console.log('removePointsFromPointPoolLocal');

  // First, get the Remaining Point Pool
  return getRemainingPointPool(managerId)
    .then(remainingPointPool => {
      if(remainingPointPool.pointsRemaining < amount) {
        return {status: false, message: 'There is not enough points in the point pool to complete this transaction' };
      } else {
        // return SqlModel.sequelize.query("UPDATE `point_pool` SET `points_remaining` = `points_remaining` - " + amount + " " +
        //     "WHERE `point_pool`.`managerId` = " + managerId + ";", {type: SqlModel.sequelize.QueryTypes.UPDATE})
        return sqlPointPoolModel.update({
          pointsRemaining: remainingPointPool.pointsRemaining - amount,
        }, {
          where: {
            managerId: managerId
          }
        })
          .then(queryResult => {
            if(!queryResult) {
              console.log('Something went wrong');
              return {status: false, message: 'Something went wrong'};
            } else {
              console.log('Points removed from point pool successfully');
              return {status: true, message: 'Points removed from point pool successfully', newPointPoolAmount: (remainingPointPool.pointsRemaining - amount)};
            }
          })
          .catch(err => {
            console.log('Trouble with the database');
            console.log(err);
            return {status: false, message: err};
          })
      }
    })
};

module.exports.removePointsFromPointPool = removePointsFromPointPool;

const initializePointPool = function (managerId) {
  console.log('initializePointPool');

  return sqlPointPoolModel.create({
    managerId: managerId,
  })
    .then(() => {
      console.log('Point Pool creation succeeded.');
      return { status: true, message: 'Point Pool creation succeeded.' };
    })
    .catch(err => {
      console.log('Problem with the database');
      return { status: false, message: err };
    })
};

module.exports.initializePointPool = initializePointPool;

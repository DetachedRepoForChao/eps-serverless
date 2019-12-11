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


const removePointsFromPointPool = function (managerId, amount) {
  console.log('removePointsFromPointPoolLocal');

  // First, get the Remaining Point Pool
  return getRemainingPointPool(managerId)
    .then(remainingPointPool => {
      if(remainingPointPool.pointsRemaining < amount) {
        return {status: false, message: 'There is not enough points in the point pool to complete this transaction' };
      } else {
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

const initializePointPool = function (amount, managerId) {
  console.log('initializePointPool');

  return getPointPoolMax()
    .then(pointPoolMaxResult => {
      if (pointPoolMaxResult.status !== false) {
        const pointsRemaining = (amount) ? amount : pointPoolMaxResult.pointPoolMax.maxAmount;
        return sqlPointPoolModel.create({
          managerId: managerId,
          pointsRemaining: pointsRemaining,
          maxAmount: pointPoolMaxResult.pointPoolMax.maxAmount
        })
          .then((pointPool) => {
            console.log('Point Pool creation succeeded.');
            return { status: true, message: 'Point Pool creation succeeded.', pointPool: pointPool };
          })
          .catch(err => {
            console.log('Problem creating point pool.');
            console.log(err);
            return { status: false, message: err };
          })
      } else {
        console.log('Problem retrieving point pool max');
        return {status: false, message: 'Problem retrieving point pool max'};
      }
    })
    .catch(err => {
      console.log('Database error.');
      console.log(err);
      return { status: false, message: err };
    });
};

module.exports.initializePointPool = initializePointPool;

const updatePointPool = function (managerId, amount) {
  console.log('updatePointPool');

  return sqlPointPoolModel.update({
    pointsRemaining: amount,
  }, {
    where: {
      managerId: managerId
    }
  })
    .then(updateResult => {
      if(!updateResult) {
        console.log('Something went wrong');
        return {status: false, message: 'Something went wrong'};
      } else {
        console.log('Updated point pool successfully');
        return {status: true, message: 'Updated point pool successfully', updatedPointPoolAmount: amount};
      }
    })
    .catch(err => {
      console.log('Database error');
      console.log(err);
      return {status: false, message: err};
    })
};

module.exports.updatePointPool = updatePointPool;

const getPointPoolMax = function () {
  console.log('getPointPoolMax');

  return Models.PointPoolMax.findOne({
    where: {
      isActive: true,
    }
  })
    .then(pointPoolMax => {
      if (!pointPoolMax) {
        return {status: false, message: 'Point Pool Max record not found.'};
      } else {
        return {status: true, pointPoolMax: pointPoolMax};
      }
    })
    .catch(err => {
      console.log('problem communicating with db');
      console.log(err);
      return {status: false, message: err};
    });
  // });
};

module.exports.getPointPoolMax = getPointPoolMax;

const setPointPoolMax = function (newMax, username) {
  console.log('setPointPoolMax');

  return Models.PointPoolMax.update(
    {
      maxAmount: newMax,
      setBy: username
    },
    {
      where: {
        isActive: true,
      }
    }
  )
    .then(() => {
      return {status: true, pointPoolMax: newMax};
    })
    .catch(err => {
      console.log('problem communicating with db');
      console.log(err);
      return {status: false, message: err};
    });
  // });
};

module.exports.setPointPoolMax = setPointPoolMax;

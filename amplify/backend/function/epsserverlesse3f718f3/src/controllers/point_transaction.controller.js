const Sequelize = require('sequelize');
const SqlModel = require('../db');
const Models = SqlModel().Models;

const sqlPointTransactionModel = Models.PointTransaction;
const sqlUserModel = Models.User;
const componentName = 'point_transaction.controller';


const getUserName = function (userId) {

  return sqlUserModel.findOne({
    attributes: ['id','username','firstName','lastName','points','email', 'securityRoleId','departmentId'],
    where: {
      id: userId,
    },
  })
    .then(userInfo => {
        console.log('userInfo');
        console.log(userInfo);
        return userInfo
      }
    )
    .catch(err => {
        console.log('Database error');
        console.log(err);
        return err;
      }
    );

};

/**
 *
 * First : save it in the database
 * Second: Detect whether the user is online
 * Final: Return the total like about this post
 *
 * @param req
 * @param res
 * @param next
 */

const getPointTransaction = function () {
  const functionName = 'getPointTransaction';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  return Models.PointTransaction.findAll({
    include: [
      {
        model: Models.User,
        as: 'sourceUser',
        attributes: ['id', 'username', 'firstName', 'lastName', 'email', 'avatarUrl', 'points']
      },
      {
        model: Models.User,
        as: 'targetUser',
        attributes: ['id', 'username', 'firstName', 'lastName', 'email', 'avatarUrl', 'points']
      },
      {
        model: Models.PointItem,
        attributes: ['name', 'coreValues']
      },
      {
        model: Models.StoreItem,
        attributes: ['id', 'name', 'description', 'cost', 'imagePath']
      },
      {
        model: Models.LikeInfo,
        attributes: ['id', 'postId', 'username', 'createdAt']
      },
    ],
    attributes: ['id', 'type', 'amount', 'createdAt', 'description', 'sourceUserId', 'targetUserId', 'pointItemId'],
    order: [
      ['id', 'DESC'],
    ],
    limit: 25,
    subQuery: false
  })
    .then(pointTransactionResult => {
        console.log(`${functionFullName}: pointTransactionResult:`);
        console.log(pointTransactionResult);

        const resultLength = pointTransactionResult.length;
        console.log(`${functionFullName}: resultLength: ${resultLength}`);
        return {status: true, pointTransactions: pointTransactionResult};
      }
    )
    .catch(err => {
        console.log(`${functionFullName}: Database error`);
        console.log(err);
        return {status: false, message: err};
      }
    );
};

module.exports.getPointTransaction = getPointTransaction;



const getPointTransactionRange = function (startIndex, numberRecords) {
  const functionName = 'getPointTransactionRange';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  return Models.PointTransaction.findAll({
    include: [
      {
        model: Models.User,
        as: 'sourceUser',
        attributes: ['id', 'username', 'firstName', 'lastName', 'email', 'avatarUrl', 'points']
      },
      {
        model: Models.User,
        as: 'targetUser',
        attributes: ['id', 'username', 'firstName', 'lastName', 'email', 'avatarUrl', 'points']
      },
      {
        model: Models.PointItem,
        attributes: ['name', 'coreValues']
      },
      {
        model: Models.StoreItem,
        attributes: ['id', 'name', 'description', 'cost', 'imagePath']
      },
      {
        model: Models.LikeInfo,
        attributes: ['id', 'postId', 'username', 'createdAt']
      },
    ],
    attributes: ['id', 'type', 'amount', 'createdAt', 'description', 'sourceUserId', 'targetUserId', 'pointItemId', 'storeItemId'],
    order: [
      ['id', 'DESC'],
    ],
    offset: startIndex,
    limit: numberRecords,
    subQuery: false,
  })
    .then(pointTransactionResult => {
        console.log(`${functionFullName}: pointTransactionResult:`);
        console.log(pointTransactionResult);

        const resultLength = pointTransactionResult.length;
        console.log(`${functionFullName}: resultLength: ${resultLength}`);
        return {status: true, pointTransactions: pointTransactionResult};
      }
    )
    .catch(err => {
        console.log(`${functionFullName}: Database error`);
        console.log(err);
        return {status: false, message: err};
      }
    );
};

module.exports.getPointTransactionRange = getPointTransactionRange;


const getAddPointTransactionRange = function (startIndex, numberRecords) {
  const functionName = 'getAddPointTransactionRange';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  return Models.PointTransaction.findAll({
    include: [
      {
        model: Models.User,
        as: 'sourceUser',
        attributes: ['id', 'username', 'firstName', 'lastName', 'email', 'avatarUrl', 'points']
      },
      {
        model: Models.User,
        as: 'targetUser',
        attributes: ['id', 'username', 'firstName', 'lastName', 'email', 'avatarUrl', 'points']
      },
      {
        model: Models.PointItem,
        attributes: ['name', 'coreValues']
      },
      {
        model: Models.StoreItem,
        attributes: ['id', 'name', 'description', 'cost', 'imagePath']
      },
      {
        model: Models.LikeInfo,
        attributes: ['id', 'postId', 'username', 'createdAt']
      },
    ],
    attributes: ['id', 'type', 'amount', 'createdAt', 'description', 'sourceUserId', 'targetUserId', 'pointItemId', 'storeItemId'],
    order: [
      ['id', 'DESC'],
    ],
    offset: startIndex,
    limit: numberRecords,
    subQuery: false,
    where: {
      type: 'Add'
    }
  })
    .then(pointTransactionResult => {
        console.log(`${functionFullName}: pointTransactionResult:`);
        console.log(pointTransactionResult);

        const resultLength = pointTransactionResult.length;
        console.log(`${functionFullName}: resultLength: ${resultLength}`);
        return {status: true, pointTransactions: pointTransactionResult};
      }
    )
    .catch(err => {
        console.log(`${functionFullName}: Database error`);
        console.log(err);
        return {status: false, message: err};
      }
    );
};

module.exports.getAddPointTransactionRange = getAddPointTransactionRange;

const getUserPointTransactions = function (userId) {
  const functionName = 'getUserPointTransactions';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  return Models.PointTransaction.findAll({
    include: [
      {
        model: Models.User,
        as: 'sourceUser',
        attributes: ['id', 'username', 'firstName', 'lastName', 'email', 'avatarUrl', 'points']
      },
      {
        model: Models.User,
        as: 'targetUser',
        attributes: ['id', 'username', 'firstName', 'lastName', 'email', 'avatarUrl', 'points']
      },
      {
        model: Models.PointItem,
        attributes: ['name', 'coreValues']
      },
      {
        model: Models.StoreItem,
        attributes: ['id', 'name', 'description', 'cost', 'imagePath']
      },
      {
        model: Models.LikeInfo,
        attributes: ['id', 'postId', 'username', 'createdAt']
      },
    ],
    attributes: ['id', 'type', 'amount', 'createdAt', 'description', 'sourceUserId', 'targetUserId', 'pointItemId', 'storeItemId'],
    order: [
      ['id', 'DESC'],
    ],
    where: {
      targetUserId: userId
    }
  })
    .then(pointTransactionResult => {
        console.log(`${functionFullName}: pointTransactionResult:`);
        console.log(pointTransactionResult);

        const resultLength = pointTransactionResult.length;
        console.log(`${functionFullName}: resultLength: ${resultLength}`);
        return {status: true, pointTransactions: pointTransactionResult};
      }
    )
    .catch(err => {
        console.log(`${functionFullName}: Database error`);
        console.log(err);
        return {status: false, message: err};
      }
    );
};

module.exports.getUserPointTransactions = getUserPointTransactions;


const getManagerPointTransactions = function (userId) {
  const functionName = 'getManagerPointTransactions';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  return Models.PointTransaction.findAll({
    include: [
      {
        model: Models.User,
        as: 'sourceUser',
        attributes: ['id', 'username', 'firstName', 'lastName', 'email', 'avatarUrl', 'points']
      },
      {
        model: Models.User,
        as: 'targetUser',
        attributes: ['id', 'username', 'firstName', 'lastName', 'email', 'avatarUrl', 'points']
      },
      {
        model: Models.PointItem,
        attributes: ['name', 'coreValues']
      },
      {
        model: Models.LikeInfo,
        attributes: ['id', 'postId', 'username', 'createdAt']
      },
    ],
    attributes: ['id', 'type', 'amount', 'createdAt', 'description', 'sourceUserId', 'targetUserId', 'pointItemId', 'storeItemId'],
    order: [
      ['id', 'DESC'],
    ],
    where: {
      sourceUserId: userId
    }
  })
    .then(pointTransactionResult => {
        console.log(`${functionFullName}: pointTransactionResult:`);
        console.log(pointTransactionResult);

        const resultLength = pointTransactionResult.length;
        console.log(`${functionFullName}: resultLength: ${resultLength}`);
        return {status: true, pointTransactions: pointTransactionResult};
      }
    )
    .catch(err => {
        console.log(`${functionFullName}: Database error`);
        console.log(err);
        return {status: false, message: err};
      }
    );
};

module.exports.getManagerPointTransactions = getManagerPointTransactions;

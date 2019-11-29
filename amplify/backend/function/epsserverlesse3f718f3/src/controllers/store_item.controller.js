const SqlModel = require('../db');
const Models = SqlModel().Models;
const sequelize = Models.sequelize;
// const sqlUserModel = Models.User;
const sqlStoreItemModel = Models.StoreItem;
const sqlUserHasStoreItemModel = Models.UserHasStoreItem;
const ctrlPoints = require('./points.controller');
const componentName = 'store_item.controller';

const getStoreItems = function() {
  const functionName = 'getStoreItems';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  return sqlStoreItemModel.findAll()
    .then(storeItems => {
      if(!storeItems) {
        console.log(`${functionFullName}: No records found`);
        return {status: false, message: 'No records found'};
      } else {
        console.log(`${functionFullName}: Records found`);
        console.log(storeItems);
        return {status: true, storeItems: storeItems};
      }
    })
    .catch(err => {
      console.log(`${functionFullName}: Error retrieving records`);
      console.log(err);
      return {status: false, message: err};
    });
};

module.exports.getStoreItems = getStoreItems;

const getUserHasStoreItemRecords = function (requestUser) {
  const functionName = 'getUserHasStoreItemRecords';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);
  console.log(requestUser);
  return sqlUserHasStoreItemModel.findAll({
    include: [
      {
        model: Models.User,
        as: 'requestUser',
        attributes: ['id', 'username', 'firstName', 'lastName', 'email', 'avatarUrl', 'points']
      },
      {
        model: Models.User,
        as: 'managerUser',
        attributes: ['id', 'username', 'firstName', 'lastName', 'email', 'avatarUrl', 'points']
      },
      {
        model: Models.StoreItem,
        attributes: ['id', 'name', 'description', 'cost']
      },
    ],
    where: {
      userId: requestUser.id
    }
  })
    .then(result => {
      if (!result) {
        console.log(`${functionFullName}: No records found`);
        return {status: false, message: 'No records found'};
      } else {
        console.log(`${functionFullName}: Records found`);
        console.log(result);
        return {status: true, userHasStoreItemRecords: result};
      }
    })
    .catch( err => {
      console.log(`${functionFullName}: Error retrieving records`);
      console.log(err);
      return {status: false, message: err};
    });
};

module.exports.getUserHasStoreItemRecords = getUserHasStoreItemRecords;

const getUserHasStoreItemManagerRecords = function (managerUser) {
  const functionName = 'getUserHasStoreItemManagerRecords';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);
  console.log(managerUser);
  return sqlUserHasStoreItemModel.findAll({
    include: [
      {
        model: Models.User,
        as: 'requestUser',
        attributes: ['id', 'username', 'firstName', 'lastName', 'email', 'avatarUrl', 'points']
      },
      {
        model: Models.User,
        as: 'managerUser',
        attributes: ['id', 'username', 'firstName', 'lastName', 'email', 'avatarUrl', 'points']
      },
      {
        model: Models.StoreItem,
        attributes: ['id', 'name', 'description', 'cost']
      },
    ],
    where: {
      managerId: managerUser.id
    }
  })
    .then(result => {
      if (!result) {
        console.log(`${functionFullName}: No records found`);
        return {status: false, message: 'No records found'};
      } else {
        console.log(`${functionFullName}: Records found`);
        console.log(result);
        return {status: true, userHasStoreItemRecords: result};
      }
    })
    .catch( err => {
      console.log(`${functionFullName}: Error retrieving records`);
      console.log(err);
      return {status: false, message: err};
    });
};

module.exports.getUserHasStoreItemManagerRecords = getUserHasStoreItemManagerRecords;


const newUserHasStoreItemRecord = function (requestUser, managerId, storeItemId) {
  const functionName = 'newUserHasStoreItemRecord';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  // Create user_has_store_item record
  return sqlUserHasStoreItemModel.create({
    userId: requestUser.id,
    managerId: managerId,
    storeItemId: storeItemId
  })
    .then(userHasStoreItemRecord => {
      console.log(`${functionFullName}: New user / store item request created successfully`);
      return {status: true, userHasStoreItemRecord: userHasStoreItemRecord};
    })
    .catch( err => {
      console.log(`${functionFullName}: Error creating new user / store item request`);
      console.log(err);
      return {status: false, message: err};
    });
};

module.exports.newUserHasStoreItemRecord = newUserHasStoreItemRecord;

const newStoreItem = function (storeItem) {
  const functionName = 'newStoreItem';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  console.log(`${functionFullName}: Creating Store Item:`);
  console.log(storeItem);

  return sqlStoreItemModel.create({
    name: storeItem.name,
    description: storeItem.description,
    cost: storeItem.cost,
    imagePath: storeItem.imagePath,
  })
    .then(newStoreItem => {
      console.log(newStoreItem);
      console.log(`${functionFullName}: Created new Store Item successfully`);
      return {status: true, storeItem: newStoreItem};
    })
    .catch(err => {
      console.log(`${functionFullName}: Database error`);
      console.log(err);
      return {status: false, message: err};
    });
};

module.exports.newStoreItem = newStoreItem;

const modifyStoreItem = function (storeItem) {
  const functionName = 'modifyStoreItem';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  console.log(`${functionFullName}: Modifying Store Item:`);
  console.log(storeItem);

  return sqlStoreItemModel.update({
    name: storeItem.name,
    description: storeItem.description,
    cost: storeItem.cost,
    imagePath: storeItem.imagePath,
  }, {
    where: {
      id: storeItem.itemId,
    }
  })
    .then(() => {
      console.log(`${functionFullName}: Successfully updated Store Item`);
      return {status: true, storeItem: storeItem};
    })
    .catch(err => {
      console.log(`${functionFullName}: Database error`);
      console.log(err);
      return {status: false, message: err};
    });
};

module.exports.modifyStoreItem = modifyStoreItem;

const deleteStoreItem = function (storeItem) {
  const functionName = 'deleteStoreItem';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  console.log(`${functionFullName}: Deleting Point Item:`);
  console.log(storeItem);

  return sqlStoreItemModel.destroy({
    where: {
      id: storeItem.itemId,
    }
  })
    .then(() => {
      console.log(`${functionFullName}: Successfully deleted Store Item`);
      return {status: true, storeItem: storeItem};
    })
    .catch(err => {
      console.log(`${functionFullName}: Database error`);
      console.log(err);
      return {status: false, message: err};
    });
};

module.exports.deleteStoreItem = deleteStoreItem;


const approveStoreItemRequest = function (managerUser, request) {
  const functionName = 'approveStoreItemRequest';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  const approvedAt = Date.now();
  request.status = 'approved';
  request.approvedAt = approvedAt;

  // Update user_has_store_item record
  return sqlUserHasStoreItemModel.update({
    status: 'approved',
    approvedAt: approvedAt
  }, {
    where: {
      id: request.recordId,
      managerId: managerUser.id
    }
  })
    .then(() => {
      console.log(`${functionFullName}: Store item request updated successfully`);

      const description = `Manager (id: ${request.managerId}; username: ${request.managerUsername}) approved user's (id: ${request.userId}; username: ${request.userUsername}) purchase of item (id: ${request.storeItemId}; name: ${request.storeItemName}; cost: ${request.storeItemCost}; request id: ${request.recordId})`;

      return ctrlPoints.removePointsFromEmployee(request.userId, request.userId, request.storeItemId, request.storeItemCost, description)
        .then(removeResult => {
          console.log(`${functionFullName}: Remove points result:`);
          console.log(removeResult);
          if (removeResult.status !== false) {
            console.log(`${functionFullName}: Points removed from user's total successfully. User's new point total is ${removeResult.newPointAmount}`);
            return {status: true, updatedRecord: request, newPointTotal: removeResult.newPointAmount};
          } else {
            console.log(`${functionFullName}: Error removing points from user's total:`);
            console.log(removeResult.message);
            return {status: false, updatedRecord: request, error: removeResult};
          }
        })
        .catch(err => {
          console.log(`${functionFullName}: Database error`);
          console.log(err);
          return {status: false, message: err};
        });
    })
    .catch( err => {
      console.log(`${functionFullName}: Error updating store item request`);
      console.log(err);
      return {status: false, message: err};
    });
};

module.exports.approveStoreItemRequest = approveStoreItemRequest;

const declineStoreItemRequest = function (managerUser, request, cancelDescription) {
  const functionName = 'declineStoreItemRequest';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  const declinedAt = Date.now();
  request.status = 'declined';
  request.declinedAt = declinedAt;

  // Update user_has_store_item record
  return sqlUserHasStoreItemModel.update({
    status: 'declined',
    declinedAt: declinedAt,
    cancelDescription: cancelDescription
  }, {
    where: {
      id: request.recordId,
      managerId: managerUser.id
    }
  })
    .then(() => {
      console.log(`${functionFullName}: Store item request updated successfully`);
      return {status: true, updatedRecord: request};
    })
    .catch( err => {
      console.log(`${functionFullName}: Error updating store item request`);
      console.log(err);
      return {status: false, message: err};
    });
};

module.exports.declineStoreItemRequest = declineStoreItemRequest;

const fulfillStoreItemRequest = function (requestUser, request) {
  const functionName = 'fulfillStoreItemRequest';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  const fulfilledAt = Date.now();
  request.status = 'fulfilled';
  request.fulfilledAt = fulfilledAt;

  // Update user_has_store_item record
  return sqlUserHasStoreItemModel.update({
    status: 'fulfilled',
    fulfilledAt: fulfilledAt,
  }, {
    where: {
      id: request.recordId,
      userId: requestUser.id
    }
  })
    .then(() => {
      console.log(`${functionFullName}: Store item request updated successfully`);
      return {status: true, updatedRecord: request};
    })
    .catch( err => {
      console.log(`${functionFullName}: Error updating store item request`);
      console.log(err);
      return {status: false, message: err};
    });
};

module.exports.fulfillStoreItemRequest = fulfillStoreItemRequest;

const cancelStoreItemRequest = function (requestUser, request, cancelDescription) {
  const functionName = 'cancelStoreItemRequest';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  const cancelledAt = Date.now();
  request.status = 'cancelled';
  request.cancelledAt = cancelledAt;
  // Update user_has_store_item record
  return sqlUserHasStoreItemModel.update({
    status: 'cancelled',
    cancelledAt: cancelledAt,
    cancelDescription: cancelDescription
  }, {
    where: {
      id: request.recordId,
      userId: requestUser.id
    }
  })
    .then(() => {
      console.log(`${functionFullName}: Store item request updated successfully`);

      return {status: true, updatedRecord: request};
    })
    .catch( err => {
      console.log(`${functionFullName}: Error updating store item request`);
      console.log(err);
      return {status: false, message: err};
    });
};

module.exports.cancelStoreItemRequest = cancelStoreItemRequest;

const subtractPointsFromUserPointTotal = function (user, subtractAmount) {
  const functionName = 'subtractPointsFromUserPointTotal';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  // Update user record
  return Models.User.update({
    points: (user.points - subtractAmount)
  }, {
    where: {
      id: user.id,
    }
  })
    .then(() => {
      console.log(`${functionFullName}: User points updated successfully`);
      return {status: true, newPointTotal: (user.points - subtractAmount)};
    })
    .catch( err => {
      console.log(`${functionFullName}: Error updating user points`);
      console.log(err);
      return {status: false, message: err};
    });
};

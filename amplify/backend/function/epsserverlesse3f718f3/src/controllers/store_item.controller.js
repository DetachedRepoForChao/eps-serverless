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
/*      {
        model: Models.User,
        as: 'managerUser',
        attributes: ['id', 'username', 'firstName', 'lastName', 'email', 'avatarUrl', 'points']
      },*/
      {
        model: Models.User,
        as: 'updatedByUser',
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
        return {status: true, purchaseRequests: result};
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
/*      {
        model: Models.User,
        as: 'managerUser',
        attributes: ['id', 'username', 'firstName', 'lastName', 'email', 'avatarUrl', 'points']
      },*/
      {
        model: Models.User,
        as: 'updatedByUser',
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
        return {status: true, purchaseRequests: result};
      }
    })
    .catch( err => {
      console.log(`${functionFullName}: Error retrieving records`);
      console.log(err);
      return {status: false, message: err};
    });
};

module.exports.getUserHasStoreItemManagerRecords = getUserHasStoreItemManagerRecords;


const getPurchaseRequestsAdmin = function (managerUser) {
  const functionName = 'getPurchaseRequestsAdmin';
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
/*      {
        model: Models.User,
        as: 'managerUser',
        attributes: ['id', 'username', 'firstName', 'lastName', 'email', 'avatarUrl', 'points']
      },*/
      {
        model: Models.User,
        as: 'updatedByUser',
        attributes: ['id', 'username', 'firstName', 'lastName', 'email', 'avatarUrl', 'points']
      },
      {
        model: Models.StoreItem,
        attributes: ['id', 'name', 'description', 'cost']
      },
    ],
  })
    .then(result => {
      if (!result) {
        console.log(`${functionFullName}: No records found`);
        return {status: false, message: 'No records found'};
      } else {
        console.log(`${functionFullName}: Records found`);
        console.log(result);
        return {status: true, purchaseRequests: result};
      }
    })
    .catch( err => {
      console.log(`${functionFullName}: Error retrieving records`);
      console.log(err);
      return {status: false, message: err};
    });
};

module.exports.getPurchaseRequestsAdmin = getPurchaseRequestsAdmin;

const newUserHasStoreItemRecord = function (requestUser, storeItemId) {
  const functionName = 'newUserHasStoreItemRecord';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  // Create user_has_store_item record
  return sqlUserHasStoreItemModel.create({
    userId: requestUser.id,
    // managerId: managerId,
    storeItemId: storeItemId
  })
    .then(newUserHasStoreItemRecord => {
      console.log(`${functionFullName}: New user / store item request created successfully`);
      return sqlUserHasStoreItemModel.findOne({
        include: [
          {
            model: Models.User,
            as: 'requestUser',
            attributes: ['id', 'username', 'firstName', 'lastName', 'email', 'avatarUrl', 'points']
          },
/*          {
            model: Models.User,
            as: 'managerUser',
            attributes: ['id', 'username', 'firstName', 'lastName', 'email', 'avatarUrl', 'points']
          },*/
          {
            model: Models.StoreItem,
            attributes: ['id', 'name', 'description', 'cost']
          },
        ],
        where: {
          id: newUserHasStoreItemRecord.id
        }
      })
        .then(userHasStoreItemRecord => {
          console.log(userHasStoreItemRecord);
          const description = `User (id: ${userHasStoreItemRecord.userId}; username: ${userHasStoreItemRecord.requestUser.username}) purchased item (id: ${userHasStoreItemRecord.storeItem.id}; name: ${userHasStoreItemRecord.storeItem.name}; cost: ${userHasStoreItemRecord.storeItem.cost}; request id: ${userHasStoreItemRecord.id})`;

          return ctrlPoints.removePointsFromEmployee(requestUser.id, requestUser.id, storeItemId, userHasStoreItemRecord.storeItem.cost, description)
            .then(removeResult => {
              console.log(`${functionFullName}: Remove points result:`);
              console.log(removeResult);
              if (removeResult.status !== false) {
                console.log(`${functionFullName}: Points removed from user's total successfully. User's new point total is ${removeResult.newPointAmount}`);
                return {status: true, purchaseRequest: userHasStoreItemRecord, newPointTotal: removeResult.newPointAmount};
              } else {
                console.log(`${functionFullName}: Error removing points from user's total:`);
                console.log(removeResult.message); // TODO: Rollback purchase request record
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
          console.log(`${functionFullName}: Error returning new user / store item request`);
          console.log(err);
          return {status: false, message: err};
        });
    })
    .catch( err => {
      console.log(`${functionFullName}: Database error creating new user / store item request`);
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

const setStoreItemRequestReadyForPickup = function (updatedByUser, request) {
  const functionName = 'setStoreItemRequestReadyForPickup';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  const time = Date.now();
  request.status = 'readyForPickup';
  request.readyForPickupAt = time;

  // Update user_has_store_item record
  return sqlUserHasStoreItemModel.update({
    status: 'readyForPickup',
    readyForPickupAt: time,
    updatedByUsername: updatedByUser.username
  }, {
    where: {
      id: request.recordId,
    }
  })
    .then(() => {
      console.log(`${functionFullName}: Store item request updated successfully`);
      const description = `Manager (id: ${updatedByUser.userId}; username: ${updatedByUser.username}) changed user (id: ${request.userId}; username: ${request.userUsername}) item (id: ${request.storeItemId}; name: ${request.storeItemName}; cost: ${request.storeItemCost}; request id: ${request.recordId}) status from 'Pending' to 'Ready For Pickup'`;

      return {status: true, updatedRecord: request, message: description};


/*      return ctrlPoints.removePointsFromEmployee(request.userId, request.userId, request.storeItemId, request.storeItemCost, description)
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
        });*/
    })
    .catch( err => {
      console.log(`${functionFullName}: Error updating store item request`);
      console.log(err);
      return {status: false, message: err};
    });
};

module.exports.setStoreItemRequestReadyForPickup = setStoreItemRequestReadyForPickup;

const setStoreItemRequestPickedUp = function (updatedByUser, request) {
  const functionName = 'setStoreItemRequestPickedUp';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  const time = Date.now();
  request.status = 'pickedUp';
  request.pickedUpAt = time;

  // Update user_has_store_item record
  return sqlUserHasStoreItemModel.update({
    status: 'pickedUp',
    pickedUpAt: time,
    updatedByUsername: updatedByUser.username
  }, {
    where: {
      id: request.recordId,
    }
  })
    .then(() => {
      console.log(`${functionFullName}: Store item request updated successfully`);
      return {status: true, updatedRecord: request, updatedByUser: updatedByUser};
    })
    .catch( err => {
      console.log(`${functionFullName}: Error updating store item request`);
      console.log(err);
      return {status: false, message: err};
    });
};

module.exports.setStoreItemRequestPickedUp = setStoreItemRequestPickedUp;


const setStoreItemRequestsReadyForPickup = function (updatedByUser, requests) {
  const functionName = 'setStoreItemRequestsReadyForPickup';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  const time = Date.now();
  const status = 'readyForPickup';
  // const pickedUpAt = time;
  const ids = [];
  requests.forEach(request => {
    ids.push(request.recordId);
    request.status = status;
    request.pickedUpAt = time;
  });

  console.log(`${functionFullName}: updating records:`);
  console.log(ids);
  // Update user_has_store_item records
  return sqlUserHasStoreItemModel.update({
    status: status,
    readyForPickupAt: time,
    updatedByUsername: updatedByUser.username
  }, {
    where: {
      id: ids,
    }
  })
    .then(() => {
      console.log(`${functionFullName}: Store item requests updated successfully`);

      const promises = [];
      const resultsArray = [];
      let completionErrors = false;
      for (const request of requests) {
        const description = `Manager (id: ${updatedByUser.id}; username: ${updatedByUser.username}) changed user (id: ${request.userId}; username: ${request.userUsername}) item (id: ${request.storeItemId}; name: ${request.storeItemName}; cost: ${request.storeItemCost}; request id: ${request.recordId}) status from 'Pending' to 'Ready For Pickup'`;
        const result = {
          updatedRecord: request,
          message: description
        };
        if (request.status !== true) {
          completionErrors = true;
        }
        resultsArray.push(result);
        // promises.push(ctrlPoints.removePointsFromEmployee(request.userId, request.userId, request.storeItemId, request.storeItemCost, description));
      }

      return {status: true, completionErrors: completionErrors, results: resultsArray, updatedByUser: updatedByUser}

    })
    .catch( err => {
      console.log(`${functionFullName}: Error updating store item request`);
      console.log(err);
      return {status: false, message: err};
    });
};

module.exports.setStoreItemRequestsReadyForPickup = setStoreItemRequestsReadyForPickup;

const setStoreItemRequestsPickedUp = function (updatedByUser, requests) {
  const functionName = 'setStoreItemRequestsPickedUp';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  const time = Date.now();
  const status = 'pickedUp';
  // const pickedUpAt = time;
  const ids = [];
  requests.forEach(request => {
    ids.push(request.recordId);
    request.status = status;
    request.pickedUpAt = time;
  });

  // Update user_has_store_item records
  return sqlUserHasStoreItemModel.update({
    status: status,
    pickedUpAt: time,
    updatedByUsername: updatedByUser.username
  }, {
    where: {
      id: ids,
    }
  })
    .then(() => {
      console.log(`${functionFullName}: Store item request updated successfully`);
      return {status: true, updatedRecords: requests, updatedByUser: updatedByUser};
    })
    .catch( err => {
      console.log(`${functionFullName}: Error updating store item request`);
      console.log(err);
      return {status: false, message: err};
    });
};

module.exports.setStoreItemRequestsPickedUp = setStoreItemRequestsPickedUp;

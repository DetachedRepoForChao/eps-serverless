const SqlModel = require('../db');
const Models = SqlModel().Models;
// const sqlUserModel = Models.User;
const sqlStoreItemModel = Models.StoreItem;
const sqlUserHasStoreItemModel = Models.UserHasStoreItem;

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

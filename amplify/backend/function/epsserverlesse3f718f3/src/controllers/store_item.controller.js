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

exports.module.getStoreItems = getStoreItems;

const newStoreItemRequest = function (requestUser, storeItemId) {
  const functionName = 'newStoreItemRequest';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  // Create user_has_store_item record
  return sqlUserHasStoreItemModel.create({
    userId: requestUser.id,
    storeItemId: storeItemId
  })
    .then(() => {
      console.log(`${functionFullName}: New user / store item request created successfully`);
      return {status: true, message: 'New user / store item request created successfully'};
    })
    .catch( err => {
      console.log(`${functionFullName}: Error creating new user / store item request`);
      console.log(err);
      return {status: false, message: err};
    });
};

exports.module.newStoreItemRequest = newStoreItemRequest;



const SqlModel = require('../db');
const Models = SqlModel().Models;
// const sqlUserModel = Models.User;
const sqlStoreItemModel = Models.StoreItem;

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

exports.getStoreItems = getStoreItems;

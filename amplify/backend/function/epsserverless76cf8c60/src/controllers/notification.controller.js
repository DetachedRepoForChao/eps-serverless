const AWS = require('aws-sdk');

const componentName = 'notification.controller';

// Set the region
AWS.config.update({region: 'us-east-1'});

const sourceEmail = 'eps.hawkware@gmail.com';

const sendAwardPointsEmail = function (targetUser, sourceUser, pointItem) {
  const functionName = 'sendAwardPointsEmail';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  console.log(`${functionFullName}: targetUser:`);
  console.log(targetUser);
  console.log(`${functionFullName}: sourceUser:`);
  console.log(sourceUser);
  console.log(`${functionFullName}: pointItem:`);
  console.log(pointItem);

  // Get target user details
  const sendTo = targetUser.email;
  const targetUserName = targetUser.firstName;
  const targetUserPoints = targetUser.points;
  const managerName = `${sourceUser.firstName} ${sourceUser.lastName}`;
  const pointItemName = pointItem.name;
  const points = pointItem.amount;
  let description = '';
  if (pointItem.description && pointItem.description.length > 0) {
    description = `Manager's comment: ${pointItem.description}`
  }

  // Create sendEmail params
  const params = {
    Destination: { /* required */
      ToAddresses: [
        sendTo,
        /* more items */
      ]
    },
    Template: 'AwardPointsTemplate',
    ConfigurationSetName: "Default",
    TemplateData: `{\"name\":\"${targetUserName}\", \"managerName\":\"${managerName}\", \"points\": \"${points}\", \"pointItemName\": \"${pointItemName}\", \"description\": \"${description}\"}`,
    Source: sourceEmail, /* required */

  };

  // Create the promise and SES service object
  const sendPromise = new AWS.SES({apiVersion: '2010-12-01'}).sendTemplatedEmail(params).promise();

  // Handle promise's fulfilled/rejected states
  return sendPromise.then(
    function(data) {
      console.log(`${functionFullName}: success sending award points email`);
      console.log(data.MessageId);
      return ({status: true, data: data});
    }).catch(
    function(err) {
      console.log(`${functionFullName}: error sending award points email`);
      console.error(err, err.stack);
      return ({status: false, message: err});
    });
};

module.exports.sendAwardPointsEmail = sendAwardPointsEmail;


const sendRequestStoreItemEmail = function (managerUser, requestUser, storeItem) {
  const functionName = 'sendRequestStoreItemEmail';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  console.log(`${functionFullName}: managerUser:`);
  console.log(managerUser);
  console.log(`${functionFullName}: requestUser:`);
  console.log(requestUser);
  console.log(`${functionFullName}: storeItem:`);
  console.log(storeItem);

  // Get target user details
  const sendTo = managerUser.email;
  const requestUserFullName = `${requestUser.firstName} ${requestUser.lastName}`;
  const requestUserFirstName = `${requestUser.firstName}`;
  const managerUserFirstName = `${managerUser.firstName}`;
  const itemName = storeItem.name;
  const itemDescription = storeItem.description;
  const cost = storeItem.cost;

  // Create sendEmail params
  const params = {
    Destination: { /* required */
      ToAddresses: [
        sendTo,
        /* more items */
      ]
    },
    Template: 'RequestItemPurchase',
    ConfigurationSetName: "Default",
    TemplateData: `{\"requestUserFullName\":\"${requestUserFullName}\", \"managerUserFirstName\":\"${managerUserFirstName}\", \"requestUserFirstName\":\"${requestUserFirstName}\", \"itemName\": \"${itemName}\", \"itemDescription\": \"${itemDescription}\", \"cost\": \"${cost}\"}`,
    Source: sourceEmail, /* required */

  };

  // Create the promise and SES service object
  const sendPromise = new AWS.SES({apiVersion: '2010-12-01'}).sendTemplatedEmail(params).promise();

  // Handle promise's fulfilled/rejected states
  return sendPromise.then(
    function(data) {
      console.log(`${functionFullName}: success sending purchase request email`);
      console.log(data.MessageId);
      return ({status: true, data: data});
    }).catch(
    function(err) {
      console.log(`${functionFullName}: error sending purchase request email`);
      console.error(err, err.stack);
      return ({status: false, message: err});
    });
};

module.exports.sendRequestStoreItemEmail = sendRequestStoreItemEmail;


const sendFulfillStoreItemEmail = function (managerUser, requestUser, storeItem) {
  const functionName = 'sendFulfillStoreItemEmail';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  console.log(`${functionFullName}: managerUser:`);
  console.log(managerUser);
  console.log(`${functionFullName}: requestUser:`);
  console.log(requestUser);
  console.log(`${functionFullName}: storeItem:`);
  console.log(storeItem);

  // Get target user details
  const sendTo = requestUser.email;
  const requestUserFullName = `${requestUser.firstName} ${requestUser.lastName}`;
  const requestUserFirstName = `${requestUser.firstName}`;
  const managerUserFirstName = `${managerUser.firstName}`;
  const managerUserFullName = `${managerUser.firstName} ${managerUser.lastName}`;
  const itemName = storeItem.name;
  const itemDescription = storeItem.description;
  const cost = storeItem.cost;
  const newPointTotal = requestUser.points;

  // Create sendEmail params
  const params = {
    Destination: { /* required */
      ToAddresses: [
        sendTo,
        /* more items */
      ]
    },
    Template: 'FulfillItemPurchase',
    ConfigurationSetName: "Default",
    TemplateData: `{\"managerUserFullName\":\"${managerUserFullName}\", \"requestUserFirstName\":\"${requestUserFirstName}\", \"itemName\": \"${itemName}\", \"cost\": \"${cost}\", \"newPointTotal\": \"${newPointTotal}\"}`,
    Source: sourceEmail, /* required */

  };

  // Create the promise and SES service object
  const sendPromise = new AWS.SES({apiVersion: '2010-12-01'}).sendTemplatedEmail(params).promise();

  // Handle promise's fulfilled/rejected states
  return sendPromise.then(
    function(data) {
      console.log(`${functionFullName}: success sending purchase request email`);
      console.log(data.MessageId);
      return ({status: true, data: data});
    }).catch(
    function(err) {
      console.log(`${functionFullName}: error sending purchase request email`);
      console.error(err, err.stack);
      return ({status: false, message: err});
    });
};

module.exports.sendFulfillStoreItemEmail = sendFulfillStoreItemEmail;

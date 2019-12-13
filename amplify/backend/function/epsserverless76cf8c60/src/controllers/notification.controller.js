const AWS = require('aws-sdk');

const componentName = 'notification.controller';

// Set the region
AWS.config.update({region: 'us-east-1'});

const sourceEmail = 'admin@pineapplepoints.net';
const originationNumber = "+12014310746";

const sendAwardPointsEmail = function (targetUser, sourceUser, pointItem) {
  const functionName = 'sendAwardPointsEmail';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  console.log(`${functionFullName}: targetUser:`, targetUser);
  console.log(`${functionFullName}: sourceUser:`, sourceUser);
  console.log(`${functionFullName}: pointItem:`, pointItem);

  // Get target user details
  const sendTo = targetUser.email;
  const targetUserFirstName = targetUser.firstName;
  // const targetUserPoints = targetUser.points;
  const managerFullName = `${sourceUser.firstName} ${sourceUser.lastName}`;
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
    TemplateData: `{\"targetUserFirstName\":\"${targetUserFirstName}\", \"managerFullName\":\"${managerFullName}\", \"points\": \"${points}\", \"pointItemName\": \"${pointItemName}\", \"description\": \"${description}\"}`,
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

const sendAwardPointsSMS = function (targetUser, sourceUser, pointItem) {
  const functionName = 'sendAwardPointsSMS';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  console.log(`${functionFullName}: targetUser:`, targetUser);
  console.log(`${functionFullName}: sourceUser:`, sourceUser);
  console.log(`${functionFullName}: pointItem:`, pointItem);

  // Get target user details
  // const sendTo = targetUser.email;
  const phone = targetUser.phone;
  // const targetUserFirstName = targetUser.firstName;
  // const targetUserPoints = targetUser.points;
  const managerFullName = `${sourceUser.firstName} ${sourceUser.lastName}`;
  // const pointItemName = pointItem.name;
  // const points = pointItem.amount;
  let description = '';
  if (pointItem.description && pointItem.description.length > 0) {
    description = `Manager's comment: ${pointItem.description}`
  }


// The recipient's phone number.  For best results, you should specify the
// phone number in E.164 format.
  var destinationNumber = phone;

// The content of the SMS message.
  var message = `You were awarded Pineapple Points 🍍 by ${managerFullName}! Log in to https://pineapplepoints.net ` +
    `to get rewards for being awesome!`;

// The Amazon Pinpoint project/application ID to use when you send this message.
// Make sure that the SMS channel is enabled for the project or application
// that you choose.
  var applicationId = "49967c53c42141d8a27b7a335ab1945d";

// The type of SMS message that you want to send. If you plan to send
// time-sensitive content, specify TRANSACTIONAL. If you plan to send
// marketing-related content, specify PROMOTIONAL.
  var messageType = "TRANSACTIONAL";

// The registered keyword associated with the originating short code.
  var registeredKeyword = "keyword_644955040906";

// The sender ID to use when sending the message. Support for sender ID
// varies by country or region. For more information, see
// https://docs.aws.amazon.com/pinpoint/latest/userguide/channels-sms-countries.html
  var senderId = "pineaplpts";

// Specify that you're using a shared credentials file, and optionally specify
// the profile that you want to use.
//   var credentials = new AWS.SharedIniFileCredentials({profile: 'default'});
//   AWS.config.credentials = credentials;

// Specify the region.
//   AWS.config.update({region:aws_region});

//Create a new Pinpoint object.
  var pinpoint = new AWS.Pinpoint();

// Specify the parameters to pass to the API.
  var params = {
    ApplicationId: applicationId,
    MessageRequest: {
      Addresses: {
        [destinationNumber]: {
          ChannelType: 'SMS'
        }
      },
      MessageConfiguration: {
        SMSMessage: {
          Body: message,
          Keyword: registeredKeyword,
          MessageType: messageType,
          OriginationNumber: originationNumber,
          SenderId: senderId,
        }
      }
    }
  };

  //Try to send the message.
  const sendPromise = pinpoint.sendMessages(params).promise();

  return sendPromise.then(
    function(data) {
      console.log("Message sent! "
        + data['MessageResponse']['Result'][destinationNumber]['StatusMessage']);
      return ({status: true, data: data});
    })
    .catch(
      function(err) {
        console.log(`Error sending SMS`);
        console.error(err, err.stack);
        return ({status: false, message: err});
      });
};

module.exports.sendAwardPointsSMS = sendAwardPointsSMS;



const sendRequestStoreItemEmail = function (purchaseRequestManager, requestUser, storeItem) {
  const functionName = 'sendRequestStoreItemEmail';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  console.log(`${functionFullName}: purchaseRequestManager:`, purchaseRequestManager);
  console.log(`${functionFullName}: requestUser:`, requestUser);
  console.log(`${functionFullName}: storeItem:`, storeItem);

  // Get target user details
  const sendTo = purchaseRequestManager.email;
  const requestUserFullName = `${requestUser.firstName} ${requestUser.lastName}`;
  // const requestUserFirstName = `${requestUser.firstName}`;
  const purchaseRequestManagerFirstName = `${purchaseRequestManager.firstName}`;
  // const purchaseRequestManagerLastName = `${purchaseRequestManager.lastName}`;
  // const emailConfirmed = purchaseRequestManager.emailConfirmed;
  // const phoneConfirmed = purchaseRequestManager.phoneConfirmed;
  const itemName = storeItem.name;
  // const itemDescription = storeItem.description;
  // const cost = storeItem.cost;

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
    TemplateData: `{\"requestUserFullName\":\"${requestUserFullName}\", \"managerUserFirstName\":\"${purchaseRequestManagerFirstName}\", \"itemName\": \"${itemName}\"}`,
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


const sendRequestStoreItemSMS = function (purchaseRequestManager, requestUser, storeItem) {
  const functionName = 'sendRequestStoreItemSMS';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  console.log(`${functionFullName}: purchaseRequestManager:`, purchaseRequestManager);
  console.log(`${functionFullName}: requestUser:`, requestUser);
  console.log(`${functionFullName}: storeItem:`, storeItem);

  // Get target user details
  // const sendTo = purchaseRequestManager.email;
  const requestUserFullName = `${requestUser.firstName} ${requestUser.lastName}`;
  // const requestUserFirstName = `${requestUser.firstName}`;
  // const purchaseRequestManagerFirstName = `${purchaseRequestManager.firstName}`;
  // const purchaseRequestManagerLastName = `${purchaseRequestManager.lastName}`;
  // const emailConfirmed = purchaseRequestManager.emailConfirmed;
  // const phoneConfirmed = purchaseRequestManager.phoneConfirmed;
  // const email = purchaseRequestManager.email;
  const phone = purchaseRequestManager.phone;
  // const itemName = storeItem.name;
  // const itemDescription = storeItem.description;
  // const cost = storeItem.cost;


// The recipient's phone number.  For best results, you should specify the
// phone number in E.164 format.
  var destinationNumber = phone;

// The content of the SMS message.
  var message = `A new Pineapple Points 🍍 purchase request has been submitted by ${requestUserFullName}. ` +
    "You can check on new requests by going to https://pineapplepoints.net/user/confirm-item-purchase " +
    "and logging in with your admin account.";

// The Amazon Pinpoint project/application ID to use when you send this message.
// Make sure that the SMS channel is enabled for the project or application
// that you choose.
  var applicationId = "49967c53c42141d8a27b7a335ab1945d";

// The type of SMS message that you want to send. If you plan to send
// time-sensitive content, specify TRANSACTIONAL. If you plan to send
// marketing-related content, specify PROMOTIONAL.
  var messageType = "TRANSACTIONAL";

// The registered keyword associated with the originating short code.
  var registeredKeyword = "keyword_644955040906";

// The sender ID to use when sending the message. Support for sender ID
// varies by country or region. For more information, see
// https://docs.aws.amazon.com/pinpoint/latest/userguide/channels-sms-countries.html
  var senderId = "pineaplpts";

// Specify that you're using a shared credentials file, and optionally specify
// the profile that you want to use.
//   var credentials = new AWS.SharedIniFileCredentials({profile: 'default'});
//   AWS.config.credentials = credentials;

// Specify the region.
//   AWS.config.update({region:aws_region});

//Create a new Pinpoint object.
  var pinpoint = new AWS.Pinpoint();

// Specify the parameters to pass to the API.
  var params = {
    ApplicationId: applicationId,
    MessageRequest: {
      Addresses: {
        [destinationNumber]: {
          ChannelType: 'SMS'
        }
      },
      MessageConfiguration: {
        SMSMessage: {
          Body: message,
          Keyword: registeredKeyword,
          MessageType: messageType,
          OriginationNumber: originationNumber,
          SenderId: senderId,
        }
      }
    }
  };

  //Try to send the message.
  const sendPromise = pinpoint.sendMessages(params).promise();

  return sendPromise.then(
    function(data) {
      console.log("Message sent! "
        + data['MessageResponse']['Result'][destinationNumber]['StatusMessage']);
      return ({status: true, data: data});
    })
    .catch(
      function(err) {
        console.log(`Error sending SMS`);
        console.error(err, err.stack);
        return ({status: false, message: err});
      });
};

module.exports.sendRequestStoreItemSMS = sendRequestStoreItemSMS;

const sendReadyForPickupEmail = function (purchaseRequestManager, requestUser, storeItems) {
  const functionName = 'sendReadyForPickupEmail';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  console.log(`${functionFullName}: managerUser:`, purchaseRequestManager);
  console.log(`${functionFullName}: requestUser:`, requestUser);
  console.log(`${functionFullName}: storeItems:`, storeItems);

  // Get target user details
  const sendTo = requestUser.email;
  // const requestUserFullName = `${requestUser.firstName} ${requestUser.lastName}`;
  const requestUserFirstName = `${requestUser.firstName}`;
  // const managerUserFirstName = `${managerUser.firstName}`;
  const managerUserFullName = `${purchaseRequestManager.firstName} ${purchaseRequestManager.lastName}`;

  let params;

  if (storeItems.length > 1) {
    // Create sendEmail params
    params = {
      Destination: { /* required */
        ToAddresses: [
          sendTo,
          /* more items */
        ]
      },
      Template: 'ReadyForPickupMultiple',
      ConfigurationSetName: "Default",
      TemplateData: `{\"managerUserFullName\":\"${managerUserFullName}\", \"requestUserFirstName\":\"${requestUserFirstName}\"}`,
      Source: sourceEmail, /* required */

    };
  } else {
    const itemName = storeItems[0].storeItemName;

    // Create sendEmail params
    params = {
      Destination: { /* required */
        ToAddresses: [
          sendTo,
          /* more items */
        ]
      },
      Template: 'ReadyForPickup',
      ConfigurationSetName: "Default",
      TemplateData: `{\"managerUserFullName\":\"${managerUserFullName}\", \"requestUserFirstName\":\"${requestUserFirstName}\", \"itemName\": \"${itemName}\"}`,
      Source: sourceEmail, /* required */

    };
  }

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

module.exports.sendReadyForPickupEmail = sendReadyForPickupEmail;


const sendReadyForPickupSMS = function (purchaseRequestManager, requestUser, storeItems) {
  const functionName = 'sendReadyForPickupSMS';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  console.log(`${functionFullName}: purchaseRequestManager:`, purchaseRequestManager);
  console.log(`${functionFullName}: requestUser:`, requestUser);
  console.log(`${functionFullName}: storeItems:`, storeItems);

  // Get target user details
  // const sendTo = purchaseRequestManager.email;
  // const requestUserFullName = `${requestUser.firstName} ${requestUser.lastName}`;
  // const requestUserFirstName = `${requestUser.firstName}`;
  const purchaseRequestManagerFirstName = `${purchaseRequestManager.firstName}`;
  const purchaseRequestManagerLastName = `${purchaseRequestManager.lastName}`;
  // const emailConfirmed = purchaseRequestManager.emailConfirmed;
  // const phoneConfirmed = purchaseRequestManager.phoneConfirmed;
  // const email = purchaseRequestManager.email;
  const phone = requestUser.phone;

  // const itemDescription = storeItem.description;
  // const cost = storeItem.cost;


// The recipient's phone number.  For best results, you should specify the
// phone number in E.164 format.
  var destinationNumber = phone;

  // The content of the SMS message.
  let message;

  if (storeItems.length > 1) {
    message = `Your Pineapple Points 🍍 purchases have been marked as Ready for Pickup ` +
      `by ${purchaseRequestManagerFirstName} ${purchaseRequestManagerLastName}! Log in to ` +
      `https://pineapplepoints.net to check the status of your purchase requests.`;
  } else {
    const itemName = storeItems[0].storeItemName;
    message = `Your Pineapple Points 🍍 purchase of ${itemName} has been marked as Ready for Pickup ` +
      `by ${purchaseRequestManagerFirstName} ${purchaseRequestManagerLastName}! Log in to ` +
      `https://pineapplepoints.net to check the status of your purchase requests.`;
  }




// The Amazon Pinpoint project/application ID to use when you send this message.
// Make sure that the SMS channel is enabled for the project or application
// that you choose.
  var applicationId = "49967c53c42141d8a27b7a335ab1945d";

// The type of SMS message that you want to send. If you plan to send
// time-sensitive content, specify TRANSACTIONAL. If you plan to send
// marketing-related content, specify PROMOTIONAL.
  var messageType = "TRANSACTIONAL";

// The registered keyword associated with the originating short code.
  var registeredKeyword = "keyword_644955040906";

// The sender ID to use when sending the message. Support for sender ID
// varies by country or region. For more information, see
// https://docs.aws.amazon.com/pinpoint/latest/userguide/channels-sms-countries.html
  var senderId = "pineaplpts";

// Specify that you're using a shared credentials file, and optionally specify
// the profile that you want to use.
//   var credentials = new AWS.SharedIniFileCredentials({profile: 'default'});
//   AWS.config.credentials = credentials;

// Specify the region.
//   AWS.config.update({region:aws_region});

//Create a new Pinpoint object.
  var pinpoint = new AWS.Pinpoint();

// Specify the parameters to pass to the API.
  var params = {
    ApplicationId: applicationId,
    MessageRequest: {
      Addresses: {
        [destinationNumber]: {
          ChannelType: 'SMS'
        }
      },
      MessageConfiguration: {
        SMSMessage: {
          Body: message,
          Keyword: registeredKeyword,
          MessageType: messageType,
          OriginationNumber: originationNumber,
          SenderId: senderId,
        }
      }
    }
  };

  //Try to send the message.
  const sendPromise = pinpoint.sendMessages(params).promise();

  return sendPromise.then(
    function(data) {
      console.log("Message sent! "
        + data['MessageResponse']['Result'][destinationNumber]['StatusMessage']);
      return ({status: true, data: data});
    })
    .catch(
      function(err) {
        console.log(`Error sending SMS`);
        console.error(err, err.stack);
        return ({status: false, message: err});
      });
};

module.exports.sendReadyForPickupSMS = sendReadyForPickupSMS;

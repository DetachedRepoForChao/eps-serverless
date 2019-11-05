const SqlModel = require('../db');
const Models = SqlModel().Models;
const sqlUserModel = Models.User;
const sqlAchievementModel = Models.Achievement;
const sqlAchievementTransactionModel = Models.AchievementTransaction;
const sqlUserAchievementProgressModel = Models.UserAchievementProgress;
const ctrlAchievement = require('./achievement.controller');
const sqlNotification = Models.Notification;
const AWS = require('aws-sdk');

const componentName = 'notification.controller';
/**
 * Get the  notificaion by the userid
 * @param {*} targetUserId
 */
const getNotifications = function (targetUserId) {
    const functionName = 'getNotifications';
    const functionFullName = `${componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);

    return sqlNotification.findAll({
      where: {
        targetUserId: targetUserId,
      },
      'order': [
        ['createdAt', 'DESC'],
        ['updatedAt', 'DESC']
      ] 
    })
      .then(notificationsResult => {
        if(!notificationsResult) {
          console.log(`${functionFullName}: No notification records found`);
          return {status: 404, message: "No notification records found" };
        } else {
          console.log(`${functionFullName}: Retrieved notification records successfully`);
          console.log(notificationsResult);
          return {status: 200, notifications: notificationsResult };
        }
      })
      .catch(err => {
        console.log(`${functionFullName}: Database error`);
        console.log(err);
        return {status: 500, message: err};
      });
  };

module.exports.getNotifications = getNotifications;

/**
 *
 * Set up notification  to the target user and based on the role of user.
 * Only Manager can send noticiations
 *
 */
const setNotificationsToPerson = function (targetUserId, title, event, description, event, sourceUserId){
      const functionName = 'setNotificationsToPerson';
      const functionFullName = `${componentName} ${functionName}`;
      console.log(`Start ${functionFullName}`);
      return sqlNotification.create({
            targetUserId: targetUserId,
            title:title,
            description:description,
            audience:'Group',
            event:event,
            timeSeen:null,
            sourceUserId: sourceUserId,
      }).then((notifications)=>{
          console.log(`${functionFullName}: notification created in the db`);
          return {status:true,message:'notification created',noticiations:notifications}
      }).catch(err=>{
        console.log(`${functionFullName}: Problem with the database`);
        console.log(err);
        return { status: false, error: 'Problem with the database: ' + err };
      })
}

exports.setNotificationsToPerson = setNotificationsToPerson;




const setNotificationsToGroup = function (group, title, event, description, event, sourceUserId) {
  const functionName = 'setNotificationsToPerson';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);
  return sqlNotification.create({
    targetUserId: targetUserId,
    title: title,
    description: description,
    audience: 'Group',
    event: event,
    timeSeen: null,
    sourceUserId: sourceUserId,
  }).then((notifications) => {
    console.log(`${functionFullName}: notification created in the db`);
    return { status: true, message: 'notification created', noticiations: notifications }
  }).catch(err => {
    console.log(`${functionFullName}: Problem with the database`);
    console.log(err);
    return { status: false, error: 'Problem with the database: ' + err };
  })
}

module.exports.setNotificationsToGroup = setNotificationsToGroup;



/**
 *
 * @param {*} notifictaionId
 */

const setNotifictaionSeenTime = function(notifictaionId){
  const functionName = 'setNotifictaionSeenTime';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  console.log(new Date().getTime.toString);
  return sqlNotification.update({
      timeSeen: Date.now(),
  },{
      where:{
         id: notifictaionId,
      }
  }).then((notifications) => {
      console.log(`${functionFullName}: timeseen update in the db`);
      return { status: true, message: 'timeseen updated', noticiations: notifications }
  }).catch(err => {
        console.log(`${functionFullName}: Problem with the database`);
        console.log(err);
        return { status: false, error: 'Problem with the database: ' + err };
  })
}

module.exports.setNotifictaionSeenTime = setNotifictaionSeenTime;

const sendNotificationEmail = function (targetUserId, sourceUser) {
  // Set the region
  AWS.config.update({region: 'us-east-1'});

  // Get target user details
  return sqlUserModel.findOne({
    where: {
      id: targetUserId,
    }
  })
    .then(targetUser => {
      const sendTo = targetUser.email;
      const targetUserName = targetUser.firstName;
      const targetUserPoints = targetUser.points;
      // Create sendEmail params
      var params = {
        Destination: { /* required */
          ToAddresses: [
            sendTo,
            /* more items */
          ]
        },
        Message: { /* required */
          Body: { /* required */
            /*        Html: {
                      Charset: "UTF-8",
                      Data: "HTML_FORMAT_BODY"
                    },*/
            Text: {
              Charset: "UTF-8",
              Data: `Hi ${targetUserName}, 
This is an automated notification test from the Employee Points System!

Our records indicate that you currently have ${targetUserPoints} points!

Sincerely,
${sourceUser.firstName} ${sourceUser.lastName}
              `
            }
          },
          Subject: {
            Charset: 'UTF-8',
            Data: 'Employee Points System Test Email'
          }
        },
        Source: 'max.bado@gmail.com', /* required */

      };

// Create the promise and SES service object
      var sendPromise = new AWS.SES({apiVersion: '2010-12-01'}).sendEmail(params).promise();

// Handle promise's fulfilled/rejected states
      return sendPromise.then(
        function(data) {
          console.log(data.MessageId);
          return ({status: true, data: data});
        }).catch(
        function(err) {
          console.error(err, err.stack);
          return ({status: false, message: err});
        });
    })
};

module.exports.sendNotificationEmail = sendNotificationEmail;


const sendAwardPointsEmail = function (targetUserId, sourceUser, pointItem) {
  const functionName = 'sendAwardPointsEmail';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  console.log(`${functionFullName}: targetUserId: ${targetUserId}`);
  console.log(`${functionFullName}: sourceUser:`);
  console.log(sourceUser);
  console.log(`${functionFullName}: pointItem:`);
  console.log(pointItem);
  // Set the region
  AWS.config.update({region: 'us-east-1'});

  // Get target user details
  return sqlUserModel.findOne({
    where: {
      id: targetUserId,
    }
  })
    .then(targetUser => {
      const sendTo = targetUser.email;
      const targetUserName = targetUser.firstName;
      const targetUserPoints = targetUser.points;
      const managerName = `${sourceUser.firstName} ${sourceUser.lastName}`;
      const pointItemName = pointItem.name;
      const points = pointItem.points;
      let description = null;
      if (pointItem.description.length > 0) {
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
        Source: 'max.bado@gmail.com', /* required */

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
    })
    .catch(err => {
      console.log(`${functionFullName}: Database error retrieving user record`);
      console.log(err);
      return ({status: false, message: err});
    })
};

module.exports.sendAwardPointsEmail = sendAwardPointsEmail;

// const setNotificationsToGroup =function(targetGroup,notificaionTitle,event,description,event){

// }


// module.exports.setNotificationsToGroup = setNotificationsToGroup;




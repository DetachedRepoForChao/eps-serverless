const SqlModel = require('../db');
const Models = SqlModel().Models;
const sqlUserModel = Models.User;
const sqlNotification = Models.Notification;
const AWS = require('aws-sdk');
const ctrlDepartment = require('./department.controller');


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
        ['id', 'DESC'],
      ]
    })
      .then(notificationsResult => {
        if(!notificationsResult) {
          console.log(`${functionFullName}: No notification records found`);
          return {status: false, message: "No notification records found" };
        } else {
          console.log(`${functionFullName}: Retrieved notification records successfully`);
          // console.log(notificationsResult);
          return {status: true, notifications: notificationsResult };
        }
      })
      .catch(err => {
        console.log(`${functionFullName}: Database error`);
        console.log(err);
        return {status: false, message: 'Database error', error: err};
      });
  };

module.exports.getNotifications = getNotifications;


const getAlerts = function (targetUserId) {
  const functionName = 'getAlerts';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  return sqlNotification.findAll({
    where: {
      targetUserId: targetUserId,
      event: 'Alert',
      timeSeen: null,
    },
    'order': [
      ['id', 'DESC'],

    ]
  })
    .then(notificationsResult => {
      if (!notificationsResult) {
        console.log(`${functionFullName}: No alert records found`);
        return { status: false, message: "No alert records found" };
      } else {
        console.log(`${functionFullName}: Retrieved alert records successfully`);
        // console.log(notificationsResult);
        return { status: true, notifications: notificationsResult };
      }
    })
    .catch(err => {
      console.log(`${functionFullName}: Database error`);
      console.log(err);
      return { status: false, message: 'Database error', error: err };
    });
};

module.exports.getAlerts = getAlerts;

/**
 *
 * Set up notification  to the target user and based on the role of user.
 * Only Manager can send noticiations
 *
 */
const setNotificationsToPerson = function (targetUserId, title, event, description, sourceUserId, status){
      const functionName = 'setNotificationsToPerson';
      const functionFullName = `${componentName} ${functionName}`;
      console.log(`Start ${functionFullName}`);
      // console.log('statusstatus--------------------------------------------------'+sourceUserId);
      return sqlNotification.create({
            targetUserId: targetUserId,
            title: title,
            description: description,
            audience: 'employee',
            event: event,
            timeSeen: null,
            status: 1,
            sourceUserId: sourceUserId,
      }).then(notification => {
        if (!notification) {
          console.log(`${functionFullName}: Error creating notification in the db`);
          return {status: true, message: 'Error creating notification in the db'};
        }
          console.log(`${functionFullName}: Notification created in the db`);
          return {status: true, message:'Notification created', notification: notification};
      }).catch(err => {
        console.log(`${functionFullName}: Problem with the database`);
        console.log(err);
        return { status: false, message: 'Problem with the database', error: err };
      })
};

exports.setNotificationsToPerson = setNotificationsToPerson;


/*
async function setGroupNotification(targetUserId, title, event, description, sourceUserId, status){
      const functionName = 'setNotificationsToPerson';
      const functionFullName = `${componentName} ${functionName}`;
      console.log(`Start ${functionFullName}`);
      console.log('statusstatus--------------------------------------------------' + sourceUserId);
      await sqlNotification.create({
      targetUserId: targetUserId,
      title: title,
      description: description,
      audience: 'Group',
      event: event,
      timeSeen: null,
      status: 1,
      sourceUserId: sourceUserId,
    })
}*/


const setNotificationsToDepartment =function (departmentId, title, event, description, sourceUserId, status) {
  const functionName = 'setNotificationsToDepartment';
  const functionFullName = `${componentName} ${functionName}`;

  // get the userList by department ID
/*  if (groupID == 911) {
    return ctrlDepartment.getEmployeesByDepartmentId(groupID).then(async userList => {
      for (let user of userList) {
          await setGroupNotification(user.id, title, event, description, sourceUserId, status);
      }
      return { status: 200, message: 'success' };
    }).catch(err => {
      console.log('Database error');
      console.log(err);
      return { status: 500, message: err };
    });
  } else {
    return ctrlDepartment.getEmployeesByDepartmentId(groupID).then(async userList => {
      for (let user of userList) {
        await setGroupNotification(user.id, title, event, description, sourceUserId, status);
      }
      return { status: 200, message: 'success' };
    }).catch(err => {
      console.log('Database error');
      console.log(err);
      return { status: 500, message: err };
    });
  }*/
  return ctrlDepartment.getEmployeesByDepartmentId(departmentId)
    .then(userList => {
      if (!userList) {
        console.log(`${functionFullName}: No members in department ${departmentId}`);
        return { status: false, message: `No members in department ${departmentId}`};
      } else {
        console.log(`${functionFullName}: Members for department ${departmentId} retrieved successfully`);

        const newRecordArray = [];
        for (let user of userList) {
          // setGroupNotification(user.id, title, event, description, sourceUserId, status);
          newRecordArray.push({
            targetUserId: user.id,
            title: title,
            description: description,
            audience: 'department',
            event: event,
            timeSeen: null,
            status: 1,
            sourceUserId: sourceUserId,
            departmentId: departmentId,
          })
        }

        return sqlNotification.bulkCreate(newRecordArray)
          .then(newRecords => {
            // console.log(newRecords);
            if (!newRecords) {
              console.log('No new records created');
              return {status: false, message: 'No new records created', newRecords: newRecords};
            } else {
              console.log('New records created successfully');
              return {status: true, message: 'New records created successfully', newRecords: newRecords};
            }
          })
          .catch(err => {
            console.log('Database error trying to create new records');
            console.log(err);
            return { status: false, message: 'Database error trying to create new records', error: err };
          });
      }
  }).catch(err => {
    console.log('Database error');
    console.log(err);
    return { status: false, message: 'Database error', error: err };
  });
};

module.exports.setNotificationsToDepartment = setNotificationsToDepartment;



/**
 *
 * @param {*} notificationId
 */

const setNotificationSeenTime = function(notificationId){
  const functionName = 'setNotificationSeenTime';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  // console.log(new Date().getTime.toString);
  const timeSeen = Date.now();
  return sqlNotification.update({
      timeSeen: Date.now(),
  },{
      where: {
         id: notificationId,
      }
  }).then((notifications) => {
      console.log(`${functionFullName}: timeSeen updated in the db`);
      return { status: true, message: 'timeSeen updated', notifications: notifications, notificationId: notificationId, timeSeen: timeSeen }
  }).catch(err => {
        console.log(`${functionFullName}: Problem with the database`);
        console.log(err);
        return { status: false, message: 'Problem with the database', error: err };
  })
};

module.exports.setNotifictaionSeenTime = setNotificationSeenTime;

const deleteNotification = function(notificationId){
  const functionName = 'deleteNotification';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  return sqlNotification.destroy({
    where: {
      id: notificationId,
    }
  }).then((result) => {
    console.log(`${functionFullName}: Delete operation completed without errors. ${result} records deleted.`);
    return { status: true, message: `Delete operation completed without errors. ${result} records deleted.`, notificationId: notificationId, numRecordsDeleted: result }
  }).catch(err => {
    console.log(`${functionFullName}: Delete operation error`);
    console.log(err);
    return { status: false, message: 'Delete operation error', error: err };
  })
};

module.exports.deleteNotification = deleteNotification;

const deleteNotifications = function(notificationIds){
  const functionName = 'deleteNotifications';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  return sqlNotification.destroy({
    where: {
      id: notificationIds,
    }
  }).then((result) => {
    console.log(`${functionFullName}: Delete operation completed without errors. ${result} records deleted.`);
    return { status: true, message: `Delete operation completed without errors. ${result} records deleted.`, notificationIds: notificationIds, numRecordsDeleted: result }
  }).catch(err => {
    console.log(`${functionFullName}: Error deleting notification`);
    console.log(err);
    return { status: false, message: 'Error deleting notification', error: err };
  })
};

module.exports.deleteNotifications = deleteNotifications;


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




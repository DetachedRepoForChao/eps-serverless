const SqlModel = require('../db');
const Models = SqlModel().Models;
const sqlNotificationModel = Models.Notification;
const sqlUserModel = Models.User;
const sqlAchievementModel = Models.Achievement;
const sqlAchievementTransactionModel = Models.AchievementTransaction;
const sqlUserAchievementProgressModel = Models.UserAchievementProgress;
const ctrlAchievement = require('./achievement.controller');
const sqlNotification = Models.Notification;


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
      // attributes: ['id', 'title', 'description', 'timeSeen', 'audience', 'event']
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
const setNotificationsToPerson = function (targetUserId,title,event, description,event){
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


const setNotificationsToGroup = function (group, title, event, description, event) {
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
  return sqlNotification.update({
      timeSeen: new Date().getTime,
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


// const setNotificationsToGroup =function(targetGroup,notificaionTitle,event,description,event){

// }


// module.exports.setNotificationsToGroup = setNotificationsToGroup;



  
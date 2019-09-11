const SqlModel = require('../db');
const Models = SqlModel().Models;

const sqlUserModel = Models.User;
const sqlAchievementModel = Models.Achievement;
const sqlAchievementTransactionModel = Models.AchievementTransaction;
const sqlUserAchievementProgressModel = Models.UserAchievementProgress;
const ctrlAchievement = require('./achievement.controller');
const sqlNotification = Models.Notification;


const componentName = 'notification.controller';

const getNotifications = function () {
    const functionName = 'getNotifications';
    const functionFullName = `${componentName} ${functionName}`;
    console.log(`Start ${functionFullName}`);
  
    return sqlNotification.findAll({
      attributes: ['id', 'title', 'description', 'timeSeen', 'audience', 'event']
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
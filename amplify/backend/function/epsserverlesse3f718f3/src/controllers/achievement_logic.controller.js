const SqlModel = require('../db');
const Models = SqlModel().Models;

const sqlUserModel = Models.User;
const sqlAchievementModel = Models.Achievement;
const sqlAchievementTransactionModel = Models.AchievementTransaction;
const sqlUserAchievementProgressModel = Models.UserAchievementProgress;
const ctrlAchievement = require('./achievement.controller');

const componentName = 'achievement_logic.controller';


const incrementAchievement = function(achievementFamily, userId) {
  const functionName = 'incrementAchievement';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  console.log(`${functionFullName}: Increment achievement family '${achievementFamily}' for userId ${userId}`);

  const data = {
    userId: userId,
    achievementFamily: achievementFamily
  };

  const functions = {
    // 'incrementAchievementSignIn': incrementAchievementSignIn,
    // 'incrementAchievementAwardPoint': incrementAchievementAwardPoint,
    // 'incrementAchievementReceivePoint': incrementAchievementAwardPoint,
  };

  if (functions.hasOwnProperty('incrementAchievement' + data.achievementFamily)) {
    console.log(`${functionFullName}: Incrementing special achievement family '${achievementFamily}' for user id ${userId}`);
    return functions['incrementAchievement' + data.achievementFamily](data.userId)
      .then(result => {
        if(result.status !== true) {
          console.log(`${functionFullName}: Error incrementing special achievement family ${achievementFamily} for user id ${userId}`);
          console.log(result.message);
          return {status: false, message: result.message};
        } else {
          console.log(`${functionFullName}: Success incrementing special achievement family ${achievementFamily} for user id ${userId}`);
          return {status: true, message: 'Success incrementing special achievement family'};
        }
      })
      .catch(err => {
        console.log(`${functionFullName}: Error`);
        console.log(err);
        return {status: false, message: err};
      });
  } else {
    console.log(`${functionFullName}: Incrementing generic achievement family '${achievementFamily}' for user id ${userId}`);
    return incrementGenericAchievement(achievementFamily, userId)
      .then(result => {
        if(result.status !== true) {
          console.log(`${functionFullName}: Error incrementing generic achievement family ${achievementFamily} for user id ${userId}`);
          console.log(result.message);
          return {status: false, message: result.message};
        } else {
          console.log(`${functionFullName}: Success incrementing generic achievement family ${achievementFamily} for user id ${userId}`);
          return {status: true, message: 'Success incrementing generic achievement family'};
        }
      })
      .catch(err => {
        console.log(`${functionFullName}: Error`);
        console.log(err);
        return {status: false, message: err};
      });
  }
};

module.exports.incrementAchievement = incrementAchievement;

/*const getAchievementFamilyProgress = function(achievementFamily, userId) {
  const functionName = 'getAchievementFamilyProgress';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  // Find user's achievement family progress
  const sequelize = SqlModel().sequelize;
  return sequelize.query("" +
    "SELECT `user_achievement_progress`.`id`, `user_achievement_progress`.`goalProgress`, " +
    "`user_achievement_progress`.`status`, " +
    "`achievement`.`id` AS `achievementId`, `achievement`.`cost` AS `achievementCost`, " +
    "`achievement`.`achievement_family` AS `achievementFamily`, `achievement`.`level` AS `level`, " +
    "`achievement`.`increment_amount` AS `incrementAmount`, `achievement`.`name` AS `achievementName` " +
    "FROM `user_achievement_progress` " +
    "JOIN `achievement` ON `user_achievement_progress`.`achievement_id` = `achievement`.`id` " +
    "WHERE `user_achievement_progress`.`user_id` = " + userId + " " +
    "AND `achievement`.`achievement_family` = '" + achievementFamily + "'",
    {type: sequelize.QueryTypes.SELECT})
    .then(achievementFamilyProgress => {
      if (!achievementFamilyProgress) {
        //return res.status(404).json({ status: false, message: 'Update failed.' });
        console.log(`${functionFullName}: Unable to find User / Achievement Family progress`);
        return {status: false, message: 'Unable to find User / Achievement Family progress.'};
      } else {
        console.log(`${functionFullName}: User / Achievement Family progress retrieved successfully`);
        console.log(achievementFamilyProgress);

        return {status: true, achievementFamilyProgress: achievementFamilyProgress};
        // const goalProgress = queryResult[0].goalProgress;
        // const achievementProgressId = queryResult[0].id;
        // const achievementId = queryResult[0].achievementId;
        // const achievementCost = queryResult[0].achievementCost;
      }
    })
    .catch(err => {
      console.log(`${functionFullName}: Database error`);
      console.log(err);
      return {status: false, message: err};
    });
};

module.exports.getAchievementFamilyProgress = getAchievementFamilyProgress;*/

const incrementGenericAchievement = function(achievementFamily, userId) {
  const functionName = 'incrementGenericAchievement';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  console.log(`${functionFullName}: Incrementing achievement family '${achievementFamily}' for user id ${userId}`);

  return ctrlAchievement.addPointsToAchievementFamilyProgress(achievementFamily, userId)
    .then(result => {
      if(result.status !== true) {
        console.log(`${functionFullName}: Something went wrong incrementing achievement progress`);
        return {status: false, message: result.message};
      } else {
        console.log(`${functionFullName}: Success incrementing achievement progress`);
        console.log(result);
        return {status: true, message: 'Success incrementing achievement progress'};
      }
    })
    .catch(err => {
      console.log(`${functionFullName}: Database error`);
      console.log(err);
      return {status: false, message: err};
    });
};

/*
const incrementAchievementSignIn = function(userId) {
  const functionName = 'incrementAchievementSignIn';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  console.log(`${functionFullName}: userId: ${userId}`);

  const achievementFamily = "SignIn";

  return ctrlAchievement.addPointsToAchievementFamilyProgress(achievementFamily, userId)
    .then(result => {
      if(result.status !== true) {
        console.log(`${functionFullName}: Something went wrong incrementing achievement progress`);
        return {status: false, message: result.message};
      } else {
        console.log(`${functionFullName}: Success incrementing achievement progress`);
        console.log(result);
        return {status: true, message: 'Success incrementing achievement progress'};
      }
    })
    .catch(err => {
      console.log(`${functionFullName}: Database error`);
      console.log(err);
      return {status: false, message: err};
    });
};


const incrementAchievementAwardPoint = function(userId) {
  const functionName = 'incrementAchievementAwardPoint';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  console.log(`${functionFullName}: userId: ${userId}`);

  const achievementFamily = "AwardPoint";

  return ctrlAchievement.addPointsToAchievementFamilyProgress(achievementFamily, userId)
    .then(result => {
      if(result.status !== true) {
        console.log(`${functionFullName}: Something went wrong incrementing achievement progress`);
        return {status: false, message: result.message};
      } else {
        console.log(`${functionFullName}: Success incrementing achievement progress`);
        console.log(result);
        return {status: true, message: 'Success incrementing achievement progress'};
      }
    })
    .catch(err => {
      console.log(`${functionFullName}: Database error`);
      console.log(err);
      return {status: false, message: err};
    });
};


const incrementAchievementReceivePoint = function(userId) {
  const functionName = 'incrementAchievementReceivePoint';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  console.log(`${functionFullName}: userId: ${userId}`);

  const achievementFamily = "ReceivePoint";

  return ctrlAchievement.addPointsToAchievementFamilyProgress(achievementFamily, userId)
    .then(result => {
      if(result.status !== true) {
        console.log(`${functionFullName}: Something went wrong incrementing achievement progress`);
        return {status: false, message: result.message};
      } else {
        console.log(`${functionFullName}: Success incrementing achievement progress`);
        console.log(result);
        return {status: true, message: 'Success incrementing achievement progress'};
      }
    })
    .catch(err => {
      console.log(`${functionFullName}: Database error`);
      console.log(err);
      return {status: false, message: err};
    });
};
*/

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
          return {status: true, message: 'Success incrementing generic achievement family', achievementFamilyProgress: result.achievementFamilyProgress};
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

const incrementGenericAchievement = function(achievementFamily, userId) {
  const functionName = 'incrementGenericAchievement';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  console.log(`${functionFullName}: Incrementing achievement family '${achievementFamily}' for user id ${userId}`);

  return ctrlAchievement.addPointsToAchievementFamilyProgress(achievementFamily, userId)
    .then(addResult => {
      if(addResult.status !== true) {
        console.log(`${functionFullName}: Something went wrong incrementing achievement progress`);
        return {status: false, message: addResult.message};
      } else {
        console.log(`${functionFullName}: Success incrementing achievement progress`);
        console.log(addResult);

        // Get new achievement family progress to return
        return ctrlAchievement.getAchievementFamilyProgress(achievementFamily, userId)
          .then(getResult => {
            if(getResult.status !== true) {
              console.log(`${functionFullName}: Something went wrong retrieving achievement family progress`);
              return {status: false, message: getResult.message};
            } else {
              console.log(`${functionFullName}: Success retrieving achievement family progress`);
              console.log(getResult);

              return {status: true, message: 'Success incrementing achievement progress', achievementFamilyProgress: getResult.achievementFamilyProgress};
            }
          })
          .catch(err => {
            console.log(`${functionFullName}: Database error`);
            console.log(err);
            return {status: false, message: err};
          });
      }
    })
    .catch(err => {
      console.log(`${functionFullName}: Database error`);
      console.log(err);
      return {status: false, message: err};
    });
};

const incrementAchievementByX = function(achievementFamily, userId, incrementAmount) {
  const functionName = 'incrementAchievementByX';
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
    return incrementGenericAchievementByX(achievementFamily, userId, incrementAmount)
      .then(result => {
        if(result.status !== true) {
          console.log(`${functionFullName}: Error incrementing generic achievement family ${achievementFamily} for user id ${userId}`);
          console.log(result.message);
          return {status: false, message: result.message};
        } else {
          console.log(`${functionFullName}: Success incrementing generic achievement family ${achievementFamily} for user id ${userId}`);
          return {status: true, message: 'Success incrementing generic achievement family', achievementFamilyProgress: result.achievementFamilyProgress};
        }
      })
      .catch(err => {
        console.log(`${functionFullName}: Error`);
        console.log(err);
        return {status: false, message: err};
      });
  }
};

module.exports.incrementAchievementByX = incrementAchievementByX;

const incrementGenericAchievementByX = function(achievementFamily, userId, incrementAmount) {
  const functionName = 'incrementGenericAchievementByX';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  console.log(`${functionFullName}: Incrementing achievement family '${achievementFamily}' for user id ${userId}`);

  return ctrlAchievement.addPointsToAchievementFamilyProgressByX(achievementFamily, userId, incrementAmount)
    .then(addResult => {
      if(addResult.status !== true) {
        console.log(`${functionFullName}: Something went wrong incrementing achievement progress`);
        return {status: false, message: addResult.message};
      } else {
        console.log(`${functionFullName}: Success incrementing achievement progress`);
        console.log(addResult);

        // Get new achievement family progress to return
        return ctrlAchievement.getAchievementFamilyProgress(achievementFamily, userId)
          .then(getResult => {
            if(getResult.status !== true) {
              console.log(`${functionFullName}: Something went wrong retrieving achievement family progress`);
              return {status: false, message: getResult.message};
            } else {
              console.log(`${functionFullName}: Success retrieving achievement family progress`);
              console.log(getResult);

              return {status: true, message: 'Success incrementing achievement progress', achievementFamilyProgress: getResult.achievementFamilyProgress};
            }
          })
          .catch(err => {
            console.log(`${functionFullName}: Database error`);
            console.log(err);
            return {status: false, message: err};
          });
      }
    })
    .catch(err => {
      console.log(`${functionFullName}: Database error`);
      console.log(err);
      return {status: false, message: err};
    });
};

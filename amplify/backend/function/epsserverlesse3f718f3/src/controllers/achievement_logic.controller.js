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
    'incrementAchievementSignIn': incrementAchievementSignIn,
    'incrementAchievementGiftFirstPointItem': incrementAchievementGiftFirstPointItem,
    'incrementAchievementReceiveFirstPointItem': incrementAchievementReceiveFirstPointItem,
  };

  if(functions.hasOwnProperty('incrementAchievement' + data.achievementFamily)) {
    return functions['incrementAchievement' + data.achievementFamily](data.userId)
      .then(result => {
        if(result.status === true) {
          console.log(`${functionFullName}: Success`);
          return {status: 200, message: 'Success'};
        } else {
          console.log(`${functionFullName}: Error`);
          console.log(result.message);
          return {status: 400, message: result.message};
        }
      })
  } else {
    console.log(`${functionFullName}: A function for this achievement does not exist`);
    return {status: 422, message: 'A function for this achievement does not exist'};
  }
};

module.exports.incrementAchievement = incrementAchievement;

const getAchievementFamilyProgress = function(achievementFamily, userId) {
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
    .then(queryResult => {
      if (!queryResult) {
        //return res.status(404).json({ status: false, message: 'Update failed.' });
        console.log(`${functionFullName}: Unable to find User / Achievement Family progress`);
        return {status: false, message: 'Unable to find User / Achievement Family progress.'};
      } else {
        console.log(`${functionFullName}: User / Achievement Family progress retrieved successfully`);
        console.log(queryResult);

        return {status: true, achievementFamilyProgress: queryResult};
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

module.exports.getAchievementFamilyProgress = getAchievementFamilyProgress;

const incrementAchievementSignIn = function(userId) {
  const functionName = 'incrementAchievementSignIn';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  const data = {
    userId: userId
    //userAchievementProgressId: req.body.userAchievementProgressId,
  };

  console.log(`${functionFullName}: userId: ${data.userId}`);

  // const achievementName = "Log In 5 Times";
  const achievementFamily = "SignIn";
  // const incrementAmount = 20;

  // Get user's progress for this achievement family
  return getAchievementFamilyProgress(achievementFamily, userId)
    .then(familyProgressResult => {
      if (!familyProgressResult) {
        console.log(`${functionFullName}: Did not receive a result from achievement family query. Something went wrong`);
        return {status: false, message: 'Did not receive a result from achievement family query. Something went wrong'};
      } else {
        if (familyProgressResult.status !== true) {
          console.log(`${functionFullName}: Error retrieving achievement family progress`);
          console.log(familyProgressResult.message)
        } else {
          console.log(`${functionFullName}: Retrieved achievement family progress successfully`);
          console.log(familyProgressResult.achievementFamilyProgress);

          // Determine what level we need to increment
          const inProgressAchievement = familyProgressResult.achievementFamilyProgress.filter(x => x.status === 'in progress');
          console.log(`${functionFullName}: inProgressAchievement:`);
          console.log(inProgressAchievement);
          const notStartedAchievements = familyProgressResult.achievementFamilyProgress.filter(x => x.status === 'not started');
          console.log(`${functionFullName}: notStartedAchievements:`);
          console.log(notStartedAchievements);
          const completedAchievements = familyProgressResult.achievementFamilyProgress.filter(x => x.status === 'completed');
          console.log(`${functionFullName}: completedAchievements:`);
          console.log(completedAchievements);

          if (inProgressAchievement.length > 0) {
            // Increment the 'in progress' achievement if it exists
            console.log(`${functionFullName}: 'In progress' status achievement: ` +
            `id: ${inProgressAchievement[0].id}; name: ${inProgressAchievement[0].name}`);
            const incrementAmount = inProgressAchievement[0].incrementAmount;

            // Add achievement points
            return ctrlAchievement.addPointsToAchievementProgress(inProgressAchievement[0].id, incrementAmount)
              .then(result => {
                if(result.status !== true) {
                  console.log(`${functionFullName}: Something went wrong incrementing achievement progress`);
                  return {status: false, message: result.message};
                } else {
                  console.log(`${functionFullName}: Success incrementing achievement progress`);
                  return {status: true, message: 'Success incrementing achievement progress'};
                }
              })
              .catch(err => {
                console.log(`${functionFullName}: Error`);
                console.log(err);
                return {status: false, message: err};
              });
          } else {
            // Increment the lowest level 'not started' achievement
            // First, we need to sort by level and pick the lowest one
            const notStartedAchievementToIncrement = notStartedAchievements.sort(function(a, b){return a.level - b.level})[0];
            console.log(`${functionFullName}: 'Not started' status achievement with the lowest level: ` +
            `id: ${notStartedAchievementToIncrement.id}; name: ${notStartedAchievementToIncrement.name}`);
            const incrementAmount = notStartedAchievementToIncrement.incrementAmount;

            // Add achievement points
            return ctrlAchievement.addPointsToAchievementProgress(notStartedAchievementToIncrement.id, incrementAmount)
              .then(result => {
                if(result.status !== true) {
                  console.log(`${functionFullName}: Something went wrong incrementing achievement progress`);
                  return {status: false, message: result.message};
                } else {
                  console.log(`${functionFullName}: Success incrementing achievement progress`);
                  return {status: true, message: 'Success incrementing achievement progress'};
                }
              })
              .catch(err => {
                console.log(`${functionFullName}: Error`);
                console.log(err);
                return {status: false, message: err};
              });
          }
        }
      }
    })
    .catch(err => {
      console.log(`${functionFullName}: Database error`);
      console.log(err);
      return {status: false, message: err};
    });

  /*// First, find the id of the user_achievement_progress for this user and achievement
  const sequelize = SqlModel().sequelize;
  return sequelize.query("" +
    "SELECT `user_achievement_progress`.`id`, `user_achievement_progress`.`goalProgress`, " +
    "`achievement`.`id` AS `achievementId`, `achievement`.`cost` AS `achievementCost` " +
    "FROM `user_achievement_progress` " +
    "JOIN `achievement` ON `user_achievement_progress`.`achievement_id` = `achievement`.`id` " +
    "WHERE `user_achievement_progress`.`user_id` = " + data.userId + " " +
    "AND `achievement`.`name` = '" + achievementName + "'",
    {type: sequelize.QueryTypes.SELECT})
    .then(queryResult => {
      if (!queryResult) {
        //return res.status(404).json({ status: false, message: 'Update failed.' });
        console.log(`${functionFullName}: Unable to find User / Achievement relationship`);
        return {status: false, message: 'Unable to find User / Achievement relationship.'};
      } else {
        console.log(`${functionFullName}: User / Achievement relationship retrieved successfully`);
        console.log(queryResult);
        // console.log('res.id: ' + queryResult[0].id);
        // console.log('res.id: ' + queryResult[0].goalProgress);
        const goalProgress = queryResult[0].goalProgress;
        const achievementProgressId = queryResult[0].id;
        const achievementId = queryResult[0].achievementId;
        const achievementCost = queryResult[0].achievementCost;

        // Add achievement points
        return ctrlAchievement.addPointsToAchievementProgress(achievementProgressId, incrementAmount)
          .then(result => {
            if(result.status !== true) {
              console.log(`${functionFullName}: Something went wrong incrementing achievement progress`);
              return {status: false, message: result.message};
            } else {
              console.log(`${functionFullName}: Success incrementing achievement progress`);
              return {status: true, message: 'Success incrementing achievement progress'};
            }
          })
          .catch(err => {
            console.log(`${functionFullName}: Error`);
            console.log(err);
            return {status: false, message: err};
          });
      }
    })
    .catch(err => {
      console.log(`${functionFullName}: Error`);
      console.log(err);
      return {status: false, message: err};
    });*/
};


const incrementAchievementGiftFirstPointItem = function(userId) {
  const functionName = 'incrementAchievementGiftFirstPointItem';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  const data = {
    userId: userId
  };

  console.log(`${functionFullName}: userId: ${data.userId}`);

  const achievementName = "Gift Your First Point Item";
  const incrementAmount = 100;

  // First, find the id of the user_achievement_progress for this user and achievement
  const sequelize = SqlModel().sequelize;
  return sequelize.query("" +
    "SELECT `user_achievement_progress`.`id`, `user_achievement_progress`.`goalProgress`, " +
    "`achievement`.`id` AS `achievementId`, `achievement`.`cost` AS `achievementCost` " +
    "FROM `user_achievement_progress` " +
    "JOIN `achievement` ON `user_achievement_progress`.`achievement_id` = `achievement`.`id` " +
    "WHERE `user_achievement_progress`.`user_id` = " + data.userId + " " +
    "AND `achievement`.`name` = '" + achievementName + "'",
    {type: sequelize.QueryTypes.SELECT})
    .then(queryResult => {
      if (!queryResult) {
        //return res.status(404).json({ status: false, message: 'Update failed.' });
        console.log(`${functionFullName}: Unable to find User / Achievement relationship`);
        return {status: false, message: 'Unable to find User / Achievement relationship.'};
      } else {
        console.log(`${functionFullName}: User / Achievement relationship retrieved successfully`);
        console.log(queryResult);
        // console.log('res.id: ' + queryResult[0].id);
        // console.log('res.id: ' + queryResult[0].goalProgress);
        const goalProgress = queryResult[0].goalProgress;
        const achievementProgressId = queryResult[0].id;
        const achievementId = queryResult[0].achievementId;
        const achievementCost = queryResult[0].achievementCost;

        // Add achievement points
        return ctrlAchievement.addPointsToAchievementProgress(achievementProgressId, incrementAmount)
          .then(result => {
            if(result.status !== true) {
              console.log(`${functionFullName}: Something went wrong incrementing achievement progress`);
              return {status: false, message: result.message};
            } else {
              console.log(`${functionFullName}: Success incrementing achievement progress`);
              return {status: true, message: 'Success incrementing achievement progress'};
            }
          })
          .catch(err => {
            console.log(`${functionFullName}: Error`);
            console.log(err);
            return {status: false, message: err};
          });
      }
    })
    .catch(err => {
      console.log(`${functionFullName}: Error`);
      console.log(err);
      return {status: false, message: err};
    });
};


const incrementAchievementReceiveFirstPointItem = function(userId) {
  const functionName = 'incrementAchievementReceiveFirstPointItem';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  const data = {
    userId: userId
  };

  console.log(`${functionFullName}: userId: ${data.userId}`);

  const achievementName = "Receive Your First Point Item";
  const incrementAmount = 100;

  // First, find the id of the user_achievement_progress for this user and achievement
  const sequelize = SqlModel().sequelize;
  return sequelize.query("" +
    "SELECT `user_achievement_progress`.`id`, `user_achievement_progress`.`goalProgress`, " +
    "`achievement`.`id` AS `achievementId`, `achievement`.`cost` AS `achievementCost` " +
    "FROM `user_achievement_progress` " +
    "JOIN `achievement` ON `user_achievement_progress`.`achievement_id` = `achievement`.`id` " +
    "WHERE `user_achievement_progress`.`user_id` = " + data.userId + " " +
    "AND `achievement`.`name` = '" + achievementName + "'",
    {type: sequelize.QueryTypes.SELECT})
    .then(queryResult => {
      if (!queryResult) {
        //return res.status(404).json({ status: false, message: 'Update failed.' });
        console.log(`${functionFullName}: Unable to find User / Achievement relationship`);
        return {status: false, message: 'Unable to find User / Achievement relationship.'};
      } else {
        console.log(`${functionFullName}: User / Achievement relationship retrieved successfully`);
        console.log(queryResult);
        // console.log('res.id: ' + queryResult[0].id);
        // console.log('res.id: ' + queryResult[0].goalProgress);
        const goalProgress = queryResult[0].goalProgress;
        const achievementProgressId = queryResult[0].id;
        const achievementId = queryResult[0].achievementId;
        const achievementCost = queryResult[0].achievementCost;

        // Add achievement points
        return ctrlAchievement.addPointsToAchievementProgress(achievementProgressId, incrementAmount)
          .then(result => {
            if(result.status !== true) {
              console.log(`${functionFullName}: Something went wrong incrementing achievement progress`);
              return {status: false, message: result.message};
            } else {
              console.log(`${functionFullName}: Success incrementing achievement progress`);
              return {status: true, message: 'Success incrementing achievement progress'};
            }
          })
          .catch(err => {
            console.log(`${functionFullName}: Error`);
            console.log(err);
            return {status: false, message: err};
          });
      }
    })
    .catch(err => {
      console.log(`${functionFullName}: Error`);
      console.log(err);
      return {status: false, message: err};
    });
};

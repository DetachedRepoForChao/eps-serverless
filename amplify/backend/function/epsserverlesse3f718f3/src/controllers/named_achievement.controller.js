const SqlModel = require('../db');
const Models = SqlModel().Models;

const sqlUserModel = Models.User;
const sqlAchievementModel = Models.Achievement;
const sqlAchievementTransactionModel = Models.AchievementTransaction;
const sqlUserAchievementProgressModel = Models.UserAchievementProgress;
const ctrlAchievement = require('./achievement.controller');

const componentName = 'named_achievement.controller';

/*
module.exports.incrementAchievement = (req, res, next) => {
    console.log('incrementAchievement: ' + req.params.achievementName);

    const data = {
        userId: req.body.userId,
        achievementName: req.params.achievementName
    };

    const functions = {
        'incrementAchievementSignIn': incrementAchievementSignIn,
        'incrementAchievementGiftFirstPointItem': incrementAchievementGiftFirstPointItem,
        'incrementAchievementReceiveFirstPointItem': incrementAchievementReceiveFirstPointItem,
    };

    if(functions.hasOwnProperty('incrementAchievement' + data.achievementName)) {
        return functions['incrementAchievement' + data.achievementName](data.userId)
            .then(result => {
                if(result.status === true) {
                    console.log('Success');
                    return res.status(200).json({status: true, message: 'Success'});
                } else {
                    console.log('Error');
                    console.log(result.message);
                    return res.status(400).json({status: false, message: result.message});
                }
            })
    } else {
        console.log('A function for this achievement does not exist');
        return res.status(422).json({status: false, message: 'A function for this achievement does not exist'});
    }
}
*/

const incrementAchievement = function(achievementName, userId) {
  const functionName = 'incrementAchievement';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  console.log(`${functionFullName}: Increment achievement '${achievementName}' for userId ${userId}`);

  const data = {
    userId: userId,
    achievementName: achievementName
  };

  const functions = {
    'incrementAchievementSignIn': incrementAchievementSignIn,
    'incrementAchievementGiftFirstPointItem': incrementAchievementGiftFirstPointItem,
    'incrementAchievementReceiveFirstPointItem': incrementAchievementReceiveFirstPointItem,
  };

  if(functions.hasOwnProperty('incrementAchievement' + data.achievementName)) {
    return functions['incrementAchievement' + data.achievementName](data.userId)
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

const incrementAchievementSignIn = function(userId) {
    console.log('incrementAchievementSignIn');

    const data = {
        userId: userId
        //userAchievementProgressId: req.body.userAchievementProgressId,
    };

    console.log('incrementAchievementSignIn userId: ' + data.userId);

    const achievementName = "Log In 5 Times";
    const incrementAmount = 20;

    // First, find the id of the user_achievement_progress for this user and achievement
    return SqlModel.sequelize.query("SELECT `user_achievement_progress`.`id`, `user_achievement_progress`.`goalProgress`, `achievement`.`id` AS `achievementId`, `achievement`.`cost` AS `achievementCost` " +
        "FROM `user_achievement_progress` " +
        "JOIN `achievement` ON `user_achievement_progress`.`achievement_id` = `achievement`.`id` " +
        "WHERE `user_achievement_progress`.`user_id` = " + data.userId + " " +
        "AND `achievement`.`name` = '" + achievementName + "'",
        {type: SqlModel.sequelize.QueryTypes.SELECT})
        .then(queryResult => {
            if (!queryResult) {
                //return res.status(404).json({ status: false, message: 'Update failed.' });
                return {status: false, message: 'Unable to find User / Achievement relationship.'};
            } else {
                console.log(queryResult);
                console.log('res.id: ' + queryResult[0].id);
                console.log('res.id: ' + queryResult[0].goalProgress);
                const goalProgress = queryResult[0].goalProgress;
                const achievementProgressId = queryResult[0].id;
                const achievementId = queryResult[0].achievementId;
                const achievementCost = queryResult[0].achievementCost;

                // Add achievement points
                return ctrlAchievement.addPointsToAchievementProgress(achievementProgressId, incrementAmount)
                    .then(result => {
                        if(result.status !== true) {
                            console.log('Something went wrong incrementing achievement progress');
                            return {status: false, message: result.message};
                        } else {
                            console.log('Success incrementing achievement progress');
                            return {status: true, message: 'Success incrementing achievement progress'};
                        }
                    })
                    .catch(err => {
                        console.log('Error');
                        console.log(err);
                        return {status: false, message: err};
                    });
            }
        })
        .catch(err => {
            console.log('Error');
            console.log(err);
            return {status: false, message: err};
        });
};


const incrementAchievementGiftFirstPointItem = function(userId) {
    console.log('incrementAchievementGiftFirstPointItem');

    const data = {
        userId: userId
    };

    console.log('incrementAchievementGiftFirstPointItem userId: ' + data.userId);

    const achievementName = "Gift Your First Point Item";
    const incrementAmount = 100;

    // First, find the id of the user_achievement_progress for this user and achievement
    return SqlModel.sequelize.query("SELECT `user_achievement_progress`.`id`, `user_achievement_progress`.`goalProgress`, `achievement`.`id` AS `achievementId`, `achievement`.`cost` AS `achievementCost` " +
        "FROM `user_achievement_progress` " +
        "JOIN `achievement` ON `user_achievement_progress`.`achievement_id` = `achievement`.`id` " +
        "WHERE `user_achievement_progress`.`user_id` = " + data.userId + " " +
        "AND `achievement`.`name` = '" + achievementName + "'",
        {type: SqlModel.sequelize.QueryTypes.SELECT})
        .then(queryResult => {
            if (!queryResult) {
                //return res.status(404).json({ status: false, message: 'Update failed.' });
                return {status: false, message: 'Unable to find User / Achievement relationship.'};
            } else {
                console.log(queryResult);
                console.log('res.id: ' + queryResult[0].id);
                console.log('res.id: ' + queryResult[0].goalProgress);
                const goalProgress = queryResult[0].goalProgress;
                const achievementProgressId = queryResult[0].id;
                const achievementId = queryResult[0].achievementId;
                const achievementCost = queryResult[0].achievementCost;

                // Add achievement points
                return ctrlAchievement.addPointsToAchievementProgress(achievementProgressId, incrementAmount)
                    .then(result => {
                        if(result.status !== true) {
                            console.log('Something went wrong incrementing achievement progress');
                            return {status: false, message: result.message};
                        } else {
                            console.log('Success incrementing achievement progress');
                            return {status: true, message: 'Success incrementing achievement progress'};
                        }
                    })
                    .catch(err => {
                        console.log('Error');
                        console.log(err);
                        return {status: false, message: err};
                    });
            }
        })
        .catch(err => {
            console.log('Error');
            console.log(err);
            return {status: false, message: err};
        });
};


const incrementAchievementReceiveFirstPointItem = function(userId) {
    console.log('incrementAchievementReceiveFirstPointItem');

    const data = {
        userId: userId
    };

    console.log('incrementAchievementReceiveFirstPointItem userId: ' + data.userId);

    const achievementName = "Receive Your First Point Item";
    const incrementAmount = 100;

    // First, find the id of the user_achievement_progress for this user and achievement
    return SqlModel.sequelize.query("SELECT `user_achievement_progress`.`id`, `user_achievement_progress`.`goalProgress`, `achievement`.`id` AS `achievementId`, `achievement`.`cost` AS `achievementCost` " +
        "FROM `user_achievement_progress` " +
        "JOIN `achievement` ON `user_achievement_progress`.`achievement_id` = `achievement`.`id` " +
        "WHERE `user_achievement_progress`.`user_id` = " + data.userId + " " +
        "AND `achievement`.`name` = '" + achievementName + "'",
        {type: SqlModel.sequelize.QueryTypes.SELECT})
        .then(queryResult => {
            if (!queryResult) {
                //return res.status(404).json({ status: false, message: 'Update failed.' });
                return {status: false, message: 'Unable to find User / Achievement relationship.'};
            } else {
                console.log(queryResult);
                console.log('res.id: ' + queryResult[0].id);
                console.log('res.id: ' + queryResult[0].goalProgress);
                const goalProgress = queryResult[0].goalProgress;
                const achievementProgressId = queryResult[0].id;
                const achievementId = queryResult[0].achievementId;
                const achievementCost = queryResult[0].achievementCost;

                // Add achievement points
                return ctrlAchievement.addPointsToAchievementProgress(achievementProgressId, incrementAmount)
                    .then(result => {
                        if(result.status !== true) {
                            console.log('Something went wrong incrementing achievement progress');
                            return {status: false, message: result.message};
                        } else {
                            console.log('Success incrementing achievement progress');
                            return {status: true, message: 'Success incrementing achievement progress'};
                        }
                    })
                    .catch(err => {
                        console.log('Error');
                        console.log(err);
                        return {status: false, message: err};
                    });
            }
        })
        .catch(err => {
            console.log('Error');
            console.log(err);
            return {status: false, message: err};
        });
};

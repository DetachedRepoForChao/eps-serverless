const SqlModel = require('../db');
const Models = SqlModel().Models;

const sqlAchievementModel = Models.Achievement;
const sqlAchievementTransactionModel = Models.AchievementTransaction;
const sqlUserAchievementProgressModel = Models.UserAchievementProgress;
const sqlUserModel = Models.User;
const ctrlUser = require('./user.controller');

const componentName = 'achievement.controller';


const getUserAchievementsByUserId = function(userId) {
  const functionName = 'getUserAchievementsByUserId';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  console.log(`${functionFullName}: userId: ${userId}`);

  const sequelize = SqlModel().sequelize;
  return sequelize.query("" +
    "SELECT `user_achievement_progress`.`id` AS `achievementProgressId`, `user_achievement_progress`.`user_id` AS `achievementProgressUserId`, " +
    "`user_achievement_progress`.`achievement_id` AS `achievementProgressAchievementId`, `user_achievement_progress`.`goalProgress` AS `achievementProgressGoalProgress`, " +
    "`user_achievement_progress`.`status` AS `achievementProgressStatus`, " +
    "`achievement`.`id` AS `achievementId`, `achievement`.`name` AS `achievementName`, `achievement`.`description` AS `achievementDescription`, " +
    "`achievement`.`status` AS `achievementStatus`, `achievement`.`cost` AS `achievementCost`, `achievement`.`achievement_family` AS `achievementFamily`, " +
    "`achievement`.`level` AS `achievementLevel`, `achievement`.`start_amount` AS `achievementStartAmount` " +
    "FROM `user_achievement_progress` " +
    "JOIN `achievement` ON `user_achievement_progress`.`achievement_id` = `achievement`.`id` " +
    "WHERE `user_achievement_progress`.`user_id` = " + userId + " " ,
    {type: sequelize.QueryTypes.SELECT})
    .then(userAchievements => {
      if(!userAchievements) {
        console.log(`${functionFullName}: Records not found`);
        return {status: 404, message: 'User Achievements not found.'};
      } else {
        console.log(`${functionFullName}: User Achievements retrieved successfully`);
        console.log(userAchievements);
        return {status: 200, userAchievements: userAchievements };
      }
    })
    .catch(err => {
      console.log(`${functionFullName}: database error`);
      console.log(err);
      return {status: 500, message: err };
    });
};

module.exports.getUserAchievementsByUserId = getUserAchievementsByUserId;


const newAchievementTransaction = function(userAchievementId, amount, type, description) {
  const functionName = 'newAchievementTransaction';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  // Create New Transaction
  return sqlAchievementTransactionModel.create({
    type: type,
    amount: amount,
    description: description,
    userAchievementId: userAchievementId
  })
    .then(() => {
      console.log(`${functionFullName}: New achievement transaction created successfully`);
      return {status: true, message: 'New achievement transaction created successfully'};
    })
    .catch( err => {
      console.log(`${functionFullName}: Error creating new achievement transaction`);
      console.log(err);
      return {status: false, message: err};
    });
};


const addPointsToAchievementProgress = function (achievementProgressId, amount) {
  const functionName = 'addPointsToAchievementProgress';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  console.log(`${functionFullName}: achievementProgressId: ${achievementProgressId}; amount: ${amount}`);

  return getAchievementProgressById(achievementProgressId)
    .then( data => {
      if (data.status !== true) {
        console.log(`${functionFullName}: Error retrieving User/Achievement Progress`);
        console.log(data.status);
        return {status: false, message: data.status};
      } else {
        console.log(`${functionFullName}: Success retrieving User/Achievement Progress`);
        const achievementProgress = data.achievementProgress;

        console.log(`${functionFullName}: id: ${achievementProgress.id}`);
        console.log(`${functionFullName}: user_id: ${achievementProgress.userId}`);
        console.log(`${functionFullName}: achievement_id: ${achievementProgress.achievementId}`);
        console.log(`${functionFullName}: goalProgress: ${achievementProgress.goalProgress}`);
        console.log(`${functionFullName}: status: ${achievementProgress.status}`);
        console.log(`${functionFullName}: amount to add: ${amount}`);

        return getAchievementById(achievementProgress.achievementId)
          .then(data => {
            if (data.status === false) {
              console.log(`${functionFullName}: Error retrieving Achievement`);
              console.log(data.message);
            } else {
              const achievement = data.achievement;
              console.log(`${functionFullName}: Success retrieving Achievement`);
              console.log(`${functionFullName}: id: ${achievement.id}`);
              console.log(`${functionFullName}: description: ${achievement.description}`);
              console.log(`${functionFullName}: name: ${achievement.name}`);
              console.log(`${functionFullName}: status: ${achievement.status}`);
              console.log(`${functionFullName}: cost: ${achievement.cost}`);
              console.log(`${functionFullName}: amount to add: ${amount}`);

              let status;
              let transactionDescription = null;
              let adjustedAmount;
              let newAmount;
              let overflowAmount = 0;

              if (achievementProgress.goalProgress >= achievement.cost) {
                // Achievement already complete. End function.
                console.log(`${functionFullName}: The achievement is already complete. End the function`);
                return {status: false, message: 'Achievement already complete'};
              } else if ((achievementProgress.goalProgress + amount) === achievement.cost) {
                // This will complete the achievement
                console.log(`${functionFullName}: This will complete the achievement`);
                console.log(`${functionFullName}: achievementProgress.goalProgress + amount: ` +
                  `${(achievementProgress.goalProgress + amount)}`);
                status = 'complete';
              } else if ((achievementProgress.goalProgress + amount) >= achievement.cost) {
                // This will complete the achievement but with a point overflow. Only add enough points
                // to complete the achievement
                console.log(`${functionFullName}: This will complete the achievement with an overflow. ` +
                  `Only add enough points to complete the achievement`);
                status = 'complete';
                adjustedAmount =  achievementProgress.goalProgress - achievement.cost;
                overflowAmount = (achievementProgress.goalProgress + amount) - achievement.cost;
                transactionDescription = 'overflow: ' + overflowAmount;
              } else {
                // Achievement not yet complete. Just add the points.
                console.log(`${functionFullName}: Achievement is still in progress. Add the points`);
                status = 'in progress';
              }

              if(adjustedAmount) {
                amount = adjustedAmount;
              }

              console.log(`${functionFullName}: amount to add: ${amount}`);

              newAmount = achievementProgress.goalProgress + amount;
              console.log(`${functionFullName}: amount after addition: ${newAmount}`);

              // Create new transaction
              return newAchievementTransaction(achievementProgress.id, amount, 'Add', transactionDescription)
                .then(result => {
                  if(result.status !== true) {
                    console.log(`${functionFullName}: Something went wrong`);
                  } else {
                    console.log(`${functionFullName}: Achievement Transaction created successfully`);

                    // Add points to achievement progress
                    return sqlUserAchievementProgressModel.update({
                      goalProgress: newAmount,
                      status: status
                    }, {
                      where: {
                        id: achievementProgress.id
                      }
                    })
                      .then(updateResult => {
                        if (!updateResult) {
                          //return res.status(404).json({ status: false, message: 'Update failed.' });
                          console.log(`${functionFullName}: Something went wrong during the Achievement Point Update`);
                          return {
                            status: false,
                            message: 'Something went wrong during the Achievement Point Update.'
                          };
                        } else {
                          console.log(`${functionFullName}: Points added successfully.`);
                          return {
                            status: true,
                            message: 'Points added successfully.',
                            newAchievementStatus: status,
                            overflow: overflowAmount
                          };
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

            }
          })
          .catch(err => {
            console.log(`${functionFullName}: Database error`);
            console.log(err);
            return {status: false, message: err};
          });
      }
    })
    .catch( err => {
      console.log(`${functionFullName}: Database error`);
      console.log(err);
      return {status: false, message: err};
    });
};

module.exports.addPointsToAchievementProgress = addPointsToAchievementProgress;


const addPointsToAchievementFamilyProgress = function (achievementFamily, userId) {
  const functionName = 'addPointsToAchievementFamilyProgress';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

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

          // Get achievement family max level by sorting by level in descending order and picking first item
          const achievementFamilyMaxLevel = familyProgressResult.achievementFamilyProgress.sort(function(a, b){return b.level - a.level})[0].level;

          // Determine which achievement progress we need to increment
          const achievementProgressToIncrement = getAchievementProgressToIncrement(familyProgressResult);
          console.log(`${functionFullName}: achievementProgressToIncrement:`);
          console.log(achievementProgressToIncrement);

          const amount = achievementProgressToIncrement.incrementAmount;

          return addPointsToAchievementProgress(achievementProgressToIncrement.id, amount)
            .then(result => {
              if(result.status !== true) {
                console.log(`${functionFullName}: Something went wrong incrementing achievement progress`);
                return {status: false, message: result.message};
              } else {
                console.log(`${functionFullName}: Success incrementing achievement progress`);

                // Check if the above transaction completed the achievement level. If so, we need to set the next level
                // to 'in progress' and add any overflow to it
                if (result.newAchievementStatus === 'complete') {
                  console.log(`${functionFullName}: The previous transaction completed the achievement level. Checking if we need to start the next level`);
                  // Get the next level achievement progress (if there is one)
                  const newAchievementProgressToIncrement = familyProgressResult.achievementFamilyProgress.find(x => x.level === (achievementProgressToIncrement.level + 1));
                  console.log(`${functionFullName}: New achievement progress to increment:`);
                  console.log(newAchievementProgressToIncrement);

                  if (newAchievementProgressToIncrement) {
                    console.log(`${functionFullName}: Starting the next achievement progress level by adding the ` +
                      `overflow amount of ${result.overflow} to achievement progress id ${newAchievementProgressToIncrement.id}`);

                    return addPointsToAchievementProgress(newAchievementProgressToIncrement.id, result.overflow)
                      .then(result => {
                        if (result.status !== true) {
                          console.log(`${functionFullName}: Something went wrong incrementing NEW achievement progress`);
                          return {status: false, message: result.message};
                        } else {
                          console.log(`${functionFullName}: Success incrementing NEW achievement progress`);
                          return {status: true, message: 'Success incrementing NEW achievement progress'};
                        }
                      })
                      .catch(err => {
                        console.log(`${functionFullName}: Error`);
                        console.log(err);
                        return {status: false, message: err};
                      });
                  } else {
                    console.log(`${functionFullName}: Unable to find a new achievement progress to increment. ` +
                      `Looks like the max level achievement was completed. Congratulations!`);

                    return {status: true, message: 'Max level achievement completed. Congratulations!'};
                  }
                }

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
    })
    .catch(err => {
      console.log(`${functionFullName}: Error`);
      console.log(err);
      return {status: false, message: err};
    });
};

module.exports.addPointsToAchievementFamilyProgress = addPointsToAchievementFamilyProgress;

const getAchievementProgressToIncrement = function(achievementFamilyProgress) {
  const functionName = 'getAchievementProgressToIncrement';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  // Determine what level we need to increment
  const inProgressAchievement = achievementFamilyProgress.achievementFamilyProgress.filter(x => x.status === 'in progress');
  console.log(`${functionFullName}: inProgressAchievement:`);
  console.log(inProgressAchievement);
  const notStartedAchievements = achievementFamilyProgress.achievementFamilyProgress.filter(x => x.status === 'not started');
  console.log(`${functionFullName}: notStartedAchievements:`);
  console.log(notStartedAchievements);
  const completedAchievements = achievementFamilyProgress.achievementFamilyProgress.filter(x => x.status === 'completed');
  console.log(`${functionFullName}: completedAchievements:`);
  console.log(completedAchievements);

  if (inProgressAchievement.length > 0) {
    // Increment the 'in progress' achievement if it exists
    console.log(`${functionFullName}: 'In progress' status achievement: ` +
      `id: ${inProgressAchievement[0].id}; name: ${inProgressAchievement[0].achievementName}`);

    return inProgressAchievement[0];
  } else {
    // Increment the lowest level 'not started' achievement
    // First, we need to sort by level and pick the lowest one
    const notStartedAchievementToIncrement = notStartedAchievements.sort(function (a, b) {
      return a.level - b.level
    })[0];
    console.log(`${functionFullName}: 'Not started' status achievement with the lowest level: ` +
      `id: ${notStartedAchievementToIncrement.id}; name: ${notStartedAchievementToIncrement.achievementName}`);

    return notStartedAchievementToIncrement;
  }
};


const getAchievementProgressById = function (id) {
  const functionName = 'getAchievementProgressById';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  return sqlUserAchievementProgressModel.findOne({
    attributes: ['id','userId', 'achievementId', 'goalProgress', 'status'],
    where: {
      id: id,
    }
  })
    .then(achievementProgress => {
      if(!achievementProgress) {
        console.log(`${functionFullName}: Unable to find User/Achievement record`);
        return {status: false, message: 'Unable to find User/Achievement record'};
      } else {
        console.log(`${functionFullName}: Retrieved User/Achievement record successfully`);
        // console.log(achievementProgress);
        // console.log(JSON.stringify({status: true, achievementProgress: achievementProgress}));
        return {status: true, achievementProgress: achievementProgress};
      }
    })
    .catch(err => {
      console.log(`${functionFullName}: Database error`);
      return {status: false, message: err};
    })
};

const getAchievementById = function (id) {
  const functionName = 'getAchievementById';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  return sqlAchievementModel.findOne({
    attributes: ['id','name', 'description', 'status', 'cost', 'incrementAmount', 'achievementFamily', 'level', 'startAmount'],
    where: {
      id: id,
    }
  })
    .then(achievement => {
      if(!achievement) {
        console.log(`${functionFullName}: Unable to find Achievement record`);
        return {status: false, message: 'Unable to find Achievement record'};
      } else {
        console.log(`${functionFullName}: Retrieved Achievement record successfully`);
        return {status: true, achievement: achievement};
      }
    })
    .catch(err => {
      console.log(`${functionFullName}: Database error`);
      console.log(err);
      return {status: false, message: err};
    })
};

const getAchievementFamily = function (achievementFamily) {
  const functionName = 'getAchievementFamily';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  return sqlAchievementModel.findAll({
    attributes: ['id','name', 'description', 'status', 'cost', 'incrementAmount', 'achievementFamily', 'level', 'startAmount'],
    where: {
      achievementFamily: achievementFamily,
    }
  })
    .then(achievements => {
      if(!achievements) {
        console.log(`${functionFullName}: Unable to find Achievement Family records`);
        return {status: false, message: 'Unable to find Achievement Family records'};
      } else {
        console.log(`${functionFullName}: Retrieved Achievement Family records successfully`);
        return {status: true, achievements: achievements};
      }
    })
    .catch(err => {
      console.log(`${functionFullName}: Database error`);
      console.log(err);
      return {status: false, message: err};
    })
};

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

module.exports.getAchievementFamilyProgress = getAchievementFamilyProgress;

const acknowledgeAchievementComplete = function (achievementProgressId, userId) {
  const functionName = 'acknowledgeAchievementComplete';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  console.log(`${functionFullName}: Completion of achievement progress id ${achievementProgressId} for user id ${userId} acknowledged`);

  return sqlUserAchievementProgressModel.update({
    status: 'complete acknowledged',
  }, {
    where: {
      id: achievementProgressId,
      status: 'complete'
    }
  })
    .then(updateResult => {
      if (!updateResult) {
        console.log(`${functionFullName}: Something went wrong during the Achievement Progress Status update`);
        return {status: false, message: 'Something went wrong during the Achievement Progress Status update.'};
      } else {
        console.log(`${functionFullName}: Status updated successfully`);
        return {status: true, message: 'Status updated successfully'};
      }
    })
    .catch(err => {
      console.log(`${functionFullName}: Database error`);
      console.log(err);
      return {status: false, message: err};
    });
};

module.exports.acknowledgeAchievementComplete = acknowledgeAchievementComplete;

const newUserAchievementProgress = function (userId, achievementId, startAmount) {
  const functionName = 'newUserAchievementProgress';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  const data = {
    userId: userId,
    achievementId: achievementId,
    startAmount: startAmount
  };

  // Make sure this User/Achievement progress record doesn't already exist
  return sqlUserAchievementProgressModel.findOne({
    attributes: ['id','userId', 'achievementId', 'goalProgress', 'status'],
    where: {
      userId: data.userId,
      achievementId: data.achievementId
    },
  })
    .then(userAchievementProgress => {
      if (userAchievementProgress != null) {
        console.log(`${functionFullName}: This User/Achievement relationship already exists`);
        return {status: false, message: 'This User/Achievement relationship already exists'};
      } else {
        console.log(`${functionFullName}: User/Achievement relationship does not yet exist. Creating`);
        return sqlUserAchievementProgressModel.create({
          userId: data.userId,
          achievementId: data.achievementId,
          goalProgress: data.startAmount
        })
          .then(() => {
            console.log(`${functionFullName}: User/Achievement relationship created: userId: ${data.userId}; ` +
              `achievementId: ${data.achievementId}; goalProgress: ${data.startAmount}`);
            return {status: true, message: 'User/Achievement relationship created' };
          })
          .catch(err => {
            console.log(`${functionFullName}: Error creating User/Achievement relationship`);
            console.log(err);
            return {status: false, message: err };
          });
      }
    })
    .catch(err => {
      console.log(`${functionFullName}: Database error`);
      console.log(err);
      return {status: false, message: err};
    });
};

module.exports.newUserAchievementProgress = newUserAchievementProgress;

const initializeUserAchievementProgress = function (userId) {
  const functionName = 'initializeUserAchievementProgress';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  // Get all achievements
  return sqlAchievementModel.findAll()
    .then(achievements => {
      // Create new User Achievement Progress for each achievement
      for(let i = 0; i < achievements.length; i++) {
        console.log(`${functionFullName}: Initializing achievement '${achievements[i].name}' for userId ${userId}`);

        const data = {
          userId: userId,
          achievementId: achievements[i].id,
          startAmount: achievements[i].startAmount
        };

        newUserAchievementProgress(data.userId, data.achievementId, data.startAmount);
      }

      console.log(`${functionFullName}: User Achievements initialized`);
      return { status: true, message : 'User Achievements initialized' };

    })
    .catch(err => {
      console.log(`${functionFullName}: Database error`);
      console.log(err);
      return { status: false, message: err };
    });
};

module.exports.initializeUserAchievementProgress = initializeUserAchievementProgress;

const resetUserAchievementProgress = function (userId) {
  const functionName = 'resetUserAchievementProgress';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  // Remove the user's achievement progress
  return removeUserAchievements(userId)
    .then(removeResult => {
      if (!removeResult) {
        console.log(`${functionFullName}: Something went very wrong`);
        return {status: false, message: 'Something went very wrong'};
      } else {
        if (removeResult.status !== true) {
          console.log(`${functionFullName}: Error removing user achievements`);
          console.log(removeResult);
          return {status: false, message: 'Error removing user achievements'};
        } else {
          console.log(`${functionFullName}: User achievements removed successfully`);
          console.log(removeResult);

          // Initialize user's achievements
          return initializeUserAchievementProgress(userId)
            .then(initializeResult => {
              if (!initializeResult) {
                console.log(`${functionFullName}: Something went very wrong`);
                return {status: false, message: 'Something went very wrong'};
              } else {
                if (initializeResult.status !== true) {
                  console.log(`${functionFullName}: Error initializing user achievements`);
                  console.log(initializeResult);
                  return {status: false, message: 'Error initializing user achievements'};
                } else {
                  console.log(`${functionFullName}: User achievements initialized successfully`);
                  console.log(initializeResult);
                  return {status: true, message: 'User achievements initialized successfully'};
                }
              }
            })
            .catch(err => {
              console.log(`${functionFullName}: Database error`);
              console.log(err);
              return {status: false, message: err};
            });
        }
      }
    })
    .catch(err => {
      console.log(`${functionFullName}: Database error`);
      console.log(err);
      return {status: false, message: err};
    });
};

module.exports.resetUserAchievementProgress = resetUserAchievementProgress;



const resetAllUsersAchievements = function () {
  const functionName = 'resetAllUsersAchievements';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  return sqlUserModel.findAll()
    .then(usersResult => {
      if (!usersResult) {
        console.log(`${functionFullName}: Did not find any user records`);
        return {status: false, message: 'Did not find any user records'};
      } else {
        console.log(`${functionFullName}: User records retrieved successfully`);
        for (let i = 0; i < usersResult.length; i++) {
          console.log(`${functionFullName}: Resetting achievements for user ${usersResult[i].username}`);
          resetUserAchievementProgress(usersResult[i].id)
            .then(resetResult => {
              if (!resetResult) {
                console.log(`${functionFullName}: Something went very wrong`);
              } else {
                if (resetResult.status !== true) {
                  console.log(`${functionFullName}: Error resetting achievements for ${usersResult[i].username}`);
                } else {
                  console.log(`${functionFullName}: Successfully reset achievements for ${usersResult[i].username}`);
                }
              }
            })
            .catch(err => {
              console.log(`${functionFullName}: Database error`);
              console.log(err);
            });
        }

        console.log(`${functionFullName}: Finished resetting all user achievements`);
        return {status: true, message: 'Finished resetting all user achievements'};
      }
    })
    .catch(err => {
      console.log(`${functionFullName}: Database error`);
      console.log(err);
      return {status: false, message: err};
    })
};

module.exports.resetAllUsersAchievements = resetAllUsersAchievements;

const removeUserAchievements = function (userId) {
  const functionName = 'removeUserAchievements';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  // Remove the user's achievement progress
  return sqlUserAchievementProgressModel.destroy({
    where: {
      userId: userId
    }
  })
    .then(result => {
      if (!result) {
        console.log(`${functionFullName}: Error deleting user achievements`);
        return {status: false, message: 'Error deleting user achievements.'};
      } else {
        console.log(`${functionFullName}: User achievements deleted successfully`);
        console.log(result);
        return {status: true, message: 'User achievements deleted successfully'}
      }
    })
    .catch(err => {
      console.log(`${functionFullName}: Database error`);
      console.log(err);
      return {status: false, message: err};
    });
};

module.exports.removeUserAchievements = removeUserAchievements;


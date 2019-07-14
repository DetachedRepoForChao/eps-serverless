const SqlModel = require('../db');
const Models = SqlModel();

const sqlAchievementModel = Models.Achievement;
const sqlAchievementTransactionModel = Models.AchievementTransaction;
const sqlUserAchievementProgressModel = Models.UserAchievementProgress;

module.exports.getAchievements = (req, res, next) =>{
  //console.log('req.id:' + req.id);
  //console.log(req);

  sqlAchievementModel.findAll({
    attributes: ['id','name','description','status','cost'],
  })
    .then(achievements => {
      return res.status(200).json({ status: true, achievements : achievements});
    })
    .catch(err => {
      console.log('Database error');
      console.log(err);
      return res.status(500).json({ status: false, message : err});
    });
};

module.exports.getAchievementById = (req, res, next) =>{

  console.log('getAchievementById req.achievementId:');
  console.log(req.body.achievementId);
  console.log(req.body);

  sqlAchievementModel.findOne({
    attributes: ['id','name','description','status','cost'],
    where: {
      id: req.body.achievementId,
    }
  })
    .then(achievement => {
      if(!achievement) {
        return res.status(404).json({ status: false, message: 'Achievement record not found.' });
      } else {
        return res.status(200).json({ status: true, achievement : achievement });
      }
    })
    .catch(err => {
      console.log('Database error');
      console.log(err);
      return res.status(500).json({ status: false, message : err});
    });

};

module.exports.getAchievementTransactions = (req, res, next) =>{
  //console.log('req.id:' + req.id);
  //console.log(req);

  sqlAchievementTransactionModel.findAll()
    .then(achievementTransactions => {
      return res.status(200).json({ status: true, achievementTransactions : achievementTransactions });
    });
};

module.exports.getAchievementTransactionById = (req, res, next) =>{

  console.log('getAchievementTransactionById req.achievementTransactionId:');
  console.log(req.body.achievementTransactionId);
  console.log(req.body);

  sqlAchievementTransactionModel.findOne({
    attributes: ['id','type', 'amount', 'userAchievementId', 'description'],
    where: {
      id: req.body.achievementTransactionId,
    }
  })
    .then(achievementTransaction => {
      if(!achievementTransaction) {
        return res.status(404).json({ status: false, message: 'Achievement Transaction record not found.' });
      } else {
        return res.status(200).json({ status: true, achievementTransaction : achievementTransaction});
      }
    });

};

module.exports.getUserAchievementProgress = (req, res, next) =>{
  sqlUserAchievementProgressModel.findAll({
    attributes: ['id','userId', 'achievementId', 'goalProgress', 'status'],
  })
    .then(userAchievementProgress => {
      return res.status(200).json({ status: true, userAchievementProgress : userAchievementProgress });
    })
    .catch(err => {
      console.log('Database error');
      console.log(err);
      return res.status(500).json({ status: false, message : err});
    });
};

module.exports.getUserAchievementProgressById = (req, res, next) =>{

  console.log('getUserAchievementProgressById req.userAchievementProgressId:');
  console.log(req.body.userAchievementProgressId);
  console.log(req.body);

  sqlUserAchievementProgressModel.findOne({
    attributes: ['id','userId', 'achievementId', 'goalProgress', 'status'],
    where: {
      id: req.body.userAchievementProgressId,
    }
  })
    .then(userAchievementProgress => {
      if(!userAchievementProgress) {
        return res.status(404).json({ status: false, message: 'User Achievement Progress record not found.' });
      } else {
        return res.status(200).json({ status: true, userAchievementProgress : userAchievementProgress});
      }
    });
};

module.exports.getUserAchievementProgressByUserId = (req, res, next) =>{

  console.log('getUserAchievementProgressByUserId req.userId:');
  console.log(req.body.userId);
  console.log(req.body);

  return SqlModel.sequelize.query(("SELECT `id`, `user_id`, `achievement_id`, `goalProgress`, `status` " +
    "FROM `user_achievement_progress` " +
    "WHERE `user_achievement_progress`.`user_id` = " + req.body.userId), { type: SqlModel.sequelize.QueryTypes.SELECT})
    .then(userAchievementProgress => {
      if(!userAchievementProgress) {
        console.log('getUserAchievementProgressByUserId Failure. User Achievement Progress not found for specified User Id.');
        return res.status(404).json({ status: false, message: 'User Achievement Progress not found for specified User Id.' });
      } else {
        console.log('getUserAchievementProgressByUserId Success. User Achievement Progress for specified User Id found');
        return res.status(200).json({ status: true, userAchievementProgress : userAchievementProgress});
      }
    })
    .catch(err => {
      console.log('Database error');
      return res.status(500).json({ status: false, message: err});
    });
};

module.exports.getUserAchievementProgressByAchievementId = (req, res, next) =>{

  console.log('getUserAchievementProgressByAchievementId req.achievementId:');
  console.log(req.body.achievementId);
  console.log(req.body);

  SqlModel.sequelize.query(("SELECT `user_achievement_progress`.`id`, `user_achievement_progress`.`user_id`, `user_achievement_progress`.`achievement_id`, `user_achievement_progress`.`goalProgress`, `status` " +
    "FROM `user_achievement_progress` " +
    "WHERE `user_achievement_progress`.`achievement_id` = " + req.body.achievementId), { type: SqlModel.sequelize.QueryTypes.SELECT})
    .then(userAchievementProgress => {
      if(!userAchievementProgress) {
        return res.status(404).json({ status: false, message: 'User Achievement Progress record not found.' });
      } else {
        console.log(userAchievementProgress);
        return res.status(200).json({ status: true, userAchievementProgress : userAchievementProgress });
      }
    });
};

module.exports.getAchievementTransactionsByUserId = (req, res, next) =>{

  console.log('getAchievementTransactionsByUserId req.userId:');
  console.log(req.body.userId);
  console.log(req.body);

  //const userAchievementProgressList = this.getUserAchievementProgressByUserId(req.body.userId);
  //console.log(userAchievementProgressList);

  SqlModel.sequelize.query(("SELECT `achievement_transaction`.`id`, `achievement_transaction`.`type`, `achievement_transaction`.`amount`, `achievement_transaction`.`user_achievement_id`," +
    "`user_achievement_progress`.`id`, `user_achievement_progress`.`user_id`, `user_achievement_progress`.`achievement_id` " +
    "FROM `achievement_transaction` JOIN `user_achievement_progress` ON `achievement_transaction`.`user_achievement_id` = `user_achievement_progress`.`id`" +
    "WHERE `user_achievement_progress`.`user_id` = " + req.body.userId), { type: SqlModel.sequelize.QueryTypes.SELECT})
    .then(achievementTransactions => {
      if(!achievementTransactions) {
        return res.status(404).json({ status: false, message: 'Achievement Transactions not found.' });
      } else {
        console.log(achievementTransactions);
        return res.status(200).json({ status: true, achievementTransactions : achievementTransactions});
      }
    });
};

module.exports.getAchievementTransactionsByAchievementId = (req, res, next) =>{

  console.log('getAchievementTransactionsByAchievementId req.achievementId:');
  console.log(req.body.achievementId);
  console.log(req.body);

  SqlModel.sequelize.query(("SELECT `achievement_transaction`.`id`, `achievement_transaction`.`type`, `achievement_transaction`.`amount`, `achievement_transaction`.`user_achievement_id`," +
    "`user_achievement_progress`.`id`, `user_achievement_progress`.`user_id`, `user_achievement_progress`.`achievement_id` " +
    "FROM `achievement_transaction` JOIN `user_achievement_progress` ON `achievement_transaction`.`user_achievement_id` = `user_achievement_progress`.`id`" +
    "WHERE `user_achievement_progress`.`achievement_id` = " + req.body.achievementId), { type: SqlModel.sequelize.QueryTypes.SELECT})
    .then(achievementTransactions => {
      if(!achievementTransactions) {
        return res.status(404).json({ status: false, message: 'Achievement Transactions not found.' });
      } else {
        console.log(achievementTransactions);
        return res.status(200).json({ status: true, achievementTransaction :achievementTransactions });
      }
    });
};


module.exports.newAchievementTransaction = (req, res, next) => {
  console.log('newAchievementTransaction:');
  console.log(req.body);

  const data = {
    type: req.body.type,
    amount: req.body.amount,
    userAchievementId: req.body.userAchievementId,
    description: req.body.description
  };


  sqlUserAchievementProgressModel.findOne({
    attributes: ['id','userId', 'achievementId', 'goalProgress'],
    where: {
      id: data.userAchievementId
    },
  })
    .then(userAchievementProgress => {
      console.log('newAchievementTransaction userAchievementProgress:');
      if(!userAchievementProgress) {
        console.log('Unable to find User Achievement Progress record for userAchievementId: ' + data.userAchievementId);
        //return userAchievementProgress.status(404).json({ status: false, message: 'Unable to find User Achievement Progress record for userAchievementId: ' + data.userAchievementId});
      } else {
        console.log('Found User Achievement Progress record for userId: ' + data.userAchievementId);
        console.log('User Id: ' + userAchievementProgress['userId']);
        console.log('Achievement Id: ' + userAchievementProgress['achievementId']);

        //return res.status(200).json({ status: true, userAchievementProgress : _.pick(userAchievementProgress,['userId','achievementId', 'goalProgress', 'id']) });
        //sqlAchievementModel.findOne()
        sqlAchievementTransactionModel.create({
          type: data.type,
          amount: data.amount,
          description: data.description,
          userAchievementId: data.userAchievementId
        }).then(res => {
          console.log('Achievement Transaction created in db');
          if(!res) {
            //return res.status(404).json({ status: false, message: 'Update failed.' });
            return { status: false, message: 'Transaction Creation failed.' };
          } else {
            console.log(res);
            return { status: true, message: 'Transaction Creation succeeded.' };
          }
        });
      }
    });
};

var newAchievementTransactionLocal = function(userAchievementId, amount, type, description) {
  console.log('newAchievementTransactionLocal');

  // Create New Transaction
  return sqlAchievementTransactionModel.create({
    type: type,
    amount: amount,
    description: description,
    userAchievementId: userAchievementId
  }).then(() => {
    console.log('newAchievementTransactionLocal success');
    return {status: true, message: 'success'};
  })
    .catch( err => {
      console.log('newAchievementTransactionLocal error');
      return {status: false, message: err};
    });

};

/*
module.exports.addPointsToAchievementProgress = (req, res, next) => {
    console.log('addPointsToAchievementProgress:');
    console.log(req.body);

    const data = {
        userAchievementProgressId: req.body.userAchievementId,
        amount: req.body.amount
    };

    console.log('userAchievementProgressId: ' + data.userAchievementProgress);
    console.log('amount: ' + data.amount);

    SqlModel.sequelize.query(("UPDATE `user_achievement_progress` SET `user_achievement_progress`.`goalProgress` =  `user_achievement_progress`.`goalProgress` + " + data.amount +
        " WHERE `user_achievement_progress`.`id` = " + "'" + data.userAchievementProgressId + "'"), { type: SqlModel.sequelize.QueryTypes.UPDATE})
        .then(res => {
            if(!res) {
                //return res.status(404).json({ status: false, message: 'Update failed.' });
                return JSON.stringify({ status: false, message: 'Update failed.' });
            } else {
                console.log(res);
                return JSON.stringify({ status: true, message: 'Update succeeded.' });
            }
        });
};
*/

var addPointsToAchievementProgress = function (achievementProgressId, amount) {
  console.log('addPointsToAchievementProgress');

  return getAchievementProgressByIdLocal(achievementProgressId)
    .then( data => {
      if (data.status !== true) {
        console.log('Error retrieving User/Achievement Progress');
        console.log(data.status);
        return {status: false, message: data.status};
      } else {
        console.log('Success retrieving User/Achievement Progress');
        const achievementProgress = data.achievementProgress;

        console.log('id: ' + achievementProgress.id);
        console.log('user_id: ' + achievementProgress.userId);
        console.log('achievement_id: ' + achievementProgress.achievementId);
        console.log('goalProgress: ' + achievementProgress.goalProgress);
        console.log('status: ' + achievementProgress.status);
        console.log('amount to add: ' + amount);


        return getAchievementByIdLocal(achievementProgress.achievementId)
          .then(data => {
            if (data.status === false) {
              console.log('Error retrieving Achievement');
              console.log(data.message);
            } else {
              const achievement = data.achievement;
              console.log('Success retrieving Achievement');
              console.log('id: ' + achievement.id);
              console.log('description: ' + achievement.description);
              console.log('name: ' + achievement.name);
              console.log('status: ' + achievement.status);
              console.log('cost: ' + achievement.cost);
              console.log('amount to add: ' + amount);

              var status;
              var transactionDescription = null;
              var newAmount;

              if (achievementProgress.goalProgress >= achievement.cost) {
                // Achievement already complete. End function.
                console.log('The achievement is already complete. End the function');
                return {status: false, message: 'Achievement already complete'};
              } else if ((achievementProgress.goalProgress + amount) === achievement.cost) {
                // This will complete the achievement
                console.log('This will complete the achievement.');
                console.log('(achievementProgress.goalProgress + amount): ' + (achievementProgress.goalProgress + amount));
                status = 'complete';
              } else if ((achievementProgress.goalProgress + amount) >= achievement.cost) {
                // This will complete the achievement but with a point overflow. Only add enough points
                // to complete the achievement
                console.log('This will complete the achievement with an overflow. Only add enough points ' +
                  'to complete the achievement');
                status = 'complete';
                newAmount =  achievementProgress.goalProgress - achievement.cost;

                transactionDescription = 'overflow: ' + ((achievementProgress.goalProgress + amount) - achievement.cost);
              } else {
                // Achievement not yet complete. Just add the points.
                console.log('Achievement is still in progress. Add the points.');
                status = 'in progress';
              }

              if(newAmount) {
                amount = newAmount;
              }

              console.log('amount to add: ' + amount);

              // Create new transaction
              return newAchievementTransactionLocal(achievementProgress.id, amount, 'Add', transactionDescription)
                .then(result => {
                  if(result.status === false) {
                    console.log('Something went wrong');
                  } else {
                    console.log('Achievement Transaction created successfully');

                    // Add points to achievement progress
                    return SqlModel.sequelize.query(("UPDATE `user_achievement_progress` " +
                      "SET `user_achievement_progress`.`goalProgress` =  `user_achievement_progress`.`goalProgress` + " + amount + ", " +
                      "`user_achievement_progress`.`status` = '" + status + "' " +
                      " WHERE `user_achievement_progress`.`id` = " + "'" + achievementProgress.id + "'"), { type: SqlModel.sequelize.QueryTypes.UPDATE})
                      .then(result => {
                        if (!result) {
                          //return res.status(404).json({ status: false, message: 'Update failed.' });
                          console.log('Something went wrong during the Achievement Point Update.');
                          return {
                            status: false,
                            message: 'Something went wrong during the Achievement Point Update.'
                          };
                        } else {
                          console.log('Points added successfully.');
                          return {
                            status: true,
                            message: 'Points added successfully.'
                          };
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

            }
          })
          .catch(err => {
            console.log('Error');
            console.log(err.message);
            return {status: false, message: err};
          });
      }
    })
    .catch( err => {
      console.log('Error');
      console.log(err.message);
      return {status: false, message: err};
    });
};

module.exports.addPointsToAchievementProgress = addPointsToAchievementProgress;

var getAchievementProgressByIdLocal = function (id) {
  console.log('getAchievementProgressByIdLocal');

  return sqlUserAchievementProgressModel.findOne({
    attributes: ['id','userId', 'achievementId', 'goalProgress', 'status'],
    where: {
      id: id,
    }
  })
    .then(achievementProgress => {
      if(!achievementProgress) {
        console.log('Unable to find User/Achievement record');
        return {status: false, message: 'Unable to find User/Achievement record'};
      } else {
        console.log('getAchievementProgressByIdLocal: Success');
        // console.log(achievementProgress);
        // console.log(JSON.stringify({status: true, achievementProgress: achievementProgress}));
        return {status: true, achievementProgress: achievementProgress};
      }
    })
    .catch(err => {
      console.log('Database error');
      return {status: false, message: err};
    })
};

var getAchievementByIdLocal = function (id) {
  console.log('getAchievementByIdLocal');

  return sqlAchievementModel.findOne({
    attributes: ['id','name', 'description', 'status', 'cost'],
    where: {
      id: id,
    }
  })
    .then(achievement => {
      if(!achievement) {
        console.log('Unable to find Achievement record');
        return {status: false, message: 'Unable to find Achievement record'};
      } else {
        console.log('Success');
        return {status: true, achievement: achievement};
      }
    })
    .catch(err => {
      console.log('Database error');
      return {status: false, message: err};
    })
};


var newUserAchievementProgressLocal = function (userId, achievementId) {
  console.log('newUserAchievementProgressLocal:');
  const data = {
    userId: userId,
    achievementId: achievementId,
  };

  sqlUserAchievementProgressModel.findOne({
    attributes: ['id','userId', 'achievementId', 'goalProgress', 'status'],
    where: {
      userId: data.userId,
      achievementId: data.achievementId
    },
  })
    .then(userAchievementProgress => {
      if (userAchievementProgress != null) {
        console.log('This User/Achievement relationship already exists');
        return {status: false, message: 'This User/Achievement relationship already exists'};
      } else {
        sqlUserAchievementProgressModel.create({
          userId: data.userId,
          achievementId: data.achievementId
        }).then(() => {
          console.log('User/Achievement relationship created in db');
          return {status: true, message: 'User/Achievement relationship created' };
        });
      }
    })
    .catch(err => {
      console.log('problem communicating with db');
      return {status: false, message: err};
    });
};

module.exports.newUserAchievementProgressLocal = newUserAchievementProgressLocal;

/*
module.exports.initializeUserAchievementProgress = (req, res, next) => {
    console.log('initializeUserAchievementProgress');
    console.log(req);
    let userId = req;
    // Get all achievements
    sqlAchievementModel.findAll()
        .then(achievements => {
            // Create new User Achievement Progress for each achievement
            for(let i = 0; i < achievements.length; i++) {
                //console.log('achievements[' + i + ']');
                //console.log(achievements[i]);

                const test = {
                    body: {
                        userId: userId,
                        achievementId: achievements[i].id
                    }
                };
                //test.body = {};

                //test.body.userId = this.userId;
                //test.body.achievementId = achievements[i].id;

                newUserAchievementProgress(test);
            }
            if(res) {
                return res.status(200).json({ status: true, achievements : achievements });
            } else {
                return JSON.stringify({status: true, achievements: achievements});
            }

        });
}
*/
var initializeUserAchievementProgressLocal = function (userId) {
  console.log('initializeUserAchievementProgress');

  // Get all achievements
  sqlAchievementModel.findAll()
    .then(achievements => {
      // Create new User Achievement Progress for each achievement
      for(let i = 0; i < achievements.length; i++) {
        //console.log('achievements[' + i + ']');
        //console.log(achievements[i]);

        const data = {
          userId: userId,
          achievementId: achievements[i].id
        };
        //test.body = {};

        //test.body.userId = this.userId;
        //test.body.achievementId = achievements[i].id;

        newUserAchievementProgressLocal(data.userId, data.achievementId);
      }

      return { status: true, message : 'User Achievements Initialized' };

    })
    .catch(err => {
      console.log('Problem with the database');
      console.log(err);
      return { status: false, message: err };
    });
};

module.exports.initializeUserAchievementProgressLocal = initializeUserAchievementProgressLocal;

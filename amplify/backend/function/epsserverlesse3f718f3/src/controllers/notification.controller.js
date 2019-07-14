const SqlModel = require('../db');
const Models = SqlModel().Models;

const sqlUserModel = Models.User;
const sqlAchievementModel = Models.Achievement;
const sqlAchievementTransactionModel = Models.AchievementTransaction;
const sqlUserAchievementProgressModel = Models.UserAchievementProgress;
const ctrlAchievement = require('./achievement.controller');


module.exports.incrementAchievement = (req, res, next) => {
    console.log('incrementAchievement: ' + req.params.achievementName);


}

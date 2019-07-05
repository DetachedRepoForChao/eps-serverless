import SqlModel from '../sequelize';
//import sequelize from 'sequelize';
import bcrypt from "bcrypt";
const _ = require('lodash');
const sqlUserModel = SqlModel.User;
const sqlAchievementModel = SqlModel.Achievement;
const sqlAchievementTransactionModel = SqlModel.AchievementTransaction;
const sqlUserAchievementProgressModel = SqlModel.UserAchievementProgress;
const ctrlAchievement = require('./achievement.controller');


module.exports.incrementAchievement = (req, res, next) => {
    console.log('incrementAchievement: ' + req.params.achievementName);


}

const Sequelize = require('sequelize');
const SqlModel = require('../db');
const Models = SqlModel().Models;

const sqlPointTransactionModel = Models.PointTransaction;
const sqlUserModel = Models.User;



const getUserName = function (userId) {

  return sqlUserModel.findOne({
    attributes: ['id','username','firstName','lastName','points','email', 'securityRoleId','departmentId'],
    where: {
      id: userId,
    },
  })
    .then(userInfo => {
        console.log('userInfo');
        console.log(userInfo);
        return userInfo
      }
    )
    .catch(err => {
        console.log('Database error');
        console.log(err);
        return err;
      }
    );

    /*return sqlUserModel.sequelize.query("select lastName,firstName,avatarUrl,departmentId from `user` WHERE id="+userId)
        .then(
            userInfo=>{
                console.log('userInfo')
                console.log(userInfo[0][0])
                return userInfo[0][0]
            }
        ).catch(
        err => {
            console.log('Database error');
            console.log(err);
            return err;
        }
    )*/
};

/**
 *
 * First : save it in the database
 * Second: Detect whether the user is online
 * Final: Return the total like about this post
 *
 * @param req
 * @param res
 * @param next
 */

const getPointTransaction = function () {
  console.log("getPointTransaction");

/*  sqlUserModel.hasMany(sqlPointTransactionModel, {foreignKey: 'sourceUserId'});
  sqlUserModel.hasMany(sqlPointTransactionModel, {foreignKey: 'targetUserId'});
  sqlPointTransactionModel.belongsTo(sqlUserModel, {foreignKey: 'id'});
  return sqlPointTransactionModel.findAll({
    include: [{
      model: sqlUserModel,
      where: {
        sourceUserId: Sequelize.col('user.id'),
        targetUserId: Sequelize.col('user.id'),
      }
    }],
    limit: 25,
    order: [
      ['id', 'DESC']
    ]
  })*/
  const sequelize = SqlModel().sequelize;
  return sequelize.query("SELECT `point_transaction`.`id`, `point_transaction`.`type`, `point_transaction`.`amount`, " +
    "`point_transaction`.`sourceUserId`, " +
    "`sourceUser`.`username` AS `sourceUserName`, `sourceUser`.`firstName` AS `sourceUserFirstName`, " +
    "`sourceUser`.`lastName` AS `sourceUserLastName`, `sourceUser`.`email` AS `sourceUserEmail`, " +
    "`sourceUser`.`avatarUrl` AS `sourceUserAvatarUrl`, `sourceUser`.`points` AS `sourceUserPoints`, " +
    "`point_transaction`.`targetUserId`, " +
    "`targetUser`.`username` AS `targetUserName`, `targetUser`.`firstName` AS `targetUserFirstName`, " +
    "`targetUser`.`lastName` AS `targetUserLastName`, `targetUser`.`email` AS `targetUserEmail`, " +
    "`targetUser`.`avatarUrl` AS `targetUserAvatarUrl`, `targetUser`.`points` AS `targetUserPoints` " +
    "FROM `point_transaction` " +
    "JOIN `user` AS `sourceUser` ON `point_transaction`.`sourceUserId` = `sourceUser`.`id` " +
    "JOIN `user` AS `targetUser` ON `point_transaction`.`targetUserId` = `targetUser`.`id` " +
    "ORDER BY `id` DESC LIMIT 25", {type: sequelize.QueryTypes.SELECT})
    .then(pointTransactionResult => {
      console.log('pointTransactionResult:');
      console.log(pointTransactionResult);
        //let pointTransactionResult=PointTransactionResult[0];

        const resultLength = pointTransactionResult.length;
        console.log('resultLength: ' + resultLength);
        return {status: 200, pointTransactions: pointTransactionResult};

/*        let pointTransactionResultList = new Array;
        for (let i = 0; i < resultLength; i++){
          getUserName(pointTransactionResult[i].sourceUserId)
            .then(result => {
              pointTransactionResult[i].sourceUserId = {lastName:result.lastName, firstName:result.firstName,avatarUrl:result.avatarUrl};
            });
          getUserName(pointTransactionResult[i].targetUserId)
            .then( result => {
              pointTransactionResult[i].targetUserId={lastName:result.lastName, firstName:result.firstName,avatarUrl:result.avatarUrl};
              pointTransactionResultList.push(pointTransactionResult[i]);
              if (i === resultLength - 1) {
                console.log('console.log(PointTransactionResult)');
                console.log(pointTransactionResultList);
                // return PointTransactionResultList;
                return {status: 200, pointTransactions: pointTransactionResultList[0]};
              }
            });
        }*/
      }
    )
    .catch(err => {
        console.log('Database error');
        console.log(err);
        return {status: 500, message: err};
      }
    )
};

module.exports.getPointTransaction = getPointTransaction;

/*module.exports.getPointTransaction = (req, res, next) =>{
  console.log("getPointTransaction");
  sqlPointTransactionModel.sequelize.query("select * from point_transaction order by id desc LIMIT 25")
        .then(
            PointTransactionResult => {
                let PointTransactionDeatilResult=PointTransactionResult[0]
                const resultlength=PointTransactionDeatilResult.length;
                console.log('resultlength:'+resultlength)
                var PointTransactionResultList = new Array;
                for (let i=0; i<resultlength; i++){
                    getUserName(PointTransactionDeatilResult[i].sourceUserId)
                        .then(result => {
                            PointTransactionDeatilResult[i].sourceUserId = {lastName:result.lastName, firstName:result.firstName,avatarUrl:result.avatarUrl};
                        });
                    getUserName(PointTransactionDeatilResult[i].targetUserId)
                        .then( result=>{
                            PointTransactionDeatilResult[i].targetUserId={lastName:result.lastName, firstName:result.firstName,avatarUrl:result.avatarUrl};
                            PointTransactionResultList.push(PointTransactionResult[i]);
                            if (i==resultlength-1) {
                                console.log('console.log(PointTransactionResult)');
                                console.log(PointTransactionResultList)
                                // return PointTransactionResultList;
                                return res.status(200).json({ status: true, PointTransactionResult:PointTransactionResultList[0]});
                            }
                        });
                }


            }
        ).catch(
        err => {
            console.log('Database error');
            console.log(err);
            return res.status(500).json({status: false, message: err});
        }
    )
}*/

var SetUserNameforTransaction=function(result) {


}




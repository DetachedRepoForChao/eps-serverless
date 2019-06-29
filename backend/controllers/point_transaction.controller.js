
import SqlModel from '../sequelize';


const sqlpointTransactionModel=SqlModel.PointTransaction;
const sqlUserModel = SqlModel.User;



var getUserName=function (userid) {
    return sqlUserModel.sequelize.query("select lastName,firstName,avatarUrl,departmentId from `user` WHERE id="+userid)
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
    )
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

module.exports.getPointTransaction = (req, res, next) =>{
    console.log("getPointTransaction")
    sqlpointTransactionModel.sequelize.query("select * from point_transaction order by id desc LIMIT 25")
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
}

var SetUserNameforTransaction=function(result) {


}




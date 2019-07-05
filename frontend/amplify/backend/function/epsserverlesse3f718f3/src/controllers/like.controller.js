
import SqlModel from '../sequelize';


const sqlLikeModel=SqlModel.Like;


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

module.exports.saveLike = (req, res, next) =>{
    const sourceUserId=req.body.sourceUserId;
    const targetUserId=req.body.targetUserId;
    const Postid=req.body.postId;
    sqlLikeModel.sequelize.query("Insert INTO like_info (post_id,user_id) values("+Postid+","+sourceUserId+")")
    .then(
        InsertLikeResult => {
            console.log("LikeController--InsertLikeResult:"+InsertLikeResult)
            getLikeNumByPostId(Postid).then(
                CountByPostId=>{
                    if (CountByPostId.status==true) {
                        return res.status(200).json({ status: true, countLikes: CountByPostId.likeNum,targetUserId:targetUserId});
                    }else {
                        return res.status(500).json({status: false, message: 'Return Total Like Num Fail!'});
                    }
                }
            )
        }
    ).catch(
        err => {
            console.log('Database error');
            console.log(err);
            return res.status(500).json({status: false, message: err});
        }
    )
}

/**
 * This function is get the total number of like
 * @param postId
 * @returns {Promise<T | string>}
 */
var getLikeNumByPostId = function (postId) {
    console.log('getLikeNumByPostId');
    // First, get the Remaining Point Pool
    return SqlModel.sequelize.query("SELECT count(*) as countlike FROM `like_info` WHERE `like_info`.`post_id` = " + postId + ";",
        {type: SqlModel.sequelize.QueryTypes.SELECT})
        .then(likeNum => {
            if (!likeNum) {
                return JSON.stringify({status: false, message: 'Unable to find any like on it'});
            } else {
                console.log("LikeNum:"+likeNum[0].countlike);
                return ({status: true, likeNum:likeNum[0].countlike});
            }
        })
        .catch(err => {
            console.log('problem communicating with db');
            console.log(err);
            return JSON.stringify({status: false, message: err});
        });
};
module.exports.getLikeNumByPostId = getLikeNumByPostId;

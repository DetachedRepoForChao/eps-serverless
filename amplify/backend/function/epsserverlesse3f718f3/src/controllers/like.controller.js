
const SqlModel = require('../db');
const Models = SqlModel().Models;
const sqlLikeModel = Models.Like;

const componentName = 'like.controller';

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

/*module.exports.saveLike = (req, res, next) =>{
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
}*/

const addLike = function (likingUsername, targetUserId, postId) {
  const functionName = 'saveLike';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  // Make sure that this Like doesn't already exist
  return sqlLikeModel.findOne({
    where: {
      postId: postId,
      username: likingUsername
    }
  })
    .then(likeRecord => {
      if (likeRecord) {
        console.log(`${functionFullName}: Like record for post id ${postId} and username ${likingUsername} already exists`);
        console.log(likeRecord);
        return {status: false, message: `Like record for post id ${postId} and username ${likingUsername} already exists`, likeRecord: likeRecord};
      } else {
        console.log(`${functionFullName}: Like record does not yet exist. Creating Like record for post id ${postId} and username ${likingUsername}`);
        return sqlLikeModel.create({
          postId: postId,
          username: likingUsername
        })
          .then(insertLikeResult => {
            if (!insertLikeResult) {
              console.log(`${functionFullName}: did not receive result from insert operation`);
              return {status: false, message: 'Did not receive result from insert operation'};
            } else {
              console.log(`${functionFullName}: insert operation successful`);
              return getLikeNumByPostId(postId)
                .then(countByPostId => {
                  if (countByPostId.status !== false) {
                    // return res.status(200).json({ status: true, countLikes: CountByPostId.likeNum,targetUserId:targetUserId});
                    return {status: true, countLikes: countByPostId.likeNum, targetUserId: targetUserId, likeId: insertLikeResult.id};
                  } else {
                    // return res.status(500).json({status: false, message: 'Return Total Like Num Fail!'});
                    return {status: false, message: 'Return Total Like Num Fail!'};
                  }
                })
                .catch(err => {
                  console.log(`${functionFullName}: Error retrieving like count`);
                  console.log(err);
                  return {status: false, message: err};
                });
            }
          })
          .catch(err => {
            console.log(`${functionFullName}: Database error`);
            console.log(err);
            // return res.status(500).json({status: false, message: err});
            return {status: false, message: err};
          });
      }
    })
    .catch(err => {
      console.log(`${functionFullName}: Error retrieving Like record`);
      console.log(err);
      return {status: false, message: err};
    });
};

module.exports.addLike = addLike;

const removeLike = function (likingUsername, postId) {
  const functionName = 'removeLike';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  return sqlLikeModel.destroy({
    where: {
      postId: postId,
      username: likingUsername
    }
  })
    .then(destroyResult => {
      if (!destroyResult) {
        console.log(`${functionFullName}: error removing Like record. Record doesn't exist?`);
        return {status: false, message: `Error removing Like record. Record doesn't exist?`}
      } else {
        console.log(`${functionFullName}: Like record removed successfully`);
        console.log(destroyResult);
        return {status: true, message: 'Like record removed successfully'};
      }
    })
    .catch(err => {
      console.log(`${functionFullName}: Database error removing Like record`);
      console.log(err);
      return {status: false, message: err};
    });
};

module.exports.removeLike = removeLike;

const getLikesByPostIds = function (postIds) {
  const functionName = 'getLikesByPostIds';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  return sqlLikeModel.findAll({
    where: {
      postId: postIds
    }
  })
    .then(likesResult => {
      if(!likesResult) {
        console.log(`${functionFullName}: did not retrieve any like records`);
        return {status: false, message: 'Did not retrieve any like records'};
      } else {
        console.log(`${functionFullName}: Like records retrieved successfully`);
        return {status: true, likes: likesResult};
      }
    })
    .catch(err => {
      console.log(`${functionFullName}: Database error`);
      console.log(err);
      return {status: false, message: err};
    });
};

module.exports.getLikesByPostIds = getLikesByPostIds;

/**
 * This function is get the total number of like
 * @param postId
 * @returns {Promise<T | string>}
 */
const getLikeNumByPostId = function (postId) {
  const functionName = 'getLikeNumByPostId';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  return sqlLikeModel.count({
    where: {
      postId: postId
    }
  })
    .then(likeNum => {
      if (!likeNum) {
        // return JSON.stringify({status: false, message: 'Unable to find any like on it'});
        console.log(`${functionFullName}: Unable to retrieve a like count`);
        return {status: false, message: 'Unable to find any like on it'};
      } else {
        console.log(`${functionFullName}: like count retrieved successfully`);
        console.log(likeNum);
        // console.log("LikeNum:"+likeNum[0].countlike);
        // return ({status: true, likeNum:likeNum[0].countlike});
        return {status: true, likeNum: likeNum};
      }
    })
    .catch(err => {
      console.log('problem communicating with db');
      console.log(err);
      return JSON.stringify({status: false, message: err});
    });

/*    return SqlModel.sequelize.query("SELECT count(*) as countlike FROM `like_info` WHERE `like_info`.`post_id` = " + postId + ";",
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
        });*/
};

module.exports.getLikeNumByPostId = getLikeNumByPostId;

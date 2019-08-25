const SqlModel = require('../db');
const Models = SqlModel().Models;
const sqlUserModel = Models.User;
// var fs = require('fs');
const AWS = require('aws-sdk');
const componentName = 'avatar.controller';

const getAvatars = function (callback) {
  const functionName = 'getAvatars';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  const s3 = new AWS.S3();
  const bucket = "eps-serverlessc5940ff4146a4cbc86df2d32b803996c-dev";
  const params = {
    Bucket: bucket
  };
  s3.listObjects(params, function(err, data) {
    if(err) {
      console.log(err, err.stack);
      return callback({status: 500, error: err});
    } else {
      // console.log(data);

      const avatarList = [];
      data.Contents.forEach(function(item) {
        avatarList.push(item.Key);
      });

      // console.log(avatarList);

      return callback({status: 200, avatarList: avatarList});
    }
  });
};

module.exports.getAvatars = getAvatars;

const getUserAvatar = function(username) {
  const functionName = 'getUserAvatar';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  return sqlUserModel.findOne({
    attributes: ['avatarUrl'],
    where: {
      username: username
    }
  })
    .then(avatarUrl => {
      console.log(`${functionFullName}: avatarUrl: ${avatarUrl}`);
      if(!avatarUrl) {
        console.log(`${functionFullName}: Did not find record`);
        return {status: 404, message: 'Did not find record.' };
      } else {
        console.log(`${functionFullName}: Success`);
        return {status: 200, avatarUrl: avatarUrl};
      }
    })
    .catch(err => {
      console.log(`${functionFullName}: Database error`);
      console.log(err);
      return {status: 500, error: err};
    });
};

module.exports.getUserAvatar = getUserAvatar;


const getUserAvatars = function() {
  const functionName = 'getUserAvatars';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  return sqlUserModel.findAll({
    attributes: ['id', 'username', 'avatarUrl'],
  })
    .then(avatarsResult => {
      // console.log(`${functionFullName}: avatarUrl: ${avatarUrl}`);
      if(!avatarsResult) {
        console.log(`${functionFullName}: Did not find any records`);
        return {status: false, message: 'Did not find any records.' };
      } else {
        console.log(`${functionFullName}: Success`);
        return {status: true, avatarsResult: avatarsResult};
      }
    })
    .catch(err => {
      console.log(`${functionFullName}: Database error`);
      console.log(err);
      return {status: false, error: err};
    });
};

module.exports.getUserAvatars = getUserAvatars;


const setUserAvatar = function(username, avatarUrl) {
  const functionName = 'setUserAvatar';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  return sqlUserModel.update({
    avatarUrl: avatarUrl
  }, {
    where: {
      username: username
    }
  })
    .then(() => {
      console.log(`${functionFullName}: Successfully updated user avatar`);
      return {status: 200, avatarUrl: avatarUrl};
    })
    .catch(err => {
      console.log(`${functionFullName}: Error updating user avatar`);
      console.log(err);
      return {status: 500, error: err};
    });
};

module.exports.setUserAvatar = setUserAvatar;

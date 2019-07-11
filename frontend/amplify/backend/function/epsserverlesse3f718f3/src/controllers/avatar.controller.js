const SqlModel = require('../db');
const Models = SqlModel();
const sqlUserModel = Models.User;
// var fs = require('fs');
const AWS = require('aws-sdk');


const getAvatars = function (callback) {
    console.log('getAvatars');
    var s3 = new AWS.S3();
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

        let avatarList = new Array();
        data.Contents.forEach(function(item) {
          avatarList.push(item.Key);
        });

        // console.log(avatarList);

        return callback({status: 200, avatarList: avatarList});

/*        fs.readdir('./public/avatars/', function(err, filenames) {
          if (err) {
            console.log(err);
            //onError(err);
            return;
          }
          filenames.forEach(function(filename) {
            // console.log(filename);
            // var avatarImage = filename;

            avatarList.push(filename);
            /!*fs.readFile(__dirname + filename, 'utf-8', function(err, content) {
                if (err) {
                    console.log(err);
                    //onError(err);
                    return;
                }
                onFileContent(filename, content);
            }); *!/
          });

          console.log(avatarList);

          return {status: 200, avatarList: data};
        });*/
      }
    });

    // var files = fs.readdirSync('../public/avatars/');
    /*
    var files = fs.readdirSync('./public/avatars/', result => {
        console.log(result);
    });
    */


};

module.exports.getAvatars = getAvatars;

const getUserAvatar = function(userId) {
    console.log('getUserAvatar');

    return sqlUserModel.findOne({
        attributes: ['avatarUrl'],
        where: {
            id: userId
        }
    })
        .then(avatarUrl => {
            console.log('getUserAvatar: avatarUrl: ');
            console.log(avatarUrl);
            if(!avatarUrl) {
                console.log('getUserAvatar: Did not find record');
                return {status: 404, message: 'getUserAvatar: Did not find record.' };
            } else {
                console.log('getUserAvatar: Success');
                return {status: 200, avatarUrl: avatarUrl};
            }
        })
        .catch(err => {
            console.log('getUserAvatar: Error: ' + err);
            return {status: 500, error: err};
    });
};

module.exports.getUserAvatar = getUserAvatar;

const setUserAvatar = function(username, avatarUrl) {
    console.log('setUserAvatar');

    return sqlUserModel.update({
        avatarUrl: avatarUrl
    }, {
        where: {
            username: username
        }
    })
        .then(() => {
            console.log('setUserAvatar: Success');
            return {status: 200, avatarUrl: avatarUrl};
        })
        .catch(err => {
            console.log('setUserAvatar: Error: err');
            return {status: 500, error: err};
        });
};

module.exports.setUserAvatar = setUserAvatar;

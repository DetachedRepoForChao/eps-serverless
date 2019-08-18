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
            console.log('getCurrentUserAvatar: avatarUrl: ');
            console.log(avatarUrl);
            if(!avatarUrl) {
                console.log('getCurrentUserAvatar: Did not find record');
                return {status: 404, message: 'getCurrentUserAvatar: Did not find record.' };
            } else {
                console.log('getCurrentUserAvatar: Success');
                return {status: 200, avatarUrl: avatarUrl};
            }
        })
        .catch(err => {
            console.log('getCurrentUserAvatar: Error: ' + err);
            return {status: 500, error: err};
    });
};

module.exports.getUserAvatar = getUserAvatar;

var setUserAvatar = function(req, res) {
    console.log('setUserAvatar');

    sqlUserModel.update({
        avatarUrl: req.body.avatarUrl
    }, {
        where: {
            id: req.body.userId
        }
    })
        .then(() => {
            console.log('setUserAvatar: Success');
            return res.status(200).json({status: true, avatarUrl: req.body.avatarUrl});
        })
        .catch(err => {
            console.log('setUserAvatar: Error: err');
            return res.status(500).json({status: false, error: err});
        });
};

module.exports.setUserAvatar = setUserAvatar;

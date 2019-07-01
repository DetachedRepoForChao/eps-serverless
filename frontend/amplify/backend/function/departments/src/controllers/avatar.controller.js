import SqlModel from '../sequelize';
const sqlUserModel = SqlModel.User;
const _ = require('lodash');
var fs = require('fs');


var getAvatars = function (req, res) {
    console.log('getAvatars');

    // var files = fs.readdirSync('../public/avatars/');
    /*
    var files = fs.readdirSync('./public/avatars/', result => {
        console.log(result);
    });
    */

    var avatarList = new Array();

    fs.readdir('./public/avatars/', function(err, filenames) {
        if (err) {
            console.log(err);
            //onError(err);
            return;
        }
        filenames.forEach(function(filename) {
            // console.log(filename);
            // var avatarImage = filename;

            avatarList.push(filename);
            /*fs.readFile(__dirname + filename, 'utf-8', function(err, content) {
                if (err) {
                    console.log(err);
                    //onError(err);
                    return;
                }
                onFileContent(filename, content);
            }); */
        });

        console.log(avatarList);

        res.status(200).send({avatarList: avatarList});
    });
};

module.exports.getAvatars = getAvatars;

var getUserAvatar = function(req, res) {
    console.log('getUserAvatar');

    sqlUserModel.findOne({
        attributes: ['avatarUrl'],
        where: {
            id: req.body.userId
        }
    })
        .then(data => {
            console.log('getUserAvatar: data: ');
            console.log(data);
            if(!data) {
                console.log('getUserAvatar: Did not find record');
                return res.status(404).json({ status: false, message: 'Something went wrong.' });
            } else {
                console.log('getUserAvatar: Success');
                return res.status(200).json({ status: true, avatarUrl : data });
            }
        })
        .catch(err => {
            console.log('getUserAvatar: Error: ' + err);
            return res.status(500).json({status: false, error: err});
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

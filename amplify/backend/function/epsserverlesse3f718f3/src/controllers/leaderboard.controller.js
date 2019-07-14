const SqlModel = require('../db');
const Models = SqlModel();
const sqlUserModel = Models.User;
const sqlDepartmentModel = Models.Department;

const generatePointsLeaderboard = function() {
    console.log('generatePointsLeaderboard');

    return sqlUserModel.findAll({
        attributes: ['id', 'username', 'email', 'firstName', 'lastName', 'departmentId', 'position', 'points', 'avatarUrl'],
        where: {
            securityRoleId: 1,
            dateOfTermination: null
        },
        order: [
            ['points', 'DESC'],
            ['lastName', 'ASC']
        ]
    })
        .then(users => {
            if(!users) {
                console.log('generatePointsLeaderboard: Unable to find any matching records');
                // return res.status(404).json({ status: false, message: "Unable to find any matching records."});
                return { status: false, message: "Unable to find any matching records."};
            } else {
                console.log('generatePointsLeaderboard: Success');
                // return res.status(200).json({ status: true, users: users});
                return { status: true, users: users};
            }
        })
        .catch(err => {
            console.log('generatePointsLeaderboard: Error: ' + err);
            // return res.sta
            return {status: false, error: err};
        });
};

const getPointsLeaderboard = function() {
    console.log('getPointsLeaderboard');
    return generatePointsLeaderboard()
        .then(result => {
            if(result.status !== false) {
                return {status: 200, result: result.users};
            } else {
                return {status: 404, result: result};
            }
        })
        .catch(err => {
            console.log('getPointsLeaderboard: Error: ' + err);
            return {status: 500, error: err};
        })
};

module.exports.getPointsLeaderboard = getPointsLeaderboard;

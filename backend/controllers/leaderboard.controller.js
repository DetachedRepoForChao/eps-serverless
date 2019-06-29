import SqlModel from '../sequelize';
const sqlUserModel = SqlModel.User;
const sqlDepartmentModel = SqlModel.Department;

var generatePointsLeaderboard = function() {
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

var getPointsLeaderboard = function(req, res) {
    console.log('getPointsLeaderboard');
    return generatePointsLeaderboard()
        .then(result => {
            if(result.status !== false) {
                return res.status(200).json({status: true, result: result.users});
            } else {
                return res.status(404).json(result);
            }
        })
        .catch(err => {
            console.log('getPointsLeaderboard: Error: ' + err);
            return res.status(500).json({status: false, error: err});
        })
};

module.exports.getPointsLeaderboard = getPointsLeaderboard;

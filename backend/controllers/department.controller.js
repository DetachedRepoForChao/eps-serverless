import SqlModel from '../sequelize';
const _ = require('lodash');
const sqlDepartmentModel = SqlModel.Department;
const sqlUserModel = SqlModel.User;

module.exports.getDepartments = (req, res, next) =>{
    //console.log('req.id:' + req.id);
    //console.log(req);
    sqlDepartmentModel.findAll({
        attributes: ['id', 'name'],
    })
        .then(departments => {
            // return res.status(200).json({ status: true, departments : departments });
            return res.status(200).json({ status: true, departments : departments });
        })
        .catch(err => {
            console.log('Database error');
            console.log(err);
            return res.status(500).json({status: false, message: err});
        });

};


module.exports.getDepartmentById = (req, res, next) =>{

    console.log('getDepartmentById req.body.departmentId:');
    console.log('req.id ' + req.id);
    console.log('req.username ' + req.username);
    //console.log(req);
    console.log(req.body.departmentId);
    console.log(req.body);

    sqlDepartmentModel.findOne({
        attributes: ['id', 'name'],
        where: {
            id: req.body.departmentId,
        }
    })
        .then(department => {
            if(!department) {
                return res.status(404).json({ status: false, message: 'Department record not found.' });
            } else {
                return res.status(200).json({ status: true, department : department });
            }
        })
        .catch(err => {
            console.log('Database error');
            console.log(err);
            return res.status(500).json({status: false, message: err});
        });
};

var getEmployeesByDepartmentId = function (req, res, next) {
    console.log('getEmployeesByDepartmentId');
    console.log('req.type()' + req.type);
    console.log(req);
    const data = {
        departmentId: req.body.departmentId,
        securityRoleId: 1 // Role ID that corresponds with the Employee Role
    };

    sqlUserModel.findAll({
        attributes: ['id', 'username', 'firstName', 'lastName', 'email', 'position', 'securityRoleId', 'points', 'avatarUrl'],
        where: {
            departmentId: data.departmentId,
            securityRoleId: data.securityRoleId
        }
    })
        .then( users => {
            //console.log('Test1');
            //console.log(users[0]);
            //console.log('Test2');
            if(!users) {
                return res.status(404).json({ status: false, message: 'Did not find any users with that Department Id.' });
            } else {
                return res.status(200).json({ status: true, users: users});
            }
        })
        .catch(err => {
            console.log('Database error');
            console.log(err);
            return res.status(500).json({ status: false, message: err });
        })
};

module.exports.getEmployeesByDepartmentId = getEmployeesByDepartmentId;

/*
module.exports.getDepartmentById = (req, res, next) =>{

    console.log('getDepartmentById req.body.departmentId:');
    console.log('req.id ' + req.id);
    console.log('req.username ' + req.username);
    //console.log(req);
    console.log(req.body.departmentId);
    console.log(req.body);

    sqlDepartmentModel.findOne({
        where: {
            id: req.body.departmentId,
        }
    })
        .then(department => {
            if(!department) {
                return res.status(404).json({ status: false, message: 'Department record not found.' });
            } else {
                return res.status(200).json({ status: true, department : _.pick(department,['id','name']) });
            }
        });
};
*/

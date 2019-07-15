const SqlModel = require('../db');
const Models = SqlModel();

const sqlDepartmentModel = Models.Department;

const getDepartments = function () {
  console.log('start function getDepartments');
  try {

    return sqlDepartmentModel.findAll({
      attributes: ['id', 'name'],
    }).then(departments => {
      // console.log('departments;');
      // console.log(departments);
      return {
        status: 200,
        departments: departments
      };
    }).catch(err => {
      console.log("Error retrieving departments");
      return {
        status: err.statusCode || 500,
        error: err || "Error retrieving departments"
      }
    });
  } catch (err) {
    return {
      status: err.statusCode || 500,
      error: err || "Error getting departments"
    }
  }
};

module.exports.getDepartments = getDepartments;

const getDepartmentById = function(req) {

    console.log('getDepartmentById req.body.departmentId:');
    // console.log('req.id ' + req.id);
    // console.log('req.username ' + req.username);
    //console.log(req);
  const departmentId = req.body.departmentId;
    console.log(departmentId);
    // console.log(req.body);

    return sqlDepartmentModel.findOne({
        attributes: ['id', 'name'],
        where: {
            id: departmentId,
        }
    })
        .then(department => {
            if(!department) {
                return {status: 404, message: 'Department record not found.' };
            } else {
                return {status: 200, department: department};
            }
        })
        .catch(err => {
            console.log('Database error');
            console.log(err);
            return {status: 500, message: err};
        });
};

module.exports.getDepartmentById = getDepartmentById;

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

const SqlModel = require('../db');
const Models = SqlModel().Models;
const sqlDepartmentModel = Models.Department;
const sqlUserModel = Models.User;

const componentName = 'department.controller';

const getDepartments = function () {
  console.log('start function getDepartments');

  return sqlDepartmentModel.findAll({
    attributes: ['id', 'name'],
  })
    .then(departments => {
      if (!departments) {
        console.log("Unable to find any department records");
        return {status: false, message: 'Unable to find any department records'};
      } else {
        console.log('Retrieved department records successfully');
        return {status: true, departments: departments};
      }
    })
    .catch(err => {
      console.log("Database error retrieving department records");
      console.log(err);
      return {status: false, message: 'Database error retrieving department records', error: err};
    });

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

const getEmployeesByDepartmentId = function (departmentId) {
  console.log('getEmployeesByDepartmentId');

  const data = {
    departmentId: departmentId,
    //securityRoleId: 1 // Role ID that corresponds with the Employee Role
  };

  return sqlUserModel.findAll({
    attributes: ['id', 'username', 'firstName', 'lastName', 'email', 'position', 'securityRoleId', 'points', 'avatarUrl'],
    where: {
      departmentId: data.departmentId,
      // securityRoleId: data.securityRoleId
    }
  })
    .then( users => {
      if(!users) {
        return [];
        //return {status: 404, message: 'Did not find any users with that Department Id.' };
      } else {
        return users;
        // console.log(users)
        //return {status: 200, users: users};
      }
    })
    .catch(err => {
      console.log('Database error');
      console.log(err);
      return {status: 500, message: err };
    })
};

module.exports.getEmployeesByDepartmentId = getEmployeesByDepartmentId;

// addDepartment
const addDepartment = function (department) {
  const functionName = 'addDepartment';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  console.log(`${functionFullName}: department:`);
  console.log(department);

  const name = department.departmentName;


  return sqlDepartmentModel.findOne({
    where: {
      name: name
    },
  })
    .then(departmentQueryResult => {
      if (departmentQueryResult !== null) {
        console.log(`${functionFullName}: departmentname already taken`);
        return {status: false, error: 'departmentname already taken'};
      } else {
        console.log(`${functionFullName}: department does not yet exist. Creating...`);

        return sqlDepartmentModel.create({
          name: name,
        })
          .then(newDepartment => {
            console.log(`${functionFullName}: department created in db`);
            return {status: true, message: 'department created', newDepartment: newDepartment};
          })
          .catch(err => {
            console.log(`${functionFullName}: Department creation error`);
            console.log(err);
            return {status: false, message: err}
          });
      }
    })
    .catch(err => {
      console.log(`${functionFullName}: Problem with the database`);
      console.log(err);
      return {status: false, message: err};
    });
};

module.exports.addDepartment = addDepartment;

// delete apartments
const deleteDepartment = function (department) {
  const functionName = 'deleteDepartment';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  console.log(`${functionFullName}: Deleting department:`);
  console.log(department);

  return sqlDepartmentModel.destroy({
    where: {
      id: department.departmentName.Id,
    }
  })
    .then(() => {
      console.log(`${functionFullName}: Successfully deleted department`);
      return {status: true, department: department};
    })
    .catch(err => {
      console.log(`${functionFullName}: Database error`);
      console.log(err);
      if (err.original.sqlState === '45000') {
        console.log(`Error Message: ${err.original.sqlMessage}`);
        return {status: false, message: err.original.sqlMessage};
      } else {
        return {status: false, message: err};
      }
    });
};

module.exports.deleteDepartment = deleteDepartment;

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

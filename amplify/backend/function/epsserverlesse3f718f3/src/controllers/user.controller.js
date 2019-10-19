const SqlModel = require('../db');
const Models = SqlModel().Models;
const sqlUserModel = Models.User;

const _ = require('lodash');

const ctrlAchievement = require('./achievement.controller');
const ctrlPointPool = require('./point_pool.controller');

// const jwtVerify = require('../config/decode-verify-jwt');
const componentName = 'user.controller';


const registerUser = function (user) {
  const functionName = 'registerUser';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  console.log(`${functionFullName}: body:`);
  console.log(user.body);

  const username = user.body.username;
  const firstName = user.body.firstName;
  const lastName = user.body.lastName;
  const email = user.body.email;
  const securityRoleId = user.body.securityRole.Id;
  const departmentId = user.body.department.Id;
  const phone = user.body.phone;
  const birthdate = user.body.birthdate;
  // const password = req.body.password;
  const middleName = user.body.middleName;
  const preferredName = user.body.preferredName;
  const prefix = user.body.prefix;
  const suffix = user.body.suffix;
  const position = user.body.position;
  const address1 = user.body.address1;
  const address2 = user.body.address2;
  const city = user.body.city;
  const state = user.body.state;
  const country = user.body.country;
  const zip = user.body.zip;
  const preferredPronoun = user.body.preferredPronoun;
  const sex = user.body.sex;
  const gender = user.body.gender;
  const dateOfHire = user.body.dateOfHire;
  // const avatarUrl =

  // var password;
  // var saltSecret;

  return sqlUserModel.findOne({
    where: {
      username: username
    },
  })
    .then(user => {
      if (user != null) {
        console.log(`${functionFullName}: username already taken`);
        return {status: false, error: 'username already taken'};
      } else {
        console.log(`${functionFullName}: user account does not yet exist. Creating...`);

        return sqlUserModel.create({
          username: username,
          firstName: firstName,
          lastName: lastName,
          email: email,
          securityRoleId: securityRoleId,
          departmentId: departmentId,
          phone: phone,
          dateOfBirth: birthdate,
          points: 0,
          middleName: middleName,
          preferredName: preferredName,
          prefix: prefix,
          suffix: suffix,
          position: position,
          address1: address1,
          address2: address2,
          city: city,
          state: state,
          country: country,
          zip: zip,
          preferredPronoun: preferredPronoun,
          sex: sex,
          gender: gender,
          dateOfHire: dateOfHire,
          active: 1,
        })
          .then((user) => {
            console.log(`${functionFullName}: user created in db`);

            // If the user is a manager, initialize their points pool
            if (user.securityRoleId === 2) {
              console.log(`${functionFullName}: initializing manager point pool for new user`);
              ctrlPointPool.initializePointPool(user.id);
            }

            return {status: true, message: 'user created', user: user};
          })
          .catch(err => {
            console.log(`${functionFullName}: User creation error`);
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

module.exports.registerUser = registerUser;


const getUserProfile = function (username) {
  const functionName = 'getUserProfile';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  return sqlUserModel.findOne({
    include: [
      {
        model: Models.Department,
        attributes: ['id', 'name']
      },
      {
        model: Models.SecurityRole,
        attributes: ['id', 'name', 'description']
      },
      {
        model: Models.PointPool,
        attributes: ['id', 'managerId', 'pointsRemaining']
      }
    ],
    attributes: ['id', 'username', 'firstName', 'lastName', 'middleName', 'preferredName', 'prefix', 'suffix',
      'position', 'points', 'email', 'address1', 'address2', 'city', 'state', 'country', 'zip', 'dateOfBirth',
      'preferredPronoun', 'sex', 'gender', 'dateOfHire', 'phone', 'securityRoleId', 'departmentId', 'avatarUrl'],
    where: {
      username: username,
      active: 1
    },
  })
    .then(user => {
      if (!user) {
        console.log(`${functionFullName}: User record not found`);
        return { status: false, message: 'User record not found.' };
      } else {
        console.log(`${functionFullName}: User record found`);
        console.log(user);
        return  {status: true, user: user};
      }
    })
    .catch(err => {
      console.log(`${functionFullName}: Error retrieving user profile`);
      console.log(err);
      return {status: false, message: err};
    });
};

module.exports.getUserProfile = getUserProfile;


const getUserPoints = function (username) {
  const functionName = 'getUserPoints';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  console.log(`${functionFullName}: username: ${username}`);

  return sqlUserModel.findOne({
    attributes: ['points'],
    where: {
      username: username
    }
  })
    .then(pointsResult => {
      if(!pointsResult) {
        return {status: 404, message: 'getUserPoints: Something went wrong.' };
      } else {
        return {status: 200, points: pointsResult.points};
      }
    })
    .catch(err => {
      console.log(`${functionFullName}: Problem with the database`);
      console.log(err);
      return {status: 500, error: 'getUserPoints: Problem with the database: ' + err};
    });
};

module.exports.getUserPoints = getUserPoints;



const getUsersPublicDetails = function () {
  const functionName = 'getUsersPublicDetails';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  return sqlUserModel.findAll({
    include: [
      {
        model: Models.Department,
        attributes: ['id', 'name']
      },
      {
        model: Models.SecurityRole,
        attributes: ['id', 'name', 'description']
      }
    ],
    attributes: ['id', 'username', 'firstName', 'lastName', 'middleName', 'preferredName', 'prefix', 'suffix',
      'position', 'points', 'dateOfBirth', 'preferredPronoun', 'securityRoleId', 'departmentId', 'avatarUrl', 'email'],
    where: {
      securityRoleId: [1, 2],
      active: 1,
    },
    order: [
      ['id', 'ASC'],
    ],
  })
    .then(usersPublicDetailsResult => {
      if (!usersPublicDetailsResult) {
        console.log(`${functionFullName}: No records found`);
        return { status: false, message: 'No records found' };
      } else {
        console.log(`${functionFullName}: User records found`);
        return  {status: true, users: usersPublicDetailsResult};
      }
    })
    .catch(err => {
      console.log(`${functionFullName}: Error retrieving user records`);
      console.log(err);
      return {status: false, message: err};
    });
};

module.exports.getUsersPublicDetails = getUsersPublicDetails;

const adminGetUsersDetails = function () {
  const functionName = 'adminGetUsersDetails';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  return sqlUserModel.findAll({
    include: [
      {
        model: Models.Department,
        attributes: ['id', 'name']
      },
      {
        model: Models.SecurityRole,
        attributes: ['id', 'name', 'description']
      }
    ],
    attributes: ['id', 'username', 'firstName', 'lastName', 'middleName', 'preferredName', 'prefix', 'suffix',
      'position', 'points', 'email', 'address1', 'address2', 'city', 'state', 'country', 'zip', 'dateOfBirth',
      'preferredPronoun', 'sex', 'gender', 'dateOfHire', 'dateOfTermination', 'phone', 'securityRoleId',
      'departmentId', 'avatarUrl'],
    order: [
      ['id', 'ASC'],
    ],
  })
    .then(usersDetailsResult => {
      if (!usersDetailsResult) {
        console.log(`${functionFullName}: No records found`);
        return { status: false, message: 'No records found' };
      } else {
        console.log(`${functionFullName}: User records found`);
        return  {status: true, users: usersDetailsResult};
      }
    })
    .catch(err => {
      console.log(`${functionFullName}: Error retrieving user records`);
      console.log(err);
      return {status: false, message: err};
    });
};

module.exports.adminGetUsersDetails = adminGetUsersDetails;

const modifyUser = function (user) {
  const functionName = 'modifyUser';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  console.log(`${functionFullName}: Modifying User:`);
  console.log(user);

  return sqlUserModel.update({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    securityRoleId: user.securityRole.Id,
    departmentId: user.department.Id,
    phone: user.phone,
    dateOfBirth: user.birthdate,
    points: user.points,
    middleName: user.middleName,
    preferredName: user.preferredName,
    prefix: user.prefix,
    suffix: user.suffix,
    position: user.position,
    address1: user.address1,
    address2: user.address2,
    city: user.city,
    state: user.state,
    country: user.country,
    zip: user.zip,
    preferredPronoun: user.preferredPronoun,
    sex: user.sex,
    gender: user.gender,
    dateOfHire: user.dateOfHire,
  }, {
    include: [
      {
        model: Models.Department,
        attributes: ['id', 'name']
      },
      {
        model: Models.SecurityRole,
        attributes: ['id', 'name', 'description']
      }
    ],
    where: {
      id: user.userId,
    }
  })
    .then(() => {
      console.log(`${functionFullName}: Successfully updated User`);
      return {status: true, user: user};
    })
    .catch(err => {
      console.log(`${functionFullName}: Database error`);
      console.log(err);
      return {status: false, message: err};
    });
};

module.exports.modifyUser = modifyUser;

const terminateUser = function (user) {
  const functionName = 'terminateUser';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  console.log(`${functionFullName}: Terminating User:`);
  console.log(user);

  return sqlUserModel.update({
    dateOfTermination: user.dateOfTermination,
    active: 0,
  }, {
    where: {
      id: user.userId,
    }
  })
    .then(() => {
      console.log(`${functionFullName}: Successfully terminated User`);
      return {status: true, user: user};
    })
    .catch(err => {
      console.log(`${functionFullName}: Database error`);
      console.log(err);
      return {status: false, message: err};
    });
};

module.exports.terminateUser = terminateUser;

const deleteUser = function (user) {
  const functionName = 'deleteUser';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  console.log(`${functionFullName}: Deleting User:`);
  console.log(user);

  return sqlUserModel.destroy({
    where: {
      id: user.userId,
    }
  })
    .then(() => {
      console.log(`${functionFullName}: Successfully deleted User`);
      return {status: true, user: user};
    })
    .catch(err => {
      console.log(`${functionFullName}: Database error`);
      console.log(err);
      return {status: false, message: err};
    });
};

module.exports.deleteUser = deleteUser;


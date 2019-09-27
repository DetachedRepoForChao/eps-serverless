const SqlModel = require('../db');
const Models = SqlModel().Models;
const sqlUserModel = Models.User;

// const bcrypt = require('bcryptjs');
// const passport = require('passport');
const _ = require('lodash');
// const jwt = require('jsonwebtoken');
// const BCRYPT_SALT_ROUNDS = 12;

const ctrlAchievement = require('./achievement.controller');
const ctrlPointPool = require('./point_pool.controller');

const jwtVerify = require('../config/decode-verify-jwt');
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
          // password: password,
          // saltSecret: saltSecret,
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
          dateOfHire: dateOfHire
        })
          .then((user) => {
            console.log(`${functionFullName}: user created in db`);

            // If the user is a manager, initialize their points pool
            if (user.securityRoleId === 2) {
              console.log(`${functionFullName}: initializing manager point pool for new user`);
              ctrlPointPool.initializePointPool(user.id);
            }

            return {status: true, message: 'user created', user: user};

            /*return ctrlAchievement.initializeUserAchievementProgress(user.id)
              .then(initAchievResult => {
                if (!initAchievResult) {
                  console.log(`${functionFullName}: Did not receive achievement initialization result during user creation`);
                  return {status: false, message: 'Did not receive achievement initialization result during user creation'}
                } else {
                  if (initAchievResult.status !== true) {
                    console.log(`${functionFullName}: Error while initializing achievements for new user`);
                    return {status: false, message: 'Error while initializing achievements for new user'}
                  } else {
                    console.log(`${functionFullName}: achievements initializing for new user successfully`);

                    // If the user is a manager, initialize their points pool
                    if (user.securityRoleId === 2) {
                      console.log(`${functionFullName}: initializing manager point pool for new user`);
                      ctrlPointPool.initializePointPool(user.id);
                    }

                    return {status: true, message: 'user created', user: user};
                  }
                }
              })
              .catch(err => {
                console.log(`${functionFullName}: Database error during achievement initialization during user creation`);
                console.log(err);
                return {status: false, message: 'Database error during achievement initialization during user creation'}
              });*/
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
      return {status: false, error: 'Problem with the database: ' + err};
    });
};

module.exports.registerUser = registerUser;

/*
module.exports.authenticateUser = (req, res, next) => {
  const functionName = 'authenticateUser';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  // call for passport authentication
  passport.authenticate('local', (err, user, info) => {
    console.log("authenticateUser().user");
    //console.log(user);
    console.log("authenticateUser().user.id");
    console.log(user.id);
    console.log("authenticateUser().info");
    console.log(info);
    // error from passport middleware
    if (err) return res.status(400).json(err);
    // registered user
    else if (user) {
      //const tempUser = user;
      //var tempId;
      //console.log('tempId: ' + tempId);
      const token = jwt.sign({
          id: user.id,
          //username: user.username,
          //firstName: user.firstName,
          //lastName: user.lastName,
          //position: user.position,
          //points: user.points,
          //email: user.email,
          //departmentId: user.departmentId,
          //securityRoleId: user.securityRoleId
        },
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.JWT_EXP
        });
      console.log('token: ' + token);
      //return res.status(200).json({ "token": user.generateJwt() });
      return res.status(200).json({ "token": token });
    }
    // unknown user or wrong password
    else return res.status(404).json(info);
  })(req, res);
};*/



const getUserProfile = function (username) {
  const functionName = 'getUserProfile';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  return sqlUserModel.findOne({
    attributes: ['id', 'username', 'firstName', 'lastName', 'middleName', 'position', 'points', 'email',
      'securityRoleId', 'departmentId', 'avatarUrl'],
    where: {
      username: username,
    },
  })
    .then(user => {
      if (!user) {
        console.log(`${functionFullName}: User record not found`);
        return { status: false, message: 'User record not found.' };
      } else {
        console.log(`${functionFullName}: User record found`);
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

module.exports.setUserProfile = (req, res, next) => {
  console.log('setUserProfile');
};


var getUserName = function (userid) {
  const functionName = 'getUserName';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  sqlUserModel.findOne({
    where: {
      id: userid,
    },
  })
    .then(user => {
      if (!user)
        return res.status(404).json({ status: false, message: 'User record not found.' });
      else
        return res.status(200).json({ status: true, user : _.pick(user,['id','username','firstName','lastName','points','email', 'securityRoleId','departmentId']) });
    });
};


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
    attributes: ['id', 'username', 'firstName', 'lastName', 'middleName', 'position', 'points', 'dateOfBirth',
      'securityRoleId', 'departmentId', 'avatarUrl'],
    where: {
      securityRoleId: [1, 2],
    },
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

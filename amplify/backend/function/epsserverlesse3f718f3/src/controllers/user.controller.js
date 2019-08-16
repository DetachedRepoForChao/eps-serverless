const SqlModel = require('../db');
const Models = SqlModel().Models;
const sqlUserModel = Models.User;

const bcrypt = require('bcryptjs');
const passport = require('passport');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const BCRYPT_SALT_ROUNDS = 12;

const ctrlAchievement = require('./achievement.controller');
const ctrlPointPool = require('./point_pool.controller');

const jwtVerify = require('../config/decode-verify-jwt');
const componentName = 'user.controller';

/*const registerUser = function (req) {
  const functionName = 'registerUser';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  console.log(`${functionFullName}: body:`);
  console.log(req);

  console.log(req.body.username);
  console.log(req.body.firstName);
  console.log(req.body.email);
  console.log(req.body.securityRole);
  console.log(req.body.password);

  const data = {
    username: req.body.username,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    securityRoleId: req.body.securityRole,
    departmentId: req.body.department,
    password: req.body.password,
  };

  var password;
  var saltSecret;

  return sqlUserModel.findOne({
    where: {
      username: data.username
    },
  })
    .then(user => {
      if (user != null) {
        console.log(`${functionFullName}: username already taken`);
        return {status: 422, error: 'username already taken'};
      } else {
        console.log(`${functionFullName}: user account does not yet exist. Creating...`);
        bcrypt.genSalt(10, (err, salt) => {
          if (err) {
            console.log(`${functionFullName}: Bcrypt salt function error`);
            console.log(err);
            return {status: false, error: err};
          }

          console.log(`${functionFullName}: Bcrypt salt function success: ${salt}`);
          bcrypt.hash(data.password, salt, (err, hash) => {
            if (err) {
              console.log(`${functionFullName}: Bcrypt hash function error`);
              console.log(err);
              return {status: false, error: err};
            }

            console.log(`${functionFullName}: Bcrypt hash function success: ${hash}`);
            password = hash;
            saltSecret = salt;
            //next();
            sqlUserModel.create({
              username: data.username,
              firstName: data.firstName,
              lastName: data.lastName,
              email: data.email,
              securityRoleId: data.securityRoleId,
              departmentId: data.departmentId,
              password: password,
              saltSecret: saltSecret,
              points: 0
            })
              .then((user) => {
                console.log(`${functionFullName}: user created in db`);

                ctrlAchievement.initializeUserAchievementProgress(user.id);
                // If the user is a manager, initialize their points pool
                if (user.securityRoleId === 2) {
                  console.log(`${functionFullName}: initializing manager point pool for new user`);
                  ctrlPointPool.initializePointPool(user.id);
                }

                return {status: 200, message: 'user created'};
              })
              .catch(err => {
                console.log(`${functionFullName}: User creation error`);
                console.log(err);
                return {status: false, message: err}
              });
          })
        })
      }
    })
    .catch(err => {
      console.log(`${functionFullName}: Problem with the database`);
      console.log(err);
      return {status: 500, error: 'Problem with the database: ' + err};
    });
};

module.exports.registerUser = registerUser;*/


const registerUser = function (req) {
  const functionName = 'registerUser';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  console.log(`${functionFullName}: body:`);
  console.log(req.body);

  console.log(req.body.username);
  console.log(req.body.firstName);
  console.log(req.body.email);
  console.log(req.body.securityRoleId);
  console.log(req.body.password);

  const data = {
    username: req.body.username,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    securityRoleId: req.body.securityRoleId,
    departmentId: req.body.departmentId,
    password: req.body.password,
  };

  var password;
  var saltSecret;

  return sqlUserModel.findOne({
    where: {
      username: data.username
    },
  })
    .then(user => {
      if (user != null) {
        console.log(`${functionFullName}: username already taken`);
        return {status: false, error: 'username already taken'};
      } else {
        console.log(`${functionFullName}: user account does not yet exist. Creating...`);

        return sqlUserModel.create({
          username: data.username,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          securityRoleId: data.securityRoleId,
          departmentId: data.departmentId,
          password: password,
          saltSecret: saltSecret,
          points: 0
        })
          .then((user) => {
            console.log(`${functionFullName}: user created in db`);

            ctrlAchievement.initializeUserAchievementProgress(user.id);
            // If the user is a manager, initialize their points pool
            if (user.securityRoleId === 2) {
              console.log(`${functionFullName}: initializing manager point pool for new user`);
              ctrlPointPool.initializePointPool(user.id);
            }

            return {status: true, message: 'user created'};
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
};



const getUserProfile = function (username) {
  const functionName = 'getUserProfile';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  console.log(`username: ${username}`);
  // console.log(req.headers.authorization);

  return sqlUserModel.findOne({
    attributes: ['id','username','firstName','lastName','points','email', 'securityRoleId','departmentId'],
    where: {
      username: username,
    },
  })
    .then(user => {
      if (!user)
        return { status: 404, message: 'User record not found.' };
      else
        return  {status: 200, user: user};
    });
};

module.exports.getUserProfile = getUserProfile;

module.exports.setUserProfile = (req, res, next) => {
  console.log('setUserProfile');
}


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
    .then(points => {
      if(!points) {
        return {status: 404, message: 'getUserPoints: Something went wrong.' };
      } else {
        return {status: 200, points: points};
      }
    })
    .catch(err => {
      console.log(`${functionFullName}: Problem with the database`);
      console.log(err);
      return {status: 500, error: 'getUserPoints: Problem with the database: ' + err};
    });
};

module.exports.getUserPoints = getUserPoints;

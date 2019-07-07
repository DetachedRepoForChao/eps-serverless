/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/

const AWS = require('aws-sdk');
var express = require('express');
var bodyParser = require('body-parser');
var awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');

// declare a new express app
var app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

// Enable CORS for all methods
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next()
});

// const SqlModel = require('./db');
// const Models = SqlModel();
const ctrlDepartment = require('./controllers/department.controller');
const ctrlSecurityRole = require('./controllers/securityrole.controller');
const ctrlUser = require('./controllers/user.controller');
const jwtVerify = require('./config/decode-verify-jwt');
/**********************
 * Example get method *
 **********************/

/*
app.get('/items', function(req, res) {
  // Add your code here
  res.json({success: 'get call succeed!', url: req.url});
});
*/

// User Routes
app.post('/items/registerUser', function(req, res) {
  console.log('starting post registerUser');

  ctrlUser.registerUser(req)
    .then(result => {
      res.json({status: 'post call succeed!', data: result});
    })
    .catch(err => {
      res.json({status: 'post call failed!', error: err});
    });
});

app.post('/items/authenticateUser', function(req, res) {
  console.log('starting post authenticateUser');
});

app.get('/items/userProfile', function(req, res) {
  console.log('starting get userProfile');
  const token = req.headers.authorization;
  jwtVerify.parseToken(token, function(tokenResult) {
    if(tokenResult.message === 'Success') {
      ctrlUser.getUserProfile(tokenResult.claims['cognito:username'])
        .then(result => {
          res.json({status: 'post call succeed!', data: result});
        })
        .catch(err => {
          res.json({status: 'post call failed!', error: err});
        });
    } else {
      res.json({status: 'Unauthorized', data: tokenResult.message});
    }
  });
});

app.get('/items/getUserPoints', function(req, res) {
  console.log('starting get getUserPoints');
});

app.put('/items/userProfile', function(req, res) {
  console.log('starting put userProfile');
});

// Department Routes
app.get('/items/getDepartments', function(req, res) {
  // Add your code here
  console.log('starting get getDepartments');
  ctrlDepartment.getDepartments()
    .then(departments => {
      res.json({status: 'get call succeed!', data: departments.departments});
    })
    .catch(err => {
      res.json({status: 'get call failed!', error: err});
    });
});

app.post('/items/getDepartments', function(req, res) {
  console.log('starting post getDepartments');
});

app.post('/items/getEmployeesByDepartmentId', function(req, res) {
  console.log('starting post getEmployeesByDepartmentId');
});

// Security Role Routes

app.get('/items/getSecurityRoles', function(req, res) {
  // Add your code here
  console.log('starting getSecurityRoles');
  ctrlSecurityRole.getSecurityRoles()
    .then(securityRoles => {
      res.json({status: 'get call succeed!', data: securityRoles.securityRoles});
    })
    .catch(err => {
      res.json({status: 'get call failed!', error: err});
    });
});

app.post('/items/getSecurityRoles', function(req, res) {
  console.log('starting post getSecurityRoles');
});

// Achievement Routes

app.post('/items/achievement', function(req, res) {
  console.log('starting post achievement');
});

app.post('/items/userAchievementProgressByUserId', function(req, res) {
  console.log('starting post userAchievementProgressByUserId');
});

app.post('/items/incrementAchievement/:achievementName', function(req, res) {
  console.log('starting post incrementAchievement');
});

// Point Routes

app.get('/items/getPointItems', function(req, res) {
  console.log('starting get getPointItems');
});

app.post('/items/giftPointsToEmployee', function(req, res) {
  console.log('starting post giftPointsToEmployee');
});

// Point Pool Routes

app.post('/items/getRemainingPointPool', function(req, res) {
  console.log('starting post getRemainingPointPool');
});

// Like Routes

app.post('/items/likeManage', function(req, res) {
  console.log('starting post likeManage');
});

// Avatar Routes

app.post('/items/getUserAvatar', function(req, res) {
  console.log('starting post getUserAvatar');
});

app.post('/items/setUserAvatar', function(req, res) {
  console.log('starting post setUserAvatar');
});

app.get('/items/getAvatars', function(req, res) {
  console.log('starting get getAvatars');
});

// Leaderboard Routes

app.get('/items/getPointsLeaderboard', function(req, res) {
  console.log('starting get getPointsLeaderboard');
});

/*// Point Transaction Routes
app.get('/items/getPointTransaction', function(req, res) {
  console.log('starting post getPointTransaction');
});*/

app.get('/items/*', function(req, res) {
  // Add your code here
  res.json({success: 'get call succeed!', url: req.url});
});

/****************************
* Example post method *
****************************/

app.post('/items', function(req, res) {
  console.log('starting registerUser');
  console.log(req.body);
  // console.log(req);
/*  ctrlUser.registerUser(req, Models)
    .then(result => {
      res.json({status: 'post call succeed!', data: result});
    })
    .catch(err => {
      res.json({status: 'post call failed!', error: err});
    });*/
});

app.post('/items/*', function(req, res) {
  // Add your code here
  res.json({success: 'post call succeed!', url: req.url, body: req.body})
});

/****************************
* Example post method *
****************************/

app.put('/items', function(req, res) {
  // Add your code here
  res.json({success: 'put call succeed!', url: req.url, body: req.body})
});

app.put('/items/*', function(req, res) {
  // Add your code here
  res.json({success: 'put call succeed!', url: req.url, body: req.body})
});

/****************************
* Example delete method *
****************************/

app.delete('/items', function(req, res) {
  // Add your code here
  res.json({success: 'delete call succeed!', url: req.url});
});

app.delete('/items/*', function(req, res) {
  // Add your code here
  res.json({success: 'delete call succeed!', url: req.url});
});

app.listen(3000, function() {
    console.log("App started")
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app

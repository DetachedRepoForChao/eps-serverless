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
const ctrlAchievement = require('./controllers/achievement.controller');
const ctrlNamedAchievement = require('./controllers/named_achievement.controller');
const ctrlPoints = require('./controllers/points.controller');
const ctrlPointPool = require('./controllers/point_pool.controller');
const ctrLike = require('./controllers/like.controller');
const ctrlPointsTransaction = require('./controllers/point_transaction.controller');
const jwtHelper = require('./config/jwtHelper');
const ctrlSession = require('./controllers/session.controller');
const ctrlAvatar = require('./controllers/avatar.controller');
const ctrlLeaderboard = require('./controllers/leaderboard.controller');

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
    .then(data => {
      res.json({status: 'post call succeed!', data: data});
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
      const username = tokenResult.claims['cognito:username'];
      ctrlUser.getUserProfile(username)
        .then(data => {
          res.json({status: 'post call succeed!', data: data.user});
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

  const token = req.headers.authorization;
  jwtVerify.parseToken(token, function(tokenResult) {
    if(tokenResult.message === 'Success') {
      const username = tokenResult.claims['cognito:username'];
      ctrlUser.getUserPoints(username)
        .then(data => {
          res.json({status: 'post call succeed!', data: data.points});
        })
        .catch(err => {
          res.json({status: 'post call failed!', error: err});
        });
    } else {
      res.json({status: 'Unauthorized', data: tokenResult.message});
    }
  });
});

app.put('/items/userProfile', function(req, res) {
  console.log('starting put userProfile');
});

// Department Routes
app.get('/items/getDepartments', function(req, res) {
  // Add your code here
  console.log('starting get getDepartments');
  ctrlDepartment.getDepartments()
    .then(data => {
      res.json({status: 'get call succeed!', data: data.departments});
    })
    .catch(err => {
      res.json({status: 'get call failed!', error: err});
    });
});

app.post('/items/getDepartments', function(req, res) {
  console.log('starting post getDepartments');
  ctrlDepartment.getDepartmentById(req)
    .then(data => {
      res.json({status: 'get call succeed!', data: data.department});
    })
    .catch(err => {
      res.json({status: 'get call failed!', error: err});
    });
});

app.post('/items/getEmployeesByDepartmentId', function(req, res) {
  console.log('starting post getEmployeesByDepartmentId');

  const token = req.headers.authorization;
  jwtVerify.parseToken(token, function(tokenResult) {
    if(tokenResult.message === 'Success') {
      const departmentId = req.body.departmentId;
      ctrlDepartment.getEmployeesByDepartmentId(departmentId)
        .then(data => {
          res.json({status: 'post call succeed!', data: data.users});
        })
        .catch(err => {
          res.json({status: 'post call failed!', error: err});
        });
    } else {
      res.json({status: 'Unauthorized', data: tokenResult.message});
    }
  });
});

// Security Role Routes
app.get('/items/getSecurityRoles', function(req, res) {
  // Add your code here
  console.log('starting getSecurityRoles');
  ctrlSecurityRole.getSecurityRoles()
    .then(data => {
      res.json({status: 'get call succeed!', data: data.securityRoles});
    })
    .catch(err => {
      res.json({status: 'get call failed!', error: err});
    });
});

app.post('/items/getSecurityRoles', function(req, res) {
  console.log('starting post getSecurityRoles');
  ctrlSecurityRole.getSecurityRoleById(req)
    .then(data => {
      res.json({status: 'get call succeed!', data: data.securityRole});
    })
    .catch(err => {
      res.json({status: 'get call failed!', error: err});
    });
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

  const token = req.headers.authorization;
  jwtVerify.parseToken(token, function(tokenResult) {
    if(tokenResult.message === 'Success') {
      ctrlPoints.getPointItems()
        .then(data => {
          res.json({status: 'post call succeed!', data: data.pointItems});
        })
        .catch(err => {
          res.json({status: 'post call failed!', error: err});
        });
    } else {
      res.json({status: 'Unauthorized', data: tokenResult.message});
    }
  });
});

app.post('/items/giftPointsToEmployee', function(req, res) {
  console.log('starting post giftPointsToEmployee');

  //const sourceUserId = req.body.userId;
  //sourceUserId, targetUserId, pointItemId, description

  const token = req.headers.authorization;

  jwtVerify.parseToken(token, function(tokenResult) {
    if(tokenResult.message === 'Success') {
      // const username = tokenResult.claims['cognito:username'];
      const sourceUserId = req.body.sourceUserId;
      const targetUserId = req.body.targetUserId;
      const pointItemId = req.body.pointItemId;
      const description = req.body.description;
      ctrlPoints.giftPointsToEmployee(sourceUserId, targetUserId, pointItemId, description)
        .then(data => {
          res.json({status: 'post call succeed!', data: data});
        })
        .catch(err => {
          res.json({status: 'post call failed!', error: err});
        });
    } else {
      res.json({status: 'Unauthorized', data: tokenResult.message});
    }
  });

});

// Point Pool Routes
app.get('/items/getRemainingPointPool', function(req, res) {
  console.log('starting post getRemainingPointPool');

  const token = req.headers.authorization;
  jwtVerify.parseToken(token, function(tokenResult) {
    if(tokenResult.message === 'Success') {
      const username = tokenResult.claims['cognito:username'];
      ctrlUser.getUserProfile(username)
        .then(result => {
          const managerId = result.user.id;
          ctrlPointPool.getRemainingPointPool(managerId)
            .then(data => {
              res.json({status: 'post call succeed!', data: data.pointsRemaining});
            })
            .catch(err => {
              res.json({status: 'post call failed!', error: err});
            });
        });
    } else {
      res.json({status: 'Unauthorized', data: tokenResult.message});
    }
  });
});

// Like Routes
app.post('/items/likeManage', function(req, res) {
  console.log('starting post likeManage');
});

// Avatar Routes
app.post('/items/getUserAvatar', function(req, res) {
  console.log('starting post getUserAvatar');

  const userId = req.body.userId;
  const token = req.headers.authorization;
  jwtVerify.parseToken(token, function(tokenResult) {
    if(tokenResult.message === 'Success') {
      // const username = tokenResult.claims['cognito:username'];
      ctrlAvatar.getUserAvatar(userId)
        .then(data => {
          res.json({status: 'post call succeed!', data: data.avatarUrl});
        })
        .catch(err => {
          res.json({status: 'post call failed!', error: err});
        });
    } else {
      res.json({status: 'Unauthorized', data: tokenResult.message});
    }
  });
});

app.post('/items/setUserAvatar', function(req, res) {
  console.log('starting post setUserAvatar');

  const avatarUrl = req.body.avatarUrl;
  const token = req.headers.authorization;
  jwtVerify.parseToken(token, function(tokenResult) {
    if(tokenResult.message === 'Success') {
      const username = tokenResult.claims['cognito:username'];
      ctrlAvatar.setUserAvatar(username, avatarUrl)
        .then(data => {
          res.json({status: 'post call succeed!', data: data.points});
        })
        .catch(err => {
          res.json({status: 'post call failed!', error: err});
        });
    } else {
      res.json({status: 'Unauthorized', data: tokenResult.message});
    }
  });
});

app.get('/items/getAvatars', function(req, res) {
  console.log('starting get getAvatars');

  const token = req.headers.authorization;
  jwtVerify.parseToken(token, function(tokenResult) {
    if(tokenResult.message === 'Success') {
      ctrlAvatar.getAvatars(function(data) {
        const avatarList = data.avatarList;
        // console.log('data');
        // console.log(data);
        // console.log('avatarList');
        // console.log(avatarList);
        if(!avatarList) {
          res.json({status: 'post call failed!', error: 'Failed to retrieve list of avatars'});
        } else {
          res.json({status: 'post call succeed!', data: avatarList});
        }
      });


/*      ctrlAvatar.getAvatars()
        .then(data => {
          res.json({status: 'post call succeed!', data: data.avatarList});
        })
        .catch(err => {
          res.json({status: 'post call failed!', error: err});
        });*/
    } else {
      res.json({status: 'Unauthorized', data: tokenResult.message});
    }
  });
});

// Leaderboard Routes
app.get('/items/getPointsLeaderboard', function(req, res) {
  console.log('starting get getPointsLeaderboard');

  const token = req.headers.authorization;
  jwtVerify.parseToken(token, function(tokenResult) {
    if(tokenResult.message === 'Success') {
      // const username = tokenResult.claims['cognito:username'];
      ctrlLeaderboard.getPointsLeaderboard()
        .then(data => {
          res.json({status: 'post call succeed!', data: data.result});
        })
        .catch(err => {
          res.json({status: 'post call failed!', error: err});
        });
    } else {
      res.json({status: 'Unauthorized', data: tokenResult.message});
    }
  });
});

// Point Transaction Routes
app.get('/items/getPointTransaction', function(req, res) {
  console.log('starting post getPointTransaction');

  const token = req.headers.authorization;
  jwtVerify.parseToken(token, function(tokenResult) {
    if(tokenResult.message === 'Success') {
      ctrlPointsTransaction.getPointTransaction()
        .then(data => {
          res.json({status: 'post call succeed!', data: data.pointTransactions});
        })
        .catch(err => {
          res.json({status: 'post call failed!', error: err});
        });
    } else {
      res.json({status: 'Unauthorized', data: tokenResult.message});
    }
  });

});

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

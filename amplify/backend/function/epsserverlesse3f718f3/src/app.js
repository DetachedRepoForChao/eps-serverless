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
const ctrlAchievementLogic = require('./controllers/achievement_logic.controller');
const ctrlPoints = require('./controllers/points.controller');
const ctrlPointPool = require('./controllers/point_pool.controller');
const ctrLike = require('./controllers/like.controller');
const ctrlPointsTransaction = require('./controllers/point_transaction.controller');
const ctrlSession = require('./controllers/session.controller');
const ctrlAvatar = require('./controllers/avatar.controller');
const ctrlLeaderboard = require('./controllers/leaderboard.controller');
const ctrlStoreItem = require('./controllers/store_item.controller');
const ctrlNotifications = require('./controllers/notification.controller');
const ctrlFeature = require('./controllers/feature.controller');

const jwtVerify = require('./config/decode-verify-jwt');
const componentName = 'app';
/**********************
 * Example get method *
 **********************/

/*
app.get('/items', function(req, res) {
  // Add your code here
  res.json({success: 'get call succeed!', url: req.url});
});f
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

app.post('/items/adminRegisterUser', function(req, res) {
  console.log('starting post adminRegisterUser');

  const token = req.headers.authorization;
  jwtVerify.parseToken(token, function(tokenResult) {
    if(tokenResult.message === 'Success') {
      const user = req.body.user;
      ctrlUser.adminRegisterUser(user)
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

/*app.post('/items/authenticateUser', function(req, res) {
  console.log('starting post authenticateUser');
});*/

app.get('/items/userProfile', function(req, res) {
  console.log('starting get userProfile');
  const token = req.headers.authorization;
  jwtVerify.parseToken(token, function(tokenResult) {
    if(tokenResult.message === 'Success') {
      const username = tokenResult.claims['cognito:username'];
      ctrlUser.getUserProfile(username)
        .then(data => {
          res.json({status: 'get call succeed!', data: data.user});
        })
        .catch(err => {
          res.json({status: 'get call failed!', error: err});
        });
    } else {
      res.json({status: 'Unauthorized', data: tokenResult.message});
    }
  });
});

app.get('/items/userProfile2', function(req, res) {
  console.log('starting get userProfile');
  const token = req.headers.authorization;
  jwtVerify.parseToken(token, function(tokenResult) {
    if(tokenResult.message === 'Success') {
      const username = tokenResult.claims['cognito:username'];
      ctrlUser.getUserProfile2(username)
        .then(data => {
          res.json({status: 'get call succeed!', data: data.user});
        })
        .catch(err => {
          res.json({status: 'get call failed!', error: err});
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

app.get('/items/usersPublicDetails', function(req, res) {
  console.log('starting get usersPublicDetails');
  const token = req.headers.authorization;
  jwtVerify.parseToken(token, function(tokenResult) {
    if(tokenResult.message === 'Success') {
      ctrlUser.getUsersPublicDetails()
        .then(data => {
          res.json({status: 'get call succeed!', data: data.users});
        })
        .catch(err => {
          res.json({status: 'get call failed!', error: err});
        });
    } else {
      res.json({status: 'Unauthorized', data: tokenResult.message});
    }
  });
});

app.get('/items/usersPublicDetails2', function(req, res) {
  console.log('starting get usersPublicDetails2');
  const token = req.headers.authorization;
  jwtVerify.parseToken(token, function(tokenResult) {
    if(tokenResult.message === 'Success') {
      const promises = [];
      promises.push(ctrlUser.getUsersPublicDetails());
      promises.push(ctrlAchievement.getUsersCompleteAchievementTotal());
      Promise.all(promises)
        .then(data => {
          res.json({status: 'get call succeed!', data: data});
        })
        .catch(err => {
          res.json({status: 'get call failed!', error: err});
        });
    } else {
      res.json({status: 'Unauthorized', data: tokenResult.message});
    }
  });
});

app.get('/items/adminUsersDetails', function(req, res) {
  console.log('starting get adminUsersDetails');
  const token = req.headers.authorization;
  jwtVerify.parseToken(token, function(tokenResult) {
    if(tokenResult.message === 'Success') {
      const promises = [];
      promises.push(ctrlUser.adminGetUsersDetails());
      promises.push(ctrlAchievement.getUsersCompleteAchievementTotal());
      Promise.all(promises)
        .then(data => {
          res.json({status: 'get call succeed!', data: data});
        })
        .catch(err => {
          res.json({status: 'get call failed!', error: err});
        });
    } else {
      res.json({status: 'Unauthorized', data: tokenResult.message});
    }
  });
});

/*
app.get('/items/usersPublicDetails3', function(req, res) {
  console.log('starting get usersPublicDetails3');
  const promises = [];
  // promises.push(ctrlUser.getUsersPublicDetails());
  promises.push(ctrlAchievement.getUsersCompleteAchievementTotal());
  Promise.all(promises)
    .then(data => {
      res.json({status: 'get call succeed!', data: data});
    })
    .catch(err => {
      res.json({status: 'get call failed!', error: err});
    });
});
*/

app.post('/items/modifyUser', function(req, res) {
  console.log('starting post modifyUser');
  const token = req.headers.authorization;
  jwtVerify.parseToken(token, function(tokenResult) {
    if(tokenResult.message === 'Success') {
      const user = req.body.user;
      ctrlUser.modifyUser(user)
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

app.post('/items/terminateUser', function(req, res) {
  console.log('starting post terminateUser');
  const token = req.headers.authorization;
  jwtVerify.parseToken(token, function(tokenResult) {
    if(tokenResult.message === 'Success') {
      const user = req.body.user;
      ctrlUser.terminateUser(user)
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

app.post('/items/reinstateUser', function(req, res) {
  console.log('starting post reinstateUser');
  const token = req.headers.authorization;
  jwtVerify.parseToken(token, function(tokenResult) {
    if(tokenResult.message === 'Success') {
      const user = req.body.user;
      ctrlUser.reinstateUser(user)
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

app.post('/items/deleteUser', function(req, res) {
  console.log('starting post deleteUser');
  const token = req.headers.authorization;
  jwtVerify.parseToken(token, function(tokenResult) {
    if(tokenResult.message === 'Success') {
      const user = req.body.user;
      ctrlUser.deleteUser(user)
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

// Department Routes
app.get('/items/departments', function(req, res) {
  const functionName = 'get departments';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  const token = req.headers.authorization;
  jwtVerify.parseToken(token, function(tokenResult) {
    if(tokenResult.message === 'Success') {
      ctrlDepartment.getDepartments()
        .then(data => {
          res.json({status: 'get call succeed!', data: data.departments});
        })
        .catch(err => {
          res.json({status: 'get call failed!', error: err});
        });
    } else {
      res.json({status: 'Unauthorized', data: tokenResult.message});
    }
  });
});

app.post('/items/addDepartments',function(req,res){
    console.log('starting post Departments');
    const token = req.headers.authorization;
    jwtVerify.parseToken(token, function(tokenResult) {
          if(tokenResult.message === 'Success') {
            const department = req.body.department;
            ctrlDepartment.addDepartment(department)
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
})

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
      res.json({status: 'get call succeed!', data: data.departments});
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

app.post('/items/deleteDepartment', function(req, res) {
  console.log('starting post deleteDepartment');
  const token = req.headers.authorization;
  jwtVerify.parseToken(token, function(tokenResult) {
    if(tokenResult.message === 'Success') {
      const department = req.body.department;
      ctrlDepartment.deleteDepartment(department)
        .then(data => {
          res.json({status: 'post call succeed!', data: data.department});
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

// Feature routes
app.get('/items/features', function(req, res) {
  const functionName = 'get features';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  const token = req.headers.authorization;
  jwtVerify.parseToken(token, function(tokenResult) {
    if(tokenResult.message === 'Success') {
      ctrlFeature.getFeatures()
        .then(data => {
          res.json({status: 'get call succeed!', data: data.features});
        })
        .catch(err => {
          res.json({status: 'get call failed!', error: err});
        });
    } else {
      res.json({status: 'Unauthorized', data: tokenResult.message});
    }
  });
});

// Achievement Routes
app.post('/items/achievement', function(req, res) {
  console.log('starting post achievement');
});

app.post('/items/userAchievementProgressByUserId', function(req, res) {
  console.log('starting post userAchievementProgressByUserId');
});

app.get('/items/currentUserAchievements', function(req, res) {
  const functionName = 'get currentUserAchievements';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  const token = req.headers.authorization;
  jwtVerify.parseToken(token, function(tokenResult) {

    // console.log("tokenResult"+tokenResult.claims)


    if(tokenResult.message === 'Success') {
      const username = tokenResult.claims['cognito:username'];
      // const username = req.body.username;
      ctrlUser.getUserProfile(username)
        .then(result => {
          const user = result.user;
          ctrlAchievement.getUserAchievementsByUserId(user)
            .then(data => {
              res.json({status: 'post call succeed!', data: data.userAchievements});
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

app.get('/items/usersCompleteAchievementTotal', function(req, res) {
  const functionName = 'get usersCompleteAchievementTotal';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  const token = req.headers.authorization;
  jwtVerify.parseToken(token, function(tokenResult) {
    if(tokenResult.message === 'Success') {
      ctrlAchievement.getUserAchievementsByUserId()
        .then(data => {
          res.json({status: 'get call succeed!', data: data.usersCompleteAchievementTotal});
        })
        .catch(err => {
          res.json({status: 'get call failed!', error: err});
        });
    } else {
      res.json({status: 'Unauthorized', data: tokenResult.message});
    }
  });
});

app.get('/items/achievementUnlocksFeature', function(req, res) {
  const functionName = 'get achievementUnlocksFeature';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  const token = req.headers.authorization;
  jwtVerify.parseToken(token, function(tokenResult) {
    if(tokenResult.message === 'Success') {
      ctrlAchievement.getAchievementUnlocksFeature()
        .then(data => {
          res.json({status: 'get call succeed!', data: data.achievementUnlocksFeature});
        })
        .catch(err => {
          res.json({status: 'get call failed!', error: err});
        });
    } else {
      res.json({status: 'Unauthorized', data: tokenResult.message});
    }
  });
});


app.post('/items/acknowledgeAchievementComplete', function(req, res) {
  const functionName = 'post acknowledgeAchievementComplete';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  const token = req.headers.authorization;
  jwtVerify.parseToken(token, function(tokenResult) {

    if(tokenResult.message === 'Success') {
      const username = tokenResult.claims['cognito:username'];

      ctrlUser.getUserProfile(username)
        .then(result => {
          const userId = result.user.id;
          const achievementProgressId = req.body.achievementProgressId;
          ctrlAchievement.acknowledgeAchievementComplete(achievementProgressId, userId)
            .then(data => {
              res.json({status: 'post call succeed!', data: data.message});
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

app.post('/items/resetUserAchievementProgress', function(req, res) {
  const functionName = 'post resetUserAchievementProgress';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  const userId = req.body.userId;
  const secretPassword = req.body.secretPassword;
  if (secretPassword !== '123password#@!') {
    res.json({status: 'Wrong Password'});
  } else {
    ctrlAchievement.resetUserAchievementProgress(userId)
      .then(data => {
        res.json({status: 'post call succeed!', data: data});
      })
      .catch(err => {
        res.json({status: 'post call failed!', error: err});
      });
  }
});

app.post('/items/resetAllUsersAchievements', function(req, res) {
  const functionName = 'post resetAllUsersAchievements';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  const secretPassword = req.body.secretPassword;
  if (secretPassword !== '123password#@!') {
    res.json({status: 'Wrong Password'});
  } else {
    ctrlAchievement.resetAllUsersAchievements()
      .then(data => {
        res.json({status: 'post call succeed!', data: data});
      })
      .catch(err => {
        res.json({status: 'post call failed!', error: err});
      });
  }
});



// Achievement Logic Routes
app.post('/items/incrementAchievement', function(req, res) {
  const functionName = 'post incrementAchievement';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  const token = req.headers.authorization;
  jwtVerify.parseToken(token, function(tokenResult) {

    if(tokenResult.message === 'Success') {
      const username = tokenResult.claims['cognito:username'];

      ctrlUser.getUserProfile(username)
        .then(result => {
          const userId = result.user.id;
          const achievementFamily = req.body.achievementFamily;
          ctrlAchievementLogic.incrementAchievement(achievementFamily, userId)
            .then(data => {
              res.json({status: 'post call succeed!', data: data});
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

app.post('/items/incrementAchievementByX', function(req, res) {
  const functionName = 'post incrementAchievementByX';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  const token = req.headers.authorization;
  jwtVerify.parseToken(token, function(tokenResult) {

    if(tokenResult.message === 'Success') {
      const username = tokenResult.claims['cognito:username'];

      ctrlUser.getUserProfile(username)
        .then(result => {
          const userId = result.user.id;
          const achievementFamily = req.body.achievementFamily;
          const incrementAmount = req.body.incrementAmount;
          ctrlAchievementLogic.incrementAchievementByX(achievementFamily, userId, incrementAmount)
            .then(data => {
              res.json({status: 'post call succeed!', data: data});
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

app.post('/items/giftPointsToEmployees', function(req, res) {
  console.log('starting post giftPointsToEmployees');

  //const sourceUserId = req.body.userId;
  //sourceUserId, targetUserId, pointItemId, description

  const token = req.headers.authorization;

  jwtVerify.parseToken(token, function(tokenResult) {
    if(tokenResult.message === 'Success') {
      const username = tokenResult.claims['cognito:username'];
      ctrlUser.getUserProfile(username)
        .then(result => {
          const sourceUser = result.user;
          const userPointObjectArray = req.body.userPointObjectArray;
          const pointItem = {
            id: userPointObjectArray[0].pointItemId,
            name: userPointObjectArray[0].pointItemName,
            points: userPointObjectArray[0].amount,
            description: userPointObjectArray[0].description,
            coreValues: userPointObjectArray[0].coreValues,
          };

          ctrlPoints.giftPointsToEmployees(sourceUser, userPointObjectArray)
            .then(data => {
              // If points were added successfully, send user an email notification
              const emailPromises = [];
              for (let i = 0; i < data.resultObjectArray.length; i++) {
                if (data.resultObjectArray[i].status === true) {
                  // emailPromises.push(ctrlNotifications.sendAwardPointsEmail(data.resultObjectArray[i].targetUserId, sourceUser, pointItem));
                  // emailPromises.push(ctrlNotifications.sendNotificationEmail(data.resultObjectArray[i].targetUserId, sourceUser));
                }
              }

              Promise.all(emailPromises)
                .then(emailResults => {
                  console.log('email results:');
                  for (let i = 0; i < emailResults.length; i++) {
                    console.log(emailResults[i]);
                  }

                  res.json({status: 'post call succeed!', data: data});
                })
                .catch(err => {
                  console.log('Promise.all error');
                  console.log(err);
                  res.json({status: 'post call failed!', error: err});
                });
            })
            .catch(err => {
              console.log('giftPointsToEmployees error');
              console.log(err);
              res.json({status: 'post call failed!', error: err});
            });
        });
    } else {
      res.json({status: 'Unauthorized', data: tokenResult.message});
    }
  });
});

app.post('/items/newPointItem', function(req, res) {
  console.log('starting post newPointItem');

  const token = req.headers.authorization;
  jwtVerify.parseToken(token, function(tokenResult) {
    if(tokenResult.message === 'Success') {
      const pointItem = req.body.pointItem;
      ctrlPoints.newPointItem(pointItem)
        .then(data => {
          res.json({status: 'post call succeed!', data: data.pointItem});
        })
        .catch(err => {
          res.json({status: 'post call failed!', error: err});
        });
    } else {
      res.json({status: 'Unauthorized', data: tokenResult.message});
    }
  });
});

app.post('/items/modifyPointItem', function(req, res) {
  console.log('starting post modifyPointItem');

  const token = req.headers.authorization;
  jwtVerify.parseToken(token, function(tokenResult) {
    if(tokenResult.message === 'Success') {
      const pointItem = req.body.pointItem;
      ctrlPoints.modifyPointItem(pointItem)
        .then(data => {
          res.json({status: 'post call succeed!', data: data.pointItem});
        })
        .catch(err => {
          res.json({status: 'post call failed!', error: err});
        });
    } else {
      res.json({status: 'Unauthorized', data: tokenResult.message});
    }
  });
});

app.post('/items/deletePointItem', function(req, res) {
  console.log('starting post deletePointItem');

  const token = req.headers.authorization;
  jwtVerify.parseToken(token, function(tokenResult) {
    if(tokenResult.message === 'Success') {
      const pointItem = req.body.pointItem;
      ctrlPoints.deletePointItem(pointItem)
        .then(data => {
          res.json({status: 'post call succeed!', data: data.pointItem});
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
app.post('/items/addLike', function(req, res) {
  console.log('starting post addLike');

  // const likingUsername = req.body.likingUsername;
  const postId = req.body.postId;
  const targetUserId = req.body.targetUserId;
  const token = req.headers.authorization;
  jwtVerify.parseToken(token, function(tokenResult) {
    if(tokenResult.message === 'Success') {
      const username = tokenResult.claims['cognito:username'];
      ctrLike.addLike(username, targetUserId, postId)
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

app.post('/items/removeLike', function(req, res) {
  console.log('starting post removeLike');

  // const likingUsername = req.body.likingUsername;
  const postId = req.body.postId;
  const token = req.headers.authorization;

  jwtVerify.parseToken(token, function(tokenResult) {
    if(tokenResult.message === 'Success') {
      const username = tokenResult.claims['cognito:username'];
      ctrLike.removeLike(username, postId)
        .then(data => {
          res.json({status: 'post call succeed!', data: data.message});
        })
        .catch(err => {
          res.json({status: 'post call failed!', error: err});
        });
    } else {
      res.json({status: 'Unauthorized', data: tokenResult.message});
    }
  });
});

app.post('/items/getLikesByPostIds', function(req, res) {
  console.log('starting post getLikesByPostIds');

  const postIds = req.body.postIds;

  ctrLike.getLikesByPostIds(postIds)
    .then(data => {
      res.json({status: 'post call succeed!', data: data.likes});
    })
    .catch(err => {
      res.json({status: 'post call failed!', error: err});
    });
});

// Avatar Routes
app.get('/items/getCurrentUser', function(req, res) {
  console.log('starting post getCurrentUser');

  // const userId = req.body.userId;
  const token = req.headers.authorization;
  jwtVerify.parseToken(token, function(tokenResult) {
    if(tokenResult.message === 'Success') {
      const username = tokenResult.claims['cognito:username'];
      // const username = req.body.username;
      ctrlAvatar.getUserAvatar(username)
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

app.post('/items/getAvatar', function(req, res) {
  console.log('starting post getAvatar');

  const token = req.headers.authorization;
  const username = req.body.username;
  jwtVerify.parseToken(token, function(tokenResult) {
    if(tokenResult.message === 'Success') {
      ctrlAvatar.getUserAvatar(username)
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

app.get('/items/getUserAvatars', function(req, res) {
  console.log('starting get getUserAvatars');

  const token = req.headers.authorization;
  jwtVerify.parseToken(token, function(tokenResult) {
    if(tokenResult.message === 'Success') {
      ctrlAvatar.getUserAvatars()
        .then(data => {
          res.json({status: 'post call succeed!', data: data.avatarsResult});
        })
        .catch(err => {
          res.json({status: 'post call failed!', error: err});
        });
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

app.get('/items/getPointTransaction2', function(req, res) {
  console.log('starting post getPointTransaction2');

  ctrlPointsTransaction.getPointTransaction()
    .then(data => {
      res.json({status: 'post call succeed!', data: data.pointTransactions});
    })
    .catch(err => {
      res.json({status: 'post call failed!', error: err});
    });
});

// Store Item Routes
app.get('/items/getStoreItems', function(req, res) {
  console.log('starting get getStoreItems');

  const token = req.headers.authorization;
  jwtVerify.parseToken(token, function(tokenResult) {
    if(tokenResult.message === 'Success') {
      ctrlStoreItem.getStoreItems()
        .then(data => {
          res.json({status: 'post call succeed!', data: data.storeItems});
        })
        .catch(err => {
          res.json({status: 'post call failed!', error: err});
        });
    } else {
      res.json({status: 'Unauthorized', data: tokenResult.message});
    }
  });
});

app.post('/items/newStoreItem', function(req, res) {
  console.log('starting post newStoreItem');

  const token = req.headers.authorization;
  jwtVerify.parseToken(token, function(tokenResult) {
    if(tokenResult.message === 'Success') {
      const storeItem = req.body.storeItem;
      ctrlStoreItem.newStoreItem(storeItem)
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

app.post('/items/modifyStoreItem', function(req, res) {
  console.log('starting post modifyStoreItem');

  const token = req.headers.authorization;
  jwtVerify.parseToken(token, function(tokenResult) {
    if(tokenResult.message === 'Success') {
      const storeItem = req.body.storeItem;
      ctrlStoreItem.modifyStoreItem(storeItem)
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

app.post('/items/deleteStoreItem', function(req, res) {
  console.log('starting post deleteStoreItem');

  const token = req.headers.authorization;
  jwtVerify.parseToken(token, function(tokenResult) {
    if(tokenResult.message === 'Success') {
      const storeItem = req.body.storeItem;
      ctrlStoreItem.deleteStoreItem(storeItem)
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

app.get('/items/getUserHasStoreItemRecords', function(req, res) {
  console.log('starting get getUserHasStoreItemRecords');

  const token = req.headers.authorization;
  jwtVerify.parseToken(token, function(tokenResult) {
    if(tokenResult.message === 'Success') {
      const username = tokenResult.claims['cognito:username'];
      ctrlUser.getUserProfile(username)
        .then(userResult => {
          const requestUser = userResult.user;
          ctrlStoreItem.getUserHasStoreItemRecords(requestUser)
            .then(data => {
              res.json({status: 'get call succeed!', data: data.userHasStoreItemRecords});
            })
            .catch(err => {
              res.json({status: 'get call failed!', error: err});
            });
        });
    } else {
      res.json({status: 'Unauthorized', data: tokenResult.message});
    }
  });
});

app.get('/items/getUserHasStoreItemManagerRecords', function(req, res) {
  console.log('starting get getUserHasStoreItemManagerRecords');

  const token = req.headers.authorization;
  jwtVerify.parseToken(token, function(tokenResult) {
    if(tokenResult.message === 'Success') {
      const username = tokenResult.claims['cognito:username'];
      ctrlUser.getUserProfile(username)
        .then(userResult => {
          const managerUser = userResult.user;
          ctrlStoreItem.getUserHasStoreItemManagerRecords(managerUser)
            .then(data => {
              res.json({status: 'get call succeed!', data: data.userHasStoreItemRecords});
            })
            .catch(err => {
              res.json({status: 'get call failed!', error: err});
            });
        });
    } else {
      res.json({status: 'Unauthorized', data: tokenResult.message});
    }
  });
});

app.post('/items/newUserHasStoreItemRecord', function(req, res) {
  console.log('starting post newUserHasStoreItemRecord');

  const token = req.headers.authorization;
  jwtVerify.parseToken(token, function(tokenResult) {
    if(tokenResult.message === 'Success') {
      const username = tokenResult.claims['cognito:username'];
      ctrlUser.getUserProfile(username)
        .then(userResult => {
          const requestUser = userResult.user;
          const managerId = req.body.managerId;
          const storeItemId = req.body.storeItemId;
          ctrlStoreItem.newUserHasStoreItemRecord(requestUser, managerId, storeItemId)
            .then(data => {
              res.json({status: 'get call succeed!', data: data});
            })
            .catch(err => {
              res.json({status: 'get call failed!', error: err});
            });
        });
    } else {
      res.json({status: 'Unauthorized', data: tokenResult.message});
    }
  });
});

// Notifications Routes
app.get('/items/getNotifications', function(req, res) {
  console.log('starting get getNotifications');

  const token = req.headers.authorization;
  jwtVerify.parseToken(token, function (tokenResult) {
    if (tokenResult.message === 'Success') {
      // const targetUserId = req.body.targetUserId;
      console.log(tokenResult.claims)
      const targetUserId = tokenResult.claims['cognito:username'];
      console.log("cognito:username:" + targetUserId)
      ctrlNotifications.getNotifications(targetUserId)
        .then(data => {
          res.json({ status: 'get call succeed!', data: data.notifications });
        })
        .catch(err => {
          res.json({ status: 'post call failed!', error: err });
        });
    } else {
      res.json({ status: 'Unauthorized', data: tokenResult.message });
    }
  });
});

app.post('/items/setNotificationsToPerson', function (req, res) {
  console.log('starting get setNotificationsToPerson');
  const token = req.headers.authorization;
  jwtVerify.parseToken(token, function (tokenResult) {
    if (tokenResult.message === 'Success') {
      console.log(tokenResult.claims)
      const targetUserId = tokenResult.claims['cognito:username'];
      console.log("cognito:username:" + targetUserId)

      const title = req.body.title;
      const event = req.body.event;
      const sourceUserId = req.body.sourceUserId;
      const description = req.body.description;

      ctrlNotifications.setNotificationsToPerson(targetUserId, title, event, description, event, sourceUserId)
        .then(data => {
          res.json({ status: 'get call succeed!', data: data.notifications });
        })
        .catch(err => {
          res.json({ status: 'post call failed!', error: err });
        });
    } else {
      res.json({ status: 'Unauthorized', data: tokenResult.message });
    }
  });
});

app.post('/items/setNotificationSeenTime', function (req, res) {
  console.log('starting get getNotifications');
  const token = req.headers.authorization;
  jwtVerify.parseToken(token, function (tokenResult) {
    if (tokenResult.message === 'Success') {
      const notificationid = req.body.notificationId;
      ctrlNotifications.setNotifictaionSeenTime(notificationid)
        .then(data => {
          res.json({ status: 'get call succeed!', data: data.notifications });
        })
        .catch(err => {
          res.json({ status: 'post call failed!', error: err });
        });
    } else {
      res.json({ status: 'Unauthorized', data: tokenResult.message });
    }
  });
});

// Email routes
app.post('/items/sendNotificationEmail' , function (req, res) {
  console.log('starting post sendNotificationEmail');
  const token = req.headers.authorization;
  jwtVerify.parseToken(token, function (tokenResult) {
    if (tokenResult.message === 'Success') {
      const targetUserId = req.body.targetUserId;
      const username = tokenResult.claims['cognito:username'];
      ctrlUser.getUserProfile(username)
        .then(sourceUser => {
          console.log(sourceUser.user);
          ctrlNotifications.sendNotificationEmail(targetUserId, sourceUser.user)
            .then(data => {
              res.json({ status: 'post call succeed!', data: data });
            })
            .catch(err => {
              res.json({ status: 'post call failed!', error: err });
            });
        });
    } else {
      res.json({ status: 'Unauthorized', data: tokenResult.message });
    }
  });
});


app.post('/items/sendAwardPointsEmail' , function (req, res) {
  console.log('starting post sendAwardPointsEmail');
  const token = req.headers.authorization;
  jwtVerify.parseToken(token, function (tokenResult) {
    if (tokenResult.message === 'Success') {
      const targetUserId = req.body.targetUserId;
      const pointItem = req.body.pointItem;
      const username = tokenResult.claims['cognito:username'];
      ctrlUser.getUserProfile(username)
        .then(sourceUser => {
          console.log(sourceUser.user);
          ctrlNotifications.sendAwardPointsEmail(targetUserId, sourceUser.user, pointItem)
            .then(data => {
              res.json({ status: 'post call succeed!', data: data });
            })
            .catch(err => {
              res.json({ status: 'post call failed!', error: err });
            });
        });
    } else {
      res.json({ status: 'Unauthorized', data: tokenResult.message });
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
module.exports = app;

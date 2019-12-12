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

const ctrlNotifications = require('./controllers/notification.controller');
const ctrlCognito = require('./controllers/cognito.controller');
const jwtVerify = require('./config/decode-verify-jwt');
const componentName = 'app';

AWS.config.update({
  region: 'us-east-1',
  accessKeyId: 'AKIAZMKSQ5SFC7O3NQUR',
  secretAccessKey: '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'
});

const userPoolId = 'us-east-1_vOg4HSZc8';

app.post('/things/sendAwardPointsNotice' , function (req, res) {
  console.log('starting post sendAwardPointsNotice');
  const token = req.headers.authorization;
  jwtVerify.parseToken(token, function (tokenResult) {
    if (tokenResult.message === 'Success') {

      const sourceUser = req.body.sourceUser;
      const targetUser = req.body.targetUser;
      const pointItem = req.body.pointItem;

      const promises = [];
      const emailConfirmed = targetUser.emailConfirmed;
      const emailNotifications = targetUser.emailNotifications;
      const phoneConfirmed = targetUser.phoneConfirmed;
      const phoneNotifications = targetUser.phoneNotifications;

      if (emailConfirmed && emailNotifications) {
        promises.push(ctrlNotifications.sendAwardPointsEmail(targetUser, sourceUser, pointItem));
      }

      if (phoneConfirmed && phoneNotifications) {
        promises.push(ctrlNotifications.sendAwardPointsSMS(targetUser, sourceUser, pointItem));
      }

      Promise.all(promises)
        .then(results => {
          res.json({ status: 'post call succeed!', results: results });
        })
        .catch(err => {
          res.json({ status: 'post call failed!', error: err });
        });
    } else {
      res.json({ status: 'Unauthorized', data: tokenResult.message });
    }
  });
});


app.post('/things/sendRequestStoreItemNotice' , function (req, res) {
  console.log('starting post sendRequestStoreItemNotice');
  const token = req.headers.authorization;
  jwtVerify.parseToken(token, function (tokenResult) {
    if (tokenResult.message === 'Success') {
      const purchaseRequestManagers = req.body.purchaseRequestManagers;
      const requestUser = req.body.requestUser;
      const storeItem = req.body.storeItem;
      console.log(purchaseRequestManagers);
      const promises = [];
      // Send notice to each manager according to their preference
      for (const purchaseRequestManager of purchaseRequestManagers) {
        const emailConfirmed = purchaseRequestManager.emailConfirmed;
        const phoneConfirmed = purchaseRequestManager.phoneConfirmed;

        if (emailConfirmed) {
          promises.push(ctrlNotifications.sendRequestStoreItemEmail(purchaseRequestManager, requestUser, storeItem));
        }

        if (phoneConfirmed) {
          promises.push(ctrlNotifications.sendRequestStoreItemSMS(purchaseRequestManager, requestUser, storeItem));
        }
      }

      Promise.all(promises)
        .then(results => {
          res.json({ status: 'post call succeed!', results: results });
        })
        .catch(err => {
          res.json({ status: 'post call failed!', error: err });
        });
    } else {
      res.json({ status: 'Unauthorized', data: tokenResult.message });
    }
  });
});


app.post('/things/sendReadyForPickupNotice' , function (req, res) {
  console.log('starting post sendReadyForPickupNotice');
  const token = req.headers.authorization;
  jwtVerify.parseToken(token, function (tokenResult) {
    if (tokenResult.message === 'Success') {
      const requestUser = req.body.requestUser;
      ctrlCognito.getCognitoUser(requestUser.username)
        .then((user) => {
          console.log(user);
            const data = {
              status: true,
              user: user
            };

            const emailConfirmed = (user.UserAttributes.find(x => x.Name === 'email_verified').Value === 'true');
            const phoneConfirmed = (user.UserAttributes.find(x => x.Name === 'phone_number_verified').Value === 'true');
            requestUser['email'] = user.UserAttributes.find(x => x.Name === 'email').Value;
            requestUser['phone'] = user.UserAttributes.find(x => x.Name === 'phone_number').Value;
            const emailNotifications = requestUser.emailNotifications;
            const phoneNotifications = requestUser.phoneNotifications;
            const purchaseRequestManager = req.body.purchaseRequestManager;
            const storeItems = req.body.storeItems;

            const promises = [];

            console.log('emailConfirmed', emailConfirmed);
            console.log('emailNotifications', requestUser.emailNotifications);
            console.log('phoneConfirmed', phoneConfirmed);
            console.log('phoneNotifications', requestUser.phoneNotifications);

            if (emailConfirmed && emailNotifications) {
              promises.push(ctrlNotifications.sendReadyForPickupEmail(purchaseRequestManager, requestUser, storeItems));
            }

            if (phoneConfirmed && phoneNotifications) {
              promises.push(ctrlNotifications.sendReadyForPickupSMS(purchaseRequestManager, requestUser, storeItems));
            }

            Promise.all(promises)
              .then(results => {
                res.json({ status: 'post call succeed!', results: results });
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



app.post('/things/getCognitoUsers', function(req, res) {
  const usernames = req.body.usernames;
  // console.log(req.body);
  // console.log(username);

  const promiseArray = [];
  const resultArray = [];


  for (const username of usernames) {
    const resultObject = {
      username: username,
      data: null
    };

    const params = {
      UserPoolId: userPoolId,
      Username: username
    };

    const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();

    promiseArray.push(
      cognitoidentityserviceprovider.adminGetUser(params, (err, user) => {
        if (err) {
          console.log(err);
          // reject(err)
          const data = {
            status: false,
            error: err
          };

          resultObject.data = data;

          // res.json({success: 'post call failed!', data: data})
        } else {
          // console.log("User", user);
          /*      data.Users.forEach(user => {
                  console.log(user.Attributes);
                });*/
          // resolve(data)
          const data = {
            status: true,
            user: user
          };

          resultObject.data = data;

          // res.json({success: 'post call succeed!', data: data})
        }

        resultArray.push(resultObject);
        console.log('test123');
        // return resultObject;
      })
    );

  }

  Promise.all(promiseArray)
    .then(results => {
      console.log('test');
      // console.log('promise results', results);
      res.json({success: 'post call succeed!', results: resultArray});
    });



  // res.json({success: 'post call succeed!', url: req.url, body: req.body})
});

app.post('/things/getCognitoUser', function(req, res) {
  const username = req.body.username;
  console.log(req.body);
  console.log(username);

  const params = {
    UserPoolId: userPoolId,
    Username: username
  };

  const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();

  cognitoidentityserviceprovider.adminGetUser(params, (err, user) => {
    if (err) {
      console.log(err);
      // reject(err)
      const data = {
        status: false,
        error: err
      };

      res.json({success: 'post call failed!', data: data})
    }
    else {
      console.log("User", user);
/*      data.Users.forEach(user => {
        console.log(user.Attributes);
      });*/
      // resolve(data)
      const data = {
        status: true,
        user: user
      };

      res.json({success: 'post call succeed!', data: data})
    }
  });

  // res.json({success: 'post call succeed!', url: req.url, body: req.body})
});

app.post('/things/setCognitoUserAttributes', function(req, res) {
  const user = req.body.user;

  const UserAttributes = [];
  const keys = Object.keys(user);

  for (let i = 0; i < keys.length; i++) {
    switch (keys[i]) {
      case 'birthdate': {
        UserAttributes.push({
          Name: 'birthdate',
          Value: user.birthdate,
        });
        break;
      }
      case 'firstName': {
        UserAttributes.push({
          Name: 'given_name',
          Value: user.firstName,
        });
        break;
      }
      case 'lastName': {
        UserAttributes.push({
          Name: 'family_name',
          Value: user.lastName,
        });
        break;
      }
      case 'email': {
        UserAttributes.push({
          Name: 'email',
          Value: user.email,
        });
        break;
      }
      case 'phone': {
        UserAttributes.push({
          Name: 'phone_number',
          Value: user.phone,
        });
        break;
      }
      case 'departmentName': {
        UserAttributes.push({
          Name: 'custom:department',
          Value: user.departmentName,
        });
        break;
      }
      case 'departmentId': {
        UserAttributes.push({
          Name: 'custom:department_id',
          Value: `${user.departmentId}`,
        });
        break;
      }
      case 'securityRoleName': {
        UserAttributes.push({
          Name: 'custom:security_role',
          Value: user.securityRoleName,
        });
        break;
      }
      case 'securityRoleId': {
        UserAttributes.push({
          Name: 'custom:security_role_id',
          Value: `${user.securityRoleId}`,
        });
        break;
      }
    }
  }

  const params = {
    UserAttributes: UserAttributes,
    UserPoolId: userPoolId,
    Username: user.username
  };

  const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();

  cognitoidentityserviceprovider.adminUpdateUserAttributes(params, (err, data) => {
    if (err) {
      console.log(err);
      res.json({success: 'post call failed!', data: err})
    } else {
      console.log("User", data);
      res.json({success: 'post call succeed!', data: data})
    }
  });
});


app.post('/things/addCognitoUser', function(req, res) {
  const user = req.body.user;

  const UserAttributes = [];
  const keys = Object.keys(user);

  for (let i = 0; i < keys.length; i++) {
    switch (keys[i]) {
      case 'birthdate': {
        UserAttributes.push({
          Name: 'birthdate',
          Value: user.birthdate,
        });
        break;
      }
      case 'firstName': {
        UserAttributes.push({
          Name: 'given_name',
          Value: user.firstName,
        });
        break;
      }
      case 'lastName': {
        UserAttributes.push({
          Name: 'family_name',
          Value: user.lastName,
        });
        UserAttributes.push({
          Name: 'name',
          Value: `${user.firstName} ${user.lastName}`,
        });
        break;
      }
      case 'middleName': {
        if (user.gender) {
          UserAttributes.push({
            Name: 'middle_name',
            Value: user.middleName,
          });
        } else {
          UserAttributes.push({
            Name: 'middle_name',
            Value: '',
          });
        }
        break;
      }
      case 'gender': {
        if (user.gender) {
          UserAttributes.push({
            Name: 'gender',
            Value: user.gender,
          });
        } else {
          UserAttributes.push({
            Name: 'gender',
            Value: '',
          });
        }
        break;
      }
      case 'email': {
        UserAttributes.push({
          Name: 'email',
          Value: user.email,
        });
        break;
      }
      case 'phone': {
        UserAttributes.push({
          Name: 'phone_number',
          Value: user.phone,
        });
        break;
      }
      case 'departmentName': {
        UserAttributes.push({
          Name: 'custom:department',
          Value: user.departmentName,
        });
        break;
      }
      case 'departmentId': {
        UserAttributes.push({
          Name: 'custom:department_id',
          Value: `${user.departmentId}`,
        });
        break;
      }
      case 'securityRoleName': {
        UserAttributes.push({
          Name: 'custom:security_role',
          Value: user.securityRoleName,
        });
        break;
      }
      case 'securityRoleId': {
        UserAttributes.push({
          Name: 'custom:security_role_id',
          Value: `${user.securityRoleId}`,
        });
        break;
      }
    }
  }

  UserAttributes.push({
    Name: 'profile',
    Value: '',
  });
  UserAttributes.push({
    Name: 'picture',
    Value: '',
  });

  const params = {
    UserAttributes: UserAttributes,
    UserPoolId: userPoolId,
    Username: user.username
  };

  const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();

  cognitoidentityserviceprovider.adminCreateUser(params, (err, data) => {
    if (err) {
      console.log(err);
      res.json({success: 'post call failed!', data: err})
    } else {
      console.log("User", data);
      res.json({success: 'post call succeed!', data: data})
    }
  });
});


app.post('/things/deleteCognitoUser', function(req, res) {
  const username = req.body.user.username;
  console.log(req.body);
  console.log(username);

  var params = {
    UserPoolId: userPoolId,
    Username: username
  };

  var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();

  cognitoidentityserviceprovider.adminDeleteUser(params, (err, data) => {
    if (err) {
      console.log(err);
      res.json({success: 'post call failed!', status: false, data: err})
    } else {
      console.log("Deleted user", data);
      res.json({success: 'post call succeed!', data: data})
    }
  });
});

app.post('/things/disableCognitoUser', function(req, res) {
  const username = req.body.user.username;
  console.log(req.body);
  console.log(username);

  var params = {
    UserPoolId: userPoolId,
    Username: username
  };

  var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();

  cognitoidentityserviceprovider.adminDisableUser(params, (err, data) => {
    if (err) {
      console.log(err);
      res.json({success: 'post call failed!', status: false, data: err})
    } else {
      console.log("Disabled user", data);
      res.json({success: 'post call succeed!', data: data})
    }
  });
});

app.post('/things/enableCognitoUser', function(req, res) {
  const username = req.body.user.username;
  console.log(req.body);
  console.log(username);

  var params = {
    UserPoolId: userPoolId,
    Username: username
  };

  var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();

  cognitoidentityserviceprovider.adminEnableUser(params, (err, data) => {
    if (err) {
      console.log(err);
      res.json({success: 'post call failed!', status: false, data: err})
    } else {
      console.log("Enabled user", data);
      res.json({success: 'post call succeed!', data: data})
    }
  });
});

app.get('/things/getCognitoIdentityProviders', function(req, res) {
  var params = {
    MaxResults: 25
  };

  var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();
  var cognitoidentity = new AWS.CognitoIdentity();

  cognitoidentity.listIdentityPools(params, (err, data) => {
    if (err) {
      console.log(err);
      // reject(err)
      res.json({success: 'post call failed!', data: err})
    }
    else {
      console.log("Providers", data);
      // data.Providers
      /*            data.Users.forEach(user => {
                    console.log(user.Attributes);
                  });*/
      // resolve(data)
      res.json({success: 'post call succeed!', data: data})
    }
  });
});

app.get('/things/getIdentityId', function(req, res) {
  var params = {
    IdentityPoolId: 'us-east-1:3bd4a2d4-3e20-4921-a87e-70af418f7ef1'
  };

  var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();
  var cognitoidentity = new AWS.CognitoIdentity();

  cognitoidentity.getId(params, (err, data) => {
    if (err) {
      console.log(err);
      // console.log(cognitoidentity.config);
      // reject(err)
      res.json({success: 'post call failed!', data: err})
    }
    else {
      console.log("Providers", data);
      // console.log(cognitoidentity.config);
      // data.Providers
      /*            data.Users.forEach(user => {
                    console.log(user.Attributes);
                  });*/
      // resolve(data)
      res.json({success: 'post call succeed!', data: data})
    }
  });
});

app.get('/things/listIdentities', function(req, res) {
  var params = {
    IdentityPoolId: 'us-east-1:3bd4a2d4-3e20-4921-a87e-70af418f7ef1',
    MaxResults: 25,
  };

  var cognitoidentity = new AWS.CognitoIdentity();

  cognitoidentity.listIdentities(params, (err, data) => {
    if (err) {
      console.log(err);
      res.json({success: 'post call failed!', data: err})
    }
    else {
      console.log("Providers", data);

      res.json({success: 'post call succeed!', data: data})
    }
  });
});


app.get('/things', function(req, res) {
  // Add your code here
  res.json({success: 'get call succeed!', url: req.url});
});

app.get('/things/*', function(req, res) {
  // Add your code here
  res.json({success: 'get call succeed!', url: req.url});
});

/****************************
* Example post method *
****************************/

app.post('/things', function(req, res) {
  // Add your code here
  res.json({success: 'post call succeed!', url: req.url, body: req.body})
});

app.post('/things/*', function(req, res) {
  // Add your code here
  res.json({success: 'post call succeed!', url: req.url, body: req.body})
});

/****************************
* Example post method *
****************************/

app.put('/things', function(req, res) {
  // Add your code here
  res.json({success: 'put call succeed!', url: req.url, body: req.body})
});

app.put('/things/*', function(req, res) {
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

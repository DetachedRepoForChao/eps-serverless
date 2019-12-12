const AWS = require('aws-sdk');

const componentName = 'cognitor.controller';

AWS.config.update({
  region: 'us-east-1',
  accessKeyId: 'AKIAZMKSQ5SFC7O3NQUR',
  secretAccessKey: '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'
});

const userPoolId = 'us-east-1_vOg4HSZc8';

const getCognitoUser = function (username) {

  const params = {
    UserPoolId: userPoolId,
    Username: username
  };

  const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();

  return cognitoidentityserviceprovider.adminGetUser(params).promise();
/*
  , (err, user) => {
    if (err) {
      console.log(err);
      // reject(err)
      const data = {
        status: false,
        error: err
      };

      resultObject.data = data;

    } else {
      const data = {
        status: true,
        user: user
      };

      resultObject.data = data;

    }

    resultArray.push(resultObject);

  });
    */


/*  Promise.all(promiseArray)
    .then(results => {
      console.log('test');
      // console.log('promise results', results);
      res.json({success: 'post call succeed!', results: resultArray});
    });*/
};

module.exports.getCognitoUser = getCognitoUser;

/* Copyright 2017-2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.

 Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file
 except in compliance with the License. A copy of the License is located at

     http://aws.amazon.com/apache2.0/

 or in the "license" file accompanying this file. This file is distributed on an "AS IS"
 BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 License for the specific language governing permissions and limitations under the License.
*/

// const https = require('https');
const jose = require('node-jose');

const region = 'us-east-1';
const userpool_id = 'us-east-1_gbzCkWTjI';
const app_client_id = '5cujgdp9icptsss4vuudv2kt8h';
const keys_url = 'https://cognito-idp.' + region + '.amazonaws.com/' + userpool_id + '/.well-known/jwks.json';

// const parseToken = function(token) {
// exports.parseToken = (token, callback) => {
function parseToken(token, callback) {
  console.log('starting parseToken');
  // var token = event.token;
  const sections = token.split('.');
  // get the kid from the headers prior to verification
  let header = jose.util.base64url.decode(sections[0]);
  header = JSON.parse(header);
  const kid = header.kid;

  const body = require('./jwks');
  // console.log(body);
  const keys = body['keys'];
  // search for the kid in the downloaded public keys
  let key_index = -1;
  for (let i=0; i < keys.length; i++) {
    if (kid === keys[i].kid) {
      key_index = i;
      break;
    }
  }
  if (key_index === -1) {
    console.log('Public key not found in jwks.json');
    // return {message: 'Public key not found in jwks.json'};
    return callback({message: 'Public key not found in jwks.json'});
  }
  // construct the public key
  jose.JWK.asKey(keys[key_index])
    .then(function(result) {
      console.log('jose.JWK.asKey(keys[key_index])');
      // verify the signature
      jose.JWS.createVerify(result).verify(token)
        .then(function(result) {
          console.log('jose.JWS.createVerify(result).verify(token)');
          // now we can use the claims
          const claims = JSON.parse(result.payload);
          // console.log(claims);
          // additionally we can verify the token expiration
          const current_ts = Math.floor(new Date() / 1000);
          if (current_ts > claims.exp) {
            console.log('Token is expired');
            return callback({message: 'Token is expired'});
            // return {message: 'Token is expired'};
          }
          // and the Audience (use claims.client_id if verifying an access token)
          if (claims.aud !== app_client_id) {
            console.log('Token was not issued for this audience');
            return callback({message: 'Token was not issued for this audience'});
            // return {message: 'Token was not issued for this audience'};
          }
          // return {message: null, claims: claims};
          console.log('Success');
          return callback({message: 'Success', claims: claims});
        })
        .catch(function() {
          console.log('Signature verification failed');
          return callback({message: 'Signature verification failed'});
          // return {message: 'Signature verification failed'}
        });
    });

/*  // download the public keys
  https.get(keys_url, function(response) {
    console.log('https get');
    if (response.statusCode === 200) {
      console.log('response === 200');
      response.on('data', function(body) {
        const keys = JSON.parse(body)['keys'];
        // search for the kid in the downloaded public keys
        let key_index = -1;
        for (let i=0; i < keys.length; i++) {
          if (kid === keys[i].kid) {
            key_index = i;
            break;
          }
        }
        if (key_index === -1) {
          console.log('Public key not found in jwks.json');
          // return {message: 'Public key not found in jwks.json'};
          return callback({message: 'Public key not found in jwks.json'});
        }
        // construct the public key
        jose.JWK.asKey(keys[key_index])
          .then(function(result) {
            console.log('jose.JWK.asKey(keys[key_index])');
            // verify the signature
            jose.JWS.createVerify(result).verify(token)
              .then(function(result) {
                console.log('jose.JWS.createVerify(result).verify(token)');
                // now we can use the claims
                const claims = JSON.parse(result.payload);
                // console.log(claims);
                // additionally we can verify the token expiration
                const current_ts = Math.floor(new Date() / 1000);
                if (current_ts > claims.exp) {
                  console.log('Token is expired');
                  return callback({message: 'Token is expired'});
                  // return {message: 'Token is expired'};
                }
                // and the Audience (use claims.client_id if verifying an access token)
                if (claims.aud !== app_client_id) {
                  console.log('Token was not issued for this audience');
                  return callback({message: 'Token was not issued for this audience'});
                  // return {message: 'Token was not issued for this audience'};
                }
                // return {message: null, claims: claims};
                console.log('Success');
                return callback({message: 'Success', claims: claims});
              })
              .catch(function() {
                console.log('Signature verification failed');
                return callback({message: 'Signature verification failed'});
                // return {message: 'Signature verification failed'}
              });
          });
      });
    }
  });*/
}

module.exports.parseToken = parseToken;

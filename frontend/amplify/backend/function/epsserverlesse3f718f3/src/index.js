const secrets = require('./secrets');
if(process.env.APPDATA) {
    process.env.DB_NAME = secrets.DB_NAME;
    // process.env.DB_NAME = secrets.DB_NAME_LOCAL;
    process.env.DB_USER = secrets.DB_USER;
    process.env.DB_PASSWORD = secrets.DB_PASSWORD;
    // process.env.DB_PASSWORD = secrets.DB_PASSWORD_LOCAL;
    process.env.DB_HOST = secrets.DB_HOST;
    // process.env.DB_HOST = secrets.DB_HOST_LOCAL;
    process.env.DB_PORT = secrets.DB_PORT;
}

// console.log(process.env);

const awsServerlessExpress = require('aws-serverless-express');
const app = require('./app');
const server = awsServerlessExpress.createServer(app);

exports.handler = (event, context) => {
  // console.log(event.body);
  // console.log(context);
  console.log(`EVENT: ${JSON.stringify(event)}`);
  awsServerlessExpress.proxy(server, event, context);
};

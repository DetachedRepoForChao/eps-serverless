const Sequelize = require('sequelize');
const DbModels = require('./models/models');

process.env.DB_NAME = "eps-test";
process.env.DB_USER = "nodeuser";
process.env.DB_PASSWORD = "F2GS_+tw4Se7$Qt2";
process.env.DB_HOST = "eps-test.copg0vm8oufq.us-east-1.rds.amazonaws.com";
process.env.DB_PORT = 3306;


const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    dialect: 'mysql',
    pool: {
      max: 5,
      min: 0,
      acquire: 20000,
      idle: 10000
    },
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    logging: false,
    define: {
      freezeTableName: true
    }
  }
);


const Models = DbModels(sequelize, Sequelize);
const connection = {};

/*
module.exports = async () => {
  if (connection.isConnected) {
    console.log('=> Using existing connection.')
    return Models
  }

  await sequelize.sync()
  await sequelize.authenticate()
  connection.isConnected = true
  console.log('=> Created a new connection.')
  return Models
}
*/

module.exports = () => {
  if (connection.isConnected) {
    console.log('=> Using existing connection.');
    return {
      Models: Models,
      sequelize: sequelize
    };
  }

  sequelize.sync();
  sequelize.authenticate();
  connection.isConnected = true;
  console.log('=> Created a new connection.');

  return {
    Models: Models,
    sequelize: sequelize
  };
};

const Sequelize = require('sequelize');
const SqlModel = require('../db');
const Models = SqlModel().Models;
const ctrlPointTransaction = require('./point_transaction.controller');
const componentName = 'core_values.controller';

const getUserCoreValues = function (userId) {
  const functionName = 'getUserCoreValues';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  const coreValuesList = {
    happy: 1,
    fun: 1,
    genuine: 1,
    caring: 1,
    respect: 1,
    honest: 1,
  };

  return ctrlPointTransaction.getUserPointTransactions(userId)
    .then(pointTransactionsResult => {
      console.log(`${functionFullName}: pointTransactionResult:`);
      console.log(pointTransactionsResult);
      if (pointTransactionsResult.status !== false) {
        for (const pointTransaction of pointTransactionsResult.pointTransactions) {
          if (pointTransaction.pointItem) {
            const coreValues = pointTransaction.pointItem.coreValues.split(';');
            for (let j = 0; j < coreValues.length; j++) {
              coreValues[j] = coreValues[j].trim();
            }

            for (const coreValue of coreValues) {
              coreValuesList[coreValue] += 1;
            }
          }
        }

        return {status: true, coreValues: coreValuesList}
      } else {
        console.log(`${functionFullName}: Error`);
        return {status: false, message: 'Error'};
      }
    })
    .catch(err => {
        console.log(`${functionFullName}: Database error`);
        console.log(err);
        return {status: false, message: err};
      });
};

module.exports.getUserCoreValues = getUserCoreValues;

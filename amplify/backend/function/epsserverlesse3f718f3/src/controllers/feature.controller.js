const SqlModel = require('../db');
const Models = SqlModel().Models;

const componentName = 'feature.controller';

const getFeatures = function() {
  const functionName = 'getFeatures';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  return Models.AchievementUnlocksFeature.findAll({
    include: [
      {
        model: Models.Feature,
        attributes: ['id', 'name', 'description']
      },
      {
        model: Models.Achievement,
        attributes: ['id']
      }
    ],
    attributes: ['id', 'featureId', 'achievementId', 'description']
  })
    .then(features => {
      if(!features) {
        console.log(`${functionFullName}: Records not found`);
        return {status: false, message: 'Achievement Unlocks Feature records not found.'};
      } else {
        console.log(`${functionFullName}: User Achievements retrieved successfully`);
        console.log(features);
        return {status: true, features: features };
      }
    })
    .catch(err => {
      console.log(`${functionFullName}: database error`);
      console.log(err);
      return {status: 500, message: err };
    });
};

module.exports.getFeatures = getFeatures;

const SqlModel = require('../db');
const Models = SqlModel().Models;
const sqlUserModel = Models.User;

const _ = require('lodash');

const ctrlAchievement = require('./achievement.controller');
const ctrlPointPool = require('./point_pool.controller');

// const jwtVerify = require('../config/decode-verify-jwt');
const componentName = 'user.controller';


const registerUser = function (user) {
  const functionName = 'registerUser';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  console.log(`${functionFullName}: body:`);
  console.log(user.body);

  const username = user.body.username;
  const firstName = user.body.firstName;
  const lastName = user.body.lastName;
  const email = user.body.email;
  const securityRoleId = user.body.securityRole.Id;
  const departmentId = user.body.department.Id;
  const phone = user.body.phone;
  const birthdate = user.body.birthdate;
  // const password = req.body.password;
  const middleName = user.body.middleName;
  const preferredName = user.body.preferredName;
  // const prefix = user.body.prefix;
  // const suffix = user.body.suffix;
  const position = user.body.position;
  // const address1 = user.body.address1;
  // const address2 = user.body.address2;
  // const city = user.body.city;
  // const state = user.body.state;
  // const country = user.body.country;
  // const zip = user.body.zip;
  // const preferredPronoun = user.body.preferredPronoun;
  // const sex = user.body.sex;
  // const gender = user.body.gender;
  const dateOfHire = user.body.dateOfHire;
  let phonePublic = false;
  let emailPublic = false;
  let birthdatePublic = true;
  let genderPublic = false;
  let pointAwardsPublic = true;
  let achievementsPublic = true;
  let pointsPublic = true;
  let coreValuesPublic = true;
  if (securityRoleId === 2) {
    phonePublic = true;
    emailPublic = true;
  }

  // const avatarUrl =

  // var password;
  // var saltSecret;

  return sqlUserModel.findOne({
    where: {
      username: username
    },
  })
    .then(user => {
      if (user != null) {
        console.log(`${functionFullName}: username already taken`);
        return {status: false, error: 'username already taken'};
      } else {
        console.log(`${functionFullName}: user account does not yet exist. Creating...`);

        return sqlUserModel.create({
          username: username,
          firstName: firstName,
          lastName: lastName,
          email: email,
          securityRoleId: securityRoleId,
          departmentId: departmentId,
          phone: phone,
          dateOfBirth: birthdate,
          points: 0,
          middleName: middleName,
          preferredName: preferredName,
          // prefix: prefix,
          // suffix: suffix,
          position: position,
          // address1: address1,
          // address2: address2,
          // city: city,
          // state: state,
          // country: country,
          // zip: zip,
          // preferredPronoun: preferredPronoun,
          // sex: sex,
          // gender: gender,
          dateOfHire: dateOfHire,
          phonePublic: phonePublic,
          emailPublic: emailPublic,
          birthdatePublic: birthdatePublic,
          genderPublic: genderPublic,
          pointAwardsPublic: pointAwardsPublic,
          achievementsPublic: achievementsPublic,
          pointsPublic: pointsPublic,
          coreValuesPublic: coreValuesPublic,
          active: 1,
        })
          .then((user) => {
            console.log(`${functionFullName}: user created in db`);

            // If the user is a manager, initialize their points pool
            if (user.securityRoleId === 2) {
              console.log(`${functionFullName}: initializing manager point pool for new user`);
              ctrlPointPool.initializePointPool(user.id);
            }

            return {status: true, message: 'user created', user: user};
          })
          .catch(err => {
            console.log(`${functionFullName}: User creation error`);
            console.log(err);
            return {status: false, message: err}
          });
      }
    })
    .catch(err => {
      console.log(`${functionFullName}: Problem with the database`);
      console.log(err);
      return {status: false, message: err};
    });
};

module.exports.registerUser = registerUser;


const adminRegisterUser = function (user) {
  const functionName = 'adminRegisterUser';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  console.log(`${functionFullName}: user:`);
  console.log(user);

  const username = user.username;
  const firstName = user.firstName;
  const lastName = user.lastName;
  const email = user.email;
  const securityRoleId = user.securityRoleId;
  const departmentId = user.departmentId;
  const phone = user.phone;
  const birthdate = user.birthdate;
  const middleName = user.middleName;
  const preferredName = user.preferredName;
  let points = 0;
  if (securityRoleId === 1) {
    points = (user.points) ? user.points : 0;
  }
  let pointsPool = null;
  if (securityRoleId === 2) {
    pointsPool = (user.pointsPool) ? user.pointsPool : null;
  }

  // const prefix = user.prefix;
  // const suffix = user.suffix;
  const position = user.position;
  // const address1 = user.address1;
  // const address2 = user.address2;
  // const city = user.city;
  // const state = user.state;
  // const country = user.country;
  // const zip = user.zip;
  // const preferredPronoun = user.preferredPronoun;
  // const sex = user.sex;
  // const gender = user.gender;
  const dateOfHire = user.dateOfHire;
  let phonePublic = false;
  let emailPublic = false;
  let birthdatePublic = true;
  let genderPublic = false;
  let pointAwardsPublic = true;
  let achievementsPublic = true;
  let pointsPublic = true;
  let coreValuesPublic = true;
  if (securityRoleId === 2) {
    phonePublic = true;
    emailPublic = true;
  }

  return sqlUserModel.findOne({
    where: {
      username: username
    },
  })
    .then(userQueryResult => {
      if (userQueryResult !== null) {
        console.log(`${functionFullName}: username already taken`);
        return {status: false, error: 'username already taken'};
      } else {
        console.log(`${functionFullName}: user account does not yet exist. Creating...`);

        return sqlUserModel.create({
          username: username,
          firstName: firstName,
          lastName: lastName,
          email: email,
          securityRoleId: securityRoleId,
          departmentId: departmentId,
          phone: phone,
          dateOfBirth: birthdate,
          points: points,
          middleName: middleName,
          preferredName: preferredName,
          // prefix: prefix,
          // suffix: suffix,
          position: position,
          // address1: address1,
          // address2: address2,
          // city: city,
          // state: state,
          // country: country,
          // zip: zip,
          // preferredPronoun: preferredPronoun,
          // sex: sex,
          // gender: gender,
          dateOfHire: dateOfHire,
          phonePublic: phonePublic,
          emailPublic: emailPublic,
          birthdatePublic: birthdatePublic,
          genderPublic: genderPublic,
          pointAwardsPublic: pointAwardsPublic,
          achievementsPublic: achievementsPublic,
          pointsPublic: pointsPublic,
          coreValuesPublic: coreValuesPublic,
          active: 1,
        })
          .then(newUser => {
            console.log(`${functionFullName}: user created in db`);

            // If the user is a manager, initialize their points pool
            if (newUser.securityRoleId === 2) {
              console.log(`${functionFullName}: initializing manager point pool for new user`);
              ctrlPointPool.initializePointPool(pointsPool, newUser.id);
            }

            return {status: true, message: 'user created', newUser: newUser};
          })
          .catch(err => {
            console.log(`${functionFullName}: User creation error`);
            console.log(err);
            return {status: false, message: err}
          });
      }
    })
    .catch(err => {
      console.log(`${functionFullName}: Problem with the database`);
      console.log(err);
      return {status: false, message: err};
    });
};

module.exports.adminRegisterUser = adminRegisterUser;


const getUserProfile = function (username) {
  const functionName = 'getUserProfile';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  return sqlUserModel.findOne({
    include: [
      {
        model: Models.Department,
        attributes: ['id', 'name']
      },
      {
        model: Models.SecurityRole,
        attributes: ['id', 'name', 'description']
      },
      {
        model: Models.PointPool,
        attributes: ['id', 'managerId', 'pointsRemaining']
      }
    ],
    attributes: ['id', 'username', 'firstName', 'lastName', 'middleName', 'preferredName', 'prefix', 'suffix',
      'position', 'points', 'email', 'address1', 'address2', 'city', 'state', 'country', 'zip', 'dateOfBirth',
      'preferredPronoun', 'sex', 'gender', 'dateOfHire', 'phone', 'securityRoleId', 'departmentId', 'avatarUrl',
      'quote', 'phonePublic', 'emailPublic', 'genderPublic', 'birthdatePublic', 'pointAwardsPublic',
      'achievementsPublic', 'pointsPublic', 'coreValuesPublic'],
    where: {
      username: username,
      active: 1
    },
  })
    .then(user => {
      if (!user) {
        console.log(`${functionFullName}: User record not found`);
        return { status: false, message: 'User record not found.' };
      } else {
        console.log(`${functionFullName}: User record found`);
        console.log(user);

        // Get the user's pending balance
        let pendingBalance = 0;
        return Models.UserHasStoreItem.findAll({
          include: [
            {
              model: Models.StoreItem
            }
          ],
          where: {
            userId: user.id,
            status: 'pending',
          }
        })
          .then(requests => {
            if (!requests) {
              // No requests. Leaving pending balance at 0

            } else {
              for (request of requests) {
                pendingBalance += request.storeItem.cost;
              }
            }

            return  {status: true, user: user, pendingBalance: pendingBalance};
          })
          .catch(err => {
            console.log('Error retrieving user store item requests. Returning user object anyway');
            console.log(err);
            return  {status: true, error: err, user: user, pendingBalance: pendingBalance};
          });
      }
    })
    .catch(err => {
      console.log(`${functionFullName}: Error retrieving user profile`);
      console.log(err);
      return {status: false, message: err};
    });
};

module.exports.getUserProfile = getUserProfile;


const getUserPoints = function (username) {
  const functionName = 'getUserPoints';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  console.log(`${functionFullName}: username: ${username}`);

  return sqlUserModel.findOne({
    attributes: ['points'],
    where: {
      username: username
    }
  })
    .then(pointsResult => {
      if(!pointsResult) {
        return {status: 404, message: 'getUserPoints: Something went wrong.' };
      } else {
        return {status: 200, points: pointsResult.points};
      }
    })
    .catch(err => {
      console.log(`${functionFullName}: Problem with the database`);
      console.log(err);
      return {status: 500, error: 'getUserPoints: Problem with the database: ' + err};
    });
};

module.exports.getUserPoints = getUserPoints;



const getUsersPublicDetails = function () {
  const functionName = 'getUsersPublicDetails';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  return sqlUserModel.findAll({
    include: [
      {
        model: Models.Department,
        attributes: ['id', 'name']
      },
      {
        model: Models.SecurityRole,
        attributes: ['id', 'name', 'description']
      },
      {
        model: Models.PointPool,
        attributes: ['id', 'managerId', 'pointsRemaining']
      }
    ],
    attributes: ['id', 'username', 'firstName', 'lastName', 'middleName', 'preferredName', 'prefix', 'suffix',
      'position', 'points', 'dateOfBirth', 'preferredPronoun', 'securityRoleId', 'departmentId', 'avatarUrl',
      'email', 'gender', 'phone', 'active', 'quote', 'phonePublic', 'emailPublic', 'genderPublic', 'birthdatePublic',
      'pointAwardsPublic', 'achievementsPublic', 'pointsPublic', 'coreValuesPublic'],
    where: {
      securityRoleId: [1, 2, 3],
      active: 1,
    },
    order: [
      ['id', 'ASC'],
    ],
  })
    .then(usersPublicDetailsResult => {
      if (!usersPublicDetailsResult) {
        console.log(`${functionFullName}: No records found`);
        return { status: false, message: 'No records found' };
      } else {
        console.log(`${functionFullName}: User records found`);
        return  {status: true, users: usersPublicDetailsResult};
      }
    })
    .catch(err => {
      console.log(`${functionFullName}: Error retrieving user records`);
      console.log(err);
      return {status: false, message: err};
    });
};

module.exports.getUsersPublicDetails = getUsersPublicDetails;

const adminGetUsersDetails = function () {
  const functionName = 'adminGetUsersDetails';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  return sqlUserModel.findAll({
    include: [
      {
        model: Models.Department,
        attributes: ['id', 'name']
      },
      {
        model: Models.SecurityRole,
        attributes: ['id', 'name', 'description']
      },
      {
        model: Models.PointPool,
        attributes: ['id', 'managerId', 'pointsRemaining']
      }
    ],
    attributes: ['id', 'username', 'firstName', 'lastName', 'middleName', 'preferredName', 'prefix', 'suffix',
      'position', 'points', 'email', 'address1', 'address2', 'city', 'state', 'country', 'zip', 'dateOfBirth',
      'preferredPronoun', 'sex', 'gender', 'dateOfHire', 'dateOfTermination', 'phone', 'securityRoleId',
      'departmentId', 'avatarUrl', 'active', 'quote', 'phonePublic', 'emailPublic', 'genderPublic', 'birthdatePublic',
      'pointAwardsPublic', 'achievementsPublic', 'pointsPublic', 'coreValuesPublic'],
    order: [
      ['id', 'ASC'],
    ],
  })
    .then(usersDetailsResult => {
      if (!usersDetailsResult) {
        console.log(`${functionFullName}: No records found`);
        return { status: false, message: 'No records found' };
      } else {
        console.log(`${functionFullName}: User records found`);
        return  {status: true, users: usersDetailsResult};
      }
    })
    .catch(err => {
      console.log(`${functionFullName}: Error retrieving user records`);
      console.log(err);
      return {status: false, message: err};
    });
};

module.exports.adminGetUsersDetails = adminGetUsersDetails;

const modifyUser = function (user) {
  const functionName = 'modifyUser';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  console.log(`${functionFullName}: Modifying User:`);
  console.log(user);

  // Build the user update object
  const userUpdate = {};
  const keys = Object.keys(user);

  for (let i = 0; i < keys.length; i++) {
    let key;
    switch (keys[i]) {
      case 'birthdate': {
        key = 'dateOfBirth';
        break;
      }
      default: {
        key = keys[i];
        break;
      }
    }

    if (user[keys[i]] === '') {
      userUpdate[key] = null;
    } else {
      userUpdate[key] = user[keys[i]];
    }
  }

  return sqlUserModel.update(userUpdate, {
    include: [
      {
        model: Models.Department,
        attributes: ['id', 'name']
      },
      {
        model: Models.SecurityRole,
        attributes: ['id', 'name', 'description']
      }
    ],
    where: {
      id: user.userId,
    }
  })
    .then(() => {
      console.log(`${functionFullName}: Successfully updated User`);
      return {status: true, user: user};
    })
    .catch(err => {
      console.log(`${functionFullName}: Database error`);
      console.log(err);
      return {status: false, message: err};
    });
};

module.exports.modifyUser = modifyUser;

const terminateUser = function (user) {
  const functionName = 'terminateUser';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  console.log(`${functionFullName}: Terminating User:`);
  console.log(user);

  return sqlUserModel.update({
    dateOfTermination: user.dateOfTermination,
    active: 0,
  }, {
    where: {
      id: user.userId,
    }
  })
    .then(() => {
      console.log(`${functionFullName}: Successfully terminated User`);
      return {status: true, user: user};
    })
    .catch(err => {
      console.log(`${functionFullName}: Database error`);
      console.log(err);
      return {status: false, message: err};
    });
};

module.exports.terminateUser = terminateUser;

const reinstateUser = function (user) {
  const functionName = 'reinstateUser';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  console.log(`${functionFullName}: Reinstating User:`);
  console.log(user);

  return sqlUserModel.update({
    dateOfTermination: '',
    active: 1,
  }, {
    where: {
      id: user.userId,
    }
  })
    .then(() => {
      console.log(`${functionFullName}: Successfully reinstated user`);
      return {status: true, user: user};
    })
    .catch(err => {
      console.log(`${functionFullName}: Database error`);
      console.log(err);
      return {status: false, message: err};
    });
};

module.exports.reinstateUser = reinstateUser;


const deleteUser = function (user) {
  const functionName = 'deleteUser';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  console.log(`${functionFullName}: Deleting User:`);
  console.log(user);

  return sqlUserModel.destroy({
    where: {
      id: user.userId,
    }
  })
    .then(() => {
      console.log(`${functionFullName}: Successfully deleted user`);
      return {status: true, user: user};
    })
    .catch(err => {
      console.log(`${functionFullName}: Database error`);
      console.log(err);
      return {status: false, message: err};
    });
};

module.exports.deleteUser = deleteUser;


const newPurchaseApprover = function (purchaseApprover) {
  const functionName = 'newPurchaseApprover';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  return Models.PurchaseApprovers.findOne({
    where: {
      userId: purchaseApprover.userId,
    }
  })
    .then(result => {
      if (result) {
        console.log(`${functionFullName}: This user account is already a purchase request manager`);
        return {status: false, message: 'This user account is already a purchase request manager'};
      } else {
        return Models.PurchaseApprovers.create(purchaseApprover)
          .then(newApprover => {
            console.log(`${functionFullName}: Successfully created new purchase request manager`);
            return {status: true, newApprover: newApprover};
          })
          .catch(err => {
            console.log(`${functionFullName}: Database error`);
            console.log(err);
            return {status: false, message: 'Database error', error: err};
          });
      }
    })
    .catch(err => {
      console.log(`${functionFullName}: Database error`);
      console.log(err);
      return {status: false, message: 'Database error', error: err};
    });
};

module.exports.newPurchaseApprover = newPurchaseApprover;

const updatePurchaseApprover = function (purchaseApprover) {
  const functionName = 'updatePurchaseApprover';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  return Models.PurchaseApprovers.update(purchaseApprover, {
    where: {
      userId: purchaseApprover.userId
    }
  })
    .then(result => {
      if (result) {
        console.log(`${functionFullName}: Successfully updated purchase request manager.`);
        return {status: true, updatedApprover: purchaseApprover};
      } else {
        console.log(`${functionFullName}: Nothing to update`);
        return {status: false, message: 'Nothing to update'};
      }
    })
    .catch(err => {
      console.log(`${functionFullName}: Database error`);
      console.log(err);
      return {status: false, message: 'Database error', error: err};
    });
};

module.exports.updatePurchaseApprover = updatePurchaseApprover;

const deletePurchaseApprover = function (userId) {
  const functionName = 'deletePurchaseApprover';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  return Models.PurchaseApprovers.destroy({
    where: {
      userId: userId
    }
  })
    .then(result => {
      if (result) {
        console.log(`${functionFullName}: Successfully deleted purchase request manager`);
        return {status: true, deletedApprover: userId};
      } else {
        console.log(`${functionFullName}: Nothing to delete`);
        return {status: false, message: 'Nothing to delete'};
      }
    })
    .catch(err => {
      console.log(`${functionFullName}: Database error`);
      console.log(err);
      return {status: false, message: 'Database error', error: err};
    });
};

module.exports.deletePurchaseApprover = deletePurchaseApprover;

const getPurchaseApprovers = function () {
  const functionName = 'getPurchaseApprovers';
  const functionFullName = `${componentName} ${functionName}`;
  console.log(`Start ${functionFullName}`);

  return Models.PurchaseApprovers.findAll({
    include: [
      {
        model: Models.User
      }
    ]
  })
    .then(result => {
      if (result) {
        console.log(`${functionFullName}: Retrieved purchase request manager records successfully`);
        return {status: true, message: 'Retrieved purchase request manager records successfully', purchaseApprovers: result};
      } else {
        console.log(`${functionFullName}: No purchase request manager records found`);
        return {status: false, message: 'No purchase request manager records found'};
      }
    })
    .catch(err => {
      console.log(`${functionFullName}: Database error`);
      console.log(err);
      return {status: false, message: 'Database error', error: err};
    });
};

module.exports.getPurchaseApprovers = getPurchaseApprovers;

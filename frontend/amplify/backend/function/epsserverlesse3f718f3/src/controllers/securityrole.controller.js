const SqlModel = require('../db');
const Models = SqlModel();

const sqlSecurityRoleModel = Models.SecurityRole;

const getSecurityRoles = function () {
  console.log('start function getSecurityRoles');
  try {
    return sqlSecurityRoleModel.findAll({
      attributes: ['id', 'name', 'description'],
    }).then(securityRoles => {
      // console.log('departments;');
      // console.log(departments);
      return {
        status: 200,
        securityRoles: securityRoles
      };
    }).catch(err => {
      console.log("Error retrieving security roles");
      return {
        status: err.statusCode || 500,
        error: err || "Error retrieving security roles"
      }
    });
  } catch (err) {
    return {
      status: err.statusCode || 500,
      error: err || "Error getting security roles"
    }
  }
};

module.exports.getSecurityRoles = getSecurityRoles;

module.exports.getSecurityRoleById = (req, res, next) =>{

    console.log('securityRoleById req.securityRoleId:');
    console.log(req.body.securityRoleId);
    console.log(req.body);

    sqlSecurityRoleModel.findOne({
        attributes: ['id', 'name', 'description'],
        where: {
            id: req.body.securityRoleId,
        }
    })
        .then(securityRole => {
            if(!securityRole) {
                return res.status(404).json({ status: false, message: 'Security Role record not found.' });
            } else {
                return res.status(200).json({ status: true, securityRole : securityRole });
            }
        })
        .catch(err => {
            console.log('Database error');
            console.log(err);
            return res.status(500).json({ status: false, message: err });
        });

};

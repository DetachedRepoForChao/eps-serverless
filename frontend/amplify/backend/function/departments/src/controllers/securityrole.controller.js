const SqlModel = require('./db');
const _ = require('lodash');
const sqlSecurityRoleModel = SqlModel.Models.SecurityRole;

module.exports.getSecurityRoles = (req, res, next) =>{
    //console.log('req.id:' + req.id);
    //console.log(req);

    sqlSecurityRoleModel.findAll({
        attributes: ['id', 'name', 'description'],
    })
        .then(securityRoles => {
            return res.status(200).json({ status: true, securityRoles : securityRoles });
        })
        .catch(err => {
            console.log('Database error');
            console.log(err);
            return res.status(500).json({ status: false, message : err });
        });

};

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

import SqlModel from '../sequelize';
const _ = require('lodash');
const sqlPointPoolModel = SqlModel.PointPool;


var getRemainingPointPool = function (req, res, next) {
    console.log('getRemainingPointPool');

    const data = {
        managerId: req.body.managerId,
    };

    sqlPointPoolModel.findOne({
        where: {
            managerId: data.managerId,
        }
    })
        .then(pointPool => {
            if (!pointPool) {
                return res.status(404).json({ status: false, message: 'Point Pool record not found.' });
            } else {
                return res.status(200).json({ status: true, pointsRemaining : pointPool.pointsRemaining });
            }
        })
        .catch(err => {
            console.log('problem communicating with db');
            res.status(500).json({status: false, message: err});
        });
};


module.exports.getRemainingPointPool = getRemainingPointPool;


var getRemainingPointPoolLocal = function (managerId) {
    console.log('getRemainingPointPoolLocal');
    console.log('managerId: ' + managerId);

    return SqlModel.sequelize.query("SELECT * FROM `point_pool` WHERE `point_pool`.`managerId` = " + managerId + ";",
        {type: SqlModel.sequelize.QueryTypes.SELECT})
        .then(pointPool => {
            //console.log(pointPool);
            if (!pointPool) {
                //console.log('fail');
                return JSON.stringify({status: false, message: 'Unable to find Point Pool record'});
            } else {
                return ({status: true, pointsRemaining: pointPool[0].points_remaining});
            }
        })
        .catch(err => {
            console.log('problem communicating with db');
            console.log(err);
            return JSON.stringify({status: false, message: err});
        });

    /*
    sqlPointPoolModel.findOne({
        where: {
            managerId: managerId
        }
    })
        .then(pointPool => {
            console.log('pointPool: ');
            //console.log(pointPool);
            if (!pointPool) {
                console.log('fail');
                return JSON.stringify({status: false, message: 'Unable to find Point Pool record'});
            } else {
                console.log('success');
                console.log('pointPool.pointsRemaining: ' + pointPool.pointsRemaining);
                return JSON.stringify({status: true, pointsRemaining: pointPool.pointsRemaining});
            }
        })
        .catch(err => {
            console.log('problem communicating with db');
            console.log(err);
            return JSON.stringify({status: false, message: err});
        });
    */
};

module.exports.getRemainingPointPoolLocal = getRemainingPointPoolLocal;

var removePointsFromPointPoolLocal = function (managerId, amount) {
    console.log('removePointsFromPointPoolLocal');

    // First, get the Remaining Point Pool
    return getRemainingPointPoolLocal(managerId)
        .then(remainingPointPool => {
            if(remainingPointPool.pointsRemaining < amount) {
                return JSON.stringify({ status: false, message: 'There is not enough points in the point pool to complete this transaction' });
            } else {
                return SqlModel.sequelize.query("UPDATE `point_pool` SET `points_remaining` = `points_remaining` - " + amount + " " +
                    "WHERE `point_pool`.`managerId` = " + managerId + ";", {type: SqlModel.sequelize.QueryTypes.UPDATE})
                    .then(queryResult => {
                        if(!queryResult) {
                            console.log('Something went wrong');
                            return JSON.stringify({status: false, message: 'Something went wrong'});
                        } else {
                            console.log('Points removed from point pool successfully');
                            return JSON.stringify({status: true, message: 'Points removed from point pool successfully'});
                        }
                    })
                    .catch(err => {
                        console.log('Trouble with the database');
                        console.log(err);
                        return JSON.stringify({status: false, message: err});
                    })
            }
        })
};

module.exports.removePointsFromPointPoolLocal = removePointsFromPointPoolLocal;

var initializePointPool = function (managerId) {
    console.log('initializePointPool');

    sqlPointPoolModel.create({
        managerId: managerId,
    })
        .then(() => {
            console.log('Point Pool creation succeeded.');
            return JSON.stringify({ status: true, message: 'Point Pool creation succeeded.' });
        })
        .catch(err => {
            console.log('Problem with the database');
            return JSON.stringify({ status: false, message: err });
        })
};

module.exports.initializePointPool = initializePointPool;

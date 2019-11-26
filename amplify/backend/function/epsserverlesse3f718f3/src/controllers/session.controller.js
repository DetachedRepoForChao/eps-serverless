const SqlModel = require('../db');
const Models = SqlModel().Models;

const sqlUserModel = Models.User;
const sqlAchievementModel = Models.Achievement;
const sqlAchievementTransactionModel = Models.AchievementTransaction;
const sqlSessionModel = Models.Session;
const _ = require('underscore');
// const serverIo = server.io;
// const sessionHash = server.sessionHash;
var sessionHash = new Array();
var io = null;


/*
io.origins((origin, callback) => {
    if (origin !== 'http://localhost:4200') {
        return callback('origin not allowed', false);
    }
    callback(null, true);
});
*/

/*
import sio from '../io';
let io = sio.io();
io.io().on('connection', function (socket) {
    console.log('new Connection socket.id: ' + socket.id);

});
*/

var initializeIo = function(sio) {
    io = sio;
    io.on('connection', function(socket) {
        console.log('session hash');
        console.log(sessionHash);
        //console.log('io');
        //console.log(io);
        //console.log('new Connection socket.id: ' + socket.id);
        console.log('socket.id');
        console.log(socket.id);

        onCreateSession(socket);
        onLogoutSession(socket);
        onDestroySession(socket);
        onDisconnect(socket);
    });
};

module.exports.initializeIo = initializeIo;


var onCreateSession = function(socket) {
    socket.on('createSession', function (data) {
        console.log('Starting createSession');
        var userId = data.userId;
        console.log('createSession: userId: ' + userId);
        console.log('createSession: socket.id: ' + socket.id);

        var session = {
            userId: userId,
            loggedIn: true,
            heartbeatAt: Date.now()
        };

        // check if this session already exists for this user
        var hashMatch = sessionHash[socket.id];
        if (hashMatch) {
            console.log('createSession: Found matching session hashtable entry:');
            console.log(hashMatch);
            if (hashMatch.userId === userId) {
                console.log('createSession: Session ' + socket.id + ' for userId ' + userId + ' already exists');
                console.log('createSession: Check if session is currently set as logged out...');
                if (hashMatch.loggedIn === false) {
                    console.log('createSession: Session: ' + socket.id + ' is currently set as logged out. Setting session as logged in');
                    sessionHash[socket.id].loggedIn = true;
                    sessionHash[socket.id].heartbeatAt = Date.now();
                } else {
                    console.log('createSession: Session: ' + socket.id + ' is already set as logged in');
                }
            } else {
                console.warn('createSession: Session ' + socket.id + ' exists for userId ' + userId + '...');
            }
        } else {
            console.log('createSession: Adding session ' + socket.id + ' for userId ' + userId + ' to the session hashtable');
            sessionHash[socket.id] = session;

            createSessionRecord(socket.id, userId);
            var socketSession = _.findWhere(io.sockets.sockets, {id: socket.id});
            socketSession.emit('sessionCreated', socket.id);

            sessionHeartbeatListener(socket.id);
            checkSessionHeartbeat(socket.id);
        }

        console.log('session hash');
        console.log(sessionHash);
    });
};

// The windows be closed
var onDisconnect = function(socket) {
    socket.on('disconnect', function () {
        console.log('Received disconnect message from socket id: ' + socket.id);
        socket.removeAllListeners();
        destroySessionRecord(socket.id);
    });
};


var onLogoutSession = function(socket) {
    socket.on('logoutSession', function() {
        console.log('Trying to set session: ' + socket.id + ' as logged out');
        if (sessionHash[socket.id]) {
            console.log('Found session: ' + socket.id + ' in the session hashtable. Setting loggedIn to false');
            sessionHash[socket.id].loggedIn = false;
        } else {
            console.log('Unable to find session: ' + socket.id + ' in the session hashtable.');
        }
    });
};

var onDestroySession = function(socket) {
    socket.on('destroySession', function (data) {
        console.log('Destroying Session: ' + data.socketId);
        const socketSession = _.findWhere(io.sockets.sockets, {id: data.socketId});
        if (socketSession) {
            socketSession.removeAllListeners();

            // socketSession.disconnect(true);
            destroySessionRecord(data.socketId);
            // var sessionHash = getKeyByValue(sessionHash, data.socketId);
            var sessionHash = sessionHash[socket.id];
            console.log('hashValue of ' + socket.id + ' is ' + sessionHash);
            console.log('Deleting hashtable entry');
            delete sessionHash[sessionHash];
        } else {
            console.log('Session ' + data.socketId + ' does not exist. It may have already been destroyed');
        }
    });
};

var createSessionRecord = function (sessionId, userId) {
    // Create new Session record
    return sqlSessionModel.create({
        id: sessionId,
        userId: userId
    })
        .then(() => {
            console.log('createSession success');
            return {status: true, message: 'success'};
        })
        .catch( err => {
            console.log('createSession error');
            return {status: false, message: err};
        });
};

module.exports.createSessionRecord = createSessionRecord;

var destroySessionRecord = function (sessionId) {

    // Destroy Session record
    sqlSessionModel.destroy({
        where: {
            id: sessionId
        }
    })
        .then(result => {
            console.log('destroySession success: ' + result);
            return {status: true, message: 'success'};
        })
        .catch( err => {
            console.log('destroySession error');
            return {status: false, message: err};
        });

    // Delete the session from the session hashtable
    delete sessionHash[sessionId];

};

module.exports.destroySessionRecord = destroySessionRecord;

var getSessionBySessionId = function (sessionId) {

    return sqlSessionModel.findOne({
        where: {
            id: sessionId
        }
    })
        .then(session => {
            if(!session) {
                console.log('Unable to find Session record');
                return {status: false, message: 'Unable to find Session record'};
            } else {
                console.log('getSessionBySessionId: Success');
                return {status: true, session: session};
            }
        })
        .catch(err => {
            console.log('Database error');
            return {status: false, message: err};
        })
};

module.exports.getSessionBySessionId = getSessionBySessionId;

/*
var measureSessionDuration = async function (sessionId) {
    getSessionBySessionId(sessionId)
        .then(session => {
            if(session.status !== true) {
                console.log('No session yet');
                setTimeout(function () {
                    console.log('Test: ' + i + ' SessionId: ' + sessionId);
                    i++;
                    measureSessionDuration(sessionId);
                }, 3000)
            } else {
                var currentTimeMs = Date.now();
                //var currentTimeMs = currentTime.getTime();
                var sessionStartTime = new Date(session.session['createdAt']);
                var sessionStartTimeMs = sessionStartTime.getTime();
                console.log('sessionStartTime: ' + sessionStartTime);
                console.log('sessionStartTimeMs: ' + sessionStartTimeMs);
                console.log('currentTimeMs: ' + currentTimeMs);
                console.log('currentTimeMs - sessionStartTimeMs: ' + (currentTimeMs - sessionStartTimeMs));
                setTimeout(function () {
                    console.log('Test: ' + i + ' SessionId: ' + sessionId);
                    i++;
                    if (socket.id) {
                        var timeDiffMs = currentTimeMs - sessionStartTimeMs;
                        var message = 'Session has been active for ' + timeDiffMs + ' milliseconds';
                        if((timeDiffMs >= 30000) && (!flag2)) {
                            console.log(message);
                            // var toSocket = _.findWhere(io.sockets.sockets, {id: toId});
                            // toSocket.emit('message', data.msg);
                            socket.emit('message', message);
                            flag2 = true;
                        } else if ((timeDiffMs >= 10000) && (!flag1)) {
                            console.log(message);
                            socket.emit('message', message);
                            flag1 = true;
                        }
                        measureSessionDuration(sessionId);
                    } else {
                        console.log('No session yet');
                    }
                }, 3000)
            }

        });
};

module.exports.measureSessionDuration = measureSessionDuration;
*/

var getSessionByUserId = function(userId) {
    return sqlSessionModel.findOne({
        where: {
            userId: userId
        }
    })
        .then(session => {
            if(!session) {
                console.log('Unable to find Session record');
                return {status: false, message: 'Unable to find Session record'};
            } else {
                console.log('getSessionByUserId: Success');
                return {status: true, session: session};
            }
        })
        .catch(err => {
            console.log('Database error');
            return {status: false, message: err};
        })
};

module.exports.getSessionByUserId = getSessionByUserId;

async function checkSessionHeartbeat(socketId) {
    console.log('Start checkSessionHeartbeat function for socket id: ' + socketId);


    //io.to(socket.id).emit('checkSessionHeartbeat');
    var socketSession = _.findWhere(io.sockets.sockets, {id: socketId});
    // var hashMatch = getKeyByValue(sessionHash, socketId);
    console.log('checkSessionHeartbeat: sessionHash');
    console.log(sessionHash);
    var hashMatch = sessionHash[socketId];
    console.log('checkSessionHeartbeat: hashMatch');
    console.log(hashMatch);
    if (hashMatch) {
        // Compare current time with last heartbeat time
        var timeNowMs = Date.now();
        var heartbeatAtMs = hashMatch.heartbeatAt;
        var timeDiffMs = timeNowMs - heartbeatAtMs;

        if (timeDiffMs >= 30000) {
            console.log('checkSessionHeartbeat: The session has not received a heartbeat update in over 30000 ms. Ending session');

            // Send notification of session disconnection
            socketSession.emit('sessionDisconnected', {sessionId: socketId, reason: 'Session idle for ' + timeDiffMs + 'ms'});

            // Delete the session from the session hashtable
            delete sessionHash[socketId];

            // Remove session listeners
            // socketSession.removeAllListeners();

            // Disconnect session
            // socketSession.disconnect();

            // Recreate connection

        } else {
            console.log('checkSessionHeartbeat: The session has received a heartbeat update the past 30000 ms. Continuing');
            if(hashMatch.loggedIn === true) {
                socketSession.emit('checkSessionHeartbeat');
                setTimeout(function () {
                    checkSessionHeartbeat(socketId)
                        .then(() => {
                            console.log('checkSessionHeartbeat: Sent checkSessionHeartbeat request to socket: ' + socketId);
                        })
                        .catch(err => {
                            console.log('checkSessionHeartbeat: Error: ' + err);
                        });

                }, 10000);
            } else {
                console.log('checkSessionHeartbeat: Session: ' + socketId + ' exists in the session hashtable but it is set as being logged out. Retrying function in 10 seconds.');
                setTimeout(function () {
                    checkSessionHeartbeat(socketId)
                        .then(() => {})
                        .catch(err => {
                            console.log('checkSessionHeartbeat: Error: ' + err);
                        });
                }, 10000);
            }
        }
    } else {
        console.log('checkSessionHeartbeat: Session hashtable does not contain an entry for session: ' + socketId);
        console.log('checkSessionHeartbeat: Ending checkSessionHeartbeat function');
    }
}

module.exports.checkSessionHeartbeat = checkSessionHeartbeat;

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}

const sessionHeartbeatListener = function(socketId) {
    console.log('Started checkSessionHeartbeat listener for socket id: ' + socketId);
    // console.log(io);
    var socketSession = _.findWhere(io.sockets.sockets, {id: socketId});
    socketSession.on('sessionHeartbeatResponse', function(data) {
        console.log('Received heartbeat response... status: ' +  data.status + '; sessionId: ' + data.sessionId + '; heartbeatAt: ' + data.heartbeatAt);
        sessionHash[socketId].heartbeatAt = Date.now();
        sqlSessionModel.update({
            heartbeatAt: data.heartbeatAt
        }, {
            where: {
                id: socketId
            }
        })
            .then(() => {})
            .catch(err => {
                console.log('Error updating session record: ' + err);
            });
    });
};

module.exports.sessionHeartbeatListener = sessionHeartbeatListener;

var cleanupIdleSessions = async function() {

};

module.exports.cleanupIdleSessions = cleanupIdleSessions;

var getIo = function() {
    console.log('getIo');
    console.log(io);
};

module.exports.getIo = getIo;

const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const _ = require('lodash');
import SqlModel from '../sequelize.js';
import bcrypt from 'bcrypt';

const sqlUserModel = SqlModel.User;

passport.use(
    new localStrategy({ usernameField: 'username' },
        (username, password, done) => {
            console.log('passport username:' + username);
            console.log('passport password:' + password);
            sqlUserModel.findOne({
                    where: {
                        username: username,
                    }
                })
                .then(user => {
                    //console.log(user);
                    if (!user) {
                        console.log('Username does not exist');
                        return done(null, false, {message: 'Username does not exist'});
                    }
                    // wrong password
                    else if (!(bcrypt.compareSync(password, user.password))) {
                        console.log('Wrong password');
                        return done(null, false, {message: 'Wrong password.'});
                        // authentication succeeded
                    }
                    else {
                        console.log('Found user');
                        return done(null, user);
                    }
                });
        })
);


/**
 * authentication.js
 *
 * AS3ICS Backend
 * by AS3ICS
 * 
 * Zachary DeGeorge
 * zach@as3ics.com
 *
 * Defines the Authentication Strategy for Username/Password (Local) and JWT (REST API)
 */

var passport = require('passport'),
    winston = require('winston'),
    LocalStrategy = require('passport-local').Strategy,
    JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

module.exports.set = function (mongoose, config, express, app) {

    // Define Passport strategy for authenticating with a username and password.
    app.use(passport.initialize());

    // The local authentication strategy authenticates users using a username and password
    // The strategy requires a verify callback, which accepts these credentials and calls done providing a user.
    // https://github.com/jaredhanson/passport-local
    passport.use(new LocalStrategy(
        function (username, password, done) {
            var User = mongoose.model('User');
            User
                .findOne({ username: username })
                .exec(function (err, user) {
                    if (err) {
                        return done(err);
                    } else if (!user) {
                        return done(null, false, { message: "User not found" });
                    } else {
                        user.isValidPassword(password, function (err, isValid) {
                            if (!isValid) {
                                return done(null, false, { message: 'Incorrect password', error_code: 'E_AUTH_PASSWORD' });
                            } else {
                                global.Authed_Users.inc();
                                return done(null, user);
                            }
                        });
                    }
                });
        }
    ));

    var JWT_STRATEGY_CONFIG = {
        secretOrKey: app.config.jwt.secretOrKey,
        issuer: app.config.jwt.issuer,
        audience: app.config.jwt.audience,
        jwtFromRequest: ExtractJwt.fromAuthHeader() // new for v 2.0
    };

    // This module lets you authenticate endpoints using a JSON web token.
    // It is intended to be used to secure RESTful endpoints without sessions.
    // https://github.com/themikenicholson/passport-jwt
    passport.use(new JwtStrategy(JWT_STRATEGY_CONFIG, function (jwt_payload, done) {
        var User = mongoose.model('User');
        User
            .findOne({ _id: jwt_payload.userId })
            .exec(function (err, user) {
                if (err) {
                    return done(err, false);
                } else if (user) {
                    return done(null, user);
                } else {
                    return done(null, false);
                }
            });
    }));
}
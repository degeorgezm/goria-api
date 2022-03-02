/**
 * permissions.js
 *
 * AS3ICS Backend
 * by AS3ICS
 * 
 * Zachary DeGeorge
 * zach@as3ics.com
 *
 * Permissions Controller
 */

var passport = require('passport'),
    mongoose = require('mongoose'),
    winston = require('winston');

/*

 $$$$$$\              $$\     $$\             $$$$$$$$\                                      
$$  __$$\             $$ |    $$ |            \__$$  __|                                     
$$ /  $$ |$$\   $$\ $$$$$$\   $$$$$$$\           $$ |$$\   $$\  $$$$$$\   $$$$$$\   $$$$$$$\ 
$$$$$$$$ |$$ |  $$ |\_$$  _|  $$  __$$\          $$ |$$ |  $$ |$$  __$$\ $$  __$$\ $$  _____|
$$  __$$ |$$ |  $$ |  $$ |    $$ |  $$ |         $$ |$$ |  $$ |$$ /  $$ |$$$$$$$$ |\$$$$$$\  
$$ |  $$ |$$ |  $$ |  $$ |$$\ $$ |  $$ |         $$ |$$ |  $$ |$$ |  $$ |$$   ____| \____$$\ 
$$ |  $$ |\$$$$$$  |  \$$$$  |$$ |  $$ |         $$ |\$$$$$$$ |$$$$$$$  |\$$$$$$$\ $$$$$$$  |
\__|  \__| \______/    \____/ \__|  \__|         \__| \____$$ |$$  ____/  \_______|\_______/ 
                                                     $$\   $$ |$$ |                          
                                                     \$$$$$$  |$$ |                          
                                                      \______/ \__|                          
*/

exports.auth = {};

// No Authentication required (for endpoints that need to be accessible to guests, such as registration)
exports.auth.NONE = function(req, res, next) {
    return next();
};


// Basic Authentication strategy is used to verify username and password for an Admin, and set the JWT Token
// which is passed to the /controllers/administrators/authenticate function
exports.auth.BASIC = function(req, res, next) {
    passport.authenticate("local", function(err, user, info) {
        if (err) {
            winston.log('Basic auth failed: ', err);
            return next(err);
        }
        if (!user) {
            winston.log('Basic auth failed: ', err);
            return res.status(401).send({});
        }

        var token = user.generateToken();
        req.token = token;

        user.password = "********";
        req.user = user;

        return next();

    })(req, res, next);
};

// Verify the JWT is valid and set the user role before executing the rest of the route
exports.auth.TOKEN = function(req, res, next) {
    passport.authenticate('jwt', { session: false }, function(err, user, info) {

        if (err) {
            winston.log('Token auth failed: ', err);
            return next(err);
        } else if (!user) {
            winston.log('Token auth failed: ', err);
            return res.status(401).send({});
        } else {
            req.user = user;
            return next();
        }


    })(req, res, next);
};

/*

$$$$$$$\            $$\                     
$$  __$$\           $$ |                    
$$ |  $$ | $$$$$$\  $$ | $$$$$$\   $$$$$$$\ 
$$$$$$$  |$$  __$$\ $$ |$$  __$$\ $$  _____|
$$  __$$< $$ /  $$ |$$ |$$$$$$$$ |\$$$$$$\  
$$ |  $$ |$$ |  $$ |$$ |$$   ____| \____$$\ 
$$ |  $$ |\$$$$$$  |$$ |\$$$$$$$\ $$$$$$$  |
\__|  \__| \______/ \__| \_______|\_______/ 

*/

exports.roles = {};

// No Special Role is required - used for API calls that require no validation
exports.roles.NONE = function(req, res, next) {
    return next();
};

// Anyone who is logged in
exports.roles.ALL = function(req, res, next) {
    if (req.user) {
        return next();
    } else {
        return res.status(401).send({});
    }
};

// Anyone who is logged in
exports.roles.ADMIN = function(req, res, next) {
    if (req.user.admin == true) {
        return next();
    } else {
        return res.status(401).send({});
    }
};
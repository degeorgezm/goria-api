/**
 * users.js
 *
 * AS3ICS Backend
 * by AS3ICS
 * 
 * Zachary DeGeorge
 * zach@as3ics.com
 *
 * Users Controller
 */

var mongoose = require('mongoose'),
    winston = require('winston'),
    User = mongoose.model('User'),
    Address = mongoose.model('Address'),
    Bag = mongoose.model('Bag'),
    Wishlist = mongoose.model('Wishlist'),
    async = require('async'),
    bcrypt = require('bcryptjs'),
    hat = require('hat'),
    ejs = require('ejs'),
    mailgun = require('mailgun-js')({ apiKey: global.MAILGUN_API_KEY, domain: global.MAILGUN_API_URL }),
    config = require('../config');

/*

$$$$$$$\             $$$$$$\  $$\           $$\   $$\     $$\                               
$$  __$$\           $$  __$$\ \__|          \__|  $$ |    \__|                              
$$ |  $$ | $$$$$$\  $$ /  \__|$$\ $$$$$$$\  $$\ $$$$$$\   $$\  $$$$$$\  $$$$$$$\   $$$$$$$\ 
$$ |  $$ |$$  __$$\ $$$$\     $$ |$$  __$$\ $$ |\_$$  _|  $$ |$$  __$$\ $$  __$$\ $$  _____|
$$ |  $$ |$$$$$$$$ |$$  _|    $$ |$$ |  $$ |$$ |  $$ |    $$ |$$ /  $$ |$$ |  $$ |\$$$$$$\  
$$ |  $$ |$$   ____|$$ |      $$ |$$ |  $$ |$$ |  $$ |$$\ $$ |$$ |  $$ |$$ |  $$ | \____$$\ 
$$$$$$$  |\$$$$$$$\ $$ |      $$ |$$ |  $$ |$$ |  \$$$$  |$$ |\$$$$$$  |$$ |  $$ |$$$$$$$  |
\_______/  \_______|\__|      \__|\__|  \__|\__|   \____/ \__| \______/ \__|  \__|\_______/ 
                                                                                                                                                                              
*/


/*

$$\   $$\           $$\                                         
$$ |  $$ |          $$ |                                        
$$ |  $$ | $$$$$$\  $$ | $$$$$$\   $$$$$$\   $$$$$$\   $$$$$$$\ 
$$$$$$$$ |$$  __$$\ $$ |$$  __$$\ $$  __$$\ $$  __$$\ $$  _____|
$$  __$$ |$$$$$$$$ |$$ |$$ /  $$ |$$$$$$$$ |$$ |  \__|\$$$$$$\  
$$ |  $$ |$$   ____|$$ |$$ |  $$ |$$   ____|$$ |       \____$$\ 
$$ |  $$ |\$$$$$$$\ $$ |$$$$$$$  |\$$$$$$$\ $$ |      $$$$$$$  |
\__|  \__| \_______|\__|$$  ____/  \_______|\__|      \_______/ 
                        $$ |                                    
                        $$ |                                    
                        \__|     
*/

function checkIfEmailExists(req, done) {

    var query = {
        email: req.body.email
    };

    User
        .findOne(query)
        .exec(function (err, user) {
            if (err) {
                return done({ status: 500, body: { error: err } });
            } else if (!user) {
                return done(null, req);
            } else {
                return done({ status: 409, body: { error: "a user with this email already exists" } });
            }
        });
}

function checkIfPhoneExists(req, done) {
    var query = {
        phone: '1' + req.body.phone
    };

    User
        .findOne(query)
        .exec(function (err, user) {
            if (err) {
                return done({ status: 500, body: { error: err } });
            } else if (!user) {
                return done(null, req);
            } else {
                return done({ status: 409, body: { error: "a user with this phone number already exists" } });
            }
        });
}

function checkIfUsernameExists(req, done) {
    var query = {
        username: req.body.username
    };

    User
        .findOne(query)
        .exec(function (err, user) {
            if (err) {
                return done({ status: 500, body: { error: err } });
            } else if (!user) {
                return done(null);
            } else {
                return done({ status: 409, body: { error: "a user with username already exists" } });
            }
        });


}


function bagCheck(user, done) {
    let query = {
        user: user._id
    }

    Bag.findOne(query)
        .exec(function (err, bag) {
            if (err) {
                return done({ status: 500, body: err });
            } else if (!bag) {
                var bag = Bag();
                bag.user = user._id;

                bag.save(function (err) {
                    if (err) {
                        winston.error("Error Creating Bag: ", err);
                        return done(null, user);
                    } else {
                        winston.info("Created Bag Successfully");
                        return done(null, user);
                    }
                });
            } else {
                return done(null, user);
            }
        });
}

function wishlistCheck(user, done) {
    let query = {
        user: user._id
    }

    Wishlist.findOne(query)
        .exec(function (err, wishlist) {
            if (err) {
                return done({ status: 500, body: err });
            } else if (!wishlist) {
                var wishlist = Wishlist();
                wishlist.user = user._id;

                wishlist.save(function (err) {
                    if (err) {
                        winston.error("Error Creating Bag: ", err);
                        return done(null, user);
                    } else {
                        winston.info("Created Bag Successfully");
                        return done(null, user);
                    }
                });
            } else {
                return done(null, user);
            }
        });
}




/*

 $$$$$$\  $$$$$$$\ $$$$$$\       $$$$$$$$\                  
$$  __$$\ $$  __$$\\_$$  _|      $$  _____|                 
$$ /  $$ |$$ |  $$ | $$ |        $$ |   $$$$$$$\   $$$$$$$\ 
$$$$$$$$ |$$$$$$$  | $$ |        $$$$$\ $$  __$$\ $$  _____|
$$  __$$ |$$  ____/  $$ |        $$  __|$$ |  $$ |\$$$$$$\  
$$ |  $$ |$$ |       $$ |        $$ |   $$ |  $$ | \____$$\ 
$$ |  $$ |$$ |     $$$$$$\       $$ |   $$ |  $$ |$$$$$$$  |
\__|  \__|\__|     \______|      \__|   \__|  \__|\_______/ 
                                                            
*/


// Create Single User (non-administrator)
exports.create = function (req, res) {

    req.checkBody('firstName', 'required').notEmpty();
    req.checkBody('lastName', 'required').notEmpty();
    req.checkBody('phone', 'required').notEmpty().isLength({ min: 10 });
    req.checkBody('email', 'required').notEmpty().isEmail();
    req.checkBody('password', 'required').notEmpty().isLength({ min: 8 });
    req.checkBody('month', 'required').notEmpty();
    req.checkBody('day', 'required').notEmpty();
    req.checkBody('admin', 'prohibited').not().notEmpty();

    if (req.validationErrors()) {
        return res.status(400).send({ errors: req.validationErrors() });
    }

    // Verify user does not exist
    async.waterfall([
        async.apply(checkIfEmailExists, req),
        checkIfPhoneExists,
        checkIfUsernameExists
    ], function (err) {
        if (err) {
            return res.status(err.status).send(err.body);
        } else {
            var user = User(req.body);
            user.admin = false;
            user.username = user.email;
            user.birthday = new Date("<1970-" + req.body.month + "-" + req.body.day + ">");

            user.save(function (err, usr) {
                if (err) {
                    return res.status(500).send(err);
                } else {
                    usr.password = "********";
                    var token = usr.generateToken();
                    res.set('Authorization', 'JWT ' + token);

                    async.waterfall([
                        async.apply(bagCheck, usr),
                        wishlistCheck
                    ], function (err) {
                        var text = "Welcome to Designica! You are receiving this message because you have recently created a new account on Designica.\n\n";
                        text += "This email is to confirm that your account has been created with the username " + usr.username + " and that you may be receiving occasional messages in the future at this address based on your activity on Designica.\n\n"
                        text += "Thank you from the Designica Team for creating an account, and we are looking forward to working with you in the future!"

                        ejs.renderFile('app/email_templates/account_created.ejs', { user: usr.firstName, username: usr.username }, function (err, htmlString) {
                            if (err) { console.error("ejs error", err); }

                            var data = {
                                from: 'Designica Jewelry <no-reply@designicajewelry.com>',
                                to: usr.email,
                                subject: "Welcome to " + global.APP_NAME + "!",
                                html: htmlString,
                                text: text
                            };

                            mailgun.messages().send(data, function (err, body) {
                                if (err) { res.status(500).send(err); }
                                res.status(200).send(usr);
                            });

                        });
                    });
                }
            });
        }
    });
};

// Create Single User (non-administrator)
exports.create_admin = function (req, res) {

    req.checkBody('firstName', 'required').notEmpty();
    req.checkBody('lastName', 'required').notEmpty();
    req.checkBody('phone', 'required').notEmpty().isLength({ min: 10 });
    req.checkBody('password', 'required').notEmpty().isLength({ min: 8 });
    req.checkBody('username', 'required').notEmpty();
    req.checkBody('email', 'prohibited').not().notEmpty();
    req.checkBody('admin', 'prohibited').not().notEmpty();

    if (req.validationErrors()) {
        return res.status(400).send({ errors: req.validationErrors() });
    }

    // Verify user does not exist
    async.waterfall([
        async.apply(checkIfEmailExists, req),
        checkIfPhoneExists,
        checkIfUsernameExists
    ], function (err) {
        if (err) {
            return res.status(err.status).send(err.body);
        } else {
            var user = User(req.body);
            user.admin = true;

            user.save(function (err, usr) {
                if (err) {
                    return res.status(500).send(err);
                } else {
                    usr.password = "********";
                    return res.status(201).send(usr);
                }
            });
        }
    });
    s
};

// Retrieve All Users (Non Administrators)
exports.retrieve_all = function (req, res) {

    query = {
        _id: { $exists: true },
        admin: false
    }

    var projection = {
        password: 0
    };

    User
        .find(query, projection)
        .sort("_updatedDate")
        .exec(function (err, users) {
            if (err) {
                return res.status(500).send(err);
            } else if (!users) {
                return res.status(200).send([]);
            } else {
                return res.status(200).send(users);
            }
        });

};

// Retrieve All Users (Administrators)
exports.retrieve_all_admins = function (req, res) {

    query = {
        _id: { $exists: true },
        admin: true
    }

    var projection = {
        password: 0
    };

    User
        .find(query, projection)
        .sort("_updatedDate")
        .exec(function (err, users) {
            if (err) {
                return res.status(500).send(err);
            } else if (!users) {
                return res.status(200).send([]);
            } else {
                return res.status(200).send(users);
            }
        });

};

// Retrieve Single User (non-administrator)
exports.retrieve = function (req, res) {

    req.checkParams('userId', 'required').notEmpty();

    if (req.validationErrors()) {
        return res.status(400).send({ errors: req.validationErrors() });
    }

    var query = {
        _id: req.params.userId
    };

    var projection = {
        password: 0
    };

    User
        .findOne(query, projection)
        .exec(function (err, user) {
            if (err) {
                return res.status(500).send(err);
            } else if (!user) {
                return res.status(404).send({ error: "User not found." });
            } else {
                return res.status(200).send(user);
            }
        });
};

// Update Single User (non-administrator)
exports.update = function (req, res) {

    req.checkParams('userId', 'required').notEmpty();
    req.checkParams('admin', 'prohibited').not().notEmpty();

    if (req.validationErrors()) {
        return res.status(400).send({ errors: req.validationErrors() });
    }

    var query = {
        _id: req.params.userId
    };

    User
        .update(query, req.body)
        .exec(function (err, user) {
            if (err) {
                return res.status(500).send(err);
            } else if (!user) {
                return res.status(404).send({ error: "User not found." });
            } else {
                return res.status(200).send(user);
            }
        });
};

// Delete Single User (non-administrator)
exports.delete = function (req, res) {

    req.checkParams('userId', 'User id is required').notEmpty();

    if (req.validationErrors()) {
        return res.status(400).send({ errors: req.validationErrors() });
    }

    var query = {
        _id: req.params.userId
    };

    User
        .remove(query)
        .exec(function (err) {
            if (err) {
                return res.status(500).send({ error: err });
            } else {
                return res.status(200).send({});
            }
        });
};

// Create Single User (non-administrator)
exports.add_address = function (req, res) {

    req.checkParams('userId', 'required').notEmpty();
    req.checkBody('name', 'required').notEmpty();
    req.checkBody('phone', 'required').notEmpty();
    req.checkBody('address1', 'required').notEmpty()
    req.checkBody('zip', 'required').notEmpty();
    req.checkBody('city', 'required').notEmpty();
    req.checkBody('state', 'required').notEmpty();
    req.checkBody('country', 'required').notEmpty();
    req.checkBody('twilio', 'required').notEmpty();

    if (req.validationErrors()) {
        return res.status(400).send({ errors: req.validationErrors() });
    }

    var query = {
        _id: req.params.userId
    };

    User
        .findOne(query)
        .exec(function (err, user) {
            if (err) {
                return res.status(500).send({ error: err });
            } else if (!user) {
                return res.status(404).send({ error: "User not found." });
            } else {
                // Add userId to body to have it added to new address
                req.body.user = req.params.userId;
                req.body._id = mongoose.Types.ObjectId();

                user.addresses.push(req.body);
                user.save(function (err, usr) {
                    if (err) {
                        return res.status(500).send({ error: err });
                    } else {
                        return res.status(201).send(req.body);
                    }
                })
            }
        })
};

// Delete Address from User
exports.remove_address = function (req, res) {
    req.checkParams('userId', 'required').notEmpty();
    req.checkParams('addressId', 'required').notEmpty();

    if (req.validationErrors()) {
        return res.status(400).send({ errors: req.validationErrors() });
    }

    var query = {
        _id: req.params.userId
    };

    User
        .findOne(query)
        .exec(function (err, user) {
            if (err) {
                return res.status(500).send({ error: err });
            } else if (!user) {
                return res.status(404).send({ error: "User not found." });
            } else {
                user.addresses.id(req.params.addressId).remove();

                if (user.billingAddress == req.params.addressId) {
                    user.billingAddress = undefined;
                }
                if (user.shippingAddress == req.params.addressId) {
                    user.shippingAddress = undefined;
                }

                user.save(function (err) {
                    if (err) {
                        return res.status(500).send({ error: err });
                    } else {
                        return res.status(200).send({});
                    }
                })
            }
        })
};

exports.update_address = function (req, res) {
    req.checkParams('userId', 'required').notEmpty();
    req.checkParams('addressId', 'required').notEmpty();

    if (req.validationErrors()) {
        return res.status(400).send({ errors: req.validationErrors() });
    }

    var query = {
        _id: req.params.userId
    };

    User
        .findOne(query)
        .exec(function (err, user) {
            if (err) {
                return res.status(500).send({ error: err });
            } else if (!user) {
                return res.status(404).send({ error: "User not found." });
            } else {
                let address = user.addresses.id(req.params.addressId);
                address.set(req.body);
                user.save(function (err) {
                    if (err) {
                        return res.status(500).send({ error: err });
                    } else {
                        return res.status(200).send({});
                    }
                })
            }
        })


}

exports.add_shipping_address = function (req, res) {
    req.checkParams('userId', 'required').notEmpty();
    req.checkParams('addressId', 'required').notEmpty();

    if (req.validationErrors()) {
        return res.status(400).send({ errors: req.validationErrors() });
    }

    var query = {
        _id: req.params.userId
    };

    User
        .findOne(query)
        .exec(function (err, user) {
            if (err) {
                return res.status(500).send({ error: err });
            } else if (!user) {
                return res.status(404).send({ error: "User not found." });
            } else {
                let address = user.addresses.id(req.params.addressId);
                if (address != undefined) {
                    user.shippingAddress = req.params.addressId;
                }

                user.save(function (err) {
                    if (err) {
                        return res.status(500).send({ error: err });
                    } else {
                        return res.status(200).send({});
                    }
                })
            }
        })
}

exports.add_billing_address = function (req, res) {
    req.checkParams('userId', 'required').notEmpty();
    req.checkParams('addressId', 'required').notEmpty();

    if (req.validationErrors()) {
        return res.status(400).send({ errors: req.validationErrors() });
    }

    var query = {
        _id: req.params.userId
    };

    User
        .findOne(query)
        .exec(function (err, user) {
            if (err) {
                return res.status(500).send({ error: err });
            } else if (!user) {
                return res.status(404).send({ error: "User not found." });
            } else {
                let address = user.addresses.id(req.params.addressId);
                if (address != undefined) {
                    user.billingAddress = req.params.addressId;
                }
                user.save(function (err) {
                    if (err) {
                        return res.status(500).send({ error: err });
                    } else {
                        return res.status(200).send({});
                    }
                })
            }
        })
}

// Change Password
// POST {{HOST}}/user/:userId/change/password
exports.change_password = function (req, res) {
    req.checkParams('userId', 'required').notEmpty();
    req.checkBody('previous', 'required').notEmpty();
    req.checkBody('password', 'required').notEmpty();

    if (req.validationErrors()) {
        return res.status(400).send({ errors: req.validationErrors() });
    }

    var query = {
        _id: req.params.userId
    };

    User
        .findOne(query)
        .exec(function (err, user) {
            if (err) {
                return res.status(500).send({ error: err });
            } else if (!user) {
                return res.status(404).send({ error: "User not found." });
            } else {
                user.isValidPassword(req.body.previous, function (err, isValid) {
                    if (err) {
                        return res.status(500).send({ error: err });
                    } else if (!isValid) {
                        return res.status(401).send({ error: "Password error. Not authorized." });
                    } else {
                        user.password = req.body.password;
                        user.save(function (err) {
                            if (err) {
                                return res.status(500).send({ error: err });
                            } else {
                                return res.status(200).send({});
                            }
                        });
                    }
                });
            }
        });
}

exports.search = function (req, res) {

    var query = {};

    if (req.body.email) {
        query['email'] = req.body.email;
    }

    if (req.body.firstName) {
        query['firstName'] = req.body.firstName;
    }

    if (req.body.lastName) {
        query['lastName'] = req.body.lastName;
    }

    if (req.body.phone) {
        query['phone'] = req.body.phone;
    }

    var projection = {
        password: 0
    };

    User.find(query, projection)
        .exec(function (err, users) {
            if (err) {
                return res.status(500).send(err);
            } else if (!users) {
                return res.status(200).send([]);
            } else {
                return res.status(200).send(users);
            }
        });
}

/*
$$$$$$$\                                                                       $$\ 
$$  __$$\                                                                      $$ |
$$ |  $$ |$$$$$$\   $$$$$$$\  $$$$$$$\ $$\  $$\  $$\  $$$$$$\   $$$$$$\   $$$$$$$ |
$$$$$$$  |\____$$\ $$  _____|$$  _____|$$ | $$ | $$ |$$  __$$\ $$  __$$\ $$  __$$ |
$$  ____/ $$$$$$$ |\$$$$$$\  \$$$$$$\  $$ | $$ | $$ |$$ /  $$ |$$ |  \__|$$ /  $$ |
$$ |     $$  __$$ | \____$$\  \____$$\ $$ | $$ | $$ |$$ |  $$ |$$ |      $$ |  $$ |
$$ |     \$$$$$$$ |$$$$$$$  |$$$$$$$  |\$$$$$\$$$$  |\$$$$$$  |$$ |      \$$$$$$$ |
\__|      \_______|\_______/ \_______/  \_____\____/  \______/ \__|       \_______|
                                                                                   
*/

// Step 1 of Password Reset Process.  Request a token to be emailed to the specified Administrator's email on file
// POST {{HOST}}/user/:email/begin/password/password
exports.begin_password_reset = function (req, res) {

    // Validations
    req.checkParams('email', 'required');

    if (req.validationErrors()) {
        return res.status(400).send({ errors: req.validationErrors() });
    }

    var query = { email: req.params.email };

    User.findOne(query, function (err, user) {
        if (!user) { return res.status(404).send({ error: "User account not found." }); }

        var rack = hat.rack(128, 16, 2);
        var token = rack();

        user._resetPasswordToken = token;
        user._resetPasswordExpires = Date.now() + (60 * 60 * 1000); // 1 hour

        user.save(function (err) {
            if (err) { res.status(500).send(err); }
            else {

                var text = "You are receiving this because you (or someone else) have requested to reset the password for your account. If you did not request this, please ignore this email and your password will remain unchanged. Please click the link below to reset your password.";

                var link = global.APP_BASE_URL + global.APP_PASSWORD_RESET_URL + "?email=" + user.email + "&token=" + user._resetPasswordToken;

                ejs.renderFile('app/email_templates/password_reset_request.ejs', { user: user.firstName, password_reset_link: link }, function (err, htmlString) {
                    if (err) { console.error("ejs error", err); }

                    var data = {
                        from: 'Designica Jewelry <no-reply@designicajewelry.com>',
                        to: user.email,
                        subject: "Reset your " + global.APP_NAME + " password",
                        html: htmlString,
                        text: text + "\n\n" + link
                    };

                    mailgun.messages().send(data, function (err, body) {
                        if (err) { res.status(500).send(err); }
                        res.status(200).send({});
                    });

                });

            }
        });

    })
};

// Step 2 of Password Reset Process.  Reset the administrator's password
// POST {{HOST}}/administrators/:email/password/password
exports.reset_password = function (req, res) {

    // Validations
    req.checkBody('token', 'required');
    req.checkBody('password', 'required');
    req.checkParams('email', 'required');

    if (req.validationErrors()) {
        return res.status(400).send({ errors: req.validationErrors() });
    }

    var query = {
        _resetPasswordToken: req.body.token,
        _resetPasswordExpires: {
            $gt: Date.now()
        }
    };

    User.findOne(query, function (err, user) {
        if (!user) {
            return res
                .status(404)
                .send({
                    error_code: 'E_INVALID_TOKEN',
                    message: 'Token is invalid or expired.'
                })
        }

        user.password = req.body.password;
        user._resetPasswordToken = undefined;
        user._resetPasswordExpires = undefined;

        user.save(function (err) {
            if (err) { res.status(500).send(err); }
            else {

                var text = "This is a confirmation that your password has been changed. If you did not make this change, please contact us immediately at support@designicajewelry.com";
                var link = global.APP_BASE_URL + global.APP_PASSWORD_RESET_URL + "?email=" + user.email + "&token=" + user._resetPasswordToken;

                ejs.renderFile('app/email_templates/password_reset_success.ejs', { user: user.firstName }, function (err, htmlString) {
                    if (err) { console.error("ejs error", err); }

                    var data = {
                        from: 'Designica Jewelry <no-reply@designicajewelry.com>',
                        to: user.email,
                        subject: "You've successfully reset your " + global.APP_NAME + " account password",
                        html: htmlString,
                        text: text + "\n\n"
                    };

                    mailgun.messages().send(data, function (err, body) {
                        if (err) { res.status(500).send(err); }
                        console.log(body);
                        res.status(200).send({});
                    });

                });

            }

        });
    });

};
/**
 * defaults.js
 *
 * AS3ICS Backend
 * by AS3ICS
 * 
 * Zachary DeGeorge
 * zach@as3ics.com
 *
 */

const e = require('express');

/*
Load and initialize all the model files
*/

require('./models/user.js');
require('./models/photo.js');
require('./models/sku.js');
require('./models/product.js');
require('./models/macros.js');
require('./models/shop.js');
require('./models/promotion.js');
require('./models/review.js');
require('./models/settings.js');
require('./models/statistic.js');

var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Variant = mongoose.model('Variant'),
    Macros = mongoose.model('Macros'),
    Group = mongoose.model('Group'),
    Setting = mongoose.model('Setting');

module.exports.set = function (fs, winston, app) {

    winston.info("Check if Admin exists...");

    var query = {
        _id: { $exists: true },
        admin: true
    }

    User.find(query)
        .exec(function (err, users) {
            if (err) {
                winston.error("Error searching for loaded admins:", err);
            } else if (users.length >= 1) {
                winston.info("Admin Exists.");
            } else {
                winston.info("No Admins exist. Create default one.");

                var user = User();
                user.firstName = process.env.DEFAULT_ADMIN_FNAME;
                user.lastName = process.env.DEFAULT_ADMIN_LNAME;
                user.email = process.env.DEFAULT_ADMIN_EMAIL;
                user.phone = process.env.DEFAULT_ADMIN_PHONE;
                user.twilio = "1" + process.env.DEFAULT_ADMIN_PHONE.replace(/[^0-9]/g, '');
                user.password = process.env.DEFAULT_ADMIN_PASSWORD;
                user.username = process.env.DEFAULT_ADMIN_USERNAME;
                user.adminSettings.role = process.env.DEFAULT_ROLE;
                user.adminSettings.security_level = process.env.DEFAULT_SECURITY_LEVEL;
                user.gender = process.env.DEFAULT_GENDER;
                user.admin = true;

                user.save(function (err) {
                    if (err) {
                        winston.error("Error creating Default Admin:", err);
                    } else {
                        winston.info("Created Default Admin");
                    }
                });
            }
        });

    winston.info("Check if defualt Variant exists...");

    Variant.findOne({ sku_shortcode: "NV" })
        .exec(function (err, variant) {
            if (err) {
                winston.error("Error searching for default variant: ", err);
            } else if (variant) {
                winston.info("Default Variant Exists.");
            } else {
                winston.info("Default Variant does not exist. Create default one.");

                var variant = Variant();
                variant.name = "No Variant";
                variant.sku_shortcode = "NV";
                variant.display = false;

                variant.save(function (err) {
                    if (err) {
                        winston.error("Error creating Default Variant:", err);
                    } else {
                        winston.info("Created Default Variant");
                    }
                });
            }
        });

    winston.info("Check if Macros model initiated");

    Macros.findOne({ name: global.MACROS_DB_NAME })
        .exec(function (err, macros) {
            if (err) {
                winston.error("Error searching for default macros model: ", err);
            } else if (macros) {
                winston.info("Default Macros model exists");
            } else {
                winston.info("Default Macros model does not exist. Create it.");

                var macros = Macros();
                macros.name = global.MACROS_DB_NAME;
                macros.count = 0;

                macros.save(function (err) {
                    if (err) {
                        winston.error("Error creating default Macros model: ", err);
                    } else {
                        winston.info("Created default Macros model")
                    }
                });
            }
        });

    winston.info("Check if default Group exists");

    Group.findOne({ name: global.DEFAULT_GROUP_NAME })
        .exec(function (err, group) {
            if (err) {
                winston.error("Error searching for defualt Group: ", err);
            } else if (group) {
                winston.info("Default Group model exists");
            } else {
                winston.info("Default Group does not exists. Create it.");

                var group = Group();
                group.name = global.DEFAULT_GROUP_NAME;
                group.sku_shortcode = global.DEFAULT_GROUP_SKU;
                group.display = false;

                group.save(function (err) {
                    if (err) {
                        winston.error("Error creating default Group: ", err);
                    } else {
                        winston.info("Created default Group");
                    }
                });
            }
        });

    winston.info("Check if default Setting exists");

    Setting.findOne({ name: global.DEFAULT_SETTINGS_DOCUMENT_NAME })
        .exec(function (err, setting) {
            if (err) {
                winston.error("Error searching for default Setting: ", err);
            } else if (setting) {
                winston.info("Default Setting exists");
            } else {
                winston.info("Default Setting does not exist. Create it.");

                var setting = Setting();
                setting.name = global.DEFAULT_SETTINGS_DOCUMENT_NAME;

                setting.save(function (err) {
                    if (err) {
                        winston.err("Error creating default Setting: ", err);
                    } else {
                        winston.info("Created default Setting");
                    }
                });
            }
        });

    winston.info("Check if Logs folder exists...");

    if (!fs.existsSync(app.config.server.logs_path)) {
        winston.info("Logs folder doesnt exist.  Create it.");
        fs.mkdirSync(app.config.server.logs_path);
    } else {
        winston.info("Logs folder Exists.");
    }
}
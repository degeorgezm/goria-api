/**
 * authentication.js
 *
 * api.goria.com
 * by AS3ICS
 *
 * Zach DeGeorge
 * zach@as3ics.com
 *
 * Authentication Controller
 *
 * @format
 */

var mongoose = require("mongoose"),
  Wishlist = mongoose.model("Wishlist"),
  Bag = mongoose.model("Bag"),
  winston = require("winston"),
  async = require("async");

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

function bagCheck(req, res, done) {
  let query = {
    user: req.user._id,
  };

  Bag.findOne(query).exec(function (err, bag) {
    if (err) {
      return done({ status: 500, body: err });
    } else if (!bag) {
      var bag = Bag();
      bag.user = req.user._id;

      bag.save(function (err) {
        if (err) {
          winston.error("Error Creating Bag: ", err);
          return done({ status: 500, body: err });
        } else {
          winston.info("Created Bag Successfully");
          return done(null, req, res);
        }
      });
    } else {
      return done(null, req, res);
    }
  });
}

function wishlistCheck(req, res, done) {
  let query = {
    user: req.user._id,
  };

  Wishlist.findOne(query).exec(function (err, wishlist) {
    if (err) {
      return done({ status: 500, body: err });
    } else if (!wishlist) {
      var wishlist = Wishlist();
      wishlist.user = req.user._id;

      wishlist.save(function (err) {
        if (err) {
          winston.error("Error Creating Bag: ", err);
          return done({ status: 500, body: err });
        } else {
          winston.info("Created Bag Successfully");
          return done(null, req, res);
        }
      });
    } else {
      return done(null, req, res);
    }
  });
}

// controllers.permissions.auth.BASIC actually does the authentication using username and password.
// This function is called after that function successfully authenticates, returning the JWT
// This is the 3rd function run using the endpoint POST {{HOST}}/authenticate/administrator
exports.authenticate = function (req, res) {
  async.waterfall(
    [async.apply(bagCheck, req, res), wishlistCheck],
    function (err, req, res) {
      if (err) {
        return res.status(err.status).send(err.body);
      } else {
        res
          .status(200)
          .set("Authorization", "JWT " + req.token)
          .send(req.user);
      }
    }
  );
};

exports.verifyToken = function (req, res) {
  if (req.user != undefined) {
    return res.status(200).send({
      admin: req.user.admin,
      _updatedDate: req.user._updatedDate,
    });
  } else {
    return res.status(401).send({});
  }
};

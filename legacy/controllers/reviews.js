/**
 * reviews.js
 *
 * api.goria.com
 * by AS3ICS
 *
 * Zach DeGeorge
 * zach@as3ics.com
 *
 * Reviews Controller
 *
 * @format
 */

var mongoose = require("mongoose"),
  winston = require("winston"),
  async = require("async"),
  Review = mongoose.model("Review"),
  Product = mongoose.model("Product"),
  User = mongoose.model("User"),
  deepPopulate = require("mongoose-deep-populate")(mongoose);

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

// Check If Can Leave Review On Product
// GET {{HOST}}/reviews/:userId/product/:productId
exports.check_review_product = function (req, res) {
  req.checkParams("userId", "required").notEmpty();
  req.checkParams("productId", "required").notEmpty();

  if (req.validationErrors()) {
    return res.status(400).send({ errors: req.validationErrors() });
  }

  let query = {
    user: req.params.userId,
    product: req.params.productId,
  };

  Review.findOne(query).exec(function (err, review) {
    if (err) {
      return res.status(500).send({ error: err });
    } else {
      // If no reviews for that User and that Product exist return Success, else return Error
      if (!review) {
        return res.status(200).send({});
      } else {
        return res.status(401).send({ _id: review._id });
      }
    }
  });
};

// Create Review On Product
// POST {{HOST}}/reviews/:userId/product/:productId
exports.create_review = function (req, res) {
  req.checkParams("userId", "required").notEmpty();
  req.checkParams("productId", "required").notEmpty();
  req.checkBody("title", "required").notEmpty();
  req.checkBody("review", "required").notEmpty();
  req.checkBody("rating", "required").notEmpty();

  if (req.validationErrors()) {
    return res.status(400).send({ errors: req.validationErrors() });
  }

  req.body["user"] = req.params.userId;
  req.body["product"] = req.params.productId;

  let review = Review(req.body);

  review.save(function (err, _review) {
    if (err) {
      return res.status(500).send({ error: err });
    } else {
      return res.status(200).send(_review);
    }
  });
};

// Retrieve Review On A Product
// Get {{HOST}}/reviews/product/:productId
exports.retrieve_reviews = function (req, res) {
  req.checkParams("productId", "required").notEmpty();

  if (req.validationErrors()) {
    return res.status(400).send({ errors: req.validationErrors() });
  }

  let query = {
    product: req.params.productId,
  };

  Review.find(query)
    .deepPopulate(
      "user user.image product product.type product.groups product.departments product.sizes product.variants product.brands product.image product.images product.user product.user.image product.stock.variant"
    )
    .exec(function (err, reviews) {
      if (err) {
        return res.status(500).send({ error: err });
      } else if (!reviews) {
        return res.status(200).send([]);
      } else {
        return res.status(200).send(reviews);
      }
    });
};

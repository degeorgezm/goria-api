/**
 * promotions.js
 *
 * AS3ICS Backend
 * by AS3ICS
 *
 * Zachary DeGeorge
 * zach@as3ics.com
 *
 * Promotions Controller
 */

var mongoose = require('mongoose'),
    winston = require('winston'),
    async = require('async'),
    Promotion = mongoose.model('Promotion'),
    Department = mongoose.model('Department'),
    Type = mongoose.model('Type'),
    Brand = mongoose.model('Brand'),
    Group = mongoose.model('Group'),
    Variant = mongoose.model('Variant'),
    Product = mongoose.model('Product'),
    deepPopulate = require('mongoose-deep-populate')(mongoose);

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

function retrievePromotion(req, done) {

    var query = {
        _id: req.params.promotionId
    };

    Promotion
        .findOne(query)
        .exec(function (err, promotion) {
            if (err) {
                return done({ status: 500, body: { error: err } });
            } else if (!promotion) {
                return done({ status: 404, body: { error: "Promotion not found." } });
            } else {
                return done(null, promotion);
            }
        });
}

function retrieveProducts(promotion, done) {

    let or = [];

    for (let i = 0; i < promotion.brands.length; i++) {
        or.push({ brand: promotion.brands[i] });
    }

    for (let i = 0; i < promotion.departments.length; i++) {
        or.push({ department: promotion.departments[i] });
    }

    for (let i = 0; i < promotion.types.length; i++) {
        or.push({ type: promotion.types[i] });
    }

    for (let i = 0; i < promotion.variants.length; i++) {
        or.push({ variants: promotion.variants[i] });
    }

    for (let i = 0; i < promotion.groups.length; i++) {
        or.push({ groups: promotion.groups[i] });
    }

    let query = {
        $or: or
    }

    Product.find(query)
        .sort({ '_creationDate': - 1 })
        .deepPopulate('image type department sizes variants stock.variant stock.size brand groups images price_changes.user sales.user')
        .exec(function (err, products) {
            if (err) {
                return done({ status: 500, body: { error: err } });
            } else if (!products) {
                return done(null, []);
            } else {
                return done(null, products);
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

// Create Promotion
// POST {{HOST}}/promotion
exports.create = function (req, res) {

    req.checkBody('title', 'required').notEmpty();
    req.checkBody('type', 'required').notEmpty();
    req.checkBody('value', 'required').notEmpty();
    req.checkBody('minimum', 'required').notEmpty();
    req.checkBody('maximum', 'required').notEmpty();
    req.checkBody('start', 'required').notEmpty();
    req.checkBody('end', 'required').notEmpty();
    req.checkBody('user', 'required').notEmpty();
    req.checkBody('stackable', 'required').notEmpty();
    req.checkBody('free_shipping', 'required').notEmpty();

    if (req.validationErrors()) {
        return res.status(400).send({ errors: req.validationErrors() });
    }

    var promotion = Promotion(req.body);
    promotion.save(function (err, promo) {
        if (err) {
            return res.status(500).send(err);
        } else {
            return res.status(201).send(promo);
        }
    });
}

// Retrieve All Promotions
// GET {{HOST}}/promotion
exports.retrieve_all = function (req, res) {

    query = {
        _id: { $exists: true }
    }

    projection = {
        user: 0
    }

    Promotion
        .find(query, projection)
        .sort("_updatedDate")
        .deepPopulate('brands departments types variants groups')
        .exec(function (err, promotions) {
            if (err) {
                return res.status(500).send(err);
            } else if (!promotions) {
                return res.status(200).send([]);
            } else {
                return res.status(200).send(promotions);
            }
        });
}

// Retrieve Single Promotion
// GET {{HOST}}/promotion/:promotionId
exports.retrieve = function (req, res) {

    req.checkParams('promotionId', 'required').notEmpty();

    if (req.validationErrors()) {
        return res.status(400).send({ errors: req.validationErrors() });
    }

    var query = {
        _id: req.params.promotionId
    };

    var projection = {
        user: 0
    };

    Promotion
        .findOne(query, projection)
        .deepPopulate('brands departments types variants groups')
        .exec(function (err, promotion) {
            if (err) {
                return res.status(500).send(err);
            } else if (!promotion) {
                return res.status(404).send({ error: "Promotion not found." });
            } else {
                return res.status(200).send(promotion);
            }
        });
};


// Update Promotion
// POST {{HOST}}/promotion/:promotionId
exports.update = function (req, res) {

    req.checkParams('promotionId', 'required').notEmpty();
    req.checkBody('user', 'required').notEmpty();

    if (req.validationErrors()) {
        return res.status(400).send({ errors: req.validationErrors() });
    }

    var query = {
        _id: req.params.promotionId
    };

    Promotion
        .update(query, req.body)
        .exec(function (err, result) {
            if (err) {
                return res.status(500).send(err);
            } else {
                return res.status(200).send(result);
            }
        });
}


// Get Products of Promotion
// GET {{HOST}}/promotion/:promotionId/products
exports.get_products = function (req, res) {

    req.checkParams('promotionId', 'required').notEmpty();

    if (req.validationErrors()) {
        return res.status(400).send({ errors: req.validationErrors() });
    }

    async.waterfall([
        async.apply(retrievePromotion, req),
        retrieveProducts
    ], function (err, products) {
        if (err) {
            return res.status(err.status).send(err.body);
        } else {
            return res.status(200).send(products);
        }
    });
}
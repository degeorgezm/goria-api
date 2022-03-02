/**
 * products.js
 *
 * AS3ICS Backend
 * by AS3ICS
 * 
 * Zachary DeGeorge
 * zach@as3ics.com
 *
 * Products Controller
 */

var mongoose = require('mongoose'),
    winston = require('winston'),
    async = require('async'),
    Department = mongoose.model('Department'),
    Type = mongoose.model('Type'),
    Size = mongoose.model('Size'),
    Brand = mongoose.model('Brand'),
    Group = mongoose.model('Group'),
    Variant = mongoose.model('Variant'),
    Product = mongoose.model('Product'),
    Macros = mongoose.model('Macros'),
    Promotion = mongoose.model('Promotion'),
    Sale = mongoose.model('Sale'),
    deepPopulate = require('mongoose-deep-populate')(mongoose),
    sku = require('./skus'),
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

function pad(num, size) {
    num = num.toString();
    while (num.length < size) num = "0" + num;
    return num;
}

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

function getVariantShortcodes(req, object, done) {

    object["variant-shortcodes"] = []
    Variant.find({ _id: { $exists: true } })
        .exec(function (err, variants) {
            if (err) {
                return done({ status: 500, body: { error: err } });
            } else {
                for (let i = 0; i < req.body["variants"].length; i++) {
                    for (let j = 0; j < variants.length; j++) {
                        if (req.body["variants"][i] == variants[j]["_id"]) {
                            object["variant-shortcodes"].push(variants[j]["sku_shortcode"]);
                            continue;
                        }
                    }
                }
                return done(null, req, object);
            }
        });
}

function getSizeShortcodes(req, object, done) {

    object["size-shortcodes"] = []
    Size.find({ _id: { $exists: true } })
        .exec(function (err, sizes) {
            if (err) {
                return done({ status: 500, body: { error: err } });
            } else {
                for (let i = 0; i < req.body["sizes"].length; i++) {
                    for (let j = 0; j < sizes.length; j++) {
                        if (req.body["sizes"][i] == sizes[j]["_id"]) {
                            object["size-shortcodes"].push(sizes[j]["sku_shortcode"]);
                            continue;
                        }
                    }
                }
                return done(null, req, object);
            }
        });
}

function getDepartmentShortcodes(req, object, done) {

    Department.findOne({ _id: req.body["department"] })
        .exec(function (err, department) {
            if (err) {
                return done({ status: 500, body: { error: err } });
            } else {
                object["department-shortcodes"] = department["sku_shortcode"];
                return done(null, req, object);
            }
        });
}

function getTypeShortcodes(req, object, done) {

    Type.findOne({ _id: req.body["type"] })
        .exec(function (err, type) {
            if (err) {
                return done({ status: 500, body: { error: err } });
            } else {
                object["type-shortcodes"] = type["sku_shortcode"];
                return done(null, req, object);
            }
        });
}

function getBrandShortcodes(req, object, done) {

    Brand.findOne({ _id: req.body["brand"] })
        .exec(function (err, brand) {
            if (err) {
                return done({ status: 500, body: { error: err } });
            } else {
                object["brand-shortcodes"] = brand["sku_shortcode"];
                return done(null, req, object);
            }
        });
}

function getMacrosCount(req, object, done) {

    Macros.findOne({ name: global.MACROS_DB_NAME })
        .exec(function (err, macros) {
            if (err) {
                return done({ status: 500, body: { error: err } });
            } else {
                let count = macros.count;
                object["macros-count"] = count;
                object["updated-count"] = count++;
                return done(null, req, object);
            }
        });
}

function updateMacrosCount(req, object, done) {

    Macros.update({ name: global.MACROS_DB_NAME },
        { $inc: { count: 1 } })
        .exec(function (err, result) {
            if (err) {
                return done({ status: 500, body: { error: err } });
            } else {
                return done(null, req, object);
            }
        });
}

function retrieveLeanProduct(req, done) {

    var query = {
        _id: req.params.productId
    };

    Product
        .findOne(query)
        .exec(function (err, product) {
            if (err) {
                return done({ status: 500, body: { error: err } });
            } else if (!product) {
                return done({ status: 404, body: { error: "Product not found." } });
            } else {
                return done(null, req, product);
            }
        });
}

function retrievePromotions(req, product, done) {

    let query = {
        _id: { $exists: true }
    }

    let or = [];
    for (let i = 0; i < product.variants.length; i++) {
        or.push({ variants: product.variants[i] });
    }

    for (let i = 0; i < product.groups.length; i++) {
        or.push({ groups: product.groups[i] });
    }

    or.push({ types: product.type });
    or.push({ brands: product.brand });
    or.push({ department: product.department });

    query["$or"] = or;

    let now = new Date().toISOString();
    query.start = { $lte: now };
    query.end = { $gte: now };

    Promotion.find(query)
        .deepPopulate('brands departments types variants groups')
        .exec(function (err, promotions) {
            if (err) {
                return done({ status: 500, body: { error: err } });
            } else if (promotions.length == 0) {
                return done(null, req, []);
            } else {
                return done(null, req, promotions);
            }
        });
}


function retrieveProduct(req, promotions, done) {

    var query = {
        _id: req.params.productId
    };

    Product
        .findOne(query)
        .deepPopulate('image type department sizes variants stock.variant stock.size brand groups images price_changes.user sales.user')
        .exec(function (err, product) {
            if (err) {
                return done({ status: 500, body: { error: err } });
            } else if (!product) {
                return done({ status: 404, body: { error: "Product not found." } });
            } else {
                return done(null, product, promotions);
            }
        });
}


function retrieveLeanProducts(req, done) {

    console.log(req.query);

    let query = req.query ? {} : {
        _id: { $exists: true }
    }

    if (req.query.brand) {
        let brands = req.query.brand ? req.query.brand.split(",") : [];
        query.brand = { $in: brands };
    }

    if (req.query.department) {
        let departments = req.query.department ? req.query.department.split(",") : [];
        query.department = { $in: departments }
    }

    if (req.query.type) {
        let types = req.query.type ? req.query.type.split(",") : [];
        query.type = { $in: types };
    }

    let or = [];
    if (req.query.variant) {
        let variants = req.query.variant ? req.query.variant.split(",") : [];

        variants.forEach(element => {
            or.push({ variants: element });
        })
    }

    if (req.query.size) {
        let sizes = req.query.size ? req.query.size.split(",") : [];
        sizes.forEach(element => {
            or.push({ sizes: element });
        })
    }

    if (or.length > 0) {
        query["$or"] = or;
    }

    if (req.query.minPrice && req.query.maxPrice) {
        let minPrice = req.query.minPrice;
        let maxPrice = req.query.maxPrice;
        query.price = { $gte: minPrice, $lte: maxPrice };
    }

    if (req.query.limit && req.query.skip) {
        Product
            .find(query)
            .skip(parseInt(req.query.skip))
            .limit(parseInt(req.query.limit))
            .sort({ '_creationDate': - 1 })
            .exec(function (err, products) {
                if (err) {
                    return done({ status: 500, body: { error: err } });
                } else if (!products) {
                    return done(null, []);
                } else {
                    return done(null, req, products)
                }
            });
    } else {
        Product.find(query)
            .sort({ '_creationDate': - 1 })
            .exec(function (err, products) {
                if (err) {
                    return done({ status: 500, body: { error: err } });
                } else if (!products) {
                    return done(null, []);
                } else {
                    return done(null, req, products)
                }
            });
    }
}

function retrieveProductPromotions(products, array, counter, done) {

    let query = {
        _id: { $exists: true }
    }

    let or = [];
    for (let i = 0; i < products[counter].variants.length; i++) {
        or.push({ variants: products[counter].variants[i] });
    }

    for (let i = 0; i < products[counter].groups.length; i++) {
        or.push({ groups: products[counter].groups[i] });
    }

    or.push({ types: products[counter].type });
    or.push({ brands: products[counter].brand });
    or.push({ department: products[counter].department });

    if (or.length > 0) {
        query["$or"] = or;
    }

    let now = new Date().toISOString();
    query.start = { $lte: now };
    query.end = { $gte: now };

    Promotion.find(query)
        .deepPopulate('brands departments types variants groups')
        .exec(function (err, promotions) {
            if (err) {
                return done({ status: 500, body: { error: err } });
            } else if (promotions.length == 0) {
                winston.info("*** No Promotions Found ***");
                array.push([]);
                return done(null, products, array, ++counter);
            } else {
                winston.info("*** " + promotions.length + " Promotions Found ***");
                array.push(promotions);
                return done(null, products, array, ++counter);
            }
        });
}

function retrieveProductsPromotions(req, products, done) {

    let functions = [];
    let array = [];
    let counter = 0;

    if (products.length > 0) {
        functions.push(async.apply(retrieveProductPromotions, products, array, counter));
    } else {
        return done(null, req, []);
    }

    for (let i = 1; i < products.length; i++) {
        functions.push(retrieveProductPromotions);
    }

    async.waterfall(
        functions
        , function (err, products, promotions, counter) {
            if (err) {
                return done({ status: 500, body: { error: err } });
            } else {
                return done(null, req, promotions);
            }
        });
}

function retrieveProducts(req, promotions, done) {

    let query = req.query ? {} : {
        _id: { $exists: true }
    }

    if (req.query.brand) {
        let brands = req.query.brand ? req.query.brand.split(",") : [];
        query.brand = { $in: brands };
    }

    if (req.query.department) {
        let departments = req.query.department ? req.query.department.split(",") : [];
        query.department = { $in: departments }
    }

    if (req.query.type) {
        let types = req.query.type ? req.query.type.split(",") : [];
        query.type = { $in: types };
    }

    let or = [];
    if (req.query.variant) {
        let variants = req.query.variant ? req.query.variant.split(",") : [];

        variants.forEach(element => {
            or.push({ variants: element });
        })
    }

    if (req.query.size) {
        let sizes = req.query.size ? req.query.size.split(",") : [];
        sizes.forEach(element => {
            or.push({ sizes: element });
        })
    }

    if (or.length > 0) {
        query["$or"] = or;
    }

    if (req.query.minPrice && req.query.maxPrice) {
        let minPrice = req.query.minPrice;
        let maxPrice = req.query.maxPrice;
        query.price = { $gte: minPrice, $lte: maxPrice };
    }

    if (req.query.limit && req.query.skip) {
        Product
            .find(query)
            .skip(parseInt(req.query.skip))
            .limit(parseInt(req.query.limit))
            .sort({ '_creationDate': - 1 })
            .deepPopulate('image type department sizes variants stock.variant stock.size brand groups images price_changes.user sales.user')
            .exec(function (err, products) {
                if (err) {
                    return done({ status: 500, body: { error: err } });
                } else if (!products) {
                    return done(null, []);
                } else {

                    let productsOut = [];
                    for (let i = 0; i < products.length; i++) {
                        let json = JSON.parse(JSON.stringify(products[i]));
                        if (promotions[i] != undefined) json.promotions = JSON.parse(JSON.stringify(promotions[i]));
                        productsOut.push(json);
                    }

                    return done(null, productsOut)
                }
            });
    } else {
        Product.find(query)
            .sort({ '_creationDate': - 1 })
            .deepPopulate('image type department sizes variants stock.variant stock.size brand groups images price_changes.user sales.user')
            .exec(function (err, products) {
                if (err) {
                    return done({ status: 500, body: { error: err } });
                } else if (!products) {
                    return done(null, []);
                } else {

                    let productsOut = [];
                    for (let i = 0; i < products.length; i++) {
                        let json = JSON.parse(JSON.stringify(products[i]));
                        if (promotions[i] != undefined) json.promotions = JSON.parse(JSON.stringify(promotions[i]));
                        productsOut.push(json);
                    }

                    return done(null, productsOut)
                }
            });
    }

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

// Create Product
// POST {{HOST}}/product
exports.create = function (req, res) {

    req.checkBody('title', 'required').notEmpty();
    req.checkBody('description', 'required').notEmpty();
    req.checkBody('type', 'required').notEmpty();
    req.checkBody('department', 'required').notEmpty();
    req.checkBody('price', 'required').notEmpty();
    req.checkBody('sizes', 'required').notEmpty();
    req.checkBody('groups', 'required').notEmpty();
    req.checkBody('variants', 'required').notEmpty();
    req.checkBody('user', 'required').notEmpty();

    if (req.validationErrors()) {
        return res.status(400).send({ errors: req.validationErrors() });
    }

    if (req.body["variants"].length != 0 && req.body["sizes"].length != 0) {
        // do stuff

        let obj = {};
        async.waterfall([
            async.apply(getVariantShortcodes, req, obj),
            getVariantShortcodes,
            getSizeShortcodes,
            getDepartmentShortcodes,
            getTypeShortcodes,
            getBrandShortcodes,
            getMacrosCount,
            updateMacrosCount
        ], function (err, req, object) {
            if (err) {
                return res.status(err.status).send(err.body);
            } else {

                let variantShortcodes = object["variant-shortcodes"];
                let sizeShortcodes = object["size-shortcodes"];
                let departmentShortcode = object["department-shortcodes"];
                let typeShortcode = object["type-shortcodes"];
                let brandShortcode = object["brand-shortcodes"];
                let count = object["macros-count"].toString();

                req.body["stock"] = [];

                let start = brandShortcode + "-";
                let len = start.length + count.length;

                // Generate 5 digit random Code
                var randomResult = "";
                var characters = '0123456789';
                var charactersLength = characters.length;
                let length = 10 - len;
                for (var k = 0; k < length; k++) {
                    randomResult = randomResult + characters.charAt(Math.floor(Math.random() *
                        charactersLength));
                }

                let productCode = start + randomResult + count;

                req.body["code"] = productCode;

                for (i = 0; i < req.body["variants"].length; i++) {

                    let stock = {}

                    stock["variant"] = req.body["variants"][i];
                    stock["inventory"] = Array(req.body["sizes"].length).fill(0);
                    stock["sold"] = Array(req.body["sizes"].length).fill(0);
                    stock["returned"] = Array(req.body["sizes"].length).fill(0);
                    stock["loss"] = Array(req.body["sizes"].length).fill(0);
                    stock["skus"] = [];
                    stock["upcs"] = [];

                    for (let j = 0; j < req.body["sizes"].length; j++) {

                        // Generate the custom SKU
                        let sku = brandShortcode + count + "-" + variantShortcodes[i] + sizeShortcodes[j] + "-" + departmentShortcode + typeShortcode;

                        stock["skus"].push(sku);
                    }

                    req.body["stock"].push(stock);

                }

                var product = Product(req.body)

                product.save(function (err, prdct) {
                    if (err) {
                        return res.status(500).send(err);
                    } else {
                        return res.status(201).send(prdct);
                    }
                });

            }
        });
    } else {

        return res.status(500).send({ error: "Dimensions for product were not correct" });
    }


}

// Get All Products
// GET {{HOST}}/product
exports.retrieve_all = function (req, res) {

    async.waterfall([
        async.apply(retrieveLeanProducts, req),
        retrieveProductsPromotions,
        retrieveProducts
    ], function (err, products) {
        if (err) {
            return res.status(err.status).send(err.body);
        } else {
            return res.status(200).send(products);
        }
    });

}

// Retrieve One Product
// GET {{HOST}}/product/:productId
exports.retrieve_product = function (req, res) {
    req.checkParams('productId', 'required').notEmpty();

    if (req.validationErrors()) {
        return res.status(400).send({ errors: req.validationErrors() });
    }

    async.waterfall([
        async.apply(retrieveLeanProduct, req),
        retrievePromotions,
        retrieveProduct
    ], function (err, product, promotions) {
        if (err) {
            return res.status(err.status).send(err.body);
        } else {
            console.log("Promotion Count: " + promotions.length);

            let json = JSON.parse(JSON.stringify(product));
            json.promotions = JSON.parse(JSON.stringify(promotions));

            return res.status(200).send(json);
        }
    });
}

// Update Single User 
exports.update = function (req, res) {

    req.checkParams('productId', 'required').notEmpty();
    req.checkBody('user', 'required').notEmpty();

    if (req.validationErrors()) {
        return res.status(400).send({ errors: req.validationErrors() });
    }

    var query = {
        _id: req.params.productId
    };

    Product
        .update(query, req.body)
        .exec(function (err, result) {
            if (err) {
                return res.status(500).send(err);
            } else {
                return res.status(200).send(result);
            }
        });
};

// Update Product Inventory 
exports.update_inventory = function (req, res) {

    req.checkParams('productId', 'required').notEmpty();
    req.checkBody('stock', 'required').notEmpty();

    if (req.validationErrors()) {
        return res.status(400).send({ errors: req.validationErrors() });
    }

    let query = {
        _id: req.params.productId
    }

    let stockObjs = req.body["stock"];

    Product.findOne(query).then(product => {
        for (let i = 0; i < product.stock.length; i++) {
            for (let j = 0; j < stockObjs.length; j++) {
                if (product.stock[i]["variant"] == stockObjs[j]["variant"]) {
                    product.stock[i].inventory = stockObjs[j]["inventory"];
                    continue;
                }
            }
        }

        product.save(function (err) {
            if (err) {
                res.status(500).send(err);
            } else {
                res.status(200).send(product);
            }
        });
    });
}

// Post Losses to Product Inventory 
exports.post_losses = function (req, res) {

    req.checkParams('productId', 'required').notEmpty();
    req.checkBody('stock', 'required').notEmpty();

    if (req.validationErrors()) {
        return res.status(400).send({ errors: req.validationErrors() });
    }

    let query = {
        _id: req.params.productId
    }

    let stockObjs = req.body["stock"];

    Product.findOne(query).then(product => {
        let totalLosses = 0;

        for (let i = 0; i < product.stock.length; i++) {
            for (let j = 0; j < stockObjs.length; j++) {
                if (product.stock[i]["variant"] == stockObjs[j]["variant"]) {
                    for (let k = 0; k < product.sizes.length; k++) {
                        let previous = product.stock[i]["inventory"][k];
                        let loss = stockObjs[j]["loss"][k];
                        if (loss > previous) {
                            loss = previous;
                        }

                        product.stock[i]["inventory"].set(k, previous - loss);
                        product.stock[i]["loss"].set(k, product.stock[i]["loss"][k] + loss);
                        totalLosses += loss;
                    }
                    continue;
                }
            }
        }

        product.loss += totalLosses;

        product.save(function (err) {
            if (err) {
                res.status(500).send(err);
            } else {
                res.status(200).send(product);
            }
        });
    });
}

// Add Sale to Product
exports.add_sale = function (req, res) {

    req.checkParams('productId', 'required').notEmpty();
    req.checkBody('title', 'required').notEmpty();
    req.checkBody('type', 'required').notEmpty();
    req.checkBody('value', 'required').notEmpty();
    req.checkBody('stackable', 'required').notEmpty();
    req.checkBody('start', 'required').notEmpty();
    req.checkBody('end', 'required').notEmpty();
    req.checkBody('description', 'required').notEmpty();

    if (req.validationErrors()) {
        return res.status(400).send({ errors: req.validationErrors() });
    }

    let query = {
        _id: req.params.productId
    }

    Product.update(query, { $push: { sales: req.body } })
        .exec(function (err) {
            if (err) {
                res.status(500).send(err);
            } else {
                return res.status(200).send({});
            }
        });
}

// Edit Sale
exports.edit_sale = function (req, res) {
    req.checkParams('productId', 'required').notEmpty();
    req.checkParams('saleId', 'required').notEmpty();

    if (req.validationErrors()) {
        return res.status(400).send({ errors: req.validationErrors() });
    }

    var query = {
        _id: req.params.productId
    };

    Product
        .findOne(query)
        .exec(function (err, product) {
            if (err) {
                return res.status(500).send({ error: err });
            } else if (!product) {
                return res.status(404).send({ error: "Product not found." });
            } else {
                let sale = product.sales.id(req.params.saleId);
                sale.set(req.body);
                product.save(function (err) {
                    if (err) {
                        return res.status(500).send({ error: err });
                    } else {
                        return res.status(200).send({});
                    }
                })
            }
        });
}

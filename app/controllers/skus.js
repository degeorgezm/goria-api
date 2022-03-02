/**
 * skus.js
 *
 * AS3ICS Backend
 * by AS3ICS
 * 
 * Zachary DeGeorge
 * zach@as3ics.com
 *
 * SKUs Controller
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

function checkIfDepartmentNameExists(req, done) {

    var query = {
        name: req.body.name
    };

    Department
        .findOne(query)
        .exec(function (err, department) {
            if (err) {
                return done({ status: 500, body: { error: err } });
            } else if (!department) {
                return done(null, req);
            } else {
                return done({ status: 409, body: { error: "a department with this name already exists" } });
            }
        });
}

function checkIfDepartmentSKUExists(req, done) {

    var query = {
        sku_shortcode: req.body.sku_shortcode
    };

    Department
        .findOne(query)
        .exec(function (err, department) {
            if (err) {
                return done({ status: 500, body: { error: err } });
            } else if (!department) {
                return done(null, req);
            } else {
                return done({ status: 409, body: { error: "a department with this sku already exists" } });
            }
        });
}

function checkIfTypeNameExists(req, done) {

    var query = {
        name: req.body.name
    };

    Type
        .findOne(query)
        .exec(function (err, type) {
            if (err) {
                return done({ status: 500, body: { error: err } });
            } else if (!type) {
                return done(null, req);
            } else {
                return done({ status: 409, body: { error: "a type with this name already exists" } });
            }
        });
}

function checkIfTypeSKUExists(req, done) {

    var query = {
        sku_shortcode: req.body.sku_shortcode
    };

    Type
        .findOne(query)
        .exec(function (err, type) {
            if (err) {
                return done({ status: 500, body: { error: err } });
            } else if (!type) {
                return done(null, req);
            } else {
                return done({ status: 409, body: { error: "a type with this sku already exists" } });
            }
        });
}

function checkIfSizeNameExists(req, done) {

    var query = {
        name: req.body.name
    };

    Size
        .findOne(query)
        .exec(function (err, size) {
            if (err) {
                return done({ status: 500, body: { error: err } });
            } else if (!size) {
                return done(null, req);
            } else {
                return done({ status: 409, body: { error: "a size with this name already exists" } });
            }
        });
}

function checkIfSizeSKUExists(req, done) {

    var query = {
        sku_shortcode: req.body.sku_shortcode
    };

    Size
        .findOne(query)
        .exec(function (err, size) {
            if (err) {
                return done({ status: 500, body: { error: err } });
            } else if (!size) {
                return done(null, req);
            } else {
                return done({ status: 409, body: { error: "a size with this sku already exists" } });
            }
        });
}

function checkIfBrandNameExists(req, done) {

    var query = {
        name: req.body.name
    };

    Brand
        .findOne(query)
        .exec(function (err, brand) {
            if (err) {
                return done({ status: 500, body: { error: err } });
            } else if (!brand) {
                return done(null, req);
            } else {
                return done({ status: 409, body: { error: "a brand with this name already exists" } });
            }
        });
}

function checkIfBrandSKUExists(req, done) {

    var query = {
        sku_shortcode: req.body.sku_shortcode
    };

    Brand
        .findOne(query)
        .exec(function (err, brand) {
            if (err) {
                return done({ status: 500, body: { error: err } });
            } else if (!brand) {
                return done(null, req);
            } else {
                return done({ status: 409, body: { error: "a brand with this sku already exists" } });
            }
        });
}

function checkIfVariantNameExists(req, done) {

    var query = {
        name: req.body.name
    };

    Variant
        .findOne(query)
        .exec(function (err, variant) {
            if (err) {
                return done({ status: 500, body: { error: err } });
            } else if (!variant) {
                return done(null, req);
            } else {
                return done({ status: 409, body: { error: "a variant with this name already exists" } });
            }
        });
}

function checkIfVariantSKUExists(req, done) {

    var query = {
        sku_shortcode: req.body.sku_shortcode
    };

    Variant
        .findOne(query)
        .exec(function (err, variant) {
            if (err) {
                return done({ status: 500, body: { error: err } });
            } else if (!variant) {
                return done(null, req);
            } else {
                return done({ status: 409, body: { error: "a variant with this sku already exists" } });
            }
        });
}

function checkIfGroupNameExists(req, done) {

    var query = {
        name: req.body.name
    };

    Group
        .findOne(query)
        .exec(function (err, group) {
            if (err) {
                return done({ status: 500, body: { error: err } });
            } else if (!group) {
                return done(null, req);
            } else {
                return done({ status: 409, body: { error: "a group with this name already exists" } });
            }
        });
}

function retrieveDepartments(req, obj, done) {
    query = {
        _id: { $exists: true }
    }

    Department
        .find(query)
        .sort("name")
        .deepPopulate('brand')
        .exec(function (err, departments) {
            if (err) {
                return done({ status: 500, body: err });
            } else if (!departments) {
                obj["departments"] = []
                return done(null, req, obj);
            } else {
                obj["departments"] = departments;
                return done(null, req, obj);
            }
        });
}

function retrieveTypes(req, obj, done) {
    query = {
        _id: { $exists: true }
    }

    Type
        .find(query)
        .sort("name")
        .exec(function (err, types) {
            if (err) {
                return done({ status: 500, body: err });
            } else if (!types) {
                obj["types"] = []
                return done(null, req, obj);
            } else {
                obj["types"] = types;
                return done(null, req, obj);
            }
        });
}

function retrieveSizes(req, obj, done) {
    query = {
        _id: { $exists: true }
    }

    Size
        .find(query)
        .sort("sku_shortcode")
        .exec(function (err, sizes) {
            if (err) {
                return done({ status: 500, body: err });
            } else if (!sizes) {
                obj["sizes"] = []
                return done(null, req, obj);
            } else {
                obj["sizes"] = sizes;
                return done(null, req, obj);
            }
        });
}

function retrieveBrands(req, obj, done) {
    query = {
        _id: { $exists: true }
    }

    Brand
        .find(query)
        .sort("name")
        .exec(function (err, brands) {
            if (err) {
                return done({ status: 500, body: err });
            } else if (!brands) {
                obj["brands"] = []
                return done(null, req, obj);
            } else {
                obj["brands"] = brands;
                return done(null, req, obj);
            }
        });
}

function retrieveVariants(req, obj, done) {
    query = {
        _id: { $exists: true }
    }

    Variant
        .find(query)
        .sort("name")
        .deepPopulate('brand')
        .exec(function (err, variants) {
            if (err) {
                return done({ status: 500, body: err });
            } else if (!variants) {
                obj["variants"] = []
                return done(null, req, obj);
            } else {
                obj["variants"] = variants;
                return done(null, req, obj);
            }
        });
}

function retrieveGroups(req, obj, done) {
    query = {
        _id: { $exists: true }
    }

    Group
        .find(query)
        .sort("name")
        .exec(function (err, groups) {
            if (err) {
                return done({ status: 500, body: err });
            } else if (!groups) {
                obj["groups"] = []
                return done(null, req, obj);
            } else {
                obj["groups"] = groups;
                return done(null, req, obj);
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

// Create Department
exports.create_department = function (req, res) {

    req.checkBody('name', 'required').notEmpty();
    req.checkBody('sku_shortcode', 'required').notEmpty();

    if (req.validationErrors()) {
        return res.status(400).send({ errors: req.validationErrors() });
    }

    // Verify department does not exist
    async.waterfall([
        async.apply(checkIfDepartmentNameExists, req),
        checkIfDepartmentSKUExists
    ], function (err) {
        if (err) {
            return res.status(err.status).send(err.body);
        } else {
            var department = Department(req.body);

            department.save(function (err, dptmnt) {
                if (err) {
                    return res.status(500).send(err);
                } else {
                    return res.status(201).send(dptmnt);
                }
            });
        }
    });
}

// Update Department
exports.update_department = function (req, res) {

    req.checkParams('departmentId', 'required').notEmpty();

    if (req.validationErrors()) {
        return res.status(400).send({ errors: req.validationErrors() });
    }

    var query = {
        _id: req.params.departmentId
    };

    // Update Department
    Department
        .update(query, req.body)
        .exec(function (err, result) {
            if (err) {
                return res.status(500).send(err);
            } else {
                return res.status(200).send(result);
            }
        });
}

// Create Type
exports.create_type = function (req, res) {

    req.checkBody('name', 'required').notEmpty();
    req.checkBody('sku_shortcode', 'required').notEmpty();

    if (req.validationErrors()) {
        return res.status(400).send({ errors: req.validationErrors() });
    }

    // Verify type does not exist
    async.waterfall([
        async.apply(checkIfTypeNameExists, req),
        checkIfTypeSKUExists
    ], function (err) {
        if (err) {
            return res.status(err.status).send(err.body);
        } else {
            var type = Type(req.body);

            type.save(function (err, typ) {
                if (err) {
                    return res.status(500).send(err);
                } else {
                    return res.status(201).send(typ);
                }
            });
        }
    });
}


// Update Type
exports.update_type = function (req, res) {

    req.checkParams('typeId', 'required').notEmpty();

    if (req.validationErrors()) {
        return res.status(400).send({ errors: req.validationErrors() });
    }

    var query = {
        _id: req.params.typeId
    };

    // Update Type
    Type
        .update(query, req.body)
        .exec(function (err, result) {
            if (err) {
                return res.status(500).send(err);
            } else {
                return res.status(200).send(result);
            }
        });
}

// Create Size
exports.create_size = function (req, res) {

    req.checkBody('name', 'required').notEmpty();
    req.checkBody('sku_shortcode', 'required').notEmpty();

    if (req.validationErrors()) {
        return res.status(400).send({ errors: req.validationErrors() });
    }

    // Verify Size does not exist
    async.waterfall([
        async.apply(checkIfSizeNameExists, req),
        checkIfSizeSKUExists
    ], function (err) {
        if (err) {
            return res.status(err.status).send(err.body);
        } else {
            var size = Size(req.body);

            size.save(function (err, sz) {
                if (err) {
                    return res.status(500).send(err);
                } else {
                    return res.status(201).send(sz);
                }
            });
        }
    });
}

// Update Size
exports.update_size = function (req, res) {

    req.checkParams('sizeId', 'required').notEmpty();

    if (req.validationErrors()) {
        return res.status(400).send({ errors: req.validationErrors() });
    }

    var query = {
        _id: req.params.sizeId
    };

    // Update Size
    Size
        .update(query, req.body)
        .exec(function (err, result) {
            if (err) {
                return res.status(500).send(err);
            } else {
                return res.status(200).send(result);
            }
        });
}

// Create Brand
exports.create_brand = function (req, res) {

    req.checkBody('name', 'required').notEmpty();
    req.checkBody('sku_shortcode', 'required').notEmpty();

    if (req.validationErrors()) {
        return res.status(400).send({ errors: req.validationErrors() });
    }

    // Verify brand does not exist
    async.waterfall([
        async.apply(checkIfBrandNameExists, req),
        checkIfBrandSKUExists
    ], function (err) {
        if (err) {
            return res.status(err.status).send(err.body);
        } else {
            var brand = Brand(req.body);

            brand.save(function (err, brnd) {
                if (err) {
                    return res.status(500).send(err);
                } else {
                    return res.status(201).send(brnd);
                }
            });
        }
    });
}


// Update Brand
exports.update_brand = function (req, res) {

    req.checkParams('brandId', 'required').notEmpty();

    if (req.validationErrors()) {
        return res.status(400).send({ errors: req.validationErrors() });
    }

    var query = {
        _id: req.params.brandId
    };

    // Update Brand
    Brand
        .update(query, req.body)
        .exec(function (err, result) {
            if (err) {
                return res.status(500).send(err);
            } else {
                return res.status(200).send(result);
            }
        });
}

// Create Group
exports.create_group = function (req, res) {

    req.checkBody('name', 'required').notEmpty();

    if (req.validationErrors()) {
        return res.status(400).send({ errors: req.validationErrors() });
    }

    // Verify group does not exist
    async.waterfall([
        async.apply(checkIfGroupNameExists, req)
    ], function (err) {
        if (err) {
            return res.status(err.status).send(err.body);
        } else {
            var group = Group(req.body);

            group.save(function (err, grp) {
                if (err) {
                    return res.status(500).send(err);
                } else {
                    return res.status(201).send(grp);
                }
            });
        }
    });
}

// Update Group
exports.update_group = function (req, res) {

    req.checkParams('groupId', 'required').notEmpty();

    if (req.validationErrors()) {
        return res.status(400).send({ errors: req.validationErrors() });
    }

    var query = {
        _id: req.params.groupId
    };

    // Update Group
    Group
        .update(query, req.body)
        .exec(function (err, result) {
            if (err) {
                return res.status(500).send(err);
            } else {
                return res.status(200).send(result);
            }
        });
}

// Create Variant
exports.create_variant = function (req, res) {

    req.checkBody('name', 'required').notEmpty();
    req.checkBody('sku_shortcode', 'required').notEmpty();
    req.checkBody('brand', 'required').notEmpty();

    if (req.validationErrors()) {
        return res.status(400).send({ errors: req.validationErrors() });
    }

    // Verify variant does not exist
    async.waterfall([
        async.apply(checkIfVariantNameExists, req),
        checkIfVariantSKUExists
    ], function (err) {
        if (err) {
            return res.status(err.status).send(err.body);
        } else {
            var variant = Variant(req.body);

            variant.save(function (err, vrnt) {
                if (err) {
                    return res.status(500).send(err);
                } else {
                    return res.status(201).send(vrnt);
                }
            });
        }
    });
}

// Update Variant
exports.update_variant = function (req, res) {

    req.checkParams('variantId', 'required').notEmpty();

    if (req.validationErrors()) {
        return res.status(400).send({ errors: req.validationErrors() });
    }

    var query = {
        _id: req.params.variantId
    };

    // Update Variant
    Variant
        .update(query, req.body)
        .exec(function (err, result) {
            if (err) {
                return res.status(500).send(err);
            } else {
                return res.status(200).send(result);
            }
        });
}

// Retrieve Departments
exports.retrieve_departments = function (req, res) {

    query = {
        _id: { $exists: true }
    }

    Department
        .find(query)
        .sort("name")
        .deepPopulate('brand')
        .exec(function (err, departments) {
            if (err) {
                return res.status(500).send(err);
            } else if (!departments) {
                return res.status(200).send([]);
            } else {
                return res.status(200).send(departments);
            }
        });
}

// Retrieve Types
exports.retrieve_types = function (req, res) {

    query = {
        _id: { $exists: true }
    }

    Type
        .find(query)
        .sort("name")
        .exec(function (err, types) {
            if (err) {
                return res.status(500).send(err);
            } else if (!types) {
                return res.status(200).send([]);
            } else {
                return res.status(200).send(types);
            }
        });
}

// Retrieve Sizes
exports.retrieve_sizes = function (req, res) {

    query = {
        _id: { $exists: true }
    }

    Size
        .find(query)
        .sort("name")
        .exec(function (err, sizes) {
            if (err) {
                return res.status(500).send(err);
            } else if (!sizes) {
                return res.status(200).send([]);
            } else {
                return res.status(200).send(sizes);
            }
        });
}


// Retrieve Brands
exports.retrieve_brands = function (req, res) {

    query = {
        _id: { $exists: true }
    }

    Brand
        .find(query)
        .sort("name")
        .exec(function (err, brands) {
            if (err) {
                return res.status(500).send(err);
            } else if (!brands) {
                return res.status(200).send([]);
            } else {
                return res.status(200).send(brands);
            }
        });
}

// Retrieve Groups
exports.retrieve_groups = function (req, res) {

    query = {
        _id: { $exists: true }
    }

    Group
        .find(query)
        .sort("name")
        .exec(function (err, groups) {
            if (err) {
                return res.status(500).send(err);
            } else if (!groups) {
                return res.status(200).send([]);
            } else {
                return res.status(200).send(groups);
            }
        });
}

// Retrieve Variants
exports.retrieve_variants = function (req, res) {

    query = {
        _id: { $exists: true }
    }

    Variant
        .find(query)
        .sort("name")
        .deepPopulate('brand')
        .exec(function (err, variants) {
            if (err) {
                return res.status(500).send(err);
            } else if (!variants) {
                return res.status(200).send([]);
            } else {
                return res.status(200).send(variants);
            }
        });
}

// Retrieve Variants
exports.retrieve_variants_brand = function (req, res) {

    req.checkParams('brandId', 'required').notEmpty();

    if (req.validationErrors()) {
        return res.status(400).send({ errors: req.validationErrors() });
    }

    var query = {
        brand: {
            $in: [req.params.brandId, null] // include default variants
        }
    };

    Variant
        .find(query)
        .sort("name")
        .deepPopulate('brand')
        .exec(function (err, variants) {
            if (err) {
                return res.status(500).send(err);
            } else if (!variants) {
                return res.status(200).send([]);
            } else {
                return res.status(200).send(variants);
            }
        });
}

// Retrieve All
exports.retrieve_all = function (req, res) {

    var obj = {};

    async.waterfall([
        async.apply(retrieveDepartments, req, obj),
        retrieveSizes,
        retrieveTypes,
        retrieveBrands,
        retrieveVariants,
        retrieveGroups
    ], function (err, req, object) {
        if (err) {
            return res.status(err.status).send(err.body);
        } else {
            return res.status(200).send(object);
        }
    });
}
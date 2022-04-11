/**
 * fetch.js
 *
 * api.goria.com
 * by AS3ICS
 *
 * Zach DeGeorge
 * zach@as3ics.com
 *
 * Fetch Controller
 *
 * @format
 */

const winston = require("winston");

var mongoose = require("mongoose"),
  Product = mongoose.model("Product"),
  deepPopulate = require("mongoose-deep-populate")(mongoose);

// Retrive all products of specific Group
exports.retrieve_group = function (req, res) {
  req.checkParams("groupId", "required").notEmpty();

  if (req.validationErrors()) {
    return res.status(400).send({ errors: req.validationErrors() });
  }

  let query = {
    groups: req.params.groupId,
  };

  let limit = 0;
  /*     if (req.query.limit != undefined) {
            limit = query.params.limit;
        } */

  Product.find(query)
    .limit(limit)
    .deepPopulate(
      "image type department sizes variants.variant stock.variant brand groups images"
    )
    .exec(function (err, products) {
      if (err) {
        return res.status(500).send(err);
      } else if (!products) {
        return res.status(200).send({});
      } else {
        return res.status(200).send(products);
      }
    });
};

// Retrieve all products by Type
exports.retrieve_type = function (req, res) {
  req.checkParams("typeId", "required").notEmpty();

  if (req.validationErrors()) {
    return res.status(400).send({ errors: req.validationErrors() });
  }

  let query = {
    type: req.params.typeId,
  };

  let limit = 0;
  /*     if (req.query.limit != undefined) {
            limit = query.params.limit;
        } */

  Product.find(query)
    .limit(limit)
    .deepPopulate(
      "image type department sizes variants.variant stock.variant brand groups images"
    )
    .exec(function (err, products) {
      if (err) {
        return res.status(500).send(err);
      } else if (!products) {
        return res.status(200).send({});
      } else {
        return res.status(200).send(products);
      }
    });
};

// Retrieve all products by Variant
exports.retrieve_variant = function (req, res) {
  req.checkParams("variantId", "required").notEmpty();

  if (req.validationErrors()) {
    return res.status(400).send({ errors: req.validationErrors() });
  }

  let query = {
    "variants.variant": req.params.variantId,
  };

  Product.find(query)
    .deepPopulate(
      "image type department sizes variants.variant stock.variant brand groups images"
    )
    .exec(function (err, products) {
      if (err) {
        return res.status(500).send(err);
      } else if (!products) {
        return res.status(200).send({});
      } else {
        return res.status(200).send(products);
      }
    });
};

// Retrieve all products by Brand
exports.retrieve_brand = function (req, res) {
  req.checkParams("brandId", "required").notEmpty();

  if (req.validationErrors()) {
    return res.status(400).send({ errors: req.validationErrors() });
  }

  let query = {
    brand: req.params.brandId,
  };

  Product.find(query)
    .deepPopulate(
      "image type department sizes variants.variant stock.variant brand groups images"
    )
    .exec(function (err, products) {
      if (err) {
        return res.status(500).send(err);
      } else if (!products) {
        return res.status(200).send({});
      } else {
        return res.status(200).send(products);
      }
    });
};

// Retrieve all products by Department
exports.retrieve_department = function (req, res) {
  req.checkParams("departmentId", "required").notEmpty();

  if (req.validationErrors()) {
    return res.status(400).send({ errors: req.validationErrors() });
  }

  let query = {
    department: req.params.departmentId,
  };

  Product.find(query)
    .deepPopulate(
      "image type department sizes variants.variant stock.variant brand groups images"
    )
    .exec(function (err, products) {
      if (err) {
        return res.status(500).send(err);
      } else if (!products) {
        return res.status(200).send({});
      } else {
        return res.status(200).send(products);
      }
    });
};

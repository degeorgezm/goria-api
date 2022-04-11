/**
 * sku.js
 *
 * api.goria.com
 * by AS3ICS
 *
 * Zach DeGeorge
 * zach@as3ics.com
 *
 * SKU Models
 *
 * @format
 */

var mongoose = require("mongoose"),
  Schema = mongoose.Schema,
  deepPopulate = require("mongoose-deep-populate")(mongoose);

var Department = new Schema(
  {
    name: { type: String, unique: true, required: true },
    sku_shortcode: { type: String, unique: true, required: true },
    brand: { type: Schema.Types.ObjectId, ref: "Brand", required: false },
    display: { type: Boolean, required: true, default: true },
  },
  {
    versionKey: false,
    usePushEach: true,
    timestamps: { createdAt: "_creationDate", updatedAt: "_updatedDate" },
  }
);

Department.plugin(deepPopulate);
module.exports = mongoose.model("Department", Department);

var Type = new Schema(
  {
    name: { type: String, unique: true, required: true },
    sku_shortcode: { type: String, unique: true, required: true },
    display: { type: Boolean, required: true, default: true },
  },
  {
    versionKey: false,
    usePushEach: true,
    timestamps: { createdAt: "_creationDate", updatedAt: "_updatedDate" },
  }
);

module.exports = mongoose.model("Type", Type);

var Size = new Schema(
  {
    name: { type: String, unique: true, required: true },
    sku_shortcode: { type: String, unique: true, required: true },
  },
  {
    versionKey: false,
    usePushEach: true,
    timestamps: { createdAt: "_creationDate", updatedAt: "_updatedDate" },
  }
);

module.exports = mongoose.model("Size", Size);

var Group = new Schema(
  {
    name: { type: String, unique: true, required: true },
    sku_shortcode: { type: String, unique: true, required: true },
    display: { type: Boolean, required: true, default: true },
  },
  {
    versionKey: false,
    usePushEach: true,
    timestamps: { createdAt: "_creationDate", updatedAt: "_updatedDate" },
  }
);

module.exports = mongoose.model("Group", Group);

var Brand = new Schema(
  {
    name: { type: String, unique: true, required: true },
    sku_shortcode: { type: String, unique: true, required: true },
    display: { type: Boolean, required: true, default: true },
  },
  {
    versionKey: false,
    usePushEach: true,
    timestamps: { createdAt: "_creationDate", updatedAt: "_updatedDate" },
  }
);

module.exports = mongoose.model("Brand", Brand);

var Variant = new Schema(
  {
    //brand: { type: Schema.Types.ObjectId, ref: 'Brand', required: false },
    name: { type: String, required: true },
    sku_shortcode: { type: String, required: true },
    image: { type: String, required: false },
    display: { type: Boolean, required: true, default: true },
  },
  {
    versionKey: false,
    usePushEach: true,
    timestamps: { createdAt: "_creationDate", updatedAt: "_updatedDate" },
  }
);

Variant.plugin(deepPopulate);
module.exports = mongoose.model("Variant", Variant);

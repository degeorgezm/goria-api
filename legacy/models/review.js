/**
 * review.js
 *
 * api.goria.com
 * by AS3ICS
 *
 * Zach DeGeorge
 * zach@as3ics.com
 *
 * Review Models
 *
 * @format
 */

var mongoose = require("mongoose"),
  Schema = mongoose.Schema,
  winston = require("winston"),
  deepPopulate = require("mongoose-deep-populate")(mongoose);

var Review = new Schema(
  {
    rating: { type: Number, max: 5, min: 1, required: true },
    title: { type: String, required: true },
    review: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  },
  {
    versionKey: false,
    usePushEach: true,
    timestamps: { createdAt: "_creationDate", updatedAt: "_updatedDate" },
  }
);

Review.plugin(deepPopulate);

module.exports = mongoose.model("Review", Review);

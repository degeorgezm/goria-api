/**
 * macros.js
 *
 * api.goria.com
 * by AS3ICS
 *
 * Zach DeGeorge
 * zach@as3ics.com
 *
 * Macros Models
 *
 * @format
 */

var mongoose = require("mongoose"),
  Schema = mongoose.Schema;

var Macros = new Schema(
  {
    name: { type: String, required: true },
    count: { type: Number, required: true },
  },
  {
    versionKey: false,
    usePushEach: true,
    timestamps: { createdAt: "_creationDate", updatedAt: "_updatedDate" },
  }
);

module.exports = mongoose.model("Macros", Macros);

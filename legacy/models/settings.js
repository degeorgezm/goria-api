/**
 * settings.js
 *
 * api.goria.com
 * by AS3ICS
 *
 * Zach DeGeorge
 * zach@as3ics.com
 *
 * Setting Models
 *
 * @format
 */

var mongoose = require("mongoose"),
  Schema = mongoose.Schema;

var Setting = new Schema(
  {
    name: { type: String, required: true },
    incoming_order_alert_email: { type: String, required: false },
    incoming_return_alert_email: { type: String, required: false },
    incoming_review_alert_email: { type: String, required: false },
    default_shipping_cost: { type: Number, required: false },
  },
  {
    versionKey: false,
    usePushEach: true,
    timestamps: { createdAt: "_creationDate", updatedAt: "_updatedDate" },
  }
);

module.exports = mongoose.model("Setting", Setting);

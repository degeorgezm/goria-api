/**
 * promotion.js
 *
 * AS3ICS Backend
 * by AS3ICS
 *
 * Zachary DeGeorge
 * zach@as3ics.com
 *
 * Promotion Model
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    winston = require('winston'),
    deepPopulate = require('mongoose-deep-populate')(mongoose);

var Promotion = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, enum: ["percentage", "amount"], required: true },
    value: { type: Number, required: true },
    minimum: { type: Number, required: true },
    maximum: { type: Number, required: true },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    stackable: { type: Boolean, required: true, default: false },
    free_shipping: { type: Boolean, required: true, default: false },
    brands: [{ type: Schema.Types.ObjectId, ref: "Brand", required: false }],
    departments: [{ type: Schema.Types.ObjectId, ref: "Department", required: false }],
    types: [{ type: Schema.Types.ObjectId, ref: "Type", required: false }],
    variants: [{ type: Schema.Types.ObjectId, ref: "Variant", required: false }],
    groups: [{ type: Schema.Types.ObjectId, ref: "Group", required: false }],
    user: { type: Schema.Types.ObjectId, ref: "User", required: true }
}, {
    versionKey: false,
    usePushEach: true,
    timestamps: { createdAt: '_creationDate', updatedAt: '_updatedDate' }
});

Promotion.plugin(deepPopulate);

module.exports = mongoose.model('Promotion', Promotion);

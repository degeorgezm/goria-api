/**
 * photo.js
 *
 * AS3ICS Backend
 * by AS3ICS
 *
 * Zachary DeGeorge
 * zach@as3ics.com
 *
 * Photo Model
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    deepPopulate = require('mongoose-deep-populate')(mongoose);

var Photo = new Schema({
    filename: { type: String, required: true },
    alt: { type: String, required: false },
    user: { type: Schema.Types.ObjectId, ref: 'User', requried: false },
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: false },
    variant: { type: Schema.Types.ObjectId, ref: 'Variant', required: false }
}, {
    versionKey: false,
    usePushEach: true, // $pushAll has been removed from Mongo version > 3.5.
    timestamps: { createdAt: '_creationDate', updatedAt: '_updatedDate' }
});


Photo.plugin(deepPopulate);

module.exports = mongoose.model('Photo', Photo);
/**
 * product.js
 *
 * AS3ICS Backend
 * by AS3ICS
 * 
 * Zachary DeGeorge
 * zach@as3ics.com
 *
 * Product Models
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    winston = require('winston'),
    deepPopulate = require('mongoose-deep-populate')(mongoose);

var Sale = new Schema({
    type: { type: String /*, enum: ['amount, percentage']*/, required: true },
    value: { type: Number, required: true },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    stackable: { type: Boolean, required: true, default: false },
    user: { type: Schema.Types.ObjectId, ref: 'User' }
}, {
    versionKey: false,
    usePushEach: true,
    timestamps: { createdAt: '_creationDate', updatedAt: '_updatedDate' }
});

Sale.plugin(deepPopulate);

module.exports = mongoose.model('Sale', Sale);

var PriceChange = new Schema({
    price: { type: Number, required: true },
    date: { type: Date, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User' }
}, {
    versionKey: false,
    usePushEach: true,
    timestamps: { createdAt: '_creationDate', updatedAt: '_updatedDate' }
});

PriceChange.plugin(deepPopulate);

module.exports = mongoose.model('PriceChange', PriceChange);

var Product = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: Schema.Types.ObjectId, ref: 'Type', required: true },
    department: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    groups: [{ type: Schema.Types.ObjectId, ref: 'Group', required: false }],
    price: { type: Number, required: true },
    price_changes: [{ type: PriceChange, required: false }],
    sales: [{ type: Sale, required: false }],
    sale: { type: Boolean, required: false },
    discount: { type: Number, required: false },
    tags: [{ type: String }],
    code: { type: String },
    brand: { type: Schema.Types.ObjectId, ref: 'Brand', required: true },
    image: { type: Schema.Types.ObjectId, ref: 'Photo' },
    images: [{ type: Schema.Types.ObjectId, ref: 'Photo' }],
    sizes: [{ type: Schema.Types.ObjectId, ref: 'Size' }],
    sold: { type: Number, required: true, default: 0 },
    returned: { type: Number, required: true, default: 0 },
    loss: { type: Number, required: true, default: 0 },
    deleted: { type: Boolean, required: false, defualt: false },
    variants: [{ type: Schema.Types.ObjectId, ref: 'Variant' }],
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    stock: [{
        variant: { type: Schema.Types.ObjectId, ref: 'Variant', required: true },
        inventory: [{ type: Number, required: true }],
        sold: [{ type: Number, required: true }],
        returned: [{ type: Number, required: true }],
        loss: [{ type: Number, required: true }],
        skus: [{ type: String, required: false }],
        upcs: [{ type: String, required: false }]
    }],
}, {
    versionKey: false,
    usePushEach: true,
    timestamps: { createdAt: '_creationDate', updatedAt: '_updatedDate' }
});

Product.plugin(deepPopulate);

// Function to be called before Product item is saved
Product.pre('save', async function (next) {
    if (!this.isModified('price')) return next();

    try {
        let change = {};
        change.price = this.price;
        change.date = Date.now();
        change.user = this.user;

        this.price_changes.push(change);

        return next();
    } catch (error) {
        winston.error(error);

        return next(error);
    }
});

// Function to be called before Product item is updated
Product.pre('update', async function (next) {

    const docToUpdate = await this.model.findOne(this.getQuery());

    const newPrice = this.getUpdate()['$set']['price'];
    const lastPrice = docToUpdate.price_changes[docToUpdate.price_changes.length - 1].price;

    if ((newPrice) && (lastPrice) && (lastPrice != newPrice)) {

        const user = this.getUpdate()['$set']['user'];

        let change = {};
        change.price = newPrice;
        change.date = Date.now();
        change.user = user;

        docToUpdate.price_changes.push(change);

        await docToUpdate.save();

        return next();
    } else {
        return next();
    }
});

module.exports = mongoose.model('Product', Product);
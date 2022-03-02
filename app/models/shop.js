/**
 * shop.js
 *
 * AS3ICS Backend
 * by AS3ICS
 * 
 * Zachary DeGeorge
 * zach@as3ics.com
 *
 * Shop Model
 */

const { Decimal128 } = require('bson');

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    deepPopulate = require('mongoose-deep-populate')(mongoose);

var StockStatus = new Schema({
    date: { type: Date, required: true },
    status: { type: String, enum: ['Wishlist', 'Bag', 'Purchased', 'Waitlisted', 'Processing', 'Shipped', 'Delivered', 'Return Requested', 'Return Approved', 'Return Denied', 'Return Shipped', 'Return Received', 'Return Processing', 'Returned', 'Refunded'], required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true }

}, {
    versionKey: false,
    usePushEach: true,
    timestamps: { createdAt: '_creationDate', updatedAt: '_updatedDate' }
});

StockStatus.plugin(deepPopulate);

module.exports = mongoose.model('StockStatus', StockStatus);

var Stock = new Schema({
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    size: { type: Schema.Types.ObjectId, ref: 'Size', required: true },
    variant: { type: Schema.Types.ObjectId, ref: 'Variant', required: true },
    sku: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    quantity: { type: Number, required: true },
    status: [{ type: StockStatus, required: false }]
}, {
    versionKey: false,
    usePushEach: true,
    timestamps: { createdAt: '_creationDate', updatedAt: '_updatedDate' }
});

Stock.plugin(deepPopulate);

module.exports = mongoose.model('Stock', Stock);

var Bag = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [{ type: Stock, required: false }]
}, {
    versionKey: false,
    usePushEach: true,
    timestamps: { createdAt: '_creationDate', updatedAt: '_updatedDate' }
});

Bag.plugin(deepPopulate);

module.exports = mongoose.model('Bag', Bag);

var Wishlist = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [{ type: Stock, required: false }]
}, {
    versionKey: false,
    usePushEach: true,
    timestamps: { createdAt: '_creationDate', updatedAt: '_updatedDate' }
});

Wishlist.plugin(deepPopulate);

module.exports = mongoose.model('Wishlist', Wishlist);

var OrderStatus = new Schema({
    date: { type: Date, required: true },
    status: { type: String, enum: ['Purchased', 'Processing', 'Waitlisted', 'Dropped', 'Cancelled', 'Shipped', 'Delivered'], required: true },
    description: { type: String, required: false },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true }

}, {
    versionKey: false,
    usePushEach: true,
    timestamps: { createdAt: '_creationDate', updatedAt: '_updatedDate' }
});

OrderStatus.plugin(deepPopulate);

module.exports = mongoose.model('OrderStatus', OrderStatus);

var PackageStatus = new Schema({
    date: { type: Date, required: true },
    status: { type: String, enum: ['Processing', 'Shipped', 'Delivered'], required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true }

}, {
    versionKey: false,
    usePushEach: true,
    timestamps: { createdAt: '_creationDate', updatedAt: '_updatedDate' }
});

PackageStatus.plugin(deepPopulate);

module.exports = mongoose.model('PackageStatus', PackageStatus);

var Payment = new Schema({
    amountMoney: {
        amount: { type: String },
        currency: { type: String }
    },
    approvedMoney: {
        amount: { type: String },
        currency: { type: String },
    },
    cardDetails: {
        avsStatus: { type: String },
        card: {
            bin: { type: String },
            cardBrand: { type: String },
            cardType: { type: String },
            expMonth: { type: String },
            expYear: { type: String },
            fingerprint: { type: String },
            last4: { type: String },
            prepaidType: { type: String }
        },
        cardPaymentTimeline: {
            authorizedAt: { type: Date },
            capturedAt: { type: Date }
        },
        cvvStatus: { type: String },
        entryMethod: { type: String },
        statementDescription: { type: String },
        status: { type: String }
    },
    createdAt: { type: Date },
    delayAction: { type: String },
    delayDuration: { type: String },
    delayedUntil: { type: Date },
    id: { type: String },
    locationId: { type: String },
    orderId: { type: String },
    receiptNumber: { type: String },
    receiptUrl: { type: String },
    riskEvaluation: {
        createdAt: { type: Date },
        riskLevel: { type: String }
    },
    sourceType: { type: String },
    status: { type: String },
    totalMoney: {
        amount: { type: String },
        currency: { type: String }
    },
    updatedAt: { type: Date },
    versionToken: { type: String }
}, {
    versionKey: false,
    usePushEach: true,
    timestamps: { createdAt: '_creationDate', updatedAt: '_updatedDate' }
});

Payment.plugin(deepPopulate);

module.exports = mongoose.model('Payment', Payment);

var Refund = new Schema({
    id: { type: String },
    status: { type: String },
    locationId: { type: String },
    amountMoney: {
        amount: { type: String },
        currency: { type: String },
    },
    paymentId: { type: String },
    orderId: { type: String },
    createdAt: { type: Date },
    updatedAt: { type: Date },
    processingFee: [{
        effectiveAt: { type: Date },
        type: { type: String },
        amountMoney: {
            amount: { type: String },
            currency: { type: String }
        }
    }]
}, {
    versionKey: false,
    usePushEach: true,
    timestamps: { createdAt: '_creationDate', updatedAt: '_updatedDate' }
});

Refund.plugin(deepPopulate);

module.exports = mongoose.model('Refund', Refund);

var OrderItem = new Schema({
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    size: { type: Schema.Types.ObjectId, ref: 'Size', required: true },
    variant: { type: Schema.Types.ObjectId, ref: 'Variant', required: true },
    sku: { type: String, required: true },
    quantity: { type: Number, required: true },
    status: { type: StockStatus, required: false },
    list_price: { type: Number, required: true },
    discount: { type: Number, required: true, default: 0.00 },
    discount_price: { type: Number, required: true },
    tax: { type: Number, required: true },
    sale: { type: Boolean, required: true, defualt: false },
    promotions: [{ type: Schema.Types.ObjectId, ref: 'Promotion', required: false }],
    sales: [{ type: Schema.Types.ObjectId, ref: 'Sale', required: false }],
    return_request: {
        returnId: { type: String },
        quantity: { type: Number },
        reason: { type: String, enum: ['No Longer Needed', 'Inaccurate Website Description', "Item Defective Or Doesn't Work", 'Bought By Mistake', 'Better Price Available', 'Product Damaged', 'Wrong Item Sent', 'Other'] },
        other_reason: { type: String },
        return_method: { type: String, enum: ['UPS', 'USPS', 'FedEx'] },
        refund_method: { type: String, enum: ['Refund Card', 'Store Credit'] },
        requested_date: { type: Date },
        decision_date: { type: Date },
        approved: { type: Boolean },
        denied: { type: Boolean },
        user: { type: Schema.Types.ObjectId, ref: 'User' }
    },
}, {
    versionKey: false,
    usePushEach: true,
    timestamps: { createdAt: '_creationDate', updatedAt: '_updatedDate' }
});


OrderItem.plugin(deepPopulate);

module.exports = mongoose.model('OrderItem', OrderItem);

var Order = new Schema({
    orderId: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [OrderItem],
    sub_total: { type: Number, required: true },
    tax_rate: { type: String, required: true },
    tax: { type: Number, required: true },
    total: { type: Number, required: true },
    discount: { type: Number, required: true },
    shipping: { type: Number, required: true },
    currency: { type: String, required: true, default: 'USD' },
    packages: [{
        _id: { type: Schema.Types.ObjectId, required: true },
        carrier: { type: String, enum: ['FedEx', 'UPS', 'USPS', 'DHL'], required: true },
        tracking_number: { type: String, required: true },
        shipping_date: { type: Date, required: false },
        received_date: { type: Date, required: false },
        cost: { type: Number, required: false },
        charged: { type: Number, required: false },
        status: [{ type: PackageStatus }],
        items: [OrderItem],
        shipping_address: {
            name: { type: String, required: true },
            address1: { type: String, required: true },
            address2: { type: String, required: false },
            zip: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            country: { type: String, required: true },
            phone: { type: String, required: true },
            twilio: { type: String, required: false, unique: false }
        },
        return_address: {
            name: { type: String, required: true },
            address1: { type: String, required: true },
            address2: { type: String, required: false },
            zip: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            country: { type: String, required: true },
            phone: { type: String, required: true },
            twilio: { type: String, required: false, unique: false }
        }
    }],
    shipping_address: {
        name: { type: String, required: true },
        address1: { type: String, required: true },
        address2: { type: String, required: false },
        zip: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        country: { type: String, required: true },
        phone: { type: String, required: true },
        twilio: { type: String, required: false, unique: false }
    },
    billing_address: {
        name: { type: String, required: true },
        address1: { type: String, required: true },
        address2: { type: String, required: false },
        zip: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        country: { type: String, required: true },
        phone: { type: String, required: true },
        twilio: { type: String, required: false, unique: false }
    },
    status: [{ type: OrderStatus }],
    payments: [{ type: Payment }],
    refund_stubs: [{ type: Refund }]
}, {
    versionKey: false,
    usePushEach: true,
    timestamps: { createdAt: '_creationDate', updatedAt: '_updatedDate' }
});

Order.plugin(deepPopulate);

module.exports = mongoose.model('Order', Order);
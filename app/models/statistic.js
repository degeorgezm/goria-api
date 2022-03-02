/**
 * statistic.js
 *
 * AS3ICS Backend
 * by AS3ICS
 *
 * Zachary DeGeorge
 * zach@as3ics.com
 *
 * Statistic Model
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Statistic = new Schema({
    date: { type: Date, required: true },
    total_sales: { type: Number, required: true },
    total_order_count: { type: Number, required: true },
    total_item_count: { type: Number, required: true },
    product_count: { type: Number, required: true },
    user_count: { type: Number, required: true },
    admin_count: { type: Number, required: true },
    total_returns_requested: { type: Number, required: true },
    total_returns_denied: { type: Number, required: true },
    total_return_sales: { type: Number, required: true },
    total_net_sales: { type: Number, required: true },
    daily_sales: { type: Number, required: true },
    daily_return_sales: { type: Number, required: true },
    daily_returns_denied: { type: Number, required: true },
    daily_returns_requested: { type: Number, required: true },
    daily_item_count: { type: Number, required: true },
    daily_order_count: { type: Number, required: true },
    daily_net_sales: { type: Number, required: true }
}, {
    versionKey: false,
    usePushEach: true,
    timestamps: { createdAt: '_creationDate', updatedAt: '_updatedDate' }
});


module.exports = mongoose.model('Statistic', Statistic);

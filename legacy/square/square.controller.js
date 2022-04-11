/**
 * square.controller.js
 *
 * api.goria.com
 * by AS3ICS
 *
 * Zach DeGeorge
 * zach@as3ics.com
 *
 * Square Controller
 *
 * @format
 */

var mongoose = require("mongoose"),
  winston = require("winston"),
  async = require("async"),
  retry = require("async-retry"),
  Promotion = mongoose.model("Promotion"),
  Product = mongoose.model("Product"),
  Bag = mongoose.model("Bag"),
  Macros = mongoose.model("Macros"),
  User = mongoose.model("User"),
  OrderStatus = mongoose.model("OrderStatus"),
  Order = mongoose.model("Order"),
  StockStatus = mongoose.model("StockStatus"),
  OrderItem = mongoose.model("OrderItem"),
  PackageStatus = mongoose.model("PackageStatus"),
  Payment = mongoose.model("Payment");

require("./square.locations");

// logger gives us insight into what's happening
const logger = require("./square.logger");
// square provides the API client and error types
const { ApiError, client: square } = require("./square.client");
const { nanoid } = require("nanoid");

/*

$$$$$$$\             $$$$$$\  $$\           $$\   $$\     $$\
$$  __$$\           $$  __$$\ \__|          \__|  $$ |    \__|
$$ |  $$ | $$$$$$\  $$ /  \__|$$\ $$$$$$$\  $$\ $$$$$$\   $$\  $$$$$$\  $$$$$$$\   $$$$$$$\
$$ |  $$ |$$  __$$\ $$$$\     $$ |$$  __$$\ $$ |\_$$  _|  $$ |$$  __$$\ $$  __$$\ $$  _____|
$$ |  $$ |$$$$$$$$ |$$  _|    $$ |$$ |  $$ |$$ |  $$ |    $$ |$$ /  $$ |$$ |  $$ |\$$$$$$\
$$ |  $$ |$$   ____|$$ |      $$ |$$ |  $$ |$$ |  $$ |$$\ $$ |$$ |  $$ |$$ |  $$ | \____$$\
$$$$$$$  |\$$$$$$$\ $$ |      $$ |$$ |  $$ |$$ |  \$$$$  |$$ |\$$$$$$  |$$ |  $$ |$$$$$$$  |
\_______/  \_______|\__|      \__|\__|  \__|\__|   \____/ \__| \______/ \__|  \__|\_______/

*/

toObject = function (json) {
  return JSON.parse(
    JSON.stringify(
      json,
      (key, value) => (typeof value === "bigint" ? value.toString() : value) // return everything else unchanged
    )
  );
};

const SalesTable = {
  AL: 0.04,
  AK: 0.0,
  AZ: 0.056,
  AR: 0.065,
  CA: 0.0725,
  CO: 0.029,
  CT: 0.0635,
  DE: 0.0,
  DC: 0.06,
  FL: 0.06,
  GA: 0.04,
  HI: 0.04,
  ID: 0.06,
  IL: 0.0625,
  IN: 0.07,
  IA: 0.06,
  KS: 0.065,
  KY: 0.06,
  LA: 0.045,
  ME: 0.055,
  MD: 0.06,
  MA: 0.0625,
  MI: 0.06,
  MN: 0.06875,
  MS: 0.7,
  MO: 0.4225,
  MT: 0.0,
  NE: 0.055,
  NV: 0.0685,
  NH: 0.0,
  NJ: 0.06625,
  NM: 0.05125,
  NY: 0.04,
  NC: 0.0475,
  ND: 0.05,
  OH: 0.0575,
  OK: 0.045,
  OR: 0.0,
  PA: 0.06,
  RI: 0.07,
  SC: 0.06,
  SD: 0.045,
  TN: 0.07,
  TX: 0.0625,
  UT: 0.061,
  VT: 0.06,
  VA: 0.053,
  WA: 0.065,
  WV: 0.06,
  WI: 0.05,
  WY: 0.04,
};

/*

$$\   $$\           $$\
$$ |  $$ |          $$ |
$$ |  $$ | $$$$$$\  $$ | $$$$$$\   $$$$$$\   $$$$$$\   $$$$$$$\
$$$$$$$$ |$$  __$$\ $$ |$$  __$$\ $$  __$$\ $$  __$$\ $$  _____|
$$  __$$ |$$$$$$$$ |$$ |$$ /  $$ |$$$$$$$$ |$$ |  \__|\$$$$$$\
$$ |  $$ |$$   ____|$$ |$$ |  $$ |$$   ____|$$ |       \____$$\
$$ |  $$ |\$$$$$$$\ $$ |$$$$$$$  |\$$$$$$$\ $$ |      $$$$$$$  |
\__|  \__| \_______|\__|$$  ____/  \_______|\__|      \_______/
                        $$ |
                        $$ |
                        \__|
*/

function retrieveLeanBag(req, done) {
  let query = {
    user: req.params.userId,
  };

  Bag.findOne(query)
    //.deepPopulate('user items items.product items.size items.variant items.user items.product.brand items.product.department items.product.groups items.product.images items.product.sizes items.product.type items.product.variants items.product.stock items.product.stock.variant')
    .exec(function (err, bag) {
      if (err) {
        return done({ status: 500, body: { error: err } });
      } else {
        return done(null, req, bag);
      }
    });
}

function retrieveProduct(items, array, counter, done) {
  let query = {
    _id: items[counter].product,
  };

  Product.findOne(query).exec(function (err, product) {
    if (err) {
      return done({ status: 500, body: { error: err } });
    } else if (!product) {
      array.push({});
      return done(null, items, array, ++counter);
    } else {
      array.push(product);
      return done(null, items, array, ++counter);
    }
  });
}

function retrieveProducts(req, list, done) {
  let functions = [];
  let array = [];
  let counter = 0;

  if (list.items.length > 0) {
    functions.push(async.apply(retrieveProduct, list.items, array, counter));
  } else {
    return done(null, req, []);
  }

  for (let i = 1; i < list.items.length; i++) {
    functions.push(retrieveProduct);
  }

  async.waterfall(functions, function (err, items, products, counter) {
    if (err) {
      return done({ status: 500, body: { error: err } });
    } else {
      return done(null, req, products);
    }
  });
}

function retrieveProductPromotions(products, array, counter, done) {
  let query = {
    _id: { $exists: true },
  };

  let or = [];
  for (let i = 0; i < products[counter].variants.length; i++) {
    or.push({ variants: products[counter].variants[i] });
  }

  for (let i = 0; i < products[counter].groups.length; i++) {
    or.push({ groups: products[counter].groups[i] });
  }

  or.push({ types: products[counter].type });
  or.push({ brands: products[counter].brand });
  or.push({ department: products[counter].department });

  if (or.length > 0) {
    query["$or"] = or;
  }

  let now = new Date().toISOString();
  query.start = { $lte: now };
  query.end = { $gte: now };

  Promotion.find(query)
    .deepPopulate("brands departments types variants groups")
    .exec(function (err, promotions) {
      if (err) {
        return done({ status: 500, body: { error: err } });
      } else if (promotions.length == 0) {
        winston.info("*** No Promotions Found ***");
        array.push([]);
        return done(null, products, array, ++counter);
      } else {
        winston.info("*** " + promotions.length + " Promotions Found ***");
        array.push(promotions);
        return done(null, products, array, ++counter);
      }
    });
}

function retrievePromotions(req, products, done) {
  let functions = [];
  let array = [];
  let counter = 0;

  if (products.length > 0) {
    functions.push(
      async.apply(retrieveProductPromotions, products, array, counter)
    );
  } else {
    return done(null, req, []);
  }

  for (let i = 1; i < products.length; i++) {
    functions.push(retrieveProductPromotions);
  }

  async.waterfall(functions, function (err, products, promotions, counter) {
    if (err) {
      return done({ status: 500, body: { error: err } });
    } else {
      return done(null, req, promotions);
    }
  });
}

function assembleBag(req, promotions, done) {
  let query = {
    user: req.params.userId,
  };

  Bag.findOne(query)
    .deepPopulate(
      "user items items.product items.size items.variant items.user items.product.brand items.product.department items.product.groups items.product.images items.product.sizes items.product.type items.product.variants items.product.stock items.product.stock.variant item.product.price_changes.user item.product.sales.user"
    )
    .exec(function (err, bag) {
      if (err) {
        return done({ status: 500, body: { error: err } });
      } else {
        let products = [];
        for (let i = 0; i < bag.items.length; i++) {
          let json = JSON.parse(JSON.stringify(bag.items[i].product));
          if (promotions[i].length > 0) {
            json.promotions = JSON.parse(JSON.stringify(promotions[i]));
          }
          products.push(json);
        }

        let bagOut = JSON.parse(JSON.stringify(bag));

        for (let i = 0; i < bagOut.items.length; i++) {
          bagOut.items[i].product = products[i];
        }

        return done(null, req, bagOut);
      }
    });
}

function calculateDiscounts(req, bag, done) {
  let functions = [];
  let counter = 0;
  let array = [];

  if (bag.items.length > 0) {
    functions.push(async.apply(calculateDiscount, bag.items, array, counter));
  } else {
    return done(null, req, bag, []);
  }

  for (let i = 1; i < bag.items.length; i++) {
    functions.push(calculateDiscount);
  }

  async.waterfall(functions, function (err, items, products, counter) {
    if (err) {
      return done({ status: 500, body: { error: err } });
    } else {
      return done(null, req, bag, products);
    }
  });
}

function calculateDiscount(items, array, counter, done) {
  let product = JSON.parse(JSON.stringify(items[counter].product));
  let active_sales = [];
  product.sales.forEach((element) => {
    if (
      new Date() >= new Date(element.start) &&
      new Date() <= new Date(element.end)
    ) {
      active_sales.push(element);
    }
  });
  product.sales = active_sales;

  let stackableDiscount = 0.0;
  let stackableEndDate;

  let standaloneDiscount = 0.0;
  let standaloneEndDate;

  if (
    (product.promotions && product.promotions.length > 0) ||
    (active_sales && active_sales.length > 0)
  ) {
    // First Find Stackable Discount Amount
    let stackablePromotions = product.promotions
      ? product.promotions.filter(
          (element) => element.stackable == true && element.minimum == 0
        )
      : [];
    let stackableSales = active_sales
      ? active_sales.filter((element) => element.stackable == true)
      : [];

    if (stackablePromotions.length > 0 || stackableSales.length > 0) {
      let salePercentages = stackableSales.filter(
        (element) => element.type == "percentage"
      );
      let saleAmounts = stackableSales.filter(
        (element) => element.type == "amount"
      );

      let promotionPercentages = stackablePromotions.filter(
        (element) => element.type == "percentage"
      );
      let promotionAmounts = stackablePromotions.filter(
        (element) => element.type == "amount"
      );

      let percentageDiscounts = [];
      salePercentages.forEach((element) =>
        percentageDiscounts.push(element.value)
      );
      promotionPercentages.forEach((element) =>
        percentageDiscounts.push(element.value)
      );
      percentageDiscounts.sort((a, b) => a - b);

      let newPrice = product.price;

      saleAmounts.forEach((element) => {
        newPrice = newPrice - element.value;
      });

      promotionAmounts.forEach((element) => {
        newPrice = newPrice - element.value;
      });

      percentageDiscounts.forEach((element) => {
        newPrice = newPrice * ((100.0 - element) / 100.0);
      });

      stackableDiscount = product.price - newPrice;

      let endDate = new Date("December 31, 2099 00:20:00");
      if (stackablePromotions) {
        stackablePromotions.forEach((element) => {
          if (element.end < endDate) {
            endDate = element.end;
          }
        });
      }

      if (stackableSales) {
        stackableSales.forEach((element) => {
          if (element.end < endDate) {
            endDate = element.end;
          }
        });
      }

      stackableEndDate = endDate;

      /*
            console.log('Stackable New Price: ' + newPrice.toFixed(2));
            console.log('Stackable Discount: ' + stackableDiscount.toFixed(2));
            console.log('Stackable End Date: ' + stackableEndDate.toString());
            */
    }

    // First Find Stackable Discount Amount
    let standalonePromotions = product.promotions
      ? product.promotions.filter((element) => element.stackable == false)
      : [];
    let standaloneSales = active_sales
      ? product.sales.filter((element) => element.stackable == false)
      : [];

    if (standalonePromotions.length > 0 || standaloneSales.length > 0) {
      let discounts = [];

      if (standalonePromotions) {
        standalonePromotions.forEach((element) => {
          let object = {};
          object["type"] = element.type;
          object["end"] = element.end;
          object["value"] = element.value;
          discounts.push(object);
        });
      }

      if (standaloneSales) {
        standaloneSales.forEach((element) => {
          let object = {};
          object["type"] = element.type;
          object["end"] = element.end;
          object["value"] = element.value;
          discounts.push(object);
        });
      }

      let index = 0;
      let high = 0.0;
      for (let i = 0; i < discounts.length; i++) {
        let discount = discounts[i];

        if (discount["type"] == "amount") {
          if (discount["value"] > high) {
            index = i;
            high = discount["value"];
          }
        } else if (discount["type"] == "percentage") {
          let value = discount["value"];
          let newPrice = product.price * ((100.0 - value) / 100.0);
          let savings = product.price - newPrice;
          if (savings > high) {
            index = i;
            high = savings;
          }
        }
      }

      standaloneDiscount = high;
      standaloneEndDate = discounts[index]["end"];

      /*
            console.log('Standalone New Price: ' + (product.price - standaloneDiscount).toFixed(2));
            console.log('Standalone Discount: ' + standaloneDiscount.toFixed(2));
            console.log('Standalone End Date: ' + standaloneEndDate.toString());
            */
    }

    if (stackableDiscount > 0.0 || standaloneDiscount > 0.0) {
      product.sale = true;

      if (stackableDiscount > standaloneDiscount) {
        product.discount = parseFloat(stackableDiscount.toFixed(2));
        product.price_end = stackableEndDate;
      } else {
        product.discount = parseFloat(standaloneDiscount.toFixed(2));
        product.price_end = standaloneEndDate;
      }
    } else {
      product.discount = 0.0;
      product.sale = false;
    }
  } else {
    product.sale = false;
    product.discount = 0.0;
  }

  array.push(JSON.parse(JSON.stringify(product)));
  return done(null, items, array, ++counter);
}

function calculateTotals(req, bag, products, done) {
  if (bag.items.length != products.length) {
    return done({
      status: 500,
      body: { error: "Calculate Totals: Array size mismatch" },
    });
  }

  let sub_total = 0.0;
  let shipping = 6.95;
  let tax = 0.0;
  let total = 0.0;
  let discount = 0.0;
  let currency = "USD";

  for (let i = 0; i < bag.items.length; i++) {
    //let price = products[i].sale ? products[i].price - products[i].discount : products[i].price;
    //tax += parseFloat((price * SalesTable[req.body.shipping_address.state]).toFixed(2)) * bag.items[i].quantity;

    let line_total = products[i].price * parseFloat(bag.items[i].quantity);
    let line_discount = 0.0;

    if (products[i].sale == true) {
      line_discount = products[i].discount * parseFloat(bag.items[i].quantity);
    }

    line_total -= line_discount;
    sub_total += line_total;
    discount += line_discount;
  }

  tax = sub_total * SalesTable[req.body.shipping_address.state];

  total = sub_total + tax + shipping;

  let content = {
    sub_total: parseFloat(sub_total.toFixed(2)),
    tax: parseFloat(tax.toFixed(2)),
    discount: parseFloat(discount.toFixed(2)),
    shipping: parseFloat(shipping.toFixed(2)),
    total: parseFloat(total.toFixed(2)),
    currency: currency,
  };

  return done(null, req, bag, products, content);
}

function compareTotals(req, bag, products, content, done) {
  console.log("Body: ");
  console.log(req.body);
  console.log("Content: ");
  console.log(content);

  let valid = true;

  if (req.body.sub_total != content.sub_total) {
    valid = false;
  }

  if (req.body.tax != content.tax) {
    valid = false;
  }

  if (req.body.discount != content.discount) {
    valid = false;
  }

  if (req.body.shipping != content.shipping) {
    valid = false;
  }

  if (req.body.total != content.total) {
    valid = false;
  }

  if (req.body.currency != content.currency) {
    valid = false;
  }

  if (valid == false) {
    return done({
      status: 500,
      body: { error: "Compare Totals: Value mismatch" },
    });
  }

  return done(null, req, bag, products, content);
}

function getOrderId(req, bag, products, content, statusCode, result, done) {
  Macros.findOne({ name: global.MACROS_DOC_NAME }).exec(function (err, macros) {
    if (err) {
      return done({ status: 500, body: { error: err } });
    } else {
      let start = "DS-";
      let count = macros.count.toString();
      let len = start.length + count.length;

      // Generate 5 digit random Code
      var randomResult = "";
      var characters = "0123456789";
      var charactersLength = characters.length;
      let length = 10 - len;
      for (var k = 0; k < length; k++) {
        randomResult =
          randomResult +
          characters.charAt(Math.floor(Math.random() * charactersLength));
      }

      let orderId = start + randomResult + count;
      return done(
        null,
        req,
        bag,
        products,
        content,
        statusCode,
        result,
        orderId
      );
    }
  });
}

function updateMacrosCount(
  req,
  bag,
  products,
  content,
  statusCode,
  result,
  orderId,
  done
) {
  Macros.update({ name: global.MACROS_DOC_NAME }, { $inc: { count: 1 } }).exec(
    function (err) {
      if (err) {
        return done({ status: 500, body: { error: err } });
      } else {
        return done(
          null,
          req,
          bag,
          products,
          content,
          statusCode,
          result,
          orderId
        );
      }
    }
  );
}

function createOrder(
  req,
  bag,
  products,
  content,
  statusCode,
  result,
  orderId,
  done
) {
  console.log("Order ID (Create Order): " + orderId);
  console.log(req.body);

  let now = new Date();

  let order = Order();

  order.orderId = orderId;
  order.user = req.body.user;
  order.sub_total = content.sub_total;
  order.tax = content.tax;
  order.total = content.total;
  order.discount = content.discount;
  order.currency = content.currency;
  order.shipping = content.shipping;
  order.tax_rate = SalesTable[req.body.shipping_address.state].toFixed(6);
  order.shipments = [];
  order.shipping_address = req.body.shipping_address;
  order.billing_address = req.body.billing_address;
  order.payments = [new Payment(result.payment)];
  order.status = [
    new OrderStatus({
      date: now,
      status: "Purchased",
      user: req.body.user,
    }),
  ];

  let items = [];
  for (let i = 0; i < bag.items.length; i++) {
    let status = new StockStatus({
      date: now,
      user: req.body.user,
      status: "Purchased",
    });

    let item = OrderItem({
      product: bag.items[i].product._id,
      size: bag.items[i].size._id,
      variant: bag.items[i].variant._id,
      sku: bag.items[i].sku,
      quantity: bag.items[i].quantity,
      status: status,
      tax: parseFloat(
        (
          parseFloat((products[i].price - products[i].discount).toFixed(2)) *
          SalesTable[req.body.shipping_address.state]
        ).toFixed(2)
      ),
      list_price: products[i].price,
      discount: products[i].discount,
      discount_price: parseFloat(
        (products[i].price - products[i].discount).toFixed(2)
      ),
      sale: products[i].sale,
    });

    if (products[i].promotions) {
      item.promotions = [];
      products[i].promotions.forEach((element) => {
        item.promotions.push(element._id);
      });
    }

    if (products[i].sales) {
      item.sales = [];
      products[i].sales.forEach((element) => {
        item.sales.push(element._id);
      });
    }

    items.push(item);
  }

  order.items = items;

  order.save(function (err, order) {
    if (err) {
      return done({ status: 500, body: { error: err } });
    } else {
      return done(null, req, bag, products, content, statusCode, result, order);
    }
  });
}

function clearBag(
  req,
  bag,
  products,
  content,
  statusCode,
  result,
  order,
  done
) {
  let query = {
    user: req.params.userId,
  };

  let _in = {
    $in: [],
  };

  bag.items.forEach((element) => {
    _in.$in.push(element._id);
  });

  Bag.update(query, { $pull: { items: { _id: _in } } }).exec(function (err) {
    if (err) {
      return done({ status: 500, body: { error: err } });
    } else {
      return done(null, req, bag, products, content, statusCode, result, order);
    }
  });
}

/*
 
 $$$$$$\  $$$$$$$\ $$$$$$\       $$$$$$$$\                  
$$  __$$\ $$  __$$\\_$$  _|      $$  _____|                 
$$ /  $$ |$$ |  $$ | $$ |        $$ |   $$$$$$$\   $$$$$$$\ 
$$$$$$$$ |$$$$$$$  | $$ |        $$$$$\ $$  __$$\ $$  _____|
$$  __$$ |$$  ____/  $$ |        $$  __|$$ |  $$ |\$$$$$$\  
$$ |  $$ |$$ |       $$ |        $$ |   $$ |  $$ | \____$$\ 
$$ |  $$ |$$ |     $$$$$$\       $$ |   $$ |  $$ |$$$$$$$  |
\__|  \__|\__|     \______|      \__|   \__|  \__|\_______/ 
                                                            
*/

exports.process_payment = async function (req, res) {
  // We validate the payload for specific fields. You may disable this feature
  // if you would prefer to handle payload validation on your own.
  req.checkParams("userId", "required").notEmpty();
  req.checkParams("bagId", "required").notEmpty();
  req.checkBody("sourceId", "required").notEmpty();
  req.checkBody("locationId", "required").notEmpty();
  req.checkBody("sub_total", "required").notEmpty();
  req.checkBody("tax", "required").notEmpty();
  req.checkBody("discount", "required").notEmpty();
  req.checkBody("shipping", "required").notEmpty();
  req.checkBody("currency", "required").notEmpty();
  req.checkBody("total", "required").notEmpty();
  req.checkBody("bag", "required").notEmpty();
  req.checkBody("user", "required").notEmpty();
  req.checkBody("billing_address", "required").notEmpty();
  req.checkBody("shipping_address", "required").notEmpty();

  if (req.validationErrors()) {
    return res.status(400).send({ errors: req.validationErrors() });
  }

  async.waterfall(
    [
      async.apply(retrieveLeanBag, req),
      retrieveProducts,
      retrievePromotions,
      assembleBag,
      calculateDiscounts,
      calculateTotals,
      compareTotals,
    ],
    async function (err, reqOut, bag, products, content) {
      if (err) {
        return res.status(err.status).send(err.body);
      } else {
        await retry(async (bail, attempt) => {
          try {
            logger.info("Creating payment", { attempt });
            const paymentAmount = (content.total * 100).toFixed(0);
            const paymentCurrency = content.currency;
            const idempotencyKey = req.body.idempotencyKey || nanoid();
            const payment = {
              idempotencyKey,
              locationId: req.body.locationId,
              sourceId: req.body.sourceId,
              // While it's tempting to pass this data from the client
              // Doing so allows bad actor to modify these values
              // Instead, leverage Orders to create an order on the server
              // and pass the Order ID to createPayment rather than raw amounts
              // See Orders documentation: https://developer.squareup.com/docs/orders-api/what-it-does
              amountMoney: {
                // the expected amount is in cents, meaning this is $1.00.
                amount: paymentAmount,
                // If you are a non-US account, you must change the currency to match the country in which
                // you are accepting the payment.
                currency: paymentCurrency,
              },
            };

            console.log("Payment: ");
            console.log(payment);
            // VerificationDetails is part of Secure Card Authentication.
            // This part of the payload is highly recommended (and required for some countries)
            // for 'unauthenticated' payment methods like Cards.
            if (req.body.verificationToken) {
              payment.verificationToken = req.body.verificationToken;
            }

            const { result, statusCode } =
              await square.paymentsApi.createPayment(payment);

            logger.info("Payment succeeded!", { result, statusCode });

            async.waterfall(
              [
                async.apply(
                  getOrderId,
                  req,
                  bag,
                  products,
                  content,
                  statusCode,
                  toObject(result)
                ),
                updateMacrosCount,
                createOrder,
                clearBag,
              ],
              async function (
                err,
                reqOut,
                bag,
                products,
                content,
                statusCode,
                result,
                order
              ) {
                if (err) {
                  console.log(err);
                  return res.status(err.status).send(err.body);
                } else {
                  return res.status(statusCode).send({
                    orderId: order._id,
                  });
                }
              }
            );
            //return res.status(statusCode).send(toObject(result));
          } catch (ex) {
            if (ex instanceof ApiError) {
              // likely an error in the request. don't retry
              logger.info(ex.errors);
              return res.status(500).send({ error: ex.errors });
            } else {
              // IDEA: send to error reporting service
              logger.info(
                `Error creating payment on attempt ${attempt}: ${ex}`
              );
              return res.status(500).send({ errors: ex });
            }
          }
        });
      }
    }
  );
};

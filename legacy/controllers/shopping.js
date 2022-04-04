/**
 * shopping.js
 *
 * api.goria.com
 * by AS3ICS
 *
 * Zach DeGeorge
 * zach@as3ics.com
 *
 * Shopping Controller
 *
 * @format
 */

const { OrdersApi } = require("square");
const sku = require("../models/sku");
const { rawListeners } = require("../models/sku");

var mongoose = require("mongoose"),
  winston = require("winston"),
  async = require("async"),
  Product = mongoose.model("Product"),
  Variant = mongoose.model("Variant"),
  Size = mongoose.model("Size"),
  User = mongoose.model("User"),
  Stock = mongoose.model("Stock"),
  Bag = mongoose.model("Bag"),
  StockStatus = mongoose.model("StockStatus"),
  Wishlist = mongoose.model("Wishlist"),
  Promotion = mongoose.model("Promotion"),
  OrderItem = mongoose.model("OrderItem"),
  Payment = mongoose.model("Payment"),
  Order = mongoose.model("Order"),
  Macros = mongoose.model("Macros"),
  OrderStatus = mongoose.model("OrderStatus"),
  Refund = mongoose.model("Refund"),
  ejs = require("ejs"),
  mailgun = require("mailgun-js")({
    apiKey: global.MAILGUN_API_KEY,
    domain: global.MAILGUN_API_URL,
  }),
  deepPopulate = require("mongoose-deep-populate")(mongoose);

const {
  ApiError,
  client2: square,
  client2,
} = require("../square/square.client");
const logger = require("../square/square.logger");
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

function retrieveLeanWishlist(req, done) {
  let query = {
    user: req.params.userId,
  };

  Wishlist.findOne(query)
    //.deepPopulate('user items items.product items.size items.variant items.user items.product.brand items.product.department items.product.groups items.product.images items.product.sizes items.product.type items.product.variants items.product.stock items.product.stock.variant')
    .exec(function (err, wishlist) {
      if (err) {
        return done({ status: 500, body: { error: err } });
      } else {
        return done(null, req, wishlist);
      }
    });
}

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

  if (functions.length > 0) {
    async.waterfall(functions, function (err, products, promotions, counter) {
      if (err) {
        return done({ status: 500, body: { error: err } });
      } else {
        return done(null, req, promotions);
      }
    });
  } else {
    return done(null, req, []);
  }
}

function retrieveWishlist(req, promotions, done) {
  let query = {
    user: req.params.userId,
  };

  Wishlist.findOne(query)
    .deepPopulate(
      "user items items.product items.size items.variant items.user items.product.brand items.product.department items.product.groups items.product.image items.product.images items.product.sizes items.product.type items.product.variants items.product.stock items.product.stock.variant item.product.price_changes.user item.product.sales.user"
    )
    .exec(function (err, wishlist) {
      if (err) {
        return done({ status: 500, body: { error: err } });
      } else {
        let products = [];
        for (let i = 0; i < wishlist.items.length; i++) {
          let json = JSON.parse(JSON.stringify(wishlist.items[i].product));
          json.promotions = JSON.parse(JSON.stringify(promotions[i]));
          products.push(json);
        }

        let wishlistOut = JSON.parse(JSON.stringify(wishlist));

        for (let i = 0; i < wishlistOut.items.length; i++) {
          wishlistOut.items[i].product = products[i];
        }

        return done(null, wishlistOut);
      }
    });
}

function retrieveBag(req, promotions, done) {
  let query = {
    user: req.params.userId,
  };

  Bag.findOne(query)
    .deepPopulate(
      "user items items.product items.size items.variant items.user items.product.brand items.product.department items.product.groups items.product.image items.product.images items.product.sizes items.product.type items.product.variants items.product.stock items.product.stock.variant item.product.price_changes.user item.product.sales.user"
    )
    .exec(function (err, bag) {
      if (err) {
        return done({ status: 500, body: { error: err } });
      } else {
        let products = [];
        for (let i = 0; i < bag.items.length; i++) {
          let json = JSON.parse(JSON.stringify(bag.items[i].product));
          json.promotions = JSON.parse(JSON.stringify(promotions[i]));
          products.push(json);
        }

        let bagOut = JSON.parse(JSON.stringify(bag));

        for (let i = 0; i < bagOut.items.length; i++) {
          bagOut.items[i].product = products[i];
        }

        return done(null, bagOut);
      }
    });
}

function retrieveOrder(req, done) {
  let query = {
    _id: req.params.orderId,
  };

  Order.findOne(query).exec(function (err, order) {
    if (err) {
      return done({ status: 500, body: { error: err } });
    } else if (!order) {
      return done({ status: 404, body: { error: "Order not found." } });
    } else {
      return done(null, req, order);
    }
  });
}

function getReturnId(req, order, done) {
  Macros.findOne({ name: global.MACROS_DOC_NAME }).exec(function (err, macros) {
    if (err) {
      return done({ status: 500, body: { error: err } });
    } else {
      let start = "RT-";
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

      let returnId = start + randomResult + count;
      return done(null, req, order, returnId);
    }
  });
}

function updateMacrosCount(req, order, returnId, done) {
  Macros.update({ name: global.MACROS_DOC_NAME }, { $inc: { count: 1 } }).exec(
    function (err) {
      if (err) {
        return done({ status: 500, body: { error: err } });
      } else {
        return done(null, req, order, returnId);
      }
    }
  );
}

function approveDenyRequest(req, order, done) {
  let item = order.items.id(req.params.itemId);

  if (item == undefined) {
    return done({ status: 404, body: { error: "Item not found. " } });
  }

  let now = new Date();

  item.return_request.approved = req.body.approved;
  item.return_request.denied = req.body.denied;
  item.return_request.user = req.body.user;
  item.return_request.decision_date = now;

  if (req.body.approved == true) {
    let status = new StockStatus({
      date: now,
      user: req.body.user,
      status: "Return Approved",
    });

    item.status = status;
  } else {
    let status = new StockStatus({
      date: now,
      user: req.body.user,
      status: "Return Denied",
    });

    item.status = status;
  }

  order.save(function (err) {
    if (err) {
      return done({ status: 500, body: { error: err } });
    } else {
      return done(null, req, order);
    }
  });
}

function splitItemInOrder(req, order, returnId, done) {
  let item = order.items.id(req.params.itemId);

  if (item == undefined) {
    return done({ status: 404, body: { error: "Item not found. " } });
  }

  if (parseInt(item.quantity) != parseInt(req.body.quantity)) {
    if (parseInt(req.body.quantity) > parseInt(item.quantity)) {
      return done({
        status: 500,
        body: {
          error: "Can't return more quantity than there is of item quantity",
        },
      });
    }

    let copy = new OrderItem();

    copy.product = item.product;
    copy.size = item.size;
    copy.variant = item.variant;
    copy.sku = item.sku;
    copy.quantity = parseInt(item.quantity) - parseInt(req.body.quantity);
    copy.list_price = item.list_price;
    copy.discount = item.discount;
    copy.sale = item.sale;
    copy.tax = item.tax;
    copy.discount_price = item.discount_price;
    copy.status = item.status;
    copy.promotions = [];
    item.promotions.forEach((element) => {
      copy.promotions.push(element);
    });
    copy.sales = [];
    item.sales.forEach((element) => {
      copy.sales.push(element);
    });

    Order.updateOne({ _id: req.params.orderId }, { $push: { items: copy } });

    order.items.id(req.params.itemId).quantity =
      parseInt(item.quantity) - parseInt(req.body.quantity);
    order.save();

    let now = new Date();

    copy.quantity = parseInt(req.body.quantity);
    copy.id = mongoose.Types.ObjectId();

    let status = StockStatus();
    status.date = now;
    status.user = req.params.userId;
    status.status = "Return Requested";

    copy.status = status;

    copy.return_request.returnId = returnId;
    copy.return_request.requested_date = now;
    copy.return_request.quantity = req.body.quantity;
    copy.return_request.reason = req.body.reason;
    copy.return_request.return_method = req.body.return_method;
    copy.return_request.refund_method = req.body.refund_method;
    copy.return_request.approved = false;
    copy.return_request.denied = false;

    if (req.body.other_reason != undefined) {
      copy.return_request.other_reason = req.body.other_reason;
    }

    Order.updateOne(
      { _id: req.params.orderId },
      { $push: { items: copy } }
    ).exec(function (err) {
      if (err) {
        return done({ status: 500, body: { error: err } });
      } else {
        return done(null, req, order, returnId);
      }
    });
  } else {
    let now = new Date();

    let status = StockStatus();
    status.date = new Date();
    status.user = req.params.userId;
    status.status = "Return Requested";

    item.status = status;

    item.return_request.returnId = returnId;
    item.return_request.requested_date = now;
    item.return_request.quantity = req.body.quantity;
    item.return_request.reason = req.body.reason;
    item.return_request.return_method = req.body.return_method;
    item.return_request.refund_method = req.body.refund_method;
    item.return_request.approved = false;
    item.return_request.denied = false;

    if (req.body.other_reason != undefined) {
      item.return_request.other_reason = req.body.other_reason;
    }

    order.save(function (err, order) {
      if (err) {
        return done({ status: 500, body: { error: err } });
      } else {
        return done(null, req, order, returnId);
      }
    });
  }
}

function sendRequestConfirmationEmail(req, order, returnId, done) {
  let query = {
    _id: req.params.userId,
  };

  let projection = {
    password: 0,
  };
  User.findOne(query, projection).exec(function (err, user) {
    if (err) {
      return done({ status: 500, body: { error: err } });
    } else {
      var text =
        "You are receiving this message because you have recently requested a new return request from Designica. This email is to confirm that your request has been received and that it will be reviewed within the next two business days for approval. If approved you will receive an additional message with instruction on how to proceed with your return. \n\n";
      text += "For your reference your return id is: " + returnId + "\n\n";
      text +=
        "If you change your mind and no longer wish to return this item you can cancel your return request by visiting the Dashboard from your Designica account. Please do not respond to this email, it is not monitored and it will not be checked. If you have any questions or concerns please use our standard customer support channels. Thank you.";

      ejs.renderFile(
        "app/email_templates/return_request_requested.ejs",
        { user: user.firstName, returnId: returnId },
        function (err, htmlString) {
          if (err) {
            console.error("ejs error", err);
          }

          var data = {
            from: "Designica Jewelry <no-reply@designicajewelry.com>",
            to: user.email,
            subject: "New " + global.APP_NAME + " Return Request",
            html: htmlString,
            text: text,
          };

          mailgun.messages().send(data, function (err, body) {
            if (err) {
              done({ status: 500, body: { error: err } });
            }
            return done(null, req, order, returnId);
          });
        }
      );
    }
  });
}

function updateItemStatussProcessing(req, order, done) {
  let array = order.items;
  let counter = 0;
  let now = new Date();
  let functions = [];

  functions.push(
    async.apply(updateItemStatusProcessing, req, order, counter, now)
  );
  for (let i = 1; i < array.length; i++) {
    functions.push(updateItemStatusProcessing);
  }

  async.waterfall(functions, function (err, req, array, counter, now) {
    if (err) {
      return done({ status: 500, body: { error: err } });
    } else {
      return done(null, req, order);
    }
  });
}

function updateItemStatusProcessing(req, order, counter, date, done) {
  let item = order.items[counter];

  let status = StockStatus();
  status.date = date;
  status.user = req.body.user;
  status.status = "Processing";

  item.status = status;

  order.save(function (err) {
    if (err) {
      console.log(err);
      return done(err);
    } else {
      console.log("Item Saved");
      return done(null, req, order, ++counter, date);
    }
  });
}

function retrieveOrderForUpdateStatus(req, done) {
  let query = {
    _id: req.params.orderId,
  };

  Order.findOne(query)
    .deepPopulate(
      "user items.product items.product.variants items.product.sizes items.product.type items.product.department items.product.groups items.product.image items.product.images items.size items.variant items.promotions items.product.stock.variant status.user items.status.user items.return_request.user"
    )
    .exec(function (err, order) {
      if (err) {
        console.log(err);
        return done({ status: 500, body: { error: err } });
      } else {
        return done(null, req, order);
      }
    });
}

function updateItemStatussRefunded(req, order, done) {
  let array = order.items;
  let counter = 0;
  let now = new Date();
  let functions = [];

  functions.push(
    async.apply(updateItemStatusRefunded, req, order, counter, now)
  );
  for (let i = 1; i < array.length; i++) {
    functions.push(updateItemStatusRefunded);
  }

  async.waterfall(functions, function (err, req, array, counter, now) {
    if (err) {
      return done({ status: 500, body: { error: err } });
    } else {
      return done(null, req, order);
    }
  });
}

function updateItemStatusRefunded(req, order, counter, date, done) {
  let item = order.items[counter];

  let status = StockStatus();
  status.date = date;
  status.user = req.body.user;
  status.status = "Refunded";

  item.status = status;

  order.save(function (err) {
    if (err) {
      console.log(err);
      return done(err);
    } else {
      console.log("Item Saved");
      return done(null, req, order, ++counter, date);
    }
  });
}

function updateOrderStatusDropOrder(req, order, done) {
  let query = {
    _id: req.params.orderId,
  };

  let status = OrderStatus({
    date: new Date(),
    status: "Dropped",
    description: req.body.description,
    user: req.body.user,
  });

  Order.update(query, { $push: { status: status } }).exec(function (err) {
    if (err) {
      console.log(err);
      return done({ status: 500, body: { error: err } });
    } else {
      return done(null, order);
    }
  });
}

function updateOrderStatusCancelOrder(req, order, done) {
  let query = {
    _id: req.params.orderId,
  };

  let status = OrderStatus({
    date: new Date(),
    status: "Cancelled",
    description: req.body.description,
    user: req.body.user,
  });

  Order.update(query, { $push: { status: status } }).exec(function (err) {
    if (err) {
      console.log(err);
      return done({ status: 500, body: { error: err } });
    } else {
      return done(null, order);
    }
  });
}

function updateOrderStatusProcessingOrder(req, order, done) {
  let query = {
    _id: req.params.orderId,
  };

  let status = OrderStatus({
    date: new Date(),
    status: "Processing",
    user: req.body.user,
  });

  Order.update(query, { $push: { status: status } }).exec(function (err) {
    if (err) {
      console.log(err);
      return done({ status: 500, body: { error: err } });
    } else {
      return done(null);
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

// Add Item to Wishlist
// POST {{HOST}}/shopping/wishlist/:userId
exports.add_to_wishlist = function (req, res) {
  req.checkParams("userId", "required").notEmpty();
  req.checkBody("user", "required").notEmpty();
  req.checkBody("product", "required").notEmpty();
  req.checkBody("variant", "required").notEmpty();
  req.checkBody("size", "required").notEmpty();
  req.checkBody("sku", "required").notEmpty();
  req.checkBody("quantity", "required").notEmpty();

  if (req.validationErrors()) {
    return res.status(400).send({ errors: req.validationErrors() });
  }

  let query = {
    user: req.params.userId,
  };

  let stock = Stock(req.body);

  let status = StockStatus();
  status.date = new Date();
  status.user = req.params.userId;
  status.status = "Wishlist";

  stock.status = status;

  Wishlist.update(query, { $push: { items: stock } }).exec(function (err) {
    if (err) {
      return res.status(500).send(err);
    } else {
      return res.status(200).send({});
    }
  });
};

// Add Item to Shopping Bag
// POST {{HOST}}/shopping/bag/:userId
exports.add_to_bag = function (req, res) {
  req.checkParams("userId", "required").notEmpty();
  req.checkBody("user", "required").notEmpty();
  req.checkBody("product", "required").notEmpty();
  req.checkBody("variant", "required").notEmpty();
  req.checkBody("size", "required").notEmpty();
  req.checkBody("sku", "required").notEmpty();
  req.checkBody("quantity", "required").notEmpty();

  if (req.validationErrors()) {
    return res.status(400).send({ errors: req.validationErrors() });
  }

  let query = {
    user: req.params.userId,
  };

  let stock = Stock(req.body);

  let status = StockStatus();
  status.date = new Date();
  status.user = req.params.userId;
  status.status = "Bag";

  stock.status = status;

  Bag.update(query, { $push: { items: stock } }).exec(function (err) {
    if (err) {
      return res.status(500).send(err);
    } else {
      return res.status(200).send({});
    }
  });
};

// Retrieve User Wishlist
// GET {{HOST}}/shopping/wishlist/:userId
exports.retrieve_wishlist = function (req, res) {
  req.checkParams("userId", "required").notEmpty();

  if (req.validationErrors()) {
    return res.status(400).send({ errors: req.validationErrors() });
  }

  async.waterfall(
    [
      async.apply(retrieveLeanWishlist, req),
      retrieveProducts,
      retrievePromotions,
      retrieveWishlist,
    ],
    function (err, wishlist) {
      if (err) {
        return res.status(err.status).send(err.body);
      } else {
        return res.status(200).send(wishlist);
      }
    }
  );
};

// Retrieve User Bag
// GET {{HOST}}/shopping/bag/:userId
exports.retrieve_bag = function (req, res) {
  req.checkParams("userId", "required").notEmpty();

  if (req.validationErrors()) {
    return res.status(400).send({ errors: req.validationErrors() });
  }

  async.waterfall(
    [
      async.apply(retrieveLeanBag, req),
      retrieveProducts,
      retrievePromotions,
      retrieveBag,
    ],
    function (err, bag) {
      if (err) {
        return res.status(err.status).send(err.body);
      } else {
        return res.status(200).send(bag);
      }
    }
  );
};

// Remove From User Wishlist
// DELETE {{HOST}}/shopping/wishlist/:userId/:stockId
exports.remove_from_wishlist = function (req, res) {
  req.checkParams("userId", "required").notEmpty();
  req.checkParams("stockId", "required").notEmpty();

  if (req.validationErrors()) {
    return res.status(400).send({ errors: req.validationErrors() });
  }

  let query = {
    user: req.params.userId,
  };

  Wishlist.update(query, {
    $pull: { items: { _id: req.params.stockId } },
  }).exec(function (err) {
    if (err) {
      return res.status(500).send(err);
    } else {
      return res.status(200).send({});
    }
  });
};

// Remove From User Bag
// DELETE {{HOST}}/shopping/bag/:userId/:stockId
exports.remove_from_bag = function (req, res) {
  req.checkParams("userId").notEmpty();
  req.checkParams("stockId").notEmpty();

  if (req.validationErrors()) {
    return res.status(400).send({ errors: req.validationErrors() });
  }

  let query = {
    user: req.params.userId,
  };

  Bag.update(query, { $pull: { items: { _id: req.params.stockId } } }).exec(
    function (err) {
      if (err) {
        return res.status(500).send(err);
      } else {
        return res.status(200).send({});
      }
    }
  );
};

// Update Wishlist Iten
// PUT {{HOST}}/shopping/wishlist/:userId
exports.update_wishlist_item = function (req, res) {
  req.checkParams("userId", "required").notEmpty();
  req.checkBody("product", "required").notEmpty();
  req.checkBody("variant", "required").notEmpty();
  req.checkBody("size", "required").notEmpty();
  req.checkBody("sku", "required").notEmpty();
  req.checkBody("quantity", "required").notEmpty();
  req.checkBody("stockId", "required").notEmpty();

  if (req.validationErrors()) {
    return res.status(400).send({ errors: req.validationErrors() });
  }

  let query = {
    user: req.params.userId,
  };

  Wishlist.findOne(query).exec(function (err, wishlist) {
    if (err) {
      winston.error(err);
      return res.status(500).send(err);
    } else if (!wishlist) {
      return res.status(404).send({});
    } else {
      let stock = wishlist.items.id(req.body.stockId);
      stock.set(req.body);
      wishlist.save(function (err) {
        if (err) {
          winston.error(err);
          return res.status(500).send({ error: err });
        } else {
          return res.status(200).send({});
        }
      });
    }
  });
};

// Update Bag Item
// PUT {{HOST}}/shopping/bag/:userId
exports.update_bag_item = function (req, res) {
  req.checkParams("userId", "required").notEmpty();
  req.checkBody("product", "required").notEmpty();
  req.checkBody("variant", "required").notEmpty();
  req.checkBody("size", "required").notEmpty();
  req.checkBody("sku", "required").notEmpty();
  req.checkBody("quantity", "required").notEmpty();
  req.checkBody("stockId", "required").notEmpty();

  if (req.validationErrors()) {
    return res.status(400).send({ errors: req.validationErrors() });
  }

  let query = {
    user: req.params.userId,
  };

  Bag.findOne(query).exec(function (err, bag) {
    if (err) {
      winston.error(err);
      return res.status(500).send(err);
    } else if (!bag) {
      return res.status(404).send({});
    } else {
      let stock = bag.items.id(req.body.stockId);
      stock.set(req.body);
      bag.save(function (err) {
        if (err) {
          winston.error(err);
          return res.status(500).send({ error: err });
        } else {
          return res.status(200).send({});
        }
      });
    }
  });
};

// Move from Bag to Wishlist
// GET {{HOST}}/shopping/bag/:userId/:stockId/wishlist
exports.from_bag_to_wishlist = function (req, res) {
  req.checkParams("userId", "required").notEmpty();
  req.checkParams("stockId", "required").notEmpty();
  req.checkBody("product", "required").notEmpty();
  req.checkBody("variant", "required").notEmpty();
  req.checkBody("size", "required").notEmpty();
  req.checkBody("sku", "required").notEmpty();
  req.checkBody("quantity", "required").notEmpty();

  if (req.validationErrors()) {
    return res.status(400).send({ errors: req.validationErrors() });
  }

  let query = {
    user: req.params.userId,
  };

  Bag.findOne(query).exec(function (err, bag) {
    if (err) {
      return res.status(500).send(err);
    } else if (!bag) {
      return res.status(404).send({});
    } else {
      let stock = Stock(req.body);

      let status = StockStatus();
      status.date = new Date();
      status.user = req.params.userId;
      status.status = "Wishlist";
      stock.status = status;

      Wishlist.update(query, { $push: { items: stock } }).exec(function (err) {
        if (err) {
          return res.status(500).send(err);
        } else {
          Bag.update(query, {
            $pull: { items: { _id: req.params.stockId } },
          }).exec(function (err) {
            if (err) {
              return res.status(500).send(err);
            } else {
              return res.status(200).send({});
            }
          });
        }
      });
    }
  });
};

// Move from Wishlist to Bag
// GET {{HOST}}/shopping/wishlist/:userId/:stockId/bag
exports.from_wishlist_to_bag = function (req, res) {
  req.checkParams("userId", "required").notEmpty();
  req.checkParams("stockId", "required").notEmpty();
  req.checkBody("product", "required").notEmpty();
  req.checkBody("variant", "required").notEmpty();
  req.checkBody("size", "required").notEmpty();
  req.checkBody("sku", "required").notEmpty();
  req.checkBody("quantity", "required").notEmpty();

  if (req.validationErrors()) {
    return res.status(400).send({ errors: req.validationErrors() });
  }

  let query = {
    user: req.params.userId,
  };

  Wishlist.findOne(query).exec(function (err, bag) {
    if (err) {
      return res.status(500).send(err);
    } else if (!bag) {
      return res.status(404).send({});
    } else {
      let stock = Stock(req.body);

      let status = StockStatus();
      status.date = new Date();
      status.user = req.params.userId;
      status.status = "Bag";
      stock.status = status;

      Bag.update(query, { $push: { items: stock } }).exec(function (err) {
        if (err) {
          return res.status(500).send(err);
        } else {
          Wishlist.update(query, {
            $pull: { items: { _id: req.params.stockId } },
          }).exec(function (err) {
            if (err) {
              return res.status(500).send(err);
            } else {
              return res.status(200).send({});
            }
          });
        }
      });
    }
  });
};

// Retrieve Order
// GET {{HOST}}/shopping/order/:orderId
exports.retrieve_order = function (req, res) {
  req.checkParams("orderId").notEmpty();

  if (req.validationErrors()) {
    return res.status(400).send({ errors: req.validationErrors() });
  }

  let query = {
    _id: req.params.orderId,
  };

  Order.findOne(query)
    .deepPopulate(
      "user items.product items.product.variants items.product.sizes items.product.type items.product.department items.product.groups items.product.image items.product.images items.size items.variant items.promotions items.product.stock.variant status.user items.status.user items.return_request.user"
    )
    .exec(function (err, order) {
      if (err) {
        console.log(err);
        return res.status(500).send({ errors: err });
      } else {
        return res.status(200).send(order);
      }
    });
};

// Retrieve Orders By User
// GET {{HOST}}/shopping/:userId/orders
exports.retrieve_orders_by_user = function (req, res) {
  req.checkParams("userId", "required").notEmpty();

  if (req.validationErrors()) {
    return res.status(400).send({ errors: req.validationErrors() });
  }

  let limit = req.query.limit ? req.query.limit : 0;
  let skip = req.query.skip ? req.query.skip : 0;

  let query = {
    user: req.params.userId,
  };

  Order.find(query)
    .limit(limit)
    .skip(skip)
    .deepPopulate(
      "user items.product items.product.variants items.product.sizes items.product.type items.product.department items.product.groups items.product.image items.product.images items.size items.variant items.promotions items.product.stock.variant status.user items.status.user items.return_request.user"
    )
    .exec(function (err, orders) {
      if (err) {
        console.log(err);
        return res.status(500).send({ errors: err });
      } else if (!orders) {
        return res.status(200).send([]);
      } else {
        return res.status(200).send(orders);
      }
    });
};

// Retrieve Orders by Status
// POST {{HOST}}/shopping/orders/status
exports.retrieve_orders_by_status = function (req, res) {
  req.checkBody("status", "required").notEmpty();

  if (req.validationErrors()) {
    return res.status(400).send({ errors: req.validationErrors() });
  }

  let limit = req.query.limit ? req.query.limit : 0;
  let skip = req.query.skip ? req.query.skip : 0;

  let query = {
    $expr: {
      $eq: [{ $last: "$status.status" }, req.body.status],
    },
  };

  Order.find(query)
    .sort({ _creationDate: 1 })
    .limit(limit)
    .skip(skip)
    .deepPopulate(
      "user items.product items.product.variants items.product.sizes items.product.type items.product.department items.product.groups items.product.image items.product.images items.size items.variant items.promotions items.product.stock.variant status.user items.status.user items.return_request.user"
    )
    .exec(function (err, orders) {
      if (err) {
        console.log(err);
        return res.status(500).send({ errors: err });
      } else if (!orders) {
        return res.status(200).send([]);
      } else {
        return res.status(200).send(orders);
      }
    });
};

// Retrieve Orders
// GET {{HOST}}/shopping/orders
exports.retrieve_orders = function (req, res) {
  let limit = req.query.limit ? parseInt(req.query.limit) : 0;
  let skip = req.query.skip ? parseInt(req.query.skip) : 0;

  var query = {
    _id: { $exists: true },
  };

  Order.find(query)
    .sort({ _creationDate: -1 })
    .limit(limit)
    .skip(skip)
    .deepPopulate(
      "user items.product items.product.variants items.product.sizes items.product.type items.product.department items.product.groups items.product.image items.product.images items.size items.variant items.promotions items.product.stock.variant status.user items.status.user items.return_request.user"
    )
    .exec(function (err, orders) {
      if (err) {
        console.log(err);
        return res.status(500).send({ errors: err });
      } else if (!orders) {
        return res.status(200).send([]);
      } else {
        return res.status(200).send(orders);
      }
    });
};

// Request Return of Item
// POST {{HOST}}/shopping/:userId/orders/:orderId/item/:itemId
exports.request_item_return = function (req, res) {
  req.checkParams("userId", "required").notEmpty();
  req.checkParams("orderId", "required").notEmpty();
  req.checkParams("itemId", "required").notEmpty();

  req.checkBody("quantity", "required").notEmpty();
  req.checkBody("reason", "required").notEmpty();
  req.checkBody("return_method", "required").notEmpty();
  req.checkBody("refund_method", "required").notEmpty();

  if (req.validationErrors()) {
    return res.status(400).send({ errors: req.validationErrors() });
  }

  async.waterfall(
    [
      async.apply(retrieveOrder, req),
      getReturnId,
      updateMacrosCount,
      splitItemInOrder,
      sendRequestConfirmationEmail,
    ],
    function (err, req, order, returnId) {
      if (err) {
        console.log(err);
        return res.status(err.status).send(err.body);
      } else {
        return res.status(200).send(order);
      }
    }
  );
};

// Approve Return/Deny Return Request
// POST {{HOST}}/shopping/orders/:orderId/requests/:userId/item/:itemId
exports.approve_or_deny_return_request = function (req, res) {
  req.checkParams("userId", "required").notEmpty();
  req.checkParams("itemId", "required").notEmpty();
  req.checkParams("orderId", "required").notEmpty();

  req.checkBody("approved", "required").notEmpty();
  req.checkBody("denied", "required").notEmpty();
  req.checkBody("user", "required").notEmpty();

  if (req.validationErrors()) {
    return res.status(400).send({ errors: req.validationErrors() });
  }

  async.waterfall(
    [async.apply(retrieveOrder, req), approveDenyRequest],
    function (err, req, order) {
      if (err) {
        console.log(err);
        return res.status(err.status).send(err.body);
      } else {
        return res.status(200).send(order);
      }
    }
  );
};

// Retrieve Return Requests
// GET {{HOST}}/shopping/orders/return/requests
exports.request_return_requests = function (req, res) {
  let limit = req.query.limit ? req.query.limit : 0;
  let skip = req.query.skip ? req.query.skip : 0;

  let query = {
    "items.status.status": "Return Requested",
  };

  Order.find(query)
    .limit(limit)
    .skip(skip)
    .deepPopulate(
      "user items.product items.product.variants items.product.sizes items.product.type items.product.department items.product.groups items.product.image items.product.images items.size items.variant items.promotions items.product.stock.variant status.user items.status.user items.return_request.user"
    )
    .exec(function (err, orders) {
      if (err) {
        console.log(err);
        return res.status(err.status).send(err.body);
      } else {
        return res.status(200).send(orders);
      }
    });
};

// Retrieve User Orders Based On Item Status
// POST {{HOST}}/shopping/orders/:userId/item/status
exports.request_orders_by_item_status = function (req, res) {
  let limit = req.query.limit ? req.query.limit : 0;
  let skip = req.query.skip ? req.query.skip : 0;

  req.checkParams("userId", "required").notEmpty();
  req.checkBody("status", "required").notEmpty();

  if (req.validationErrors()) {
    return res.status(400).send({ errors: req.validationErrors() });
  }

  let query = {
    user: req.params.userId,
  };

  if (req.body.status == "all") {
    query["items.status.status"] = {
      $in: [
        "Return Requested",
        "Return Approved",
        "Return Denied",
        "Return Shipped",
        "Return Received",
        "Return Processing",
        "Returned",
      ],
    };
  } else {
    query["items.status.status"] = req.body.status;
  }

  Order.find(query)
    .limit(limit)
    .skip(skip)
    .sort({ _creationDate: 1 })
    .deepPopulate(
      "user items.product items.product.variants items.product.sizes items.product.type items.product.department items.product.groups items.product.image items.product.images items.size items.variant items.promotions items.product.stock.variant status.user items.status.user items.return_request.user"
    )
    .exec(function (err, orders) {
      if (err) {
        console.log(err);
        return res.status(err.status).send(err.body);
      } else {
        return res.status(200).send(orders);
      }
    });
};

// Drop Order
// POST {{HOST}}/shopping/orders/:orderId/drop
exports.drop_order = function (req, res) {
  req.checkBody("user", "required").notEmpty();
  req.checkBody("description", "required").notEmpty();
  req.checkParams("orderId", "required").notEmpty();

  if (req.validationErrors()) {
    return res.status(400).send({ errors: req.validationErrors() });
  }

  async.waterfall(
    [
      async.apply(retrieveOrderForUpdateStatus, req),
      updateItemStatussRefunded,
      updateOrderStatusDropOrder,
    ],
    async function (err, order) {
      if (err) {
        console.log(err);
        return res.status(err.status).send(err.body);
      } else {
        let refund = {
          idempotencyKey: nanoid(),
          paymentId: order.payments[0].id,
          amountMoney: {
            amount: parseInt(order.payments[0].totalMoney.amount),
            currency: order.payments[0].totalMoney.currency,
          },
        };

        try {
          const response = await client2.refundsApi.refundPayment(refund);

          console.log(response.result);

          let _refund = Refund(toObject(response.result["refund"]));

          let query = {
            _id: req.params.orderId,
          };

          Order.update(query, { $push: { refund_stubs: _refund } }).exec(
            function (err) {
              if (err) {
                return res.status(500).send({ error: err });
              } else {
                return res.status(200).send({});
              }
            }
          );
        } catch (error) {
          console.log(error);

          return res.status(500).send({ error: error });
        }
      }
    }
  );
};

// Cancel Order
// POST {{HOST}}/shopping/orders/:orderId/cancel
exports.cancel_order = function (req, res) {
  req.checkBody("user", "required").notEmpty();
  req.checkBody("description", "required").notEmpty();
  req.checkParams("orderId", "required").notEmpty();

  if (req.validationErrors()) {
    return res.status(400).send({ errors: req.validationErrors() });
  }

  async.waterfall(
    [
      async.apply(retrieveOrderForUpdateStatus, req),
      updateItemStatussRefunded,
      updateOrderStatusCancelOrder,
    ],
    async function (err, order) {
      if (err) {
        console.log(err);
        return res.status(err.status).send(err.body);
      } else {
        let refund = {
          idempotencyKey: nanoid(),
          paymentId: order.payments[0].id,
          amountMoney: {
            amount: parseInt(order.payments[0].totalMoney.amount),
            currency: order.payments[0].totalMoney.currency,
          },
        };

        try {
          const response = await client2.refundsApi.refundPayment(refund);

          console.log(response.result);

          let _refund = Refund(toObject(response.result["refund"]));

          let query = {
            _id: req.params.orderId,
          };

          Order.update(query, { $push: { refund_stubs: _refund } }).exec(
            function (err) {
              if (err) {
                return res.status(500).send({ error: err });
              } else {
                return res.status(200).send({});
              }
            }
          );
        } catch (error) {
          console.log(error);

          return res.status(500).send({ error: error });
        }
      }
    }
  );
};

// Process Order
// POST {{HOST}}/shopping/orders/:orderId/process
exports.process_order = function (req, res) {
  req.checkBody("user", "required").notEmpty();
  req.checkParams("orderId", "required").notEmpty();

  if (req.validationErrors()) {
    return res.status(400).send({ errors: req.validationErrors() });
  }

  async.waterfall(
    [
      async.apply(retrieveOrderForUpdateStatus, req),
      updateItemStatussProcessing,
      updateOrderStatusProcessingOrder,
    ],
    async function (err) {
      if (err) {
        console.log(err);
        return res.status(err.status).send(err.body);
      } else {
        return res.status(200).send({});
      }
    }
  );
};

// Get Payment Refund Status
// {{HOST}}/shopping/order/:orderId/refund/:refundId
exports.get_payment_refund_status = async function (req, res) {
  req.checkParams("orderId", "required").notEmpty();
  req.checkParams("refundId", "required").notEmpty();

  if (req.validationErrors()) {
    return res.status(400).send({ errors: req.validationErrors() });
  }

  let query = {
    _id: req.params.orderId,
  };

  try {
    const response = await client2.refundsApi.getPaymentRefund(
      req.params.refundId
    );

    console.log(response.result);

    let _refund = Refund(toObject(response.result["refund"]));

    Order.update(query, { $push: { refund_stubs: _refund } }).exec(function (
      err
    ) {
      if (err) {
        return res.status(500).send({ error: err });
      } else {
        return res.status(200).send(_refund);
      }
    });
  } catch (error) {
    console.log(error);

    return res.status(500).send({ error: error });
  }
};

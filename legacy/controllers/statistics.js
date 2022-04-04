/**
 * statistics.js
 *
 * api.goria.com
 * by AS3ICS
 *
 * Zach DeGeorge
 * zach@as3ics.com
 *
 * Statistics Controller
 *
 * @format
 */

var mongoose = require("mongoose"),
  winston = require("winston"),
  async = require("async"),
  Statistic = mongoose.model("Statistic"),
  User = mongoose.model("User"),
  Product = mongoose.model("Product"),
  Order = mongoose.model("Order"),
  deepPopulate = require("mongoose-deep-populate")(mongoose);

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

const StockStatusEnum = {
  WISHLIST: "Wishlist",
  BAG: "Bag",
  PURCHASED: "Purchased",
  WAITLISTED: "Waitlisted",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  RETURN_REQUESTED: "Return Requested",
  RETURN_APPROVED: "Return Approved",
  RETURN_DENIED: "Return Denied",
  RETURN_SHIPPED: "Return Shipped",
  RETURN_RECEIVED: "Return Received",
  RETURN_PROCESSING: "Return Processing",
  RETURNED: "Returned",
};

function isReturnEnum(str) {
  if (
    str == StockStatusEnum.RETURN_REQUESTED ||
    str == StockStatusEnum.RETURN_APPROVED ||
    str == StockStatusEnum.RETURN_DENIED ||
    str == StockStatusEnum.RETURN_SHIPPED ||
    str == StockStatusEnum.RETURN_RECEIVED ||
    str == StockStatusEnum.RETURN_PROCESSING ||
    str == StockStatusEnum.RETURNED
  ) {
    return true;
  } else {
    return false;
  }
}

function isReturnDenied(str) {
  if (str == StockStatusEnum.RETURN_DENIED) {
    return true;
  } else {
    return false;
  }
}

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

function getUserCount(req, done) {
  let object = {};

  object["date"] = req.query.date ? new Date(req.query.date) : new Date();

  var query = {
    _id: { $exists: true },
    admin: false,
  };

  User.find(query).exec(function (err, users) {
    if (err) {
      return done({ status: 500, body: { error: err } });
    } else if (!users) {
      object["user_count"] = 0;
      return done(null, req, object);
    } else {
      object["user_count"] = users.length;
      return done(null, req, object);
    }
  });
}

function getAdminCount(req, object, done) {
  var query = {
    _id: { $exists: true },
    admin: true,
  };

  User.find(query).exec(function (err, users) {
    if (err) {
      return done({ status: 500, body: { error: err } });
    } else if (!users) {
      object["admin_count"] = 0;
      return done(null, req, object);
    } else {
      object["admin_count"] = users.length;
      return done(null, req, object);
    }
  });
}

function getProductCount(req, object, done) {
  var query = {
    _id: { $exists: true },
  };

  Product.find(query).count(function (err, count) {
    if (err) {
      return done({ status: 500, body: { error: err } });
    } else {
      object["product_count"] = count;
      return done(null, req, object);
    }
  });
}

function getOrderCount(req, object, done) {
  var query = {
    _id: { $exists: true },
  };

  if (req.body.start != undefined) {
    query["_creationDate"] = { $gte: req.body.start };
    object["start"] = req.body.start;
  }

  if (req.body.end != undefined) {
    query["_creationDate"] = { $lt: req.body.end };
    object["end"] = req.body.end;
  }

  Order.find(query)
    .deepPopulate(
      "user items.product items.product.variants items.product.sizes items.product.type items.product.department items.product.groups items.product.image items.product.images items.size items.variant items.promotions items.product.stock.variant status.user items.status.user items.return_request.user"
    )
    .exec(function (err, orders) {
      if (err) {
        return done({ status: 500, body: { error: err } });
      } else if (!orders) {
        object["total_order_count"] = 0;
        return done(null, req, object, []);
      } else {
        object["total_order_count"] = orders.length;
        return done(null, req, object, orders);
      }
    });
}

function processOrders(req, object, orders, done) {
  let item_count = 0;
  let total_sales = 0;
  let return_sales = 0;
  let returns_requested = 0;
  let returns_denied = 0;
  orders.forEach((order) => {
    total_sales += order.sub_total;

    let sub_count = 0;
    order.items.forEach((item) => {
      sub_count += item.quantity;
      if (isReturnEnum(item.status.status)) {
        returns_requested += item.quantity;

        if (isReturnDenied(item.status.status)) {
          returns_denied += item.quantity;
        } else {
          return_sales += item.discount_price * item.quantity;
        }
      }
    });
    item_count += sub_count;
  });

  object["total_item_count"] = parseInt(item_count);
  object["total_sales"] = parseFloat(parseFloat(total_sales).toFixed(2));
  object["total_returns_requested"] = parseInt(returns_requested);
  object["total_returns_denied"] = parseInt(returns_denied);
  object["total_return_sales"] = parseFloat(
    parseFloat(return_sales).toFixed(2)
  );
  object["total_net_sales"] = parseFloat(
    parseFloat(total_sales - return_sales).toFixed(2)
  );

  return done(null, req, object);
}

function getTodaysOrders(req, object, done) {
  let date = object["date"];
  let _yesterday = date.getTime() - 24 * 60 * 60 * 1000;
  let yesterday = new Date(_yesterday);

  var query = {
    _id: { $exists: true },
    _creationDate: {
      $gte: yesterday,
      $lt: date,
    },
  };

  Order.find(query)
    .deepPopulate(
      "user items.product items.product.variants items.product.sizes items.product.type items.product.department items.product.groups items.product.image items.product.images items.size items.variant items.promotions items.product.stock.variant status.user items.status.user items.return_request.user"
    )
    .exec(function (err, orders) {
      if (err) {
        return done({ status: 500, body: { error: err } });
      } else if (!orders) {
        object["daily_order_count"] = 0;
        return done(null, req, object, []);
      } else {
        object["daily_order_count"] = orders.length;
        return done(null, req, object, orders);
      }
    });
}

function processDailyOrders(req, object, orders, done) {
  let item_count = 0;
  let total_sales = 0;
  let return_sales = 0;
  let returns_requested = 0;
  let returns_denied = 0;
  orders.forEach((order) => {
    total_sales += order.sub_total;

    let sub_count = 0;
    order.items.forEach((item) => {
      sub_count += item.quantity;
      if (isReturnEnum(item.status.status)) {
        returns_requested += item.quantity;

        if (isReturnDenied(item.status.status)) {
          returns_denied += item.quantity;
        } else {
          return_sales += item.discount_price * item.quantity;
        }
      }
    });
    item_count += sub_count;
  });

  object["daily_item_count"] = parseInt(item_count);
  object["daily_sales"] = parseFloat(parseFloat(total_sales).toFixed(2));
  object["daily_returns_requested"] = parseInt(returns_requested);
  object["daily_returns_denied"] = parseInt(returns_denied);
  object["daily_return_sales"] = parseFloat(
    parseFloat(return_sales).toFixed(2)
  );
  object["daily_net_sales"] = parseFloat(
    parseFloat(total_sales - return_sales).toFixed(2)
  );

  return done(null, object);
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

// Create Statistic Value
// POST {{HOST}}/statistic/create
exports.create_statistic = function (req, res) {
  async.waterfall(
    [
      async.apply(getUserCount, req),
      getAdminCount,
      getProductCount,
      getOrderCount,
      processOrders,
      getTodaysOrders,
      processDailyOrders,
    ],
    async function (err, object) {
      if (err) {
        console.log(err);
        return res.status(err.status).send(err.body);
      } else {
        let statistic = new Statistic();

        statistic.date = object["date"];
        statistic.product_count = object["product_count"];
        statistic.user_count = object["user_count"];
        statistic.admin_count = object["admin_count"];
        statistic.total_sales = object["total_sales"];
        statistic.total_order_count = object["total_order_count"];
        statistic.total_item_count = object["total_item_count"];
        statistic.total_returns_requested = object["total_returns_requested"];
        statistic.total_returns_denied = object["total_returns_denied"];
        statistic.total_return_sales = object["total_return_sales"];
        statistic.total_net_sales = object["total_net_sales"];
        statistic.daily_return_sales = object["daily_return_sales"];
        statistic.daily_returns_denied = object["daily_returns_denied"];
        statistic.daily_returns_requested = object["daily_returns_requested"];
        statistic.daily_item_count = object["daily_item_count"];
        statistic.daily_order_count = object["daily_order_count"];
        statistic.daily_net_sales = object["daily_net_sales"];
        statistic.daily_sales = object["daily_sales"];

        statistic.save(function (err, _statistic) {
          if (err) {
            return res.status(500).send({ errors: err });
          } else {
            res.status(200).send(_statistic);
          }
        });
      }
    }
  );
};

// Retrieve Statistic Values
// GET {{HOST}}/statistic/retrieve
exports.retrieve_statistics = function (req, res) {
  let query = {
    _id: { $exists: true },
  };

  let limit = req.query.limit ? parseInt(req.query.limit) : 0;
  let skip = req.query.skip ? parseInt(req.query.skip) : 0;

  console.log(query);

  Statistic.find(query)
    .sort({ date: -1 })
    .limit(limit)
    .skip(skip)
    .exec(function (err, statistics) {
      if (err) {
        return res.status(500).send({ errors: err });
      } else {
        return res.status(200).send(statistics);
      }
    });
};

// Generate Statistic Values
// GET {{HOST}}/statistic/generate
exports.generate_statistic = function (req, res) {
  req.checkBody("start", "required").notEmpty();
  req.checkBody("end", "required").notEmpty();

  if (req.validationErrors()) {
    return res.status(400).send({ errors: req.validationErrors() });
  }

  async.waterfall(
    [
      async.apply(getUserCount, req),
      getAdminCount,
      getProductCount,
      getOrderCount,
      processOrders,
    ],
    async function (err, _req, object) {
      if (err) {
        console.log(err);
        return res.status(err.status).send(err.body);
      } else {
        return res.status(200).send(object);
      }
    }
  );
};

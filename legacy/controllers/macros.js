/**
 * macros.js
 *
 * api.goria.com
 * by AS3ICS
 *
 * Zach DeGeorge
 * zach@as3ics.com
 *
 * Macros Controller
 *
 * @format
 */

var mongoose = require("mongoose"),
  winston = require("winston"),
  async = require("async"),
  Department = mongoose.model("Department"),
  Type = mongoose.model("Type"),
  Size = mongoose.model("Size"),
  Brand = mongoose.model("Brand"),
  Group = mongoose.model("Group"),
  Variant = mongoose.model("Variant"),
  Product = mongoose.model("Product"),
  Macros = mongoose.model("Macros"),
  Promotion = mongoose.model("Promotion"),
  deepPopulate = require("mongoose-deep-populate")(mongoose),
  User = mongoose.model("User"),
  Order = mongoose.model("Order");
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

function getUserCount(done) {
  let object = {};

  var query = {
    _id: { $exists: true },
    admin: false,
  };

  User.find(query).exec(function (err, users) {
    if (err) {
      return done({ status: 500, body: { error: err } });
    } else if (!users) {
      object["user-count"] = 0;
      return done(null, object);
    } else {
      object["user-count"] = users.length;
      return done(null, object);
    }
  });
}

function getAdminCount(object, done) {
  var query = {
    _id: { $exists: true },
    admin: true,
  };

  User.find(query).exec(function (err, users) {
    if (err) {
      return done({ status: 500, body: { error: err } });
    } else if (!users) {
      object["admin-count"] = 0;
      return done(null, object);
    } else {
      object["admin-count"] = users.length;
      return done(null, object);
    }
  });
}

function getProductCount(object, done) {
  var query = {
    _id: { $exists: true },
  };

  Product.find().count(function (err, count) {
    if (err) {
      return done({ status: 500, body: { error: err } });
    } else {
      object["product-count"] = count;
      return done(null, object);
    }
  });
}

function getOrderCount(object, done) {
  var query = {
    _id: { $exists: true },
  };

  Order.find(query)
    .deepPopulate(
      "user items.product items.product.variants items.product.sizes items.product.type items.product.department items.product.groups items.product.image items.product.images items.size items.variant items.promotions items.product.stock.variant status.user items.status.user items.return_request.user"
    )
    .exec(function (err, orders) {
      if (err) {
        return done({ status: 500, body: { error: err } });
      } else if (!orders) {
        object["order-count"] = 0;
        return done(null, object);
      } else {
        object["order-count"] = orders.length;
        return done(null, object, orders);
      }
    });
}

function processOrders(object, orders, done) {
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

        if (item.status.status == "Return Denied") {
          returns_denied += item.quantity;
        } else {
          return_sales += item.discount_price * item.quantity;
        }
      }
    });
    item_count += sub_count;
  });

  object["item-count"] = item_count;
  object["total-sales"] = total_sales;
  object["returns-requested"] = returns_requested;
  object["returns-denied"] = returns_denied;
  object["return-sales"] = return_sales;

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

// Get Meta-Data
exports.get_meta = function (req, res) {
  async.waterfall(
    [
      async.apply(getUserCount),
      getAdminCount,
      getProductCount,
      getOrderCount,
      processOrders,
    ],
    async function (err, object) {
      if (err) {
        console.log(err);
        return res.status(err.status).send(err.body);
      } else {
        return res.status(200).send(object);
      }
    }
  );
};

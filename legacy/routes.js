/** @format */

// /**
//  * routes.js
//  *
//  * api.goria.com
//  * by AS3ICS
//  *
//  * Zach DeGeorge
//  * zach@as3ics.com
//  *
//  * API Routes
//  *
//  * @format
//  */

// var express = require("express"),
//   router = express.Router();

// API = {};

// API.authentication = require("./controllers/authentication");
// API.permissions = require("./controllers/permissions");
// API.users = require("./controllers/users");
// API.photos = require("./controllers/photos");
// API.skus = require("./controllers/skus");
// API.products = require("./controllers/products");
// API.fetch = require("./controllers/fetch");
// API.shopping = require("./controllers/shopping");
// API.promotions = require("./controllers/promotions");
// API.square = require("./square/square.controller");
// API.macros = require("./controllers/macros");
// API.reviews = require("./controllers/reviews");
// API.statistics = require("./controllers/statistics");

// // ASCII Art Generator http://patorjk.com/software/taag/#p=display&f=Big%20Money-nw&t=Type%20Something%20
// /*

//  $$$$$$\              $$\     $$\                            $$\     $$\                     $$\     $$\
// $$  __$$\             $$ |    $$ |                           $$ |    \__|                    $$ |    \__|
// $$ /  $$ |$$\   $$\ $$$$$$\   $$$$$$$\   $$$$$$\  $$$$$$$\ $$$$$$\   $$\  $$$$$$$\ $$$$$$\ $$$$$$\   $$\  $$$$$$\  $$$$$$$\
// $$$$$$$$ |$$ |  $$ |\_$$  _|  $$  __$$\ $$  __$$\ $$  __$$\\_$$  _|  $$ |$$  _____|\____$$\\_$$  _|  $$ |$$  __$$\ $$  __$$\
// $$  __$$ |$$ |  $$ |  $$ |    $$ |  $$ |$$$$$$$$ |$$ |  $$ | $$ |    $$ |$$ /      $$$$$$$ | $$ |    $$ |$$ /  $$ |$$ |  $$ |
// $$ |  $$ |$$ |  $$ |  $$ |$$\ $$ |  $$ |$$   ____|$$ |  $$ | $$ |$$\ $$ |$$ |     $$  __$$ | $$ |$$\ $$ |$$ |  $$ |$$ |  $$ |
// $$ |  $$ |\$$$$$$  |  \$$$$  |$$ |  $$ |\$$$$$$$\ $$ |  $$ | \$$$$  |$$ |\$$$$$$$\\$$$$$$$ | \$$$$  |$$ |\$$$$$$  |$$ |  $$ |
// \__|  \__| \______/    \____/ \__|  \__| \_______|\__|  \__|  \____/ \__| \_______|\_______|  \____/ \__| \______/ \__|  \__|

// */

// router
//   .route("/authenticate/user")
//   // Authenticate User and return JWT, if successful
//   .post(
//     API.permissions.auth.BASIC,
//     API.permissions.roles.ALL,
//     API.authentication.authenticate
//   );

// router
//   .route("/authenticate/verify")
//   // Verify Tokens on Frontend Website
//   .get(
//     API.permissions.auth.TOKEN,
//     API.permissions.roles.NONE,
//     API.authentication.verifyToken
//   );

// /*

// $$$$$$$\  $$\                  $$\
// $$  __$$\ $$ |                 $$ |
// $$ |  $$ |$$$$$$$\   $$$$$$\ $$$$$$\    $$$$$$\   $$$$$$$\
// $$$$$$$  |$$  __$$\ $$  __$$\\_$$  _|  $$  __$$\ $$  _____|
// $$  ____/ $$ |  $$ |$$ /  $$ | $$ |    $$ /  $$ |\$$$$$$\
// $$ |      $$ |  $$ |$$ |  $$ | $$ |$$\ $$ |  $$ | \____$$\
// $$ |      $$ |  $$ |\$$$$$$  | \$$$$  |\$$$$$$  |$$$$$$$  |
// \__|      \__|  \__| \______/   \____/  \______/ \_______/

// */

// router
//   .route("/user/:userId/photo/upload")
//   // Upload Single Profile Photo to User
//   .post(
//     API.permissions.auth.TOKEN,
//     API.permissions.roles.ADMIN,
//     API.photos.upload_photo_user
//   );

// router
//   .route("/user/:userId/photo/download")
//   // Get Single Profile Photo from User
//   .get(
//     API.permissions.auth.NONE,
//     API.permissions.roles.NONE,
//     API.photos.download_photo_user
//   );

// router
//   .route("/product/:productId/photo/upload")
//   // Upload Single Profile Photo to Product
//   .post(
//     API.permissions.auth.TOKEN,
//     API.permissions.roles.ADMIN,
//     API.photos.upload_photo_product
//   );

// router
//   .route("/product/:productId/photo/download")
//   // Get Single Profile Photo from User
//   .get(
//     API.permissions.auth.NONE,
//     API.permissions.roles.NONE,
//     API.photos.download_photo_product
//   );

// router
//   .route("/product/:productId/photos")
//   // Add New Product Photo
//   .post(
//     API.permissions.auth.TOKEN,
//     API.permissions.roles.ADMIN,
//     API.photos.upload_additional_photo_product
//   );

// router
//   .route("/product/:productId/photos/:photoId")
//   // Get Product Photo
//   .get(
//     API.permissions.auth.NONE,
//     API.permissions.roles.NONE,
//     API.photos.download_additional_photo_product
//   )
//   // Delete Product Photo
//   .delete(
//     API.permissions.auth.TOKEN,
//     API.permissions.roles.ADMIN,
//     API.photos.delete_photo_product
//   )
//   // Set Primary Photo Product
//   .put(
//     API.permissions.auth.TOKEN,
//     API.permissions.roles.ADMIN,
//     API.photos.set_photo_primary
//   );

// /*
// router.route('/variant/:variantId/photo/upload')
//     // Upload Single Profile Photo to Variant
//     .post(API.permissions.auth.TOKEN, API.permissions.roles.ADMIN, API.photos.upload_photo_variant);

// router.route('/variant/:variantId/photo/download')
//     // Get Single Variant Photo
//     .get(API.permissions.auth.NONE, API.permissions.roles.NONE, API.photos.download_photo_variant);
// */

// /*

// $$$$$$$$\         $$\               $$\
// $$  _____|        $$ |              $$ |
// $$ |    $$$$$$\ $$$$$$\    $$$$$$$\ $$$$$$$\
// $$$$$\ $$  __$$\\_$$  _|  $$  _____|$$  __$$\
// $$  __|$$$$$$$$ | $$ |    $$ /      $$ |  $$ |
// $$ |   $$   ____| $$ |$$\ $$ |      $$ |  $$ |
// $$ |   \$$$$$$$\  \$$$$  |\$$$$$$$\ $$ |  $$ |
// \__|    \_______|  \____/  \_______|\__|  \__|

// */

// router
//   .route("/fetch/group/:groupId")
//   // Retrieve Products by group
//   .get(
//     API.permissions.auth.NONE,
//     API.permissions.roles.NONE,
//     API.fetch.retrieve_group
//   );

// router
//   .route("/fetch/type/:typeId")
//   // Retrieve Products by type
//   .get(
//     API.permissions.auth.NONE,
//     API.permissions.roles.NONE,
//     API.fetch.retrieve_type
//   );

// router
//   .route("/fetch/brand/:brandId")
//   // Retrieve Products by brand
//   .get(
//     API.permissions.auth.NONE,
//     API.permissions.roles.NONE,
//     API.fetch.retrieve_brand
//   );

// router
//   .route("/fetch/department/:departmentId")
//   // Retrieve Products by department
//   .get(
//     API.permissions.auth.NONE,
//     API.permissions.roles.NONE,
//     API.fetch.retrieve_department
//   );

// router
//   .route("/fetch/variant/:variantId")
//   // Retrieve Products by department
//   .get(
//     API.permissions.auth.NONE,
//     API.permissions.roles.NONE,
//     API.fetch.retrieve_variant
//   );

// /*

// $$\      $$\
// $$$\    $$$ |
// $$$$\  $$$$ | $$$$$$\   $$$$$$$\  $$$$$$\   $$$$$$\   $$$$$$$\
// $$\$$\$$ $$ | \____$$\ $$  _____|$$  __$$\ $$  __$$\ $$  _____|
// $$ \$$$  $$ | $$$$$$$ |$$ /      $$ |  \__|$$ /  $$ |\$$$$$$\
// $$ |\$  /$$ |$$  __$$ |$$ |      $$ |      $$ |  $$ | \____$$\
// $$ | \_/ $$ |\$$$$$$$ |\$$$$$$$\ $$ |      \$$$$$$  |$$$$$$$  |
// \__|     \__| \_______| \_______|\__|       \______/ \_______/

// */

// router
//   .route("/meta")
//   // Retrieve Meta Information
//   .get(
//     API.permissions.auth.TOKEN,
//     API.permissions.roles.ADMIN,
//     API.macros.get_meta
//   );

// /*

// $$$$$$$\                            $$\                       $$\
// $$  __$$\                           $$ |                      $$ |
// $$ |  $$ | $$$$$$\   $$$$$$\   $$$$$$$ |$$\   $$\  $$$$$$$\ $$$$$$\    $$$$$$$\
// $$$$$$$  |$$  __$$\ $$  __$$\ $$  __$$ |$$ |  $$ |$$  _____|\_$$  _|  $$  _____|
// $$  ____/ $$ |  \__|$$ /  $$ |$$ /  $$ |$$ |  $$ |$$ /        $$ |    \$$$$$$\
// $$ |      $$ |      $$ |  $$ |$$ |  $$ |$$ |  $$ |$$ |        $$ |$$\  \____$$\
// $$ |      $$ |      \$$$$$$  |\$$$$$$$ |\$$$$$$  |\$$$$$$$\   \$$$$  |$$$$$$$  |
// \__|      \__|       \______/  \_______| \______/  \_______|   \____/ \_______/

// */

// router
//   .route("/product")
//   // Create New Product
//   .post(
//     API.permissions.auth.TOKEN,
//     API.permissions.roles.ADMIN,
//     API.products.create
//   )
//   // Get Products
//   .get(
//     API.permissions.auth.NONE,
//     API.permissions.roles.NONE,
//     API.products.retrieve_all
//   );

// router
//   .route("/product/:productId")
//   // Get One Product
//   .get(
//     API.permissions.auth.NONE,
//     API.permissions.roles.NONE,
//     API.products.retrieve_product
//   )
//   // Update Product
//   .post(
//     API.permissions.auth.TOKEN,
//     API.permissions.roles.ADMIN,
//     API.products.update
//   );

// router
//   .route("/product/:productId/inventory")
//   // Update Product Inventory
//   .post(
//     API.permissions.auth.TOKEN,
//     API.permissions.roles.ADMIN,
//     API.products.update_inventory
//   );

// router
//   .route("/product/:productId/inventory/losses")
//   // Update Product Inventory
//   .post(
//     API.permissions.auth.TOKEN,
//     API.permissions.roles.ADMIN,
//     API.products.post_losses
//   );

// router
//   .route("/product/:productId/sale")
//   // Add Sale to Product
//   .post(
//     API.permissions.auth.TOKEN,
//     API.permissions.roles.ADMIN,
//     API.products.add_sale
//   );

// router
//   .route("/product/:productId/sale/:saleId")
//   // Edit Sale
//   .post(
//     API.permissions.auth.TOKEN,
//     API.permissions.roles.ADMIN,
//     API.products.edit_sale
//   );

// /*

// $$$$$$$\                                               $$\     $$\
// $$  __$$\                                              $$ |    \__|
// $$ |  $$ | $$$$$$\   $$$$$$\  $$$$$$\$$$$\   $$$$$$\ $$$$$$\   $$\  $$$$$$\  $$$$$$$\   $$$$$$$\
// $$$$$$$  |$$  __$$\ $$  __$$\ $$  _$$  _$$\ $$  __$$\\_$$  _|  $$ |$$  __$$\ $$  __$$\ $$  _____|
// $$  ____/ $$ |  \__|$$ /  $$ |$$ / $$ / $$ |$$ /  $$ | $$ |    $$ |$$ /  $$ |$$ |  $$ |\$$$$$$\
// $$ |      $$ |      $$ |  $$ |$$ | $$ | $$ |$$ |  $$ | $$ |$$\ $$ |$$ |  $$ |$$ |  $$ | \____$$\
// $$ |      $$ |      \$$$$$$  |$$ | $$ | $$ |\$$$$$$  | \$$$$  |$$ |\$$$$$$  |$$ |  $$ |$$$$$$$  |
// \__|      \__|       \______/ \__| \__| \__| \______/   \____/ \__| \______/ \__|  \__|\_______/

// */

// router
//   .route("/promotion")
//   // Create New Promotion
//   .post(
//     API.permissions.auth.TOKEN,
//     API.permissions.roles.ADMIN,
//     API.promotions.create
//   )
//   // Get Promotions
//   .get(
//     API.permissions.auth.TOKEN,
//     API.permissions.roles.ADMIN,
//     API.promotions.retrieve_all
//   );

// router
//   .route("/promotion/:promotionId")
//   // Get A Promotion
//   .get(
//     API.permissions.auth.TOKEN,
//     API.permissions.roles.ADMIN,
//     API.promotions.retrieve
//   )
//   // Update Promotion
//   .post(
//     API.permissions.auth.TOKEN,
//     API.permissions.roles.ADMIN,
//     API.promotions.update
//   );

// router
//   .route("/promotion/:promotionId/products")
//   // Retrieve Products for Promotion
//   .get(
//     API.permissions.auth.TOKEN,
//     API.permissions.roles.ADMIN,
//     API.promotions.get_products
//   );

// /*

// $$$$$$$\                      $$\
// $$  __$$\                     \__|
// $$ |  $$ | $$$$$$\ $$\    $$\ $$\  $$$$$$\  $$\  $$\  $$\  $$$$$$$\
// $$$$$$$  |$$  __$$\\$$\  $$  |$$ |$$  __$$\ $$ | $$ | $$ |$$  _____|
// $$  __$$< $$$$$$$$ |\$$\$$  / $$ |$$$$$$$$ |$$ | $$ | $$ |\$$$$$$\
// $$ |  $$ |$$   ____| \$$$  /  $$ |$$   ____|$$ | $$ | $$ | \____$$\
// $$ |  $$ |\$$$$$$$\   \$  /   $$ |\$$$$$$$\ \$$$$$\$$$$  |$$$$$$$  |
// \__|  \__| \_______|   \_/    \__| \_______| \_____\____/ \_______/

// */

// router
//   .route("/reviews/:userId/product/:productId")
//   // Check If Can Post Review On Product
//   .get(
//     API.permissions.auth.TOKEN,
//     API.permissions.roles.ALL,
//     API.reviews.check_review_product
//   )
//   // Create Review
//   .post(
//     API.permissions.auth.TOKEN,
//     API.permissions.roles.ALL,
//     API.reviews.create_review
//   );

// router
//   .route("/reviews/product/:productId")
//   // Retrieve Reviews For Product
//   .get(
//     API.permissions.auth.NONE,
//     API.permissions.roles.NONE,
//     API.reviews.retrieve_reviews
//   );

// /*

//  $$$$$$\  $$\                                     $$\
// $$  __$$\ $$ |                                    \__|
// $$ /  \__|$$$$$$$\   $$$$$$\   $$$$$$\   $$$$$$\  $$\ $$$$$$$\   $$$$$$\
// \$$$$$$\  $$  __$$\ $$  __$$\ $$  __$$\ $$  __$$\ $$ |$$  __$$\ $$  __$$\
// \____$$\ $$ |  $$ |$$ /  $$ |$$ /  $$ |$$ /  $$ |$$ |$$ |  $$ |$$ /  $$ |
// $$\   $$ |$$ |  $$ |$$ |  $$ |$$ |  $$ |$$ |  $$ |$$ |$$ |  $$ |$$ |  $$ |
// \$$$$$$  |$$ |  $$ |\$$$$$$  |$$$$$$$  |$$$$$$$  |$$ |$$ |  $$ |\$$$$$$$ |
// \______/ \__|  \__| \______/ $$  ____/ $$  ____/ \__|\__|  \__| \____$$ |
//                           $$ |      $$ |                    $$\   $$ |
//                           $$ |      $$ |                    \$$$$$$  |
//                           \__|      \__|                     \______/
// */

// router
//   .route("/shopping/wishlist/:userId")
//   // Add to User Wishlist
//   .post(
//     API.permissions.auth.TOKEN,
//     API.permissions.roles.ALL,
//     API.shopping.add_to_wishlist
//   )
//   // Retrieve User Wishlist
//   .get(
//     API.permissions.auth.TOKEN,
//     API.permissions.roles.ALL,
//     API.shopping.retrieve_wishlist
//   )
//   // Update Wishlist Item
//   .put(
//     API.permissions.auth.TOKEN,
//     API.permissions.roles.ALL,
//     API.shopping.update_wishlist_item
//   );

// router
//   .route("/shopping/bag/:userId")
//   // Add to User Bag
//   .post(
//     API.permissions.auth.TOKEN,
//     API.permissions.roles.ALL,
//     API.shopping.add_to_bag
//   )
//   // Retrieve User Bag
//   .get(
//     API.permissions.auth.TOKEN,
//     API.permissions.roles.ALL,
//     API.shopping.retrieve_bag
//   )
//   // Update Bag Item
//   .put(
//     API.permissions.auth.TOKEN,
//     API.permissions.roles.ALL,
//     API.shopping.update_bag_item
//   );

// router
//   .route("/shopping/bag/:userId/:stockId")
//   // Remove from User Bag
//   .delete(
//     API.permissions.auth.TOKEN,
//     API.permissions.roles.ALL,
//     API.shopping.remove_from_bag
//   );

// router
//   .route("/shopping/wishlist/:userId/:stockId")
//   // Remove from User Wishlist
//   .delete(
//     API.permissions.auth.TOKEN,
//     API.permissions.roles.ALL,
//     API.shopping.remove_from_wishlist
//   );

// router
//   .route("/shopping/bag/:userId/:stockId/wishlist")
//   // Move from bag to wishlist
//   .post(
//     API.permissions.auth.TOKEN,
//     API.permissions.roles.ALL,
//     API.shopping.from_bag_to_wishlist
//   );

// router
//   .route("/shopping/wishlist/:userId/:stockId/bag")
//   // Move from wishlist to bag
//   .post(
//     API.permissions.auth.TOKEN,
//     API.permissions.roles.ALL,
//     API.shopping.from_wishlist_to_bag
//   );

// router
//   .route("/shopping/order/:orderId")
//   // Retrieve Order
//   .get(
//     API.permissions.auth.TOKEN,
//     API.permissions.roles.ALL,
//     API.shopping.retrieve_order
//   );

// router
//   .route("/shopping/order/:orderId/drop")
//   // Drop Order
//   .post(
//     API.permissions.auth.TOKEN,
//     API.permissions.roles.ADMIN,
//     API.shopping.drop_order
//   );

// router
//   .route("/shopping/order/:orderId/cancel")
//   // Cancel Order
//   .post(
//     API.permissions.auth.TOKEN,
//     API.permissions.roles.ADMIN,
//     API.shopping.cancel_order
//   );

// router
//   .route("/shopping/order/:orderId/process")
//   // Process Order
//   .post(
//     API.permissions.auth.TOKEN,
//     API.permissions.roles.ADMIN,
//     API.shopping.process_order
//   );

// router
//   .route("/shopping/:userId/orders")
//   // Retrieve Orders for User
//   .get(
//     API.permissions.auth.TOKEN,
//     API.permissions.roles.ALL,
//     API.shopping.retrieve_orders_by_user
//   );

// router
//   .route("/shopping/orders/status")
//   // Retrieve Orders by Status
//   .post(
//     API.permissions.auth.TOKEN,
//     API.permissions.roles.ADMIN,
//     API.shopping.retrieve_orders_by_status
//   );

// router
//   .route("/shopping/:userId/orders/:orderId/item/:itemId")
//   // Request item return
//   .post(
//     API.permissions.auth.TOKEN,
//     API.permissions.roles.ALL,
//     API.shopping.request_item_return
//   );

// router
//   .route("/shopping/orders/return/requests")
//   // Retrieve all Return Requests
//   .get(
//     API.permissions.auth.TOKEN,
//     API.permissions.roles.ADMIN,
//     API.shopping.request_return_requests
//   );

// router
//   .route("/shopping/orders/:userId/item/status")
//   // Retrieve Orders by Item Status
//   .post(
//     API.permissions.auth.TOKEN,
//     API.permissions.roles.ADMIN,
//     API.shopping.request_orders_by_item_status
//   );

// router
//   .route("/shopping/order/:orderId/requests/:userId/item/:itemId")
//   // Approve or deny Return Requests
//   .post(
//     API.permissions.auth.TOKEN,
//     API.permissions.roles.ADMIN,
//     API.shopping.approve_or_deny_return_request
//   );

// router
//   .route("/shopping/orders")
//   // Retrieve Orders
//   .get(
//     API.permissions.auth.TOKEN,
//     API.permissions.roles.ADMIN,
//     API.shopping.retrieve_orders
//   );

// router
//   .route("/shopping/order/:orderId/refund/:refundId")
//   // Get Payment Refund Status
//   .get(
//     API.permissions.auth.TOKEN,
//     API.permissions.roles.ALL,
//     API.shopping.get_payment_refund_status
//   );

// /*
//  $$$$$$\  $$\   $$\ $$\   $$\  $$$$$$\
// $$  __$$\ $$ | $$  |$$ |  $$ |$$  __$$\
// $$ /  \__|$$ |$$  / $$ |  $$ |$$ /  \__|
// \$$$$$$\  $$$$$  /  $$ |  $$ |\$$$$$$\
//  \____$$\ $$  $$<   $$ |  $$ | \____$$\
// $$\   $$ |$$ |\$$\  $$ |  $$ |$$\   $$ |
// \$$$$$$  |$$ | \$$\ \$$$$$$  |\$$$$$$  |
//  \______/ \__|  \__| \______/  \______/

// */

// router
//   .route("/departments")
//   // Create new department
//   .post(
//     API.permissions.auth.TOKEN,
//     API.permissions.roles.ADMIN,
//     API.skus.create_department
//   )
//   // Get departments
//   .get(
//     API.permissions.auth.NONE,
//     API.permissions.roles.NONE,
//     API.skus.retrieve_departments
//   );

// router
//   .route("/departments/:departmentId")
//   // Update Department
//   .put(
//     API.permissions.auth.TOKEN,
//     API.permissions.roles.ADMIN,
//     API.skus.update_department
//   );

// router
//   .route("/types")
//   // Create new type
//   .post(
//     API.permissions.auth.TOKEN,
//     API.permissions.roles.ADMIN,
//     API.skus.create_type
//   )
//   // Get types
//   .get(
//     API.permissions.auth.NONE,
//     API.permissions.roles.NONE,
//     API.skus.retrieve_types
//   );

// router
//   .route("/types/:typeId")
//   // Update Type
//   .put(
//     API.permissions.auth.TOKEN,
//     API.permissions.roles.ADMIN,
//     API.skus.update_type
//   );

// router
//   .route("/sizes")
//   // Create new size
//   .post(
//     API.permissions.auth.TOKEN,
//     API.permissions.roles.ADMIN,
//     API.skus.create_size
//   )
//   // Get sizes
//   .get(
//     API.permissions.auth.NONE,
//     API.permissions.roles.NONE,
//     API.skus.retrieve_sizes
//   );

// router
//   .route("/sizes/:sizeId")
//   // Update Size
//   .put(
//     API.permissions.auth.TOKEN,
//     API.permissions.roles.ADMIN,
//     API.skus.update_size
//   );

// router
//   .route("/brands")
//   // Create new brand
//   .post(
//     API.permissions.auth.TOKEN,
//     API.permissions.roles.ADMIN,
//     API.skus.create_brand
//   )
//   // Get brands
//   .get(
//     API.permissions.auth.NONE,
//     API.permissions.roles.NONE,
//     API.skus.retrieve_brands
//   );

// router
//   .route("/brands/:brandId")
//   // Update Brand
//   .put(
//     API.permissions.auth.TOKEN,
//     API.permissions.roles.ADMIN,
//     API.skus.update_brand
//   );

// router
//   .route("/groups")
//   // Create new group
//   .post(
//     API.permissions.auth.TOKEN,
//     API.permissions.roles.ADMIN,
//     API.skus.create_group
//   )
//   // Get groups
//   .get(
//     API.permissions.auth.NONE,
//     API.permissions.roles.NONE,
//     API.skus.retrieve_groups
//   );

// router
//   .route("/groups/:groupId")
//   // Update Group
//   .put(
//     API.permissions.auth.TOKEN,
//     API.permissions.roles.ADMIN,
//     API.skus.update_group
//   );

// router
//   .route("/variants")
//   // Create new variant
//   .post(
//     API.permissions.auth.TOKEN,
//     API.permissions.roles.ADMIN,
//     API.skus.create_variant
//   )
//   // Get variants
//   .get(
//     API.permissions.auth.NONE,
//     API.permissions.roles.NONE,
//     API.skus.retrieve_variants
//   );

// router
//   .route("/variants/:variantId")
//   // Update variant
//   .put(
//     API.permissions.auth.TOKEN,
//     API.permissions.roles.ADMIN,
//     API.skus.update_variant
//   );

// router
//   .route("/variants/brand/:brandId")
//   // Get variants based on Brand
//   .get(
//     API.permissions.auth.TOKEN,
//     API.permissions.roles.ADMIN,
//     API.skus.retrieve_variants_brand
//   );

// router
//   .route("/skus")
//   // Retrieve all
//   .get(
//     API.permissions.auth.NONE,
//     API.permissions.roles.NONE,
//     API.skus.retrieve_all
//   );

// /*

//  $$$$$$\
// $$  __$$\
// $$ /  \__| $$$$$$\  $$\   $$\  $$$$$$\   $$$$$$\   $$$$$$\
// \$$$$$$\  $$  __$$\ $$ |  $$ | \____$$\ $$  __$$\ $$  __$$\
//  \____$$\ $$ /  $$ |$$ |  $$ | $$$$$$$ |$$ |  \__|$$$$$$$$ |
// $$\   $$ |$$ |  $$ |$$ |  $$ |$$  __$$ |$$ |      $$   ____|
// \$$$$$$  |\$$$$$$$ |\$$$$$$  |\$$$$$$$ |$$ |      \$$$$$$$\
//  \______/  \____$$ | \______/  \_______|\__|       \_______|
//                 $$ |
//                 $$ |
//                 \__|

// */

// router
//   .route("/payment/:userId/bag/:bagId")
//   // Create Payment
//   .post(
//     API.permissions.auth.NONE,
//     API.permissions.roles.NONE,
//     API.square.process_payment
//   );

// /*

// $$$$$$\    $$\                $$\     $$\             $$\     $$\
// $$  __$$\   $$ |               $$ |    \__|            $$ |    \__|
// $$ /  \__|$$$$$$\    $$$$$$\ $$$$$$\   $$\  $$$$$$$\ $$$$$$\   $$\  $$$$$$$\  $$$$$$$\
// \$$$$$$\  \_$$  _|   \____$$\\_$$  _|  $$ |$$  _____|\_$$  _|  $$ |$$  _____|$$  _____|
//     \____$$\   $$ |     $$$$$$$ | $$ |    $$ |\$$$$$$\    $$ |    $$ |$$ /      \$$$$$$\
// $$\   $$ |  $$ |$$\ $$  __$$ | $$ |$$\ $$ | \____$$\   $$ |$$\ $$ |$$ |       \____$$\
// \$$$$$$  |  \$$$$  |\$$$$$$$ | \$$$$  |$$ |$$$$$$$  |  \$$$$  |$$ |\$$$$$$$\ $$$$$$$  |
//     \______/    \____/  \_______|  \____/ \__|\_______/    \____/ \__| \_______|\_______/

// */

// router
//   .route("/statistic/create")
//   // Create Statistic
//   .get(
//     API.permissions.auth.NONE,
//     API.permissions.roles.NONE,
//     API.statistics.create_statistic
//   );

// router
//   .route("/statistic/retrieve")
//   // Retrieve Statistics
//   .get(
//     API.permissions.auth.TOKEN,
//     API.permissions.roles.ADMIN,
//     API.statistics.retrieve_statistics
//   );

// router
//   .route("/statistic/generate")
//   // Generate Statistic
//   .post(
//     API.permissions.auth.TOKEN,
//     API.permissions.roles.ADMIN,
//     API.statistics.generate_statistic
//   );

// /*

// $$\   $$\
// $$ |  $$ |
// $$ |  $$ | $$$$$$$\  $$$$$$\   $$$$$$\   $$$$$$$\
// $$ |  $$ |$$  _____|$$  __$$\ $$  __$$\ $$  _____|
// $$ |  $$ |\$$$$$$\  $$$$$$$$ |$$ |  \__|\$$$$$$\
// $$ |  $$ | \____$$\ $$   ____|$$ |       \____$$\
// \$$$$$$  |$$$$$$$  |\$$$$$$$\ $$ |      $$$$$$$  |
// \______/ \_______/  \_______|\__|      \_______/

// */

// router
//   .route("/user")
//   // Create Single User
//   .post(
//     API.permissions.auth.NONE,
//     API.permissions.roles.NONE,
//     API.users.create
//   );

// router
//   .route("/user/admin")
//   // Create Single Admin
//   .post(
//     API.permissions.auth.TOKEN,
//     API.permissions.roles.ADMIN,
//     API.users.create_admin
//   );

// router
//   .route("/users")
//   // Retrieve All Users
//   .get(
//     API.permissions.auth.TOKEN,
//     API.permissions.roles.ADMIN,
//     API.users.retrieve_all
//   );

// router
//   .route("/users/admins")
//   // Retrieve All Admins
//   .get(
//     API.permissions.auth.TOKEN,
//     API.permissions.roles.ADMIN,
//     API.users.retrieve_all_admins
//   );

// router
//   .route("/user/:userId")
//   // Retrieve Single User
//   .get(
//     API.permissions.auth.TOKEN,
//     API.permissions.roles.ALL,
//     API.users.retrieve
//   )
//   // Update Single User (non-administrator)
//   .put(API.permissions.auth.TOKEN, API.permissions.roles.ALL, API.users.update)
//   // Delete Single User (non-administrator)
//   .delete(
//     API.permissions.auth.TOKEN,
//     API.permissions.roles.ADMIN,
//     API.users.delete
//   );

// router
//   .route("/user/:userId/address")
//   // Add Address to User
//   .post(
//     API.permissions.auth.TOKEN,
//     API.permissions.roles.ALL,
//     API.users.add_address
//   );

// router
//   .route("/user/:userId/address/:addressId/shipping")
//   // Add Default Shipping Address to User
//   .get(
//     API.permissions.auth.TOKEN,
//     API.permissions.roles.ALL,
//     API.users.add_shipping_address
//   );

// router
//   .route("/user/:userId/address/:addressId/billing")
//   // Add Default Billing Address to User
//   .get(
//     API.permissions.auth.TOKEN,
//     API.permissions.roles.ALL,
//     API.users.add_billing_address
//   );

// router
//   .route("/user/:userId/address/:addressId")
//   // Update Address from User
//   .post(
//     API.permissions.auth.TOKEN,
//     API.permissions.roles.ALL,
//     API.users.update_address
//   )
//   // Delete Address from User
//   .delete(
//     API.permissions.auth.TOKEN,
//     API.permissions.roles.ALL,
//     API.users.remove_address
//   );

// router
//   .route("/user/:userId/change/password")
//   // Change User Password
//   .post(
//     API.permissions.auth.TOKEN,
//     API.permissions.roles.ALL,
//     API.users.change_password
//   );

// router
//   .route("/user/:email/begin/reset/password")
//   // Reset User Password
//   .get(
//     API.permissions.auth.NONE,
//     API.permissions.roles.NONE,
//     API.users.begin_password_reset
//   );

// router
//   .route("/user/:email/reset/password")
//   // Reset User Password
//   .post(
//     API.permissions.auth.NONE,
//     API.permissions.roles.NONE,
//     API.users.reset_password
//   );

// router
//   .route("/user/search")
//   // Search Users
//   .post(
//     API.permissions.auth.TOKEN,
//     API.permissions.roles.ADMIN,
//     API.users.search
//   );

// module.exports = router;

/** @format */

const { runInNewContext } = require("vm");
const winston = require("winston");

/**
 * photos.js
 *
 * api.goria.com
 * by AS3ICS
 *
 * Zach DeGeorge
 * zach@as3ics.com
 *
 * Photos Controller
 */
var config = require("../config"),
  mongoose = require("mongoose"),
  fs = require("fs"),
  multer = require("multer"),
  multerS3 = require("multer-s3"),
  Photo = mongoose.model("Photo"),
  async = require("async"),
  AWS = require("aws-sdk"),
  User = mongoose.model("User"),
  Product = mongoose.model("Product"),
  //Variant = mongoose.model('Variant'),
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

// Define the filetype for Picture Upload
function fileFilterPicture(req, file, cb) {
  if (
    file.mimetype == "image/jpeg" ||
    file.mimetype == "image/jpg" ||
    file.mimetype == "image/png"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Support file formats: image/jpeg, image/png"));
  }
}

// Configure aws s3 SDK
AWS.config.update({
  accessKeyId: global.IAM_ACCESS_KEY_ID,
  secretAccessKey: global.IAM_SECRET_ACCESS_KEY,
});

var s3 = new AWS.S3();

// Multer upload (Use multer-s3 to save directly to AWS instead of locally)
var uploadS3User = multer({
  storage: multerS3({
    s3: s3,
    bucket: global.S3_BUCKET_NAME,
    // Set public read permissions
    // acl: 'public-read',
    // Auto detect contet type
    contentType: multerS3.AUTO_CONTENT_TYPE,
    // Set key/ filename as original uploaded name
    key: function (req, file, cb) {
      cb(
        null,
        global.S3_IMG_HANDLER_FOLDER +
          "/users/" +
          req.params.userId +
          "/" +
          file.fieldname +
          "-" +
          Date.now() +
          "." +
          "jpeg"
      );
    },
  }),
  fileFilter: fileFilterPicture,
  limits: { fileSize: config.server.max_file_size },
});

// Multer upload (Use multer-s3 to save directly to AWS instead of locally)
var uploadS3Product = multer({
  storage: multerS3({
    s3: s3,
    bucket: global.S3_BUCKET_NAME,
    // Set public read permissions
    // acl: 'public-read',
    // Auto detect contet type
    contentType: multerS3.AUTO_CONTENT_TYPE,
    // Set key/ filename as original uploaded name
    key: function (req, file, cb) {
      cb(
        null,
        global.S3_IMG_HANDLER_FOLDER +
          "/products/" +
          req.params.productId +
          "/" +
          file.fieldname +
          "-" +
          Date.now() +
          "." +
          "jpeg"
      );
    },
  }),
  fileFilter: fileFilterPicture,
  limits: { fileSize: config.server.max_file_size },
});

/*
// Multer upload (Use multer-s3 to save directly to AWS instead of locally)
var uploadS3Variant = multer({
    storage: multerS3({
        s3: s3,
        bucket: global.S3_BUCKET_NAME,
        // Set public read permissions
        // acl: 'public-read',
        // Auto detect contet type
        contentType: multerS3.AUTO_CONTENT_TYPE,
        // Set key/ filename as original uploaded name
        key: function (req, file, cb) {
            cb(null, global.S3_IMG_HANDLER_FOLDER + '/variants/' + req.params.variantId + '/' + file.fieldname + '-' + Date.now() + '.' + 'jpeg');
        },
    }),
    fileFilter: fileFilterPicture,
    limits: { fileSize: config.server.max_file_size }
});
*/

// Remove Folder from Filename
function removeFolderFromFilenameUser(req) {
  var X = req.file.key;
  var Y = global.S3_IMG_HANDLER_FOLDER + "/users/" + req.params.userId + "/";
  return X.slice(X.indexOf(Y) + Y.length);
}

// Remove Folder from Filename
function removeFolderFromFilenameProduct(req) {
  var X = req.file.key;
  var Y =
    global.S3_IMG_HANDLER_FOLDER + "/products/" + req.params.productId + "/";
  return X.slice(X.indexOf(Y) + Y.length);
}

/*
// Remove Folder from Filename
function removeFolderFromFilenameVariant(req) {
    var X = req.file.key;
    var Y = global.S3_IMG_HANDLER_FOLDER + '/variants/' + req.params.variantId + '/';
    return X.slice(X.indexOf(Y) + Y.length);
}
*/

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

function getPhoto(req, done) {
  let query = {
    _id: req.params.photoId,
  };

  Photo.findOne(query).exec(function (err, photo) {
    if (err) {
      return done({ status: 500, body: { error: err } });
    } else if (!photo) {
      return done({ status: 404, body: { error: "Photo not found." } });
    } else {
      return done(null, req, photo);
    }
  });
}

function getProduct(req, photo, done) {
  let query = {
    _id: req.params.productId,
  };

  Product.findOne(query).exec(function (err, product) {
    if (err) {
      return done({ status: 500, body: { error: err } });
    } else if (!product) {
      return done({ status: 404, body: { error: "Product not found." } });
    } else {
      return done(null, photo, product);
    }
  });
}

function deleteProductPhotoS3(photo, product, done) {
  params = {
    Bucket: global.S3_BUCKET_NAME,
    Key:
      global.S3_IMG_HANDLER_FOLDER +
      "/products/" +
      product._id +
      "/" +
      photo.filename,
  };

  s3.deleteObject(params, function (err, data) {
    if (err) {
      return done({
        status: 424,
        body: { error: "Previous S3 photo could not be deleted." },
      });
    } else {
      return done(null, photo, product);
    }
  });
}

function checkIfUserHasPhoto(req, res, done) {
  let query = {
    _id: req.params.userId,
  };

  User.findOne(query).exec(function (err, user) {
    if (err) {
      return done({ status: 500, body: { error: err } });
    } else if (!user) {
      return done({ status: 404, body: { error: "User not found." } });
    } else {
      if (!user.image) {
        return done(null, req, res);
      } else {
        let query = {
          _id: user.image,
        };

        Photo.findOne(query).exec(function (err, photo) {
          if (err) {
            return done(err);
          } else if (!photo) {
            return done({ status: 404, body: { error: "Photo not found." } });
          } else {
            params = {
              Bucket: global.S3_BUCKET_NAME,
              Key:
                global.S3_IMG_HANDLER_FOLDER +
                "/users/" +
                req.params.userId +
                "/" +
                photo.filename,
            };

            s3.deleteObject(params, function (err, data) {
              if (err) {
                return done({
                  status: 424,
                  body: { error: "Previous S3 photo could not be deleted." },
                });
              } else {
                return done(null, req, res);
              }
            });
          }
        });
      }
    }
  });
}

/*
function checkIfVariantHasPhoto(req, res, done) {
    let query = {
        _id: req.params.variantId
    }

    Variant.findOne(query)
        .exec(function (err, variant) {
            if (err) {
                return done({ status: 500, body: { error: err } })
            } else if (!variant) {
                return done({ status: 404, body: { error: "Variant not found." } })
            } else {
                if (!variant.image) {
                    return done(null, req, res);
                } else {
                    let q
                    uery = {
                        _id: variant.image
                    };

                    Photo
                        .findOne(query)
                        .exec(function (err, photo) {
                            if (err) {
                                return done(err);
                            } else if (!photo) {
                                return done({ status: 404, body: { error: "Photo not found." } });
                            } else {
                                params = {
                                    Bucket: global.S3_BUCKET_NAME,
                                    Key: global.S3_IMG_HANDLER_FOLDER + '/variants/' + req.params.variantId + '/' + photo.filename
                                };

                                s3.deleteObject(params, function (err, data) {
                                    if (err) {
                                        return done({ status: 424, body: { error: "Previous S3 photo could not be deleted." } });
                                    } else {
                                        return done(null, req, res);
                                    }
                                });
                            }
                        });
                }
            }
        })
}
*/

function uploadPhotoS3User(req, res, done) {
  uploadS3User.single("photo")(req, res, function (err) {
    //upload the file in the fieldname "photo"
    if (err || req.file == undefined) {
      return done({ status: 500, body: { error: err } });
    } else {
      return done(null, req);
    }
  });
}

function uploadPhotoS3Product(req, res, done) {
  uploadS3Product.single("photo")(req, res, function (err) {
    //upload the file in the fieldname "photo"
    if (err || req.file == undefined) {
      return done({ status: 500, body: { error: err } });
    } else {
      return done(null, req);
    }
  });
}

/*
function uploadPhotoS3Variant(req, res, done) {
    uploadS3Variant.single('photo')(req, res, function (err) { //upload the file in the fieldname "photo"
        if (err || req.file == undefined) {
            return done({ status: 500, body: { error: err } });
        } else { return done(null, req); }
    });
}
*/

function savePhotoUser(req, done) {
  var photo = Photo();

  photo.filename = removeFolderFromFilenameUser(req);
  photo.user = req.params.userId;
  if (req.body.alt) photo.alt = req.body.alt;

  photo.save(function (err, pht) {
    if (err) {
      return done({ status: 500, body: { error: err } });
    } else {
      let query = {
        _id: req.params.userId,
      };

      let body = {
        image: pht._id,
      };

      User.update(query, body).exec(function (err, user) {
        if (err) {
          return done({ status: 500, body: { error: err } });
        } else if (!user) {
          return done({ status: 404, body: { error: "User not found." } });
        } else {
          return done(null, pht);
        }
      });
    }
  });
}

function savePhotoProduct(req, done) {
  var photo = Photo();

  photo.filename = removeFolderFromFilenameProduct(req);
  photo.product = req.params.productId;
  if (req.body.alt) photo.alt = req.body.alt;

  photo.save(function (err, pht) {
    if (err) {
      return done({ status: 500, body: { error: err } });
    } else {
      return done(null, req, pht);
    }
  });
}

function saveProductPhoto(req, photo, done) {
  let query = {
    _id: req.params.productId,
  };

  Product.findOne(query).exec(function (err, product) {
    if (err) {
      return done({ status: 500, body: { error: err } });
    } else if (!product) {
      return done({ status: 404, body: { error: "Product not found." } });
    } else {
      if (!product.image) {
        product.image = photo._id;
      }
      if (!product.images) {
        product["images"] = [];
        product.images.unshift(photo._id);
      } else {
        product["images"].unshift(photo._id);
      }
      product.save(function (err) {
        if (err) {
          return done({ status: 500, body: { error: err } });
        } else {
          return done(null, photo);
        }
      });
    }
  });
}

function saveAdditionalProductPhoto(req, photo, done) {
  let query = {
    _id: req.params.productId,
  };

  Product.findOne(query).exec(function (err, product) {
    if (err) {
      return done({ status: 500, body: { error: err } });
    } else if (!product) {
      return done({ status: 404, body: { error: "Product not found." } });
    } else {
      if (!product["images"]) {
        product["images"] = [];
        product["images"].push(product.image);
      }

      product["images"].push(photo._id);

      product.save(function (err) {
        if (err) {
          return done({ status: 500, body: { error: err } });
        } else {
          return done(null, photo);
        }
      });
    }
  });
}

/*
function savePhotoVariant(req, done) {
    var photo = Photo();

    photo.filename = removeFolderFromFilenameVariant(req);
    photo.variant = req.params.variantId;
    if (req.body.alt) photo.alt = req.body.alt;

    photo.save(function (err, pht) {
        if (err) {
            return done({ status: 500, body: { error: err } });
        } else {
            let query = {
                _id: req.params.variantId
            }

            let body = {
                image: pht._id
            }

            Variant.update(query, body)
                .exec(function (err, variant) {
                    if (err) {
                        return done({ status: 500, body: { error: err } });
                    } else if (!variant) {
                        return done({ status: 404, body: { error: "Variant not found." } });
                    } else {
                        return done(null, pht);
                    }
                });
        }
    });
}
*/

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

// Upload Photo (User)
// POST {{HOST}}/user/:userId/photo/upload
exports.upload_photo_user = function (req, res) {
  req.checkParams("userId", "required").notEmpty();

  if (req.validationErrors()) {
    return res.status(400).send({ errors: req.validationErrors() });
  }

  var functionsToCall = [
    async.apply(checkIfUserHasPhoto, req, res),
    uploadPhotoS3User,
    savePhotoUser,
  ];

  async.waterfall(functionsToCall, function (err, result) {
    if (err) {
      return res.status(err.status).send(err.body);
    } else {
      return res.status(200).send(result);
    }
  });
};

// Upload Photo (Product)
// POST {{HOST}}/product/:productId/photo/upload
exports.upload_photo_product = function (req, res) {
  req.checkParams("productId", "required").notEmpty();

  if (req.validationErrors()) {
    return res.status(400).send({ errors: req.validationErrors() });
  }

  var functionsToCall = [
    async.apply(uploadPhotoS3Product, req, res),
    savePhotoProduct,
    saveProductPhoto,
  ];

  async.waterfall(functionsToCall, function (err, photo) {
    if (err) {
      return res.status(err.status).send(err.body);
    } else {
      return res.status(200).send(photo);
    }
  });
};

exports.upload_additional_photo_product = function (req, res) {
  req.checkParams("productId", "required").notEmpty();

  if (req.validationErrors()) {
    return res.status(400).send({ errors: req.validationErrors() });
  }

  var functionsToCall = [
    async.apply(uploadPhotoS3Product, req, res),
    savePhotoProduct,
    saveAdditionalProductPhoto,
  ];

  async.waterfall(functionsToCall, function (err, photo) {
    if (err) {
      return res.status(err.status).send(err.body);
    } else {
      return res.status(200).send(photo);
    }
  });
};

/*
// Upload Photo (Product)
// POST {{HOST}}/variant/:variantId/photo/upload
exports.upload_photo_variant = function (req, res) {

    req.checkParams('variantId', 'required').notEmpty();

    if (req.validationErrors()) {
        return res.status(400).send({ errors: req.validationErrors() });
    }

    var functionsToCall = [
        async.apply(checkIfVariantHasPhoto, req, res),
        uploadPhotoS3Variant,
        savePhotoVariant
    ];

    async.waterfall(
        functionsToCall,
        function (err, photo) {
            if (err) {
                return res.status(err.status).send(err.body);
            } else {
                return res.status(200).send(photo);
            }
        });
}
*/

// Download Photo (User)
// GET {{HOST}}/user/:userId/photo
exports.download_photo_user = function (req, res) {
  req.checkParams("userId", "required").notEmpty();

  if (req.validationErrors()) {
    return res.status(400).send({ errors: req.validationErrors() });
  }

  let query = {
    _id: req.params.userId,
  };

  User.findOne(query).exec(function (err, user) {
    if (err) {
      return res.status(500).send({ error: err });
    } else if (!user) {
      return res.status(404).send({ error: "User not found." });
    } else if (!user.image) {
      return res.status(200).send({});
    } else {
      let query = {
        _id: user.image,
      };

      Photo.findOne(query).exec(function (err, photo) {
        if (err) {
          return res.status(500).send({ error: err });
        } else if (!photo) {
          return res.status(404).send({ error: "Photo not found." });
        } else {
          var params = {
            Bucket: global.S3_BUCKET_NAME,
            Key:
              global.S3_IMG_HANDLER_FOLDER +
              "/users/" +
              req.params.userId +
              "/" +
              photo.filename,
          };

          s3.getObject(params, function (err, data) {
            if (err) {
              return res.status(500).send({ errors: err });
            } else {
              var img = new Buffer.from(data.Body, "base64");
              res.contentType(data.ContentType);
              res.status(200).send(img);
            }
          });
        }
      });
    }
  });
};

// Download Photo (Product)
// GET {{HOST}}/product/:productId/photo/download
exports.download_photo_product = function (req, res) {
  req.checkParams("productId", "required").notEmpty();

  if (req.validationErrors()) {
    return res.status(400).send({ errors: req.validationErrors() });
  }

  let query = {
    _id: req.params.productId,
  };

  Product.findOne(query).exec(function (err, product) {
    if (err) {
      return res.status(500).send({ error: err });
    } else if (!product) {
      return res.status(404).send({ error: "Product not found." });
    } else if (!product.image) {
      return res.status(200).send({});
    } else {
      let query = {
        _id: product.image,
      };

      Photo.findOne(query).exec(function (err, photo) {
        if (err) {
          return res.status(500).send({ error: err });
        } else if (!photo) {
          return res.status(404).send({ error: "Photo not found." });
        } else {
          var params = {
            Bucket: global.S3_BUCKET_NAME,
            Key:
              global.S3_IMG_HANDLER_FOLDER +
              "/products/" +
              req.params.productId +
              "/" +
              photo.filename,
          };

          s3.getObject(params, function (err, data) {
            if (err) {
              return res.status(500).send({ errors: err });
            } else {
              var img = new Buffer.from(data.Body, "base64");
              res.contentType(data.ContentType);
              res.status(200).send(img);
            }
          });
        }
      });
    }
  });
};

// Download Photo (Product)
// GET {{HOST}}/product/:productId/photo/:photoId
exports.download_additional_photo_product = function (req, res) {
  req.checkParams("productId", "required").notEmpty();
  req.checkParams("photoId", "required").notEmpty();

  if (req.validationErrors()) {
    return res.status(400).send({ errors: req.validationErrors() });
  }

  let query = {
    _id: req.params.photoId,
  };

  Photo.findOne(query).exec(function (err, photo) {
    if (err) {
      return res.status(500).send({ error: err });
    } else if (!photo) {
      return res.status(404).send({ error: "Photo not found." });
    } else {
      var params = {
        Bucket: global.S3_BUCKET_NAME,
        Key:
          global.S3_IMG_HANDLER_FOLDER +
          "/products/" +
          req.params.productId +
          "/" +
          photo.filename,
      };

      s3.getObject(params, function (err, data) {
        if (err) {
          return res.status(500).send({ errors: err });
        } else {
          var img = new Buffer.from(data.Body, "base64");
          res.contentType(data.ContentType);
          res.status(200).send(img);
        }
      });
    }
  });
};

// Delete Photo (Product)
// DELETE {{HOST}}/product/:productId/photo/:photoId
exports.delete_photo_product = function (req, res) {
  req.checkParams("productId", "required").notEmpty();
  req.checkParams("photoId", "required").notEmpty();

  if (req.validationErrors()) {
    return res.status(400).send({ errors: req.validationErrors() });
  }

  var functionsToCall = [
    async.apply(getPhoto, req),
    getProduct,
    deleteProductPhotoS3,
  ];

  async.waterfall(functionsToCall, function (err, photo, product) {
    if (err) {
      return res.status(err.status).send(err.body);
    } else {
      let query = {
        _id: product._id,
      };

      Product.update(query, { $pull: { images: { $in: [photo._id] } } }).exec(
        function (err) {
          if (err) {
            return res.status(500).send({ error: err });
          } else {
            return res.status(200).send({});
          }
        }
      );
    }
  });
};

// Set Photo Primaru (Product)
// PUT {{HOST}}/product/:productId/photo/:photoId
exports.set_photo_primary = function (req, res) {
  req.checkParams("productId", "required").notEmpty();
  req.checkParams("photoId", "required").notEmpty();

  if (req.validationErrors()) {
    return res.status(400).send({ errors: req.validationErrors() });
  }

  let query = {
    _id: req.params.productId,
  };

  Product.update(query, { image: req.params.photoId }).exec(function (err) {
    if (err) {
      return res.status(500).send({ error: err });
    } else {
      return res.status(200).send({});
    }
  });
};
/*
// Download Photo (Product)
// GET {{HOST}}/variant/:variantId/photo/download
exports.download_photo_variant = function (req, res) {

    req.checkParams('variantId', 'required').notEmpty();

    if (req.validationErrors()) {
        return res.status(400).send({ errors: req.validationErrors() });
    }

    let query = {
        _id: req.params.variantId
    };

    Variant
        .findOne(query)
        .exec(function (err, variant) {
            if (err) {
                return res.status(500).send({ error: err });
            } else if (!variant) {
                return res.status(404).send({ error: "Product not found." });
            } else if (!variant.image) {
                return res.status(200).send({})
            } else {
                let query = {
                    _id: variant.image
                }

                Photo.findOne(query)
                    .exec(function (err, photo) {
                        if (err) {
                            return res.status(500).send({ error: err });
                        } else if (!photo) {
                            return res.status(404).send({ error: "Photo not found." });
                        } else {

                            var params = {
                                Bucket: global.S3_BUCKET_NAME,
                                Key: global.S3_IMG_HANDLER_FOLDER + '/variants/' + req.params.variantId + '/' + photo.filename
                            };

                            s3.getObject(params, function (err, data) {
                                if (err) {
                                    return res.status(500).send({ errors: err });
                                } else {
                                    var img = new Buffer.from(data.Body, 'base64');
                                    res.contentType(data.ContentType);
                                    res.status(200).send(img);
                                }
                            });
                        }
                    });
            }
        });
}
*/

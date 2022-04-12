/** @format */

import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import { ObjectId } from "mongoose";
import { waterfall, apply } from "async";

import multer from "multer";
import multerS3 from "multer-s3";
import { config, S3 } from "aws-sdk";

import { BaseController } from "../../controllers/BaseController";
import { ImageType } from "../../schemas/Images/Image";
import { Image, User } from "../../schemas";

import {
  IAM_ACCESS_KEY_ID,
  IAM_SECRET_ACCESS_KEY,
  S3_BUCKET_NAME,
  S3_IMG_HANDLER_FOLDER,
  S3_BUCKET_REGION,
  CONFIG,
} from "../../config";
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
const file_filter_picture = (req, file, cb) => {
  if (
    file.mimetype == "image/jpeg" ||
    file.mimetype == "image/jpg" ||
    file.mimetype == "image/png"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Supported file formats: image/jpeg, image/png"));
  }
};

config.update({
  credentials: {
    accessKeyId: IAM_ACCESS_KEY_ID,
    secretAccessKey: IAM_SECRET_ACCESS_KEY,
  },
});

const s3 = new S3({
  region: S3_BUCKET_REGION,
});

const uploadS3User = multer({
  storage: multerS3({
    s3: s3,
    bucket: S3_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req: Request, file, cb) {
      cb(
        null,
        `${S3_IMG_HANDLER_FOLDER}/user/${req.params.id}/${
          file.fieldname
        }_${Date.now()}.jpeg`
      );
    },
  }),
  fileFilter: file_filter_picture,
  limits: {
    fileSize: CONFIG.server.max_file_size,
  },
});

const uploadS3Product = multer({
  storage: multerS3({
    s3: s3,
    bucket: S3_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req: Request, file, cb) {
      cb(
        null,
        `${S3_IMG_HANDLER_FOLDER}/product/${req.params.id}/${
          file.fieldname
        }_${Date.now()}.jpeg`
      );
    },
  }),
  fileFilter: file_filter_picture,
  limits: {
    fileSize: CONFIG.server.max_file_size,
  },
});

// const uploadS3Variant = multer({
//   storage: multerS3({
//     s3: s3,
//     bucket: S3_BUCKET_NAME,
//     contentType: multerS3.AUTO_CONTENT_TYPE,
//     key: function (req: Request, file, cb) {
//       cb(
//         null,
//         `${S3_IMG_HANDLER_FOLDER}/variant/${req.params.id}/${
//           file.fieldname
//         }_${Date.now()}.jpeg`
//       );
//     },
//   }),
//   fileFilter: file_filter_picture,
//   limits: {
//     fileSize: CONFIG.server.max_file_size,
//   },
// });

// Remove Folder from Filename
const sliceFilename = (req: Request, file, type: ImageType): string => {
  var X = file.key;
  var Y = `${S3_IMG_HANDLER_FOLDER}/${type}/${req.params.id}/`;
  return X.slice(X.indexOf(Y) + Y.length);
};

interface WaterfallError {
  status: number;
  body: any;
}

const waterfallError = (status: number, err: any): WaterfallError => {
  return {
    status: status,
    body: { error: err },
  };
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

const uploadImageS3User = (req, res, done) => {
  uploadS3User.single("image")(req, res, function (err) {
    if (err) {
      return done(waterfallError(500, err));
    } else if (!req.file.key) {
      return done(
        waterfallError(500, "An S3 upload error occured. No filename returned.")
      );
    } else {
      return done(null, req, ImageType.USER);
    }
  });
};

const uploadImageS3Product = (req, res, done) => {
  uploadS3Product.single("image")(req, res, function (err) {
    if (err) {
      return done(waterfallError(500, err));
    } else if (!req.filename) {
      return done(
        waterfallError(500, "An S3 upload error occured. No filename returned.")
      );
    } else {
      return done(null, req, ImageType.PRODUCT);
    }
  });
};

// const uploadImageS3Variant = (req, res, done) => {
//   uploadS3Variant.single("image")(req, res, function (err) {
//     if (err) {
//       return done({
//         status: 500,
//         body: { error: err },
//       });
//     } else if (!req.filename) {
//       return done({
//         status: 500,
//         body: { error: "An S3 upload error occured. No filename returned." },
//       });
//     } else {
//       return done(null, req);
//     }
//   });
// };

const createImage = async (req: Request, type: ImageType, done) => {
  var image = new Image();

  image.filename = sliceFilename(req, req.file, type);
  if (req.body.alt) image.alt = req.body.alt;
  image.objectId = req.params.id as unknown as ObjectId;
  image.type = req.params.type as ImageType;
  image.key = req.file["key"];

  try {
    image = await image.save();
    return done(null, image);
  } catch (err) {
    return done({ status: 500, body: { error: err } });
  }
};

const updateUser = async (image, done) => {
  try {
    const user = await User.findById(image.user);
    if (!user)
      return done(waterfallError(404, "User not found from image user value."));
    user.image = image._id;
    await user.save();
    return done(null, image);
  } catch (err) {
    return done(waterfallError(500, err));
  }
};

interface S3ImageParams {
  Bucket: string;
  Key: string;
}

const s3ImageParams = (image): S3ImageParams => {
  const params = {
    Bucket: S3_BUCKET_NAME,
    Key: image.key,
  };
  return params;
};

const deletePreviousUserImage = async (req, res, done) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return waterfallError(404, "User not found.");
    if (user.image) {
      const image = await Image.findById(user.image);
      if (!image) {
      } else {
        console.log("Deleting previous user image: key:: ", image.key);
        await s3.deleteObject(s3ImageParams(image)).promise();
      }
    }
    return done(null, req, res);
  } catch (err) {
    return waterfallError(500, err);
  }
};

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

class ImageController extends BaseController {
  public async create(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ) {
    const id = req.params?.id;
    const type = req.params?.type;

    let validation = [];
    if (!id) validation.push("param:id");
    if (!type) validation.push("type");

    if (validation.length != 0)
      return res.status(400).send({
        validation_error: validation.toLocaleString(),
      });

    const functions = [];
    switch (type) {
      case ImageType.USER:
        functions.push(apply(deletePreviousUserImage, req, res));
        functions.push(uploadImageS3User);
        functions.push(createImage);
        functions.push(updateUser);
        break;
      case ImageType.PRODUCT:
        functions.push(apply(uploadImageS3Product, req, res));
        functions.push(createImage);
        break;
      //   case ImageType.VARIANT:
      //     functions.push(apply(uploadImageS3Variant, req, res));
      //     functions.push(createImage);
      //     break;
      default:
        return res
          .status(400)
          .send({ error: "type not supported at this time." });
        break;
    }

    waterfall(functions, function (err: WaterfallError, image: typeof Image) {
      if (err) return res.status(err.status).send(err.body);
      return res.status(201).send(image);
    });
  }

  public async read(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ) {
    const id = req.params?.id;

    let validation = [];
    if (!id) validation.push("param:id");

    if (validation.length != 0)
      return res.status(400).send({
        validation_error: validation.toLocaleString(),
      });

    try {
      const image = await Image.findById(id);
      return res.status(200).send(image);
    } catch (err) {
      return res.status(500).send({ error: err });
    }
  }
  public async update(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ) {
    const id = req.params?.id;

    let validation = [];
    if (!id) validation.push("param:id");

    if (validation.length != 0)
      return res.status(400).send({
        validation_error: validation.toLocaleString(),
      });

    try {
      const response = await Image.updateOne(
        {
          _id: id,
        },
        {
          ...req.body,
        }
      );
      return res.status(200).send(response);
    } catch (err) {
      return res.status(500).send({ error: err });
    }
  }
  public async delete(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ) {
    const id = req.params?.id;

    let validation = [];
    if (!id) validation.push("param:id");

    if (validation.length != 0)
      return res.status(400).send({
        validation_error: validation.toLocaleString(),
      });

    try {
      const image = await Image.findById(id);
      if (!image) return res.status(404).send({ error: "Image not found." });

      await s3.deleteObject(s3ImageParams(image)).promise();
      switch (image.type) {
        case ImageType.USER:
          await User.updateMany(
            {
              image: image._id,
            },
            {
              image: null,
            }
          );
          break;
        case ImageType.PRODUCT:
          break;
        case ImageType.VARIANT:
          break;
        default:
          break;
      }

      const response = await Image.deleteOne({
        _id: id,
      });
      return res.status(200).send(response);
    } catch (err) {
      return res.status(500).send({ error: err });
    }
  }
  public async read_all(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ) {
    try {
      console.log("Read All Images");
      const images = await Image.find({});
      return res.status(200).send(images);
    } catch (err) {
      return res.status(500).send({ error: err });
    }
  }
  public async download(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ) {
    const id = req.params?.id;

    let validation = [];
    if (!id) validation.push("param:id");

    if (validation.length != 0)
      return res.status(400).send({
        validation_error: validation.toLocaleString(),
      });

    try {
      const image = await Image.findById(id);
      const data = await s3.getObject(s3ImageParams(image)).promise();
      const download = Buffer.from(data.Body as String, "base64");
      res.contentType(data.ContentType);
      res.status(200).send(download);
    } catch (err) {
      return res.status(500).send({ error: err });
    }
  }
}

export const imageController = new ImageController();

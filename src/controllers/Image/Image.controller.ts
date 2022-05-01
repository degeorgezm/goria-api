/** @format */

import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import { ObjectId } from "mongoose";
import { waterfall, apply } from "async";

import multer from "multer";
import multerS3 from "multer-s3";
import { config, S3 } from "aws-sdk";

import { BaseController } from "../BaseController";
import { Image, User, IImage, ImageType } from "../../models";

import {
  IAM_ACCESS_KEY_ID,
  IAM_SECRET_ACCESS_KEY,
  S3_BUCKET_NAME,
  S3_IMG_HANDLER_FOLDER,
  S3_BUCKET_REGION,
  CONFIG,
} from "../../config";

// Define the filetype for Picture Upload
const fileFilterPicture = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/png"
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
    s3,
    bucket: S3_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req: Request, file, cb) => {
      cb(
        null,
        `${S3_IMG_HANDLER_FOLDER}/user/${req.params.id}/${
          file.fieldname
        }_${Date.now()}.jpeg`
      );
    },
  }),
  fileFilter: fileFilterPicture,
  limits: {
    fileSize: CONFIG.server.max_file_size,
  },
});

const uploadS3Product = multer({
  storage: multerS3({
    s3,
    bucket: S3_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req: Request, file, cb) => {
      cb(
        null,
        `${S3_IMG_HANDLER_FOLDER}/product/${req.params.id}/${
          file.fieldname
        }_${Date.now()}.jpeg`
      );
    },
  }),
  fileFilter: fileFilterPicture,
  limits: {
    fileSize: CONFIG.server.max_file_size,
  },
});

// const uploadS3Variant = multer({
//   storage: multerS3({
//     s3,
//     bucket: S3_BUCKET_NAME,
//     contentType: multerS3.AUTO_CONTENT_TYPE,
//     key: (req: Request, file, cb) => {
//       cb(
//         null,
//         `${S3_IMG_HANDLER_FOLDER}/variant/${req.params.id}/${
//           file.fieldname
//         }_${Date.now()}.jpeg`
//       );
//     },
//   }),
//   fileFilter: fileFilterPicture,
//   limits: {
//     fileSize: CONFIG.server.max_file_size,
//   },
// });

// Remove Folder from Filename
const sliceFilename = (req: Request, file, type: ImageType): string => {
  const X = file.key;
  const Y = `${S3_IMG_HANDLER_FOLDER}/${type}/${req.params.id}/`;
  return X.slice(X.indexOf(Y) + Y.length);
};

interface WaterfallError {
  status: number;
  body: any;
}

const waterfallError = (status: number, err: any): WaterfallError => {
  return {
    status,
    body: { error: err },
  };
};

const uploadImageS3User = (req, res, done) => {
  uploadS3User.single("image")(req, res, (err) => {
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
  uploadS3Product.single("image")(req, res, (err) => {
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
  let image = new Image();

  image.filename = sliceFilename(req, req.file, type);
  if (req.body.alt) image.alt = req.body.alt;
  image.object_id = req.params.id as unknown as ObjectId;
  image.type = req.params.type as ImageType;
  /* tslint:disable-next-line no-string-literal error */
  image.key = req.file["key"];

  try {
    image = await image.save();
    image = await Image.findById(image._id).populate(ImageController.populates);
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
    if (!user) return waterfallError(404, "user not found");
    if (user.image) {
      const image = await Image.findById(user.image);
      if (image) await s3.deleteObject(s3ImageParams(image)).promise();
    }
    return done(null, req, res);
  } catch (err) {
    return waterfallError(500, err);
  }
};

export class ImageController extends BaseController {
  public static populates = "user variant product";

  public async create(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ) {
    const id = req.params?.id;
    const type = req.params?.type;

    const validation = [];
    if (!type) validation.push("type");

    if (validation.length !== 0)
      return res.status(400).send({
        error: { validation: validation.toLocaleString() },
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

    waterfall(functions, (err: WaterfallError, image: IImage) => {
      if (err) return res.status(err.status).send(err.body);
      return res.status(201).send(image);
    });
  }

  public async read(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ) {
    const id = req.params?.id;

    const validation = [];

    if (validation.length !== 0)
      return res.status(400).send({
        error: { validation: validation.toLocaleString() },
      });

    try {
      const image = await Image.findById(id).populate(
        ImageController.populates
      );
      return res.status(200).send(image);
    } catch (err) {
      return res.status(500).send({ error: err });
    }
  }

  public async read_all(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ) {
    try {
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

    const validation = [];

    if (validation.length !== 0)
      return res.status(400).send({
        error: { validation: validation.toLocaleString() },
      });

    try {
      const image = await Image.findById(id);
      const data = await s3.getObject(s3ImageParams(image)).promise();
      const download = Buffer.from(data.Body as string, "base64");
      res.contentType(data.ContentType);
      res.status(200).send(download);
    } catch (err) {
      return res.status(500).send({ error: err });
    }
  }
  public async update(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ) {
    const id = req.params?.id;

    const validation = [];
    if (req.body._id) validation.push("!_id");
    if (req.body.filename) validation.push("!filename");
    if (req.body.user) validation.push("!user");
    if (req.body.variant) validation.push("!variant");
    if (req.body.product) validation.push("!product");
    if (req.body.key) validation.push("!key");
    if (req.body.type) {
      switch (req.body.type) {
        case ImageType.PRODUCT:
          if (req.body.variant) validation.push("!variant");
          if (req.body.user) validation.push("!user");
          if (!req.body.product) validation.push("+product");
          break;
        case ImageType.USER:
          if (req.body.variant) validation.push("!variant");
          if (!req.body.user) validation.push("+user");
          if (req.body.product) validation.push("!product");
          break;
        case ImageType.VARIANT:
          if (!req.body.variant) validation.push("+variant");
          if (req.body.user) validation.push("!user");
          if (req.body.product) validation.push("!product");
          break;
        default:
          validation.push("invalid_type");
      }
    }

    if (validation.length !== 0)
      return res.status(400).send({
        error: { validation: validation.toLocaleString() },
      });

    try {
      let image = await Image.findById(id);
      for (const index in req.body) image[index] = req.body[index];
      image = await image.save();
      image = await Image.findById(id).populate(ImageController.populates);
      return res.status(200).send(image);
    } catch (err) {
      return res.status(500).send({ error: err });
    }
  }
  public async delete(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ) {
    const id = req.params?.id;

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
}

export const imageController = new ImageController();

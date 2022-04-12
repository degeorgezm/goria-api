/** @format */

import mongoose, { Schema, model, NativeError } from "mongoose";
import mongooseDeepPopulate from "mongoose-deep-populate";
import { Document } from "mongodb";

export enum ImageType {
  USER = "user",
  PRODUCT = "product",
  VARIANT = "variant",
}

// 1. Create an interface representing a document in MongoDB.
interface IImage {
  _id: Schema.Types.ObjectId;
  filename: string;
  key: string;
  type: ImageType;
  objectId: Schema.Types.ObjectId;
  user?: Schema.Types.ObjectId;
  product?: Schema.Types.ObjectId;
  variant: Schema.Types.ObjectId;
  alt?: string;
  save(): IImage | PromiseLike<IImage>;
}

// 2. Create a Schema corresponding to the document interface.
const ImageSchema = new Schema(
  {
    filename: { type: String, required: true },
    key: { type: String, required: true },
    alt: { type: String, required: false, default: "Image" },
    type: { type: String, required: true, enum: ImageType },
    objectId: { type: Schema.Types.ObjectId, required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: false },
    product: { type: Schema.Types.ObjectId, ref: "Product", required: false },
    variant: { type: Schema.Types.ObjectId, ref: "Variant", required: false },
  },
  {
    versionKey: false,
    timestamps: { createdAt: true, updatedAt: true },
  }
);

ImageSchema.plugin(mongooseDeepPopulate(mongoose), {});

ImageSchema.pre(
  "save",
  async function (
    this: Document,
    next: (err?: NativeError) => void,
    data: any
  ) {
    switch (this.type) {
      case ImageType.USER:
        this.user = this.objectId;
        break;
      case ImageType.PRODUCT:
        this.product = this.objectId;
        break;
      case ImageType.VARIANT:
        this.variant = this.objectId;
        break;
      default:
        break;
    }

    return next();
  }
);

ImageSchema.post("deleteOne", async function (reponse) {
  console.log("Image Deleted: ", reponse);
});

// 3. Create a Model.
export const Image = model<IImage>("Image", ImageSchema);

/** @format */

import mongoose, { Schema, model, NativeError } from "mongoose";
import mongooseDeepPopulate from "mongoose-deep-populate";
import { Document } from "mongodb";

import { IUser, IVariant } from "..";

export enum ImageType {
  USER = "user",
  PRODUCT = "product",
  VARIANT = "variant",
}

// 1. Create an interface representing a document in MongoDB.
export interface IImage {
  _id: Schema.Types.ObjectId;
  filename: string;
  type: ImageType;
  key: string;
  object_id: Schema.Types.ObjectId;
  user?: Schema.Types.ObjectId | IUser;
  product?: Schema.Types.ObjectId;
  variant: Schema.Types.ObjectId | IVariant;
  alt?: string;
  createdAt: string;
  updatedAt: string;
  save(): IImage | PromiseLike<IImage>;
}

// 2. Create a Schema corresponding to the document interface.
const ImageSchema = new Schema(
  {
    filename: { type: String, required: true },
    alt: { type: String, required: false, default: "Image" },
    type: { type: String, required: true, enum: ImageType },
    key: { type: String, required: true },
    object_id: { type: Schema.Types.ObjectId, required: true },
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
        this.user = this.object_id;
        break;
      case ImageType.PRODUCT:
        this.product = this.object_id;
        break;
      case ImageType.VARIANT:
        this.variant = this.object_id;
        break;
      default:
        break;
    }

    return next();
  }
);

// ImageSchema.post("deleteOne", async (reponse) => {});

// 3. Create a Model.
export let Image = model<IImage>("Image", ImageSchema);

/** @format */

import mongoose, { Schema, model } from "mongoose";
import mongooseDeepPopulate from "mongoose-deep-populate";
import { IImage, IType } from "../../index";

// 1. Create an interface representing a document in MongoDB.
export interface IVariant {
  _id: Schema.Types.ObjectId;
  name: string;
  sku_shortcode: string;
  display: boolean;
  color: string;
  type: Schema.Types.ObjectId | IType;
  image: Schema.Types.ObjectId | IImage;
  save(): IVariant | PromiseLike<IVariant>;
}

const VariantSchema = new Schema(
  {
    name: { type: String, required: true },
    sku_shortcode: { type: String, unique: true, required: true },
    display: { type: Boolean, required: true, default: true },
    type: { type: Schema.Types.ObjectId, ref: "Type", required: true },
    image: { type: Schema.Types.ObjectId, ref: "Image", required: false },
    color: { type: String, required: false },
  },
  {
    versionKey: false,
    timestamps: { createdAt: "_createdAt", updatedAt: "_updatedAt" },
  }
);

VariantSchema.plugin(mongooseDeepPopulate(mongoose), {});

// 3. Create a Model.
export const Variant = model<IVariant>("Variant", VariantSchema);

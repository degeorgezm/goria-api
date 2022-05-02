/** @format */

import { Schema, model } from "mongoose";

// 1. Create an interface representing a document in MongoDB.
export interface IBrand {
  _id: Schema.Types.ObjectId;
  name: string;
  sku_shortcode: string;
  display: boolean;
  save(): IBrand | PromiseLike<IBrand>;
}

const BrandSchema = new Schema(
  {
    name: { type: String, unique: true, required: true },
    sku_shortcode: { type: String, unique: true, required: true },
    display: { type: Boolean, required: true, default: true },
  },
  {
    versionKey: false,
    timestamps: { createdAt: "_createdAt", updatedAt: "_updatedAt" },
  }
);

// 3. Create a Model.
export const Brand = model<IBrand>("Brand", BrandSchema);

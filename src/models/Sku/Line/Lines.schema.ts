/** @format */

import { Schema, model } from "mongoose";

// 1. Create an interface representing a document in MongoDB.
export interface ILine {
  _id: Schema.Types.ObjectId;
  name: string;
  sku_shortcode: string;
  display: boolean;
  save(): ILine | PromiseLike<ILine>;
}

const LineSchema = new Schema(
  {
    name: { type: String, unique: true, required: true },
    sku_shortcode: { type: String, unique: true, required: true },
    brand: { type: Schema.Types.ObjectId, ref: "Brand", required: false },
    display: { type: Boolean, required: true, default: true },
  },
  {
    versionKey: false,
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

// 3. Create a Model.
export const Line = model<ILine>("Line", LineSchema);

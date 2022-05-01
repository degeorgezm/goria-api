/** @format */

import { Schema, model } from "mongoose";
import { IType } from "../Type";

// 1. Create an interface representing a document in MongoDB.
export interface ISize {
  _id: Schema.Types.ObjectId;
  name: string;
  sku_shortcode: string;
  type: IType | Schema.Types.ObjectId;
  save(): ISize | PromiseLike<ISize>;
}

var SizeSchema = new Schema(
  {
    name: { type: String, unique: true, required: true },
    sku_shortcode: { type: String, unique: true, required: true },
    type: { type: Schema.Types.ObjectId, ref: "Type", required: true },
    display: { type: Boolean, required: true, default: true },
  },
  {
    versionKey: false,
    timestamps: { createdAt: "_creationDate", updatedAt: "_updatedDate" },
  }
);

// 3. Create a Model.
export const Size = model<ISize>("Size", SizeSchema);

/** @format */

import mongoose, { Schema, model } from "mongoose";
import mongooseDeepPopulate from "mongoose-deep-populate";

import {
  IBrand,
  IGroup,
  ILine,
  ISize,
  IType,
  IVariant,
  IUser,
  IProduct,
} from "../..";

export enum SaleType {
  AMOUNT = "amount",
  PERCENTAGE = "percentage",
  NO_OP = "no_op",
}

// 1. Create an interface representing a document in MongoDB.
export interface ISale {
  _id: Schema.Types.ObjectId;
  title: string;
  description: string;
  type: SaleType;
  value: number;
  minimum: number;
  maximum: number;
  start: Date;
  end: Date;
  stackable: boolean;
  free_shipping: boolean;
  brands: Schema.Types.ObjectId[] | IBrand[];
  lines: Schema.Types.ObjectId[] | ILine[];
  types: Schema.Types.ObjectId[] | IType[];
  variants: Schema.Types.ObjectId[] | IVariant[];
  groups: Schema.Types.ObjectId[] | IGroup[];
  sizes: Schema.Types.ObjectId[] | ISize[];
  products: Schema.Types.ObjectId[] | IProduct[];
  _user: Schema.Types.ObjectId | IUser;
  save(): ISale | PromiseLike<ISale>;
}

const SaleSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: false },
    type: { type: String, enum: SaleType, required: true },
    value: { type: Number, required: true },
    minimum: { type: Number, required: false, default: 0 },
    maximum: { type: Number, required: false, default: 0 },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    stackable: { type: Boolean, required: false, default: false },
    free_shipping: { type: Boolean, required: false, default: false },
    brands: [{ type: Schema.Types.ObjectId, ref: "Brand", required: false }],
    lines: [{ type: Schema.Types.ObjectId, ref: "Line", required: false }],
    types: [{ type: Schema.Types.ObjectId, ref: "Type", required: false }],
    sizes: [{ type: Schema.Types.ObjectId, ref: "Size", required: false }],
    variants: [
      { type: Schema.Types.ObjectId, ref: "Variant", required: false },
    ],
    groups: [{ type: Schema.Types.ObjectId, ref: "Group", required: false }],
    _user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    versionKey: false,
    timestamps: { createdAt: "_createdAt", updatedAt: "_updatedAt" },
  }
);

SaleSchema.plugin(mongooseDeepPopulate(mongoose), {});

// 3. Create a Model.
export const Sale = model<ISale>("Sale", SaleSchema);

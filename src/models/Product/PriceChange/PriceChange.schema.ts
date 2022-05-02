/** @format */

import { Schema, model } from "mongoose";
import { IProduct } from "../Product";

import {
  IBrand,
  IGroup,
  ILine,
  ISize,
  IType,
  IVariant,
  IUser,
} from "./../../../models";

export enum PriceChangeType {
  FIXED = "fixed",
  PERCENTAGE = "percentage",
  AMOUNT = "amount",
  NO_OP = "no_op",
}

// 1. Create an interface representing a document in MongoDB.
export interface IPriceChange {
  _id: Schema.Types.ObjectId;
  title: string;
  description: string;
  type: PriceChangeType;
  value: number;
  free_shipping: boolean;
  effective_date: Date;
  brands: Schema.Types.ObjectId[] | IBrand[];
  lines: Schema.Types.ObjectId[] | ILine[];
  types: Schema.Types.ObjectId[] | IType[];
  variants: Schema.Types.ObjectId[] | IVariant[];
  groups: Schema.Types.ObjectId[] | IGroup[];
  sizes: Schema.Types.ObjectId[] | ISize[];
  products: Schema.Types.ObjectId[] | IProduct[];
  _user: Schema.Types.ObjectId | IUser;
  save(): IPriceChange | PromiseLike<IPriceChange>;
}

const PriceChangeSchema = new Schema(
  {
    title: { type: String, required: false },
    description: { type: String, required: false },
    type: { type: String, enum: PriceChangeType, required: true },
    value: { type: Number, required: false, default: 0.0 },
    free_shipping: { type: Boolean, required: false },
    effective_date: { type: Date, required: true },
    brands: [{ type: Schema.Types.ObjectId, ref: "Brand", required: false }],
    lines: [{ type: Schema.Types.ObjectId, ref: "Line", required: false }],
    types: [{ type: Schema.Types.ObjectId, ref: "Type", required: false }],
    sizes: [{ type: Schema.Types.ObjectId, ref: "Size", required: false }],
    variants: [
      { type: Schema.Types.ObjectId, ref: "Variant", required: false },
    ],
    groups: [{ type: Schema.Types.ObjectId, ref: "Group", required: false }],
    products: [
      { type: Schema.Types.ObjectId, ref: "Product", required: false },
    ],
    _user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    versionKey: false,
    timestamps: { createdAt: "_createdAt", updatedAt: "_updatedAt" },
  }
);

// 3. Create a Model.
export const PriceChange = model<IPriceChange>(
  "PriceChange",
  PriceChangeSchema
);

/** @format */

import { IUser } from "models/User";
import { Schema, model } from "mongoose";

export enum SaleType {
  AMOUNT = "amount",
  PERCENTAGE = "percentage",
}

// 1. Create an interface representing a document in MongoDB.
export interface ISale {
  _id: Schema.Types.ObjectId;
  type: SaleType;
  start: Date;
  end: Date;
  title: string;
  description: string;
  stackable: boolean;
  _user: Schema.Types.ObjectId | IUser;
  save(): ISale | PromiseLike<ISale>;
}

const SaleSchema = new Schema(
  {
    type: { type: String, enum: SaleType, required: true },
    value: { type: Number, required: true },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    stackable: { type: Boolean, required: true, default: false },
    _user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    versionKey: false,
    timestamps: { createdAt: "_createdAt", updatedAt: "_updatedAt" },
  }
);

// 3. Create a Model.
export const Sale = model<ISale>("Sale", SaleSchema);

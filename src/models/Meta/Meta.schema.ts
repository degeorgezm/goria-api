/** @format */

import { Schema, model } from "mongoose";

// 1. Create an interface representing a document in MongoDB.
export interface IMeta {
  _id: Schema.Types.ObjectId;
  key: string;
  value: any;
  save(): IMeta | PromiseLike<IMeta>;
}

const MetaSchema = new Schema(
  {
    key: { type: String, unique: true, required: true },
    value: { type: Schema.Types.Mixed, required: true },
  },
  {
    versionKey: false,
    timestamps: { createdAt: "_createdAt", updatedAt: "_updatedAt" },
  }
);

// 3. Create a Model.
export const Meta = model<IMeta>("Meta", MetaSchema);

export const retrieveMeta = async (key: string): Promise<IMeta> => {
  const result = await Meta.findOne({ key });
  return result;
};

/** @format */

import { Schema } from "mongoose";

interface Document {
  _id: Schema.Types.ObjectId;
}

export const isDocument = (test: any): test is Document => test._id in test;

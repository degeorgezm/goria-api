/** @format */

import { Schema } from "mongoose";

interface document {
  _id: Schema.Types.ObjectId;
}

export const isDocument = (test: any): test is document => test._id in test;

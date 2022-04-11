/** @format */

import mongoose, { Schema, model, NativeError } from "mongoose";
import mongooseDeepPopulate from "mongoose-deep-populate";
import { Document } from "mongodb";
import { User } from "../Users";

// 1. Create an interface representing a document in MongoDB.
interface IAddress {
  name: string;
  address1: string;
  address2?: string;
  zip: string;
  city: string;
  state: string;
  country: string;
  phone: string;
  twilio?: string;
  instructions?: string;
  user: Schema.Types.ObjectId;
  billing?: boolean;
  shipping?: boolean;
}

// 2. Create a Schema corresponding to the document interface.
const AddressSchema = new Schema(
  {
    name: { type: String, required: true },
    address1: { type: String, required: true },
    address2: { type: String, required: false },
    zip: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String, required: true },
    twilio: { type: String, required: false },
    instructions: { type: String, required: false },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    billing: { type: Boolean, required: false, default: false },
    shipping: { type: Boolean, required: false, default: false },
  },
  {
    versionKey: false,
    timestamps: { createdAt: true, updatedAt: true },
  }
);

AddressSchema.plugin(mongooseDeepPopulate(mongoose), {});

AddressSchema.pre(
  "save",
  async function (
    this: Document,
    next: (err?: NativeError) => void,
    data: any
  ) {
    if (this.isModified("billing") && this.billing == true) {
      await Address.updateMany(
        {
          user: this.user,
        },
        {
          billing: false,
        }
      );
      await User.updateOne(
        {
          _id: this.user,
        },
        {
          billing_address: this._id,
        }
      );
    }

    if (this.isModified("shipping") && this.shipping == true) {
      await Address.updateMany(
        {
          user: this.user,
        },
        {
          shipping: false,
        }
      );
      await User.updateOne(
        {
          _id: this.user,
        },
        {
          shipping_address: this._id,
        }
      );
    }

    if (this.isModified("phone")) {
      let twilio = this.phone.replace(/\D/g, "");
      if (twilio.charAt(0) != "1") twilio = "1" + twilio;
      this.twilio = twilio;
    }

    return next();
  }
);

AddressSchema.post("deleteOne", async function (reponse) {
  console.log("Address Deleted: ", reponse);
});

AddressSchema.post("deleteMany", async function (reponse) {
  console.log("Addresses Deleted: ", reponse);
});

// 3. Create a Model.
export const Address = model<IAddress>("Address", AddressSchema);

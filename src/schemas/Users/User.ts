/** @format */

// External dependencies

import mongoose, { Schema, model, NativeError } from "mongoose";
import { sign } from "jsonwebtoken";
import { genSalt, hash, compare } from "bcryptjs";
import mongooseDeepPopulate from "mongoose-deep-populate";
import { Document, MongoError } from "mongodb";

import { CONFIG } from "./../../config";

// Declarations

export enum Roles {
  SUPER_ADMIN = 0,
  ADMIN = 1,
  OWNER = 2,
  SUPERVISOR = 3,
  EMPLOYEE = 4,
  TEMP = 5,
  INTERN = 6,
  USER = 7,
}

export enum Genders {
  MALE = "Male",
  FEMALE = "Female",
  NON_BINARY = "Non-Binary",
  UNDEFINED = "Undefined",
  UNSPECIFIED = "Unspecified",
}

// 1. Create an interface representing a document in MongoDB.
interface IUser {
  firstName: string;
  lastName: string;
  password: string;
  email: string;
  username: string;
  role: Roles;
  phone?: string;
  twilio?: string;
  birthday?: Date;
  gender?: Genders;
  image?: Schema.Types.ObjectId;
  billing_address?: Schema.Types.ObjectId;
  shipping_address?: Schema.Types.ObjectId;
  validPassword(password): Promise<boolean>;
  generateToken(): string;
  admin(): boolean;
}

// 2. Create a Schema corresponding to the document interface.
const UserSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    role: { type: Number, required: true, enum: Roles },
    phone: { type: String, required: false },
    twilio: { type: String, required: false },
    birthday: { type: Date, required: false },
    gender: { type: String, required: false, enum: Genders },
    image: { type: Schema.Types.ObjectId, required: false, ref: "Image" },
    billing_address: {
      type: Schema.Types.ObjectId,
      required: false,
      ref: "Address",
    },
    shipping_address: {
      type: Schema.Types.ObjectId,
      required: false,
      ref: "Address",
    },
  },
  {
    versionKey: false,
    timestamps: { createdAt: true, updatedAt: true },
  }
);

UserSchema.plugin(mongooseDeepPopulate(mongoose), {});

UserSchema.pre(
  "save",
  async function (
    this: Document,
    next: (err?: NativeError) => void,
    data: any
  ) {
    if (this.email) {
      if (this.role === Roles.USER) {
        this.username = this.email;
      }
    }

    if (this.isModified("phone")) {
      let twilio = this.phone.replace(/\D/g, "");
      if (twilio.charAt(0) != "1") twilio = "1" + twilio;
      this.twilio = twilio;
    }

    if (this.isModified("password")) {
      const salt = await genSalt(CONFIG.database.salt_work_factor);
      this.password = await hash(this.password, salt);
    }

    return next();
  }
);

UserSchema.post("deleteOne", async function (reponse) {
  console.log("User Deleted: ", reponse);
});

UserSchema.methods.generateToken = function () {
  const token = sign(
    {
      user_id: this.id,
      username: this.username,
      email: this.email,
      role: this.role,
      admin: this.admin,
    },
    CONFIG.jwt.secretOrKey,
    {
      audience: CONFIG.jwt.audience,
      issuer: CONFIG.jwt.issuer,
      expiresIn: CONFIG.jwt.expiration,
      algorithm: "HS512",
    }
  );
  return token;
};

UserSchema.methods.validPassword = async function (candidate) {
  return await compare(candidate, this.password);
};

UserSchema.methods.admin = function () {
  return this.role <= Roles.ADMIN;
};

// 3. Create a Model.
export const User = model<IUser>("User", UserSchema);

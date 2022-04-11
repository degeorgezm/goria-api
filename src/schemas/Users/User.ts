/** @format */

// External dependencies

import { Schema, model } from "mongoose";
import { sign } from "jsonwebtoken";
import { genSalt, hash, compare } from "bcryptjs";

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
}

// 2. Create a Schema corresponding to the document interface.
const userSchema = new Schema<IUser>(
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

userSchema.methods.generateToken = function () {
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

userSchema.pre("save", async function (next) {
  if (this.isModified("email")) {
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
});

userSchema.methods.validPassword = async function (candidate) {
  return await compare(candidate, this.password);
};

userSchema.methods.admin = async function () {
  return this.role <= Roles.ADMIN;
};

// 3. Create a Model.
export const User = model<IUser>("User", userSchema);

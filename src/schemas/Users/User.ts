/** @format */

// External dependencies

import { ObjectId } from "mongodb";
import { sign } from "jsonwebtoken";
import { genSaltSync, hashSync, compareSync } from "bcryptjs";

import { BaseSchema } from "../../schemas";
import { CONFIG } from "./../../config";

// Declarations

export enum Roles {
  SUPER_ADMIN = 1,
  ADMIN = 2,
  OWNER = 3,
  SUPERVISOR = 4,
  EMPLOYEE = 5,
  TEMP = 6,
  INTERN = 7,
  USER = 8,
}

export enum Genders {
  MALE = "Male",
  FEMALE = "Female",
  NON_BINARY = "Non-Binary",
  UNDEFINED = "Undefined",
  UNSPECIFIED = "Unspecified",
}

// Class Implementation

export default class User implements BaseSchema {
  static collection_name: string = "Users";

  constructor(
    public firstName: string,
    public lastName: string,
    public password: string,
    public email: string,
    public role: Roles,
    public username: string,
    public phone?: string,
    public twilio?: string,
    public birthday?: Date,
    public gender?: Genders,
    public image?: ObjectId,
    public billing_address?: ObjectId,
    public shipping_address?: ObjectId,
    public id?: ObjectId,
    public creation_date?: Date,
    public updated_date?: Date
  ) {}

  generateToken = (): string =>
    sign(
      {
        user_id: this.id,
        username: this.username,
        email: this.email,
        role: this.role,
        admin: this.role <= Roles.ADMIN,
      },
      CONFIG.jwt.secretOrKey,
      {
        audience: CONFIG.jwt.audience,
        issuer: CONFIG.jwt.issuer,
        expiresIn: CONFIG.jwt.expiration,
        algorithm: "HS512",
      }
    );
}

export const hashPassword = (password: string) => {
  const salt = genSaltSync(CONFIG.database.salt_work_factor);
  return hashSync(password, salt);
};

export const validPassword = (candidate, password): boolean => {
  return compareSync(candidate, password);
};

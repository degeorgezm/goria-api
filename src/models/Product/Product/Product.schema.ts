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
  ISale,
  IImage,
} from "./../../../models";

export enum CurrencyType {
  USD = "USD", // US Dollar
  GBP = "GBP", // Great British Pound
  EUR = "EUR", // Euro
  JPY = "JPY", // Japanese Yen
  CHF = "CHF", // Switzerland Franc
  AUD = "AUD", // Australian Dollar
  CAD = "CAD", // Canadian Dollar
  DKK = "DKK", // Denmark Krone
  EGP = "EGP", // Egypt Pound
  HKD = "HKD", // Hong Kong Dollar
  INR = "INR", // Indian Rupee
  ILS = "ILS", // Israel New Shekel
  MXN = "MXN", // Mexican Peso
  NZD = "NZD", // New Zealand Dollar
  NOK = "NOK", // Norway Kroner
  PKR = "PKR", // Pakistani Rupee
  QAR = "QAR", // Qatar Rial
  SAR = "SAR", // Saudi Arabia Riyal
  ZAR = "ZAR", // South African Rand
  KRW = "KRW", // South Korean Won
  SEK = "SEK", // Sweden Krona
  TWD = "TWD", // Taiwon Dollar
  TRY = "TRY", // Turkish New Lira
  UAH = "UAH", // Ukraine Hryvnia
  AED = "AED", // United Arab Emirates Dirham
  VND = "VND", // Vietnam Dong
}

// 1. Create an interface representing a document in MongoDB.
export interface IProduct {
  _id: Schema.Types.ObjectId;
  title: string;
  description: string;
  specifications: string;
  type: Schema.Types.ObjectId | IType;
  line: Schema.Types.ObjectId | ILine;
  brand: Schema.Types.ObjectId | IBrand;
  variants: [Schema.Types.ObjectId | IVariant];
  sizes: [Schema.Types.ObjectId | ISize];
  image: Schema.Types.ObjectId | IImage;
  images: [Schema.Types.ObjectId | IImage];
  groups: [Schema.Types.ObjectId | IGroup];
  sales: [Schema.Types.ObjectId | ISale];
  price: number;
  currency: CurrencyType;
  tags: [string];
  code: string;
  sold: number;
  returned: number;
  loss: number;
  free_shipping: boolean;
  stock: [
    {
      variant: Schema.Types.ObjectId | IVariant;
      sizes: [Schema.Types.ObjectId | ISize];
      inventory: [number];
      sold: [number];
      returned: [number];
      loss: [number];
      skus: [string];
      upcs: [string];
    }
  ];
  _user: Schema.Types.ObjectId | IUser;
  _deleted: boolean;
  sale(): boolean;
  save(): IProduct | PromiseLike<IProduct>;
}

const ProductSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    specifications: { type: String, required: false },
    type: { type: Schema.Types.ObjectId, red: "Type", required: true },
    line: { type: Schema.Types.ObjectId, red: "Line", required: true },
    brand: { type: Schema.Types.ObjectId, red: "Brand", required: true },
    variants: [{ type: Schema.Types.ObjectId, ref: "Variant", required: true }],
    sizes: [{ type: Schema.Types.ObjectId, ref: "Size", required: true }],
    image: { type: Schema.Types.ObjectId, red: "Image", required: false },
    iamges: [{ type: Schema.Types.ObjectId, ref: "Images", required: false }],
    groups: [{ type: Schema.Types.ObjectId, ref: "Group", required: false }],
    sales: [{ type: Schema.Types.ObjectId, ref: "Sale", required: false }],
    price: { type: Number, required: true },
    currency: { type: String, enum: CurrencyType, required: true },
    tags: [{ type: String, required: false }],
    code: { type: String, required: false },
    sold: { type: Number, required: false, default: 0 },
    returned: { type: Number, required: false, default: 0 },
    loss: { type: Number, required: false, default: 0 },
    free_shipping: { type: Boolean, required: false, default: false },
    stock: [
      {
        variant: {
          type: Schema.Types.ObjectId,
          ref: "Variant",
          required: true,
        },
        sizes: [{ type: Schema.Types.ObjectId, ref: "Size", required: true }],
        inventory: [{ type: Number, required: true }],
        sold: [{ type: Number, required: true }],
        returned: [{ type: Number, required: true }],
        loss: [{ type: Number, required: true }],
        skus: [{ type: String, required: true }],
        upcs: [{ type: String, required: false }],
      },
    ],
    _deleted: { type: Boolean, required: false, default: false },
    _user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    versionKey: false,
    timestamps: { createdAt: "_createdAt", updatedAt: "_updatedAt" },
  }
);

ProductSchema.plugin(mongooseDeepPopulate(mongoose), {});

// 3. Create a Model.
export const Product = model<IProduct>("Product", ProductSchema);

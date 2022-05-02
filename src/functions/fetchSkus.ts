/** @format */

import {
  IBrand,
  IGroup,
  ILine,
  ISize,
  IType,
  IVariant,
  Brand,
  Group,
  Line,
  Size,
  Type,
  Variant,
} from "./../models";
import { Schema } from "mongoose";

export interface FetchSkuArgs {
  brands?: Schema.Types.ObjectId[];
  groups?: Schema.Types.ObjectId[];
  lines?: Schema.Types.ObjectId[];
  sizes?: Schema.Types.ObjectId[];
  types?: Schema.Types.ObjectId[];
  variants?: Schema.Types.ObjectId[];
}

export interface FetchSkuReturn {
  brands?: IBrand[];
  groups?: IGroup[];
  lines?: ILine[];
  sizes?: ISize[];
  types?: IType[];
  variants?: IVariant[];
}

export const fetchSkus = async (
  args: FetchSkuArgs
): Promise<FetchSkuReturn> => {
  const returns: FetchSkuReturn = {};

  if (args.brands) returns.brands = await Brand.find({ _id: args.brands });
  if (args.groups) returns.groups = await Group.find({ _id: args.groups });
  if (args.lines) returns.lines = await Line.find({ _id: args.lines });
  if (args.sizes) returns.sizes = await Size.find({ _id: args.sizes });
  if (args.types) returns.types = await Type.find({ _id: args.types });
  if (args.variants)
    returns.variants = await Variant.find({ _id: args.variants });

  return returns;
};

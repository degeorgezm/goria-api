/** @format */

import { META_KEY_PRODUCT_COUNT } from "config";
import { IBrand, retrieveMeta } from "./../models";
import { generateRandomCode } from "./generateRandomCode";

export const generateCode = async (
  brand: IBrand,
  length: number = 10
): Promise<string> => {
  const start = brand.sku_shortcode;
  const meta = await retrieveMeta(META_KEY_PRODUCT_COUNT);
  const end = String(Math.floor(meta.value as number));
  const remainingLen = length - start.length - end.length;
  const middle = generateRandomCode(remainingLen);
  return start + middle + end;
};

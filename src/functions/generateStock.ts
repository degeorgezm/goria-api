/** @format */

import { Schema } from "mongoose";
import { FetchSkuReturn, generateSku, generateUPC } from "./../functions";
import { StockEntry, CodeType } from "./../models";

export const generateStock = (
  variants: Schema.Types.ObjectId[],
  sizes: Schema.Types.ObjectId[],
  code: CodeType,
  skus: FetchSkuReturn
): StockEntry[] => {
  const stock = [];
  for (let i = 0; i < variants.length; i++) {
    const variant = variants[i];
    const entry = {
      variant,
      sizes,
      inventory: Array(sizes.length).fill(0),
      sold: Array(sizes.length).fill(0),
      returned: Array(sizes.length).fill(0),
      loss: Array(sizes.length).fill(0),
      skus: Array(sizes.length).fill(""),
      upcs: Array(sizes.length).fill(""),
    };

    for (let j = 0; j < sizes.length; j++) {
      entry.skus[j] = generateSku(skus.variants[i], code, j, skus);
      entry.upcs[j] = generateUPC();
    }

    stock.push(entry);
  }

  return stock;
};

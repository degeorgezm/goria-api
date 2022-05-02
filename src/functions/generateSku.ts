/** @format */

import { IVariant, CodeType } from "./../models";
import { FetchSkuReturn } from "../functions";

export const generateSku = (
  variant: IVariant,
  code: CodeType,
  i: number,
  skus: FetchSkuReturn
): string => {
  const sku =
    code +
    "-" +
    variant.sku_shortcode +
    skus.sizes[i].sku_shortcode +
    "-" +
    skus.lines[0].sku_shortcode +
    skus.types[0].sku_shortcode;

  return sku;
};

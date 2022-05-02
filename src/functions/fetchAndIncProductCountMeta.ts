/** @format */

import { Meta } from "./../models";
import { META_KEY_PRODUCT_COUNT } from "./../config";

export const fetchAndIncProductCountMeta = async (
  count: number = 1
): Promise<number> => {
  const meta = await Meta.findOne({ key: META_KEY_PRODUCT_COUNT });

  if (!meta)
    throw new Error(
      "functions: fetchAndIncProductCountMeta:: Product Count Meta not found"
    );

  const current = meta.value as number;
  (meta.value as number) += count;
  await meta.save();
  return current;
};

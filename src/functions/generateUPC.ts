/** @format */

import { v4 as uuidv4 } from "uuid";

export const generateUPC = (): string => {
  return uuidv4();
};

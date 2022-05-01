/** @format */

export const defined = <T>(t: T): t is Exclude<T, undefined | null> =>
  t !== undefined && t !== null;

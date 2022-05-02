/** @format */

export const generateRandomCode = (
  length: number,
  characters: string = "0123456789"
): string => {
  let result = "";
  const charLen = characters.length;
  for (let k = 0; k < length; k++)
    result = result + characters.charAt(Math.floor(Math.random() * charLen));
  return result;
};

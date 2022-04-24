/**
 * @format
 * @abstract see documentation at https://www.npmjs.com/package/@shelf/jest-mongodb
 */

/**
 *
 * @abstract mongodb memory server
 */
module.exports = {
  mongodbMemoryServerOptions: {
    instance: {
      dbName: "jest",
    },
    binary: {
      version: "4.0.2", // Version of MongoDB
      skipMD5: true,
    },
    autoStart: false,
  },
};

/**
 *
 * @abstract Use the same database for all tests
 */
// module.exports = {
//   mongodbMemoryServerOptions: {
//     binary: {
//       version: "4.0.3",
//       skipMD5: true,
//     },
//     instance: {
//       dbName: "jest",
//     },
//     autoStart: false,
//   },
// };

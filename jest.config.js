/** @format */

const tsPreset = require("ts-jest/jest-preset");
const mongodbPreset = require("@shelf/jest-mongodb/jest-preset");

module.exports = {
  verbose: true,
  ...tsPreset,
  ...mongodbPreset,
  globalSetup: "./node_modules/@shelf/jest-mongodb/setup.js",
  globalTeardown: "./node_modules/@shelf/jest-mongodb/teardown.js",
  transformIgnorePatterns: ["/node_modules/"],
  collectCoverage: true,
  coverageReporters: ["json", "html"],
  coverageDirectory: "./coverage",
};

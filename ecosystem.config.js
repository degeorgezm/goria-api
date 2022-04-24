/** @format */

module.exports = {
  apps: [
    {
      name: "goria-api",
      script: "dist/src/index.js",
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "goria-api-dev",
      script: "dist/src/index.js",
      env: {
        NODE_ENV: "development",
      },
    },
  ],
};

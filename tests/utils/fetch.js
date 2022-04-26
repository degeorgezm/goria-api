/** @format */

const https = require("https");

/*

const data = JSON.stringify({
  todo: 'Buy the milk'
});

const options = {
  hostname: 'flaviocopes.com',
  port: 443,
  path: '/todos',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  },
};

*/

/**
 * Do a request with options provided.
 *
 * @format
 * @param {Object} options
 * @param {Object} data
 * @return {Promise} a promise of request
 */

module.exports = function fetch(options, data) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      res.setEncoding("utf8");
      let responseBody = "";

      res.on("data", (chunk) => {
        responseBody += chunk;
      });

      res.on("end", () => {
        resolve(JSON.parse(responseBody));
      });
    });

    req.on("error", (err) => {
      reject(err);
    });

    req.write(data);
    req.end();
  });
};

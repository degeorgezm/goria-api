const { ApiError, Client, Environment } = require('square');

const { isProduction, SQUARE_ACCESS_TOKEN } = require('./square.config');

console.log("Square Access Token: " + SQUARE_ACCESS_TOKEN);

const client = new Client({
    timeout: 3000,
    environment: Environment.Sandbox,
    accessToken: SQUARE_ACCESS_TOKEN,
});

const client2 = new Client({
    timeout: 3000,
    environment: Environment.Sandbox,
    accessToken: SQUARE_ACCESS_TOKEN,
});

module.exports = { ApiError, client, client2 };

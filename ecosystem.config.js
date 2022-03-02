module.exports = {
    apps: [{
            name: "market-api",
            script: "./server.js",
            env: {
                NODE_ENV: "production",
            }
        },
        {
            name: "market-dev-api",
            script: "./server.js",
            env: {
                NODE_ENV: "development",
            }
        },
    ]
}
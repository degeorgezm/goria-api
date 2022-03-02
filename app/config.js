/**
 * config.js
 *
 * AS3ICS Backend
 * by AS3ICS
 * 
 * Zachary DeGeorge
 * zach@as3ics.com
 *
 * Defines various configuration constants related to the server and database
 */

var winston = require('winston')

var config = {
    server: {
        port: process.env.PORT || 3000,
        hostname: '127.0.0.1',
        version: '1.0.0',
        loggingEnabled: true,
        uploads_path: 'uploads/',
        logs_path: 'logs/',
        max_file_size: 5 * 1024 * 1024
    },
    database: {
        url: global.MONGODB_URL,
        salt_work_factor: 10
    },
    jwt: {
        secretOrKey: 'Sr0PsubnYbtN5ZIsCeFUZuF3S8ih9Xu7jLyWMK9HgOTWDDcXkojSPkoimsszPyn',
        issuer: 'market-api.as3icsworkspace.com',
        audience: 'market-api.as3icsworkspace.com',
        algorithm: 'HS256',
        expiration: "7 days"
    }
};

module.exports = config;
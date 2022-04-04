/**
 * server.js
 *
 * api.goria.com
 * by AS3ICS
 *
 * Zach DeGeorge
 * zach@as3ics.com
 *
 * @format
 */

require("dotenv").config();

const io = require("@pm2/io");

// https://pm2.io/doc/en/plus/reference/pm2io/
io.init({
  metrics: {
    eventLoopActive: true, // (default: true) Monitor active handles and active requests
    eventLoopDelay: true, // (default: true) Get event loop's average delay

    // Network monitoring at the application level
    network: {
      traffic: true, // (default: true) Allow application level network monitoring
      ports: true, // (default: false) Shows which ports your app is listening on
    },

    // Transaction Tracing system configuration
    transaction: {
      http: true, // (default: true) HTTP routes logging
      tracing: {
        // (default: false) Enable transaction tracing
        http_latency: 1, // (default: 200) minimum latency in milliseconds to take into account
        ignore_routes: [], // (default: empty) exclude some routes
      },
    },

    deepMetrics: {
      mongo: true, // (default: true) Mongo connections monitoring
      //mysql: true,     // (default: true) MySQL connections monitoring
      //mqtt: true,      // (default: true) Mqtt connections monitoring
      //socketio: true, // (default: true) WebSocket monitoring
      //redis: true,     // (default: true) Redis monitoring
      http: true, // (default: true) Http incoming requests monitoring
      https: true, // (default: true) Https incoming requests monitoring
      "http-outbound": true, // (default: true) Http outbound requests monitoring
      "https-outbound": true, // (default: true) Https outbound requests monitoring
    },

    actions: {
      eventLoopDump: false, // (default: false) Enable event loop dump action
      profilingCpu: true, // (default: true) Enable CPU profiling actions
      profilingHeap: true, // (default: true) Enable Heap profiling actions
    },
  },
});

global.Authed_Users = io.counter({
  type: "counter",
  name: "All Time Authenticated Users",
});

global.Created_Users = io.counter({
  type: "counter",
  name: "All Time Created Users",
});

var winston = require("winston"),
  app = require("./app/app.js");

winston.info("Starting server.js");

app.listen();

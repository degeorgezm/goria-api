/**
 * index.js
 *
 * api.goria.com
 * by AS3ICS
 *
 * Zach DeGeorge
 * zach@as3ics.com
 *
 * @format
 * @abstract Entry point into api.goria.com server
 *
 */

require("./constants");

var express = require("express"),
  http = require("http"),
  cors = require("cors"),
  fs = require("fs"),
  exec = require("child_process").exec,
  bodyParser = require("body-parser"),
  validator = require("express-validator"),
  initialize = require("./initialize"),
  config = require("./config"),
  multer = require("multer");

var upload = multer();

/* 
    Configure the application
*/

var app = express();

app.config = config;
app.set("port", app.config.server.port);

/* 
    Log mongoose queries using winston
*/

mongoose.set("debug", (collectionName, method, query, doc) => {
  console.info(`${collectionName}.${method}`, JSON.stringify(query), doc);
});

/*
    Add a middleware function to track API calls
*/

app.use(function (req, res, next) {
  if (app.config.server.loggingEnabled == true) {
    console.info(Date() + "\t\t" + req.method + " " + req.url);
    if (req.method == "POST" || req.method == "PUT") {
      console.info(req.body);
    }
  }

  return next();
});

/*
    Set Up Git Information
*/

var gitPrint = require("./git");
gitPrint.print(git, exec, winston);

var revision,
  branch,
  date = undefined;
exec("git rev-parse HEAD", function (err, res) {
  if (!err) {
    revision = res.toString().trim();
  }
});
exec("git rev-parse --abbrev-ref HEAD", function (err, res) {
  if (!err) {
    branch = res.toString().trim();
  }
});
exec("git log -1 --format=%cd", function (err, res) {
  if (!err) {
    date = new Date(res.toString());
  }
});

/*
    Function to launch the server from server.js
*/

var server;
module.exports.listen = function (done) {
  server = http.createServer(app);

  app.set("server", server);

  // Parse URL-encoded bodies (as sent by HTML forms)
  app.use(express.urlencoded({ extended: true }));
  // Parse JSON bodies (as sent by API clients)
  app.use(express.json());

  app.use(validator());

  /*
    Cross-origin resource sharing (CORS) is a mechanism that allows restricted resources (e.g. fonts)
    on a web page to be requested from another domain outside the domain from which the first resource was served.
    */

  var corsOptions = {
    origin: "*",
    methods: "GET, POST, PUT, DELETE",
    allowedHeaders:
      "Authorization,DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type",
    exposedHeaders: "Authorization",
  };

  app.use(cors(corsOptions));

  /*
        Check to see API status and code version
    */

  app.get("/", function (req, res) {
    var response = {
      status: "OK",
      environment: process.env.NODE_ENV,
      version: config.server.version,
    };

    res.status(200).send(response);
  });

  /* 
        Setup the database
    */

  database.setup(mongoose, winston);

  /*
        Setup the default database values
    */

  initialize.set(fs, winston, app);

  /*
        Set Up Authentication
    */

  var authentication = require("./authentication");
  authentication.set(mongoose, config, express, app);

  /*
        Setup Routes
    */

  var routes = require("./routes");
  app.use(routes);

  server.listen(app.get("port"), function () {
    if (app.config.server.loggingEnabled == true) {
      console.info("Express server listening on port " + app.get("port"));
    } else if (done) {
      Done();
    }
  });
};

module.exports.close = function () {
  server.close();
};

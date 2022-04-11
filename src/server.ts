/**
 * express.ts
 *
 * api.goria.com
 * by AS3ICS
 *
 * Zach DeGeorge
 * zach@as3ics.com
 *
 * @format
 * @abstract Initializes the express server
 *
 */

import express from "express";

import { set_authorization_strategy, authRouter } from "./authentication";
import { userRouter, addressRouter } from "./routes";

import { PORT, LOGGING_ENABLED, VERSION } from "./config";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(function (req, res, next) {
  if (LOGGING_ENABLED) {
    console.info(Date() + "\t\t" + req.method + " " + req.url);
    if (req.method == "POST" || req.method == "PUT") {
      console.info(req.body);
    }
  }

  return next();
});

app.get("/", function (req, res) {
  var response = {
    status: "OK",
    environment: process.env.NODE_ENV,
    version: VERSION,
    timestamp: new Date().toLocaleString(),
  };

  res.status(200).send(response);
});

app.use("/user", userRouter);
app.use("/address", addressRouter);
app.use("/authenticate", authRouter);

set_authorization_strategy(app);

// app.init();

export const start = async () => {
  app.listen(PORT, () => {
    console.error(`Server is listening at http://localhost:${PORT}`);
  });
};

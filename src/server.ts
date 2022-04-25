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

import { setAuthorizationStrategy, authRouter } from "./authentication";
import { userRouter, addressRouter, imageRouter } from "./routes";

import { PORT, LOGGING_ENABLED, VERSION } from "./config";
import { Server } from "http";

export const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  if (LOGGING_ENABLED) {
    /* tslint:disable-next-line no-console error */
    console.info(Date() + "\t\t" + req.method + " " + req.url);
    if (req.method === "POST" || req.method === "PUT") {
      /* tslint:disable-next-line no-console error */
      console.info(req.body);
    }
  }

  return next();
});

app.get("/", (req, res) => {
  const response = {
    status: "OK",
    environment: process.env.NODE_ENV,
    version: VERSION,
    timestamp: new Date().toLocaleString(),
  };

  res.status(200).send(response);
});

app.use("/user", userRouter);
app.use("/address", addressRouter);
app.use("/authorization", authRouter);
app.use("/image", imageRouter);

setAuthorizationStrategy(app);

export let server: Server;

export const start = async () => {
  server = await app.listen(PORT, () => {
    /* tslint:disable-next-line no-console error */
    console.info(`Server is listening at http://localhost:${PORT}`);
  });
};

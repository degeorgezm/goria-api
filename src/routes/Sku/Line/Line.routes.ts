/** @format */

import express, { Request, Response } from "express";
import { lineController } from "../../../controllers";
import { auth, roles } from "../../../authentication";

export const router = express.Router({
  strict: true,
});

router.post("/", auth.TOKEN, roles.ADMIN, (req: Request, res: Response) => {
  lineController.create(req, res);
});

router.get("/", auth.NONE, (req: Request, res: Response) => {
  lineController.read_all(req, res);
});

router.get("/:id", auth.NONE, (req: Request, res: Response) => {
  lineController.read(req, res);
});

router.put("/:id", auth.TOKEN, roles.ADMIN, (req: Request, res: Response) => {
  lineController.update(req, res);
});

router.delete(
  "/:id",
  auth.TOKEN,
  roles.ADMIN,
  (req: Request, res: Response) => {
    lineController.delete(req, res);
  }
);

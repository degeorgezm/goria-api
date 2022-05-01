/** @format */

import express, { Request, Response } from "express";
import { variantController } from "../../../controllers";
import { auth, roles } from "../../../authentication";

export const router = express.Router({
  strict: true,
});

router.post("/", auth.TOKEN, roles.ADMIN, (req: Request, res: Response) => {
  variantController.create(req, res);
});

router.get("/", auth.NONE, (req: Request, res: Response) => {
  variantController.read_all(req, res);
});

router.get("/:id", auth.NONE, (req: Request, res: Response) => {
  variantController.read(req, res);
});

router.put("/:id", auth.TOKEN, roles.ADMIN, (req: Request, res: Response) => {
  variantController.update(req, res);
});

router.delete(
  "/:id",
  auth.TOKEN,
  roles.ADMIN,
  (req: Request, res: Response) => {
    variantController.delete(req, res);
  }
);

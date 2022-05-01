/** @format */

import express, { Request, Response } from "express";
import { brandController } from "../../../controllers";
import { auth, roles } from "../../../authentication";

export const router = express.Router({
  strict: true,
});

router.post("/", auth.TOKEN, roles.ADMIN, (req: Request, res: Response) => {
  brandController.create(req, res);
});

router.get("/", auth.NONE, (req: Request, res: Response) => {
  brandController.read_all(req, res);
});

router.get("/:id", auth.NONE, (req: Request, res: Response) => {
  brandController.read(req, res);
});

router.put("/:id", auth.TOKEN, roles.ADMIN, (req: Request, res: Response) => {
  brandController.update(req, res);
});

router.delete(
  "/:id",
  auth.TOKEN,
  roles.ADMIN,
  (req: Request, res: Response) => {
    brandController.delete(req, res);
  }
);

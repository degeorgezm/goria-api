/** @format */

import express, { Request, Response } from "express";
import { typeController } from "../../../controllers";
import { auth, roles } from "../../../authentication";

export const router = express.Router({
  strict: true,
});

router.post("/", auth.TOKEN, roles.ADMIN, (req: Request, res: Response) => {
  typeController.create(req, res);
});

router.get("/", auth.NONE, (req: Request, res: Response) => {
  typeController.read_all(req, res);
});

router.get("/:id", auth.NONE, (req: Request, res: Response) => {
  typeController.read(req, res);
});

router.put("/:id", auth.TOKEN, roles.ADMIN, (req: Request, res: Response) => {
  typeController.update(req, res);
});

router.delete(
  "/:id",
  auth.TOKEN,
  roles.ADMIN,
  (req: Request, res: Response) => {
    typeController.delete(req, res);
  }
);

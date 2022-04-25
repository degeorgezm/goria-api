/** @format */

import express, { Request, Response } from "express";
import { addressController } from "../../controllers";
import { roles, auth } from "../../authentication";

export const router = express.Router({
  strict: true,
});

router.post("/:id", auth.TOKEN, roles.USER, (req: Request, res: Response) => {
  addressController.create(req, res);
});

router.get("/", auth.TOKEN, roles.USER, (req: Request, res: Response) => {
  addressController.read_all(req, res);
});

router.get("/:id", auth.TOKEN, roles.USER, (req: Request, res: Response) => {
  addressController.read(req, res);
});

router.put("/:id", auth.TOKEN, roles.USER, (req: Request, res: Response) => {
  addressController.update(req, res);
});

router.delete("/:id", auth.TOKEN, roles.USER, (req: Request, res: Response) => {
  addressController.delete(req, res);
});

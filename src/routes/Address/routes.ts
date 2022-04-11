/** @format */

import express, { Request, Response } from "express";
import { addressController } from "../../controllers";

export const router = express.Router({
  strict: true,
});

router.post("/:user_id", (req: Request, res: Response) => {
  addressController.create(req, res);
});

router.get("/", (req: Request, res: Response) => {
  addressController.read_all(req, res);
});

router.get("/:id", (req: Request, res: Response) => {
  addressController.read(req, res);
});

router.put("/:id", (req: Request, res: Response) => {
  addressController.update(req, res);
});

router.delete("/:id", (req: Request, res: Response) => {
  addressController.delete(req, res);
});

/** @format */

import express, { Request, Response } from "express";
import { variantController } from "../../../controllers";

export const router = express.Router({
  strict: true,
});

router.post("/", (req: Request, res: Response) => {
  variantController.create(req, res);
});

router.get("/", (req: Request, res: Response) => {
  variantController.read_all(req, res);
});

router.get("/:id", (req: Request, res: Response) => {
  variantController.read(req, res);
});

router.put("/:id", (req: Request, res: Response) => {
  variantController.update(req, res);
});

router.delete("/:id", (req: Request, res: Response) => {
  variantController.delete(req, res);
});

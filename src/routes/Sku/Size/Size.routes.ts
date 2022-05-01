/** @format */

import express, { Request, Response } from "express";
import { sizeController } from "../../../controllers";

export const router = express.Router({
  strict: true,
});

router.post("/", (req: Request, res: Response) => {
  sizeController.create(req, res);
});

router.get("/", (req: Request, res: Response) => {
  sizeController.read_all(req, res);
});

router.get("/:id", (req: Request, res: Response) => {
  sizeController.read(req, res);
});

router.put("/:id", (req: Request, res: Response) => {
  sizeController.update(req, res);
});

router.delete("/:id", (req: Request, res: Response) => {
  sizeController.delete(req, res);
});

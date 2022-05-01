/** @format */

import express, { Request, Response } from "express";
import { lineController } from "../../../controllers";

export const router = express.Router({
  strict: true,
});

router.post("/", (req: Request, res: Response) => {
  lineController.create(req, res);
});

router.get("/", (req: Request, res: Response) => {
  lineController.read_all(req, res);
});

router.get("/:id", (req: Request, res: Response) => {
  lineController.read(req, res);
});

router.put("/:id", (req: Request, res: Response) => {
  lineController.update(req, res);
});

router.delete("/:id", (req: Request, res: Response) => {
  lineController.delete(req, res);
});

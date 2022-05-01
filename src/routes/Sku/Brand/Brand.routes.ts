/** @format */

import express, { Request, Response } from "express";
import { brandController } from "../../../controllers";

export const router = express.Router({
  strict: true,
});

router.post("/", (req: Request, res: Response) => {
  brandController.create(req, res);
});

router.get("/", (req: Request, res: Response) => {
  brandController.read_all(req, res);
});

router.get("/:id", (req: Request, res: Response) => {
  brandController.read(req, res);
});

router.put("/:id", (req: Request, res: Response) => {
  brandController.update(req, res);
});

router.delete("/:id", (req: Request, res: Response) => {
  brandController.delete(req, res);
});

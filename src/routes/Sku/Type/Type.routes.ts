/** @format */

import express, { Request, Response } from "express";
import { typeController } from "../../../controllers";

export const router = express.Router({
  strict: true,
});

router.post("/", (req: Request, res: Response) => {
  typeController.create(req, res);
});

router.get("/", (req: Request, res: Response) => {
  typeController.read_all(req, res);
});

router.get("/:id", (req: Request, res: Response) => {
  typeController.read(req, res);
});

router.put("/:id", (req: Request, res: Response) => {
  typeController.update(req, res);
});

router.delete("/:id", (req: Request, res: Response) => {
  typeController.delete(req, res);
});

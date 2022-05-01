/** @format */

import express, { Request, Response } from "express";
import { groupController } from "../../../controllers";

export const router = express.Router({
  strict: true,
});

router.post("/", (req: Request, res: Response) => {
  groupController.create(req, res);
});

router.get("/", (req: Request, res: Response) => {
  groupController.read_all(req, res);
});

router.get("/:id", (req: Request, res: Response) => {
  groupController.read(req, res);
});

router.put("/:id", (req: Request, res: Response) => {
  groupController.update(req, res);
});

router.delete("/:id", (req: Request, res: Response) => {
  groupController.delete(req, res);
});

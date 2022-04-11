/** @format */

import express, { Request, Response } from "express";
import { userController } from "../../controllers";

export const router = express.Router({
  strict: true,
});

router.post("/", (req: Request, res: Response) => {
  userController.create(req, res);
});

router.get("/", (req: Request, res: Response) => {
  userController.read_all(req, res);
});

router.get("/:id", (req: Request, res: Response) => {
  userController.read(req, res);
});

router.put("/:id", (req: Request, res: Response) => {
  userController.update(req, res);
});

router.delete("/:id", (req: Request, res: Response) => {
  userController.delete(req, res);
});

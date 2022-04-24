/** @format */

import express, { Request, Response } from "express";

import { imageController } from "../../controllers";

export const router = express.Router({
  strict: true,
});

router.post("/:type/:id", (req: Request, res: Response) => {
  imageController.create(req, res);
});

router.get("/", (req: Request, res: Response) => {
  imageController.read_all(req, res);
});

router.get("/:id", (req: Request, res: Response) => {
  imageController.read(req, res);
});

router.put("/:id", (req: Request, res: Response) => {
  imageController.update(req, res);
});

router.delete("/:id", (req: Request, res: Response) => {
  imageController.delete(req, res);
});

router.get("/:id/download", (req: Request, res: Response) => {
  imageController.download(req, res);
});

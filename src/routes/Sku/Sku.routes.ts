/** @format */

import express from "express";

import {
  brandRouter,
  groupRouter,
  lineRouter,
  sizeRouter,
  typeRouter,
  variantRouter,
} from "./../../routes";

export const router = express.Router({
  strict: true,
});

router.use("/brand", brandRouter);
router.use("/group", groupRouter);
router.use("/line", lineRouter);
router.use("/size", sizeRouter);
router.use("/type", typeRouter);
router.use("/variant", variantRouter);

/** @format */

import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";

import { BaseController } from "../../BaseController";
import { IVariant, Variant } from "../../../models";

export class VariantController extends BaseController {
  private static populates = "type image";

  public async create(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ) {
    const id = req.params?.id;

    const validation = [];
    if (req.body._id) validation.push("!_id");
    if (!req.body.name) validation.push("name");
    if (!req.body.sku_shortcode) validation.push("sku_shortcode");
    if (!req.body.display) validation.push("display");
    if (!req.body.type) validation.push("type");

    if (validation.length !== 0)
      return res.status(400).send({
        error: { validation: validation.toLocaleString() },
      });

    try {
      let variant = await new Variant({
        ...req.body,
      }).save();
      variant = await Variant.findById(variant._id).populate(
        VariantController.populates
      );
      return res.status(201).send(variant);
    } catch (error) {
      return res.status(400).send(error);
    }
  }
  public async read(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ) {
    const id = req.params?.id;

    try {
      const variant = await Variant.findById(id).populate(
        VariantController.populates
      );
      return variant
        ? res.status(200).send(variant)
        : res.status(404).send({ error: "not found" });
    } catch (error) {
      return res.status(400).send(error);
    }
  }
  public async read_all(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ) {
    const query: Partial<IVariant> = {};

    for (const index in req.query)
      query[index] =
        typeof req.query === "object" // is Array
          ? {
              $in: req.query[index],
            }
          : req.query[index];

    try {
      const variants = await Variant.find(query).populate(
        VariantController.populates
      );
      return res.status(200).send(variants);
    } catch (error) {
      return res.status(400).send(error);
    }
  }
  public async update(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ) {
    const id = req.params?.id;
    const validation = [];
    if (req.body._id) validation.push("!_id");

    if (validation.length !== 0)
      return res.status(400).send({
        error: { validation: validation.toLocaleString() },
      });

    try {
      let variant = await Variant.findById(id);
      if (!variant) return res.status(404).send({ error: "not found" });
      for (const index in req.body) variant[index] = req.body[index];
      variant = await variant.save();
      variant = await Variant.findById(id).populate(
        VariantController.populates
      );
      return res.status(200).send(variant);
    } catch (error) {
      return res.status(400).send(error);
    }
  }
  public async delete(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ) {
    const id = req.params?.id;

    try {
      const response = await Variant.deleteOne({
        _id: id,
      });
      return res.status(200).send(response);
    } catch (error) {
      return res.status(400).send({ error });
    }
  }
}

export const variantController = new VariantController();

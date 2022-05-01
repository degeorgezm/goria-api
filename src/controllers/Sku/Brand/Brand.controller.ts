/** @format */

import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";

import { BaseController } from "../../BaseController";
import { Brand } from "../../../models";

export class BrandController extends BaseController {
  private static populates = "";

  public async create(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ) {
    const validation = [];
    if (req.body._id) validation.push("!_id");
    if (!req.body.name) validation.push("name");
    if (!req.body.sku_shortcode) validation.push("sku_shortcode");
    if (!req.body.display) validation.push("display");

    if (validation.length !== 0)
      return res.status(400).send({
        error: { validation: validation.toLocaleString() },
      });

    try {
      let brand = await new Brand({
        ...req.body,
      }).save();
      brand = await Brand.findById(brand._id).populate(
        BrandController.populates
      );
      return res.status(201).send(brand);
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
      const brand = await Brand.findById(id).populate(
        BrandController.populates
      );

      return brand
        ? res.status(200).send(brand)
        : res.status(404).send({ error: "not found" });
    } catch (error) {
      return res.status(400).send(error);
    }
  }
  public async read_all(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ) {
    try {
      const brands = await Brand.find({}).populate(BrandController.populates);
      return res.status(200).send(brands);
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
      let brand = await Brand.findById(id);

      if (!brand) return res.status(404).send({ error: "not found" });

      for (const index in req.body) brand[index] = req.body[index];
      brand = await brand.save();
      brand = await Brand.findById(brand._id).populate(
        BrandController.populates
      );
      return res.status(200).send(brand);
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
      const response = await Brand.deleteOne({
        _id: id,
      });
      return res.status(200).send(response);
    } catch (error) {
      return res.status(400).send({ error });
    }
  }
}

export const brandController = new BrandController();

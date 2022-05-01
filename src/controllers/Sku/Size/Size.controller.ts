/** @format */

import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";

import { BaseController } from "../../BaseController";
import { Size } from "../../../models";

export class SizeController extends BaseController {
  private static populates = "type";

  public async create(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ) {
    const id = req.params?.id;

    const validation = [];
    if (!req.body.name) validation.push("name");
    if (!req.body.sku_shortcode) validation.push("sku_shortcode");
    if (!req.body.display) validation.push("display");
    if (!req.body.type) validation.push("type");

    if (validation.length !== 0)
      return res.status(400).send({
        error: { validation: validation.toLocaleString() },
      });

    try {
      const user: any = req.user;
      if (!user.admin() && String(user._id) !== id)
        return res.status(400).send({ error: "not authorized" });

      let size = await new Size({
        ...req.body,
      }).save();
      size = await Size.findById(size._id).populate(SizeController.populates);
      return res.status(201).send(size);
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
      const size = await Size.findById(id).populate(SizeController.populates);
      return size
        ? res.status(200).send(size)
        : res.status(404).send({ error: "not found" });
    } catch (error) {
      return res.status(400).send(error);
    }
  }
  public async read_all(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ) {
    const type = req.query?.type;

    const query = {};
    if (type) query["type"] = type;

    try {
      const sizes = await Size.find(query).populate(SizeController.populates);
      return res.status(200).send(sizes);
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

    if (validation.length !== 0)
      return res.status(400).send({
        error: { validation: validation.toLocaleString() },
      });

    try {
      let size = await Size.findById(id);

      if (!size) return res.status(404).send({ error: "not found" });

      for (const index in req.body) size[index] = req.body[index];
      size = await size.save();
      size = await Size.findById(id).populate(SizeController.populates);
      return res.status(200).send(size);
    } catch (error) {
      return res.status(400).send(error);
    }
  }
  public async delete(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ) {
    const id = req.params?.id;

    const validation = [];

    if (validation.length !== 0)
      return res
        .status(400)
        .send({ error: { validation: validation.toLocaleString() } });

    try {
      let user: any = req.user;
      if (!user.admin())
        if (!user) return res.status(400).send({ error: "not authorized" });

      const response = await Size.deleteOne({
        _id: id,
      });
      return res.status(200).send(response);
    } catch (error) {
      return res.status(400).send({ error });
    }
  }
}

export const sizeController = new SizeController();

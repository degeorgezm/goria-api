/** @format */

import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";

import { BaseController } from "../../BaseController";
import { Type } from "../../../models";

export class TypeController extends BaseController {
  private static populates = "";

  public async create(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ) {
    const id = req.params?.id;

    const validation = [];
    if (!req.body.name) validation.push("name");
    if (!req.body.sku_shortcode) validation.push("sku_shortcode");
    if (!req.body.display) validation.push("display");

    if (validation.length !== 0)
      return res.status(400).send({
        error: { validation: validation.toLocaleString() },
      });

    try {
      const user: any = req.user;
      if (!user.admin() && String(user._id) !== id)
        return res.status(400).send({ error: "not authorized" });

      let type = await new Type({
        ...req.body,
      }).save();
      type = await Type.findById(type._id).populate(TypeController.populates);
      return res.status(201).send(type);
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
      const type = await Type.findById(id).populate(TypeController.populates);
      return type
        ? res.status(200).send(type)
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
      const types = await Type.find({}).populate(TypeController.populates);
      return res.status(200).send(types);
    } catch (error) {
      return res.status(400).send(error);
    }
  }
  public async update(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ) {
    const id = req.params?.id;

    try {
      let type = await Type.findById(id);

      if (!type) return res.status(404).send({ error: "not found" });

      for (const index in req.body) type[index] = req.body[index];
      type = await type.save();
      type = await Type.findById(id).populate(TypeController.populates);
      return res.status(200).send(type);
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
      let user: any = req.user;
      if (!user.admin())
        if (!user) return res.status(400).send({ error: "not authorized" });

      const response = await Type.deleteOne({
        _id: id,
      });
      return res.status(200).send(response);
    } catch (error) {
      return res.status(400).send({ error });
    }
  }
}

export const typeController = new TypeController();

/** @format */

import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";

import { BaseController } from "../../BaseController";
import { Line } from "../../../models";

export class LineController extends BaseController {
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

      let line = await new Line({
        ...req.body,
      }).save();
      line = await Line.findById(line._id).populate(LineController.populates);
      return res.status(201).send(line);
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
      const line = await Line.findById(id).populate(LineController.populates);

      return line
        ? res.status(200).send(line)
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
      const lines = await Line.find({}).populate(LineController.populates);
      return res.status(200).send(lines);
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
      let line = await Line.findById(id);

      if (!line) return res.status(404).send({ error: "not found" });

      for (const index in req.body) line[index] = req.body[index];
      line = await line.save();
      line = await Line.findById(line._id).populate(LineController.populates);
      return res.status(200).send(line);
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

      const response = await Line.deleteOne({
        _id: id,
      });
      return res.status(200).send(response);
    } catch (error) {
      return res.status(400).send({ error });
    }
  }
}

export const lineController = new LineController();

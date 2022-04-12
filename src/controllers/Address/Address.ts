/** @format */

import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";

import { BaseController } from "../../controllers/BaseController";
import { Address } from "./../../schemas";

export class AddressController extends BaseController {
  public async create(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ) {
    const user_id = req.params?.user_id;

    let validation = [];
    if (!user_id) validation.push("param:user_id");
    if (!req.body.name) validation.push("name");
    if (!req.body.address1) validation.push(" address1");
    if (!req.body.zip) validation.push(" zip");
    if (!req.body.city) validation.push("city");
    if (!req.body.state) validation.push("state");
    if (!req.body.country) validation.push("country");
    if (!req.body.phone) validation.push("phone");
    if (req.body.user) validation.push("!user");
    if (req.body.twilio) validation.push("!twilio");

    if (validation.length != 0)
      return res.status(400).send({
        validation_error: validation.toLocaleString(),
      });

    try {
      const address = await Address.create({
        ...req.body,
        user: user_id,
      });
      return res.status(201).send(address);
    } catch (error) {
      console.error(error);
      return res.status(400).send(error);
    }
  }
  public async read(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ) {
    const id = req.params?.id;

    const validation = [];
    if (!id) validation.push("param:id");

    if (validation.length != 0)
      return res
        .status(400)
        .send({ validation_error: validation.toLocaleString() });

    try {
      const address = await Address.findOne({
        _id: id,
      });
      return address ? res.status(200).send(address) : res.status(404).send({});
    } catch (error) {
      console.error(error);
      return res.status(400).send(error);
    }
  }
  public async read_all(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ) {
    try {
      const addresses = await Address.find({});
      return res.status(200).send(addresses);
    } catch (error) {
      console.error(error);
      return res.status(400).send(error);
    }
  }
  public async update(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ) {
    const id = req.params?.id;

    let validation = [];
    if (!id) validation.push("param:id");
    if (req.body.user) validation.push("!user");
    if (req.body.twilio) validation.push("!twilio");

    if (validation.length != 0)
      return res.status(400).send({
        validation_error: validation.toLocaleString(),
      });

    try {
      const response = await Address.updateOne(
        {
          _id: id,
        },
        req.body
      );
      return res.status(200).send(response);
    } catch (error) {
      console.error(error);
      return res.status(400).send(error);
    }
  }
  public async delete(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ) {
    const id = req.params?.id;

    let validation = [];

    if (!id) validation.push("param:id");

    if (validation.length != 0)
      return res
        .status(400)
        .send({ validation_error: validation.toLocaleString() });

    try {
      const response = await Address.deleteOne({
        _id: id,
      });
      return res.status(200).send(response);
    } catch (error) {
      console.error(error);
      return res.status(400).send(error);
    }
  }
}

export const addressController = new AddressController();

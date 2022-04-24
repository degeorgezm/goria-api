/** @format */

import { forEach } from "async";
import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";

import { BaseController } from "../../controllers/BaseController";
import { Address, User } from "./../../schemas";

export class AddressController extends BaseController {
  public async create(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ) {
    const user_id = req.params?.user_id;

    const validation = [];
    if (!user_id) validation.push("param:user_id");
    if (!req.body.name) validation.push("name");
    if (!req.body.address1) validation.push("address1");
    if (!req.body.zip) validation.push("zip");
    if (!req.body.city) validation.push("city");
    if (!req.body.state) validation.push("state");
    if (!req.body.country) validation.push("country");
    if (!req.body.phone) validation.push("phone");
    if (req.body.user) validation.push("!user");
    if (req.body.twilio) validation.push("!twilio");

    if (validation.length !== 0)
      return res.status(400).send({
        error: { validation: validation.toLocaleString() },
      });

    try {
      const address = await new Address({
        ...req.body,
        user: user_id,
      }).save();
      return res.status(201).send(address);
    } catch (error) {
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

    if (validation.length !== 0)
      return res
        .status(400)
        .send({ error: { validation: validation.toLocaleString() } });

    try {
      const address = await Address.findOne({
        _id: id,
      });
      return address ? res.status(200).send(address) : res.status(404).send({});
    } catch (error) {
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
      return res.status(400).send(error);
    }
  }
  public async update(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ) {
    const id = req.params?.id;

    const validation = [];
    if (!id) validation.push("param:id");
    if (req.body.user) validation.push("!user");
    if (req.body.twilio) validation.push("!twilio");
    if (req.body._id) validation.push("!_id");

    if (validation.length !== 0)
      return res.status(400).send({
        error: { validation: validation.toLocaleString() },
      });

    try {
      let address = await Address.findById(id);
      for (const record in req.body) address[record] = req.body[record];
      address = await address.save();
      return res.status(200).send(address);
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

    if (!id) validation.push("param:id");

    if (validation.length !== 0)
      return res
        .status(400)
        .send({ error: { validation: validation.toLocaleString() } });

    try {
      const address = await Address.findById(id);

      if (!address) {
        return res.status(404).send({ error: "Address not found." });
      }

      const user = await User.findById(address.user);

      let userUpdated = false;
      if (String(user.billing_address) === id) {
        user.billing_address = null;
        userUpdated = true;
      }
      if (String(user.shipping_address) === id) {
        user.shipping_address = null;
        userUpdated = true;
      }

      if (userUpdated) {
        await user.save();
      }

      const response = await Address.deleteOne({
        _id: id,
      });
      return res.status(200).send(response);
    } catch (error) {
      return res.status(400).send(error);
    }
  }
}

export const addressController = new AddressController();

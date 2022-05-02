/** @format */

import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";

import { BaseController } from "../BaseController";
import {
  Address,
  IAddress,
  IUser,
  Roles,
  User,
  ADMIN_ROLES,
} from "../../models";
import { Schema } from "mongoose";

export class AddressController extends BaseController {
  private static populates = "user";
  private static projection = { user: { password: 0 } };

  public async create(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ) {
    const userId = req.params?.id;

    const validation = [];
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
      let address = await new Address({
        ...req.body,
        user: userId,
      }).save();
      address = await Address.findById(address._id).populate(
        AddressController.populates
      );
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

    try {
      const address = await Address.findById(id).populate(
        AddressController.populates
      );

      return address
        ? res.status(200).send(address)
        : res.status(404).send({ error: "not found" });
    } catch (error) {
      return res.status(400).send(error);
    }
  }
  public async read_all(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ) {
    const query: Partial<IAddress> = {};

    for (const index in req.query)
      query[index] =
        typeof req.query === "object" // is Array
          ? {
              $in: req.query[index],
            }
          : req.query[index];

    try {
      const addresses = await Address.find(query).populate(
        AddressController.populates
      );
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
    if (req.body.user) validation.push("!user");
    if (req.body.twilio) validation.push("!twilio");
    if (req.body._id) validation.push("!_id");

    if (validation.length !== 0)
      return res.status(400).send({
        error: { validation: validation.toLocaleString() },
      });

    try {
      let address = await Address.findById(id);

      if (!address) return res.status(404).send({ error: "address not found" });

      for (const record in req.body) address[record] = req.body[record];
      address = await address.save();
      address = await Address.findById(address._id).populate(
        AddressController.populates
      );
      return res.status(200).send(address);
    } catch (error) {
      return res.status(400).send(error);
    }
  }
  public async delete(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ) {
    const _id = req.params?.id;

    const query = { _id };

    try {
      const address = await Address.findOne(query);

      if (!address) return res.status(404).send({ error: "not found" });

      const user = await User.findById(address.user);

      let userUpdated = false;
      if (String(user.billing_address) === _id) {
        user.billing_address = null;
        userUpdated = true;
      }
      if (String(user.shipping_address) === _id) {
        user.shipping_address = null;
        userUpdated = true;
      }

      if (userUpdated) await user.save();

      const response = await Address.deleteOne(query);
      return res.status(200).send(response);
    } catch (error) {
      return res.status(400).send({ error });
    }
  }
}

export const addressController = new AddressController();

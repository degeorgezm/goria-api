/** @format */

import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";

import { BaseController } from "../../controllers/BaseController";
import { Roles } from "./../../schemas/Users/User";
import { Address, User } from "./../../schemas";

export class UserController extends BaseController {
  public async create(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ) {
    let validation = [];
    if (!req.body.firstName) validation.push("firstName");
    if (!req.body.lastName) validation.push("lastName");
    if (!req.body.password) validation.push("password");
    if (!req.body.email) validation.push("email");
    if (req.body.username) validation.push("!username");
    if (req.body.role) validation.push("!role");
    if (req.body.twilio) validation.push("!twilio");

    if (validation.length != 0)
      return res.status(400).send({ error: validation.toLocaleString() });

    try {
      const user = await User.create({
        ...req.body,
        role: Roles.USER,
        username: req.body.email,
      });
      return res.status(201).send(user);
    } catch (error) {
      console.error(error);
      return res.status(400).send(error);
    }
  }
  public async read(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ) {
    const id = req?.params?.id;

    if (!id) return res.status(400).send({ error: "id not found." });

    try {
      const user = await User.findOne({
        _id: id,
      }).populate("billing_address shipping_address");
      if (user) user.password = "********";
      return user ? res.status(200).send(user) : res.status(404).send({});
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
      const users = await User.find({}).populate(
        "billing_address shipping_address"
      );
      users.map((user) => (user.password = "********"));
      return res.status(200).send(users);
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
    if (req.body._id) validation.push("!_id");
    if (req.body.username) validation.push("!username");
    if (req.body.role) validation.push("!role");
    if (req.body.twilio) validation.push("!twilio");

    if (validation.length != 0)
      return res.status(400).send({ error: validation.toLocaleString() });

    try {
      let user = await User.findById(id);

      for (const record in req.body) {
        user[record] = req.body[record];
      }

      user = await user.save();
      return res.status(200).send(user);
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
      return res.status(400).send({ error: validation.toLocaleString() });

    try {
      await Address.deleteMany({
        user: id,
      });
      const response = await User.deleteOne({
        _id: id,
      });
      return res.status(200).send(response);
    } catch (error) {
      console.error(error);
      return res.status(400).send(error);
    }
  }
}

export const userController = new UserController();

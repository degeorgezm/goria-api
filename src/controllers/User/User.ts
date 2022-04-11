/** @format */

import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";

import { BaseController } from "../../controllers";
import { Roles } from "./../../schemas/Users/User";
import { User } from "./../../schemas";

export class UserController extends BaseController {
  public async create(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ) {
    let validation = "";
    if (!req.body.firstName) validation += "firstName ";
    if (!req.body.lastName) validation += " lastName ";
    if (!req.body.password) validation += " password ";
    if (!req.body.email) validation += "email ";
    if (req.body.username) validation + "!username ";
    if (req.body.role) validation += "!role ";

    if (validation)
      return res
        .status(400)
        .send({ validation_error: "Validatation errors: " + validation });

    try {
      const user = await User.create({
        ...req.body,
        role: Roles.USER,
        username: req.body.email,
      });
      return res.status(202).send(user);
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

    if (!id) return res.status(400).send({ validation_error: "id not found." });

    try {
      const user = await User.findOne({
        _id: id,
      });
      return res.status(200).send(user);
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
      const users = await User.find({});
      return res.status(200).send(users);
    } catch (error) {
      console.error(error);
      return res.status(400).send(error);
    }
  }
  public update(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ): void {
    throw new Error("Method not implemented.");
  }
  public delete(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ): void {
    throw new Error("Method not implemented.");
  }
}

export const userController = new UserController();

/** @format */

import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import { User } from "./../../schemas";
import { collections } from "./../../services";
import { BaseController } from "../../controllers";
import { Roles, hashPassword } from "./../../schemas/Users/User";
import { ObjectId } from "mongodb";

export class UserController extends BaseController {
  public async create(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ) {
    try {
      const user = {
        ...req.body,
        role: Roles.USER,
        username: req.body["email"] || "",
      } as User;
      user.password = hashPassword(user.password);

      const result = await collections.users.insertOne(user);

      result
        ? res.status(201).send({ id: result.insertedId })
        : res.status(500).send({ error: "Failed to insert new user." });
    } catch (error) {
      console.error(error);
      res.status(400).send(error);
    }
  }
  public async read(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ) {
    const id = req?.params?.id;

    if (id) {
      try {
        const query = { _id: new ObjectId(id) };
        const user = (await collections.users.findOne(
          query
        )) as unknown as User;
        user
          ? res.status(200).send(user)
          : res.status(404).send({ error: "User not found." });
      } catch (error) {
        console.error(error);
        res.status(400).send(error);
      }
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

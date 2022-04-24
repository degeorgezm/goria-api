/** @format */

import { connect, disconnect } from "mongoose";
import request from "supertest";
import { createServer, Server } from "http";

import { app } from "../../src/server";
import { User, Address } from "../../src/schemas";
import { Roles } from "../../src/schemas/Users/User";

const user1_body = {
  firstName: "Munchkin",
  lastName: "Confidential",
  password: "password",
  email: "munchkinconfidential@mas3ics.com",
  phone: "1111111111",
};

const user2_body = {
  firstName: "AS3ICS",
  lastName: "Inc.",
  password: "password",
  email: "as3ics@as3ics.com",
  phone: "2222222222",
};

describe("User Tests", () => {
  beforeAll(async () => {
    await connect(global.__MONGO_URI__, { autoIndex: true });
  });

  afterAll(async () => {
    await disconnect();
  });

  test("1. user create route performs correctly", async () => {
    let res = await request(app).post("/user").send(user1_body);

    const password = user1_body.password;
    delete user1_body.password;
    expect(res.statusCode).toEqual(201);

    expect(res.body).toEqual({
      createdAt: res.body.createdAt,
      updatedAt: res.body.updatedAt,
      role: Number(Roles.USER),
      _id: res.body._id,
      password: res.body.password,
      username: user1_body.email,
      twilio: "1" + user1_body.phone,
      ...user1_body,
    });

    user1_body["password"] = password;

    res = await request(app).post("/user").send({
      twilio: "foo",
      username: "foo",
      role: "foo",
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({
      validation_error:
        "firstName,lastName,password,email,!username,!role,!twilio",
    });
  });
});

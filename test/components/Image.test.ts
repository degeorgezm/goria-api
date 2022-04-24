/** @format */

import { connect, disconnect } from "mongoose";
import request from "supertest";
import { app } from "../../src/server";
import { Image, User } from "../../src/schemas";
import { readFile, createReadStream, readFileSync } from "node:fs";

const user_body = {
  firstName: "Munchkin",
  lastName: "Confidential",
  password: "password",
  email: "munchkin@as3ics.com",
  username: "munchkin@as3ics.com",
  phone: "1111111111",
  role: 7,
};

describe("User Tests", () => {
  jest.setTimeout(20000);

  beforeAll(async () => {
    await connect(global.__MONGO_URI__, { autoIndex: true });
  });

  afterAll(async () => {
    await disconnect();
  });

  test("1. image create type='USER' route performs correctly", async () => {
    let user = new User(user_body);
    user = await user.save();

    expect(user._id).toBeDefined();

    let res = await request(app)
      .post("/image/user/" + user._id)
      .attach("image", readFileSync(__dirname + "/../utils/test.jpg"), {
        contentType: "image/jpg",
        filename: "test.jpg",
      });

    expect(res.body._id).toBeDefined();

    user = await User.findOne({ _id: user._id });

    expect(String(user.image)).toEqual(res.body._id);
  });

  test("2. image create type='PRODUCT' route performs correctly", async () => {});
  test("2. image read route performs correctly", async () => {});

  test("3. image read all route performs correctly", async () => {});

  test("4. image update route performs correctly", async () => {});

  test("5. image delete route performs correctly", async () => {});
});

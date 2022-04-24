/** @format */
import { connect } from "mongoose";
import request from "supertest";

import { app } from "../../src/server";
import { User } from "../../src/schemas";
import { Roles } from "../../src/schemas/Users/User";

describe("Address Unit Tests", () => {
  (async () => {
    await app.listen(80);
    await connect(global.__MONGO_URI__, { autoIndex: true });
    console.log("server started");
  })();

  beforeAll(async () => {});

  afterAll(async () => {});

  test("creates a new address", async () => {
    let user = new User({
      firstName: "Munchkin",
      lastName: "Confidential",
      password: "password",
      email: "munchkinconfidential@munchkin.com",
      role: Roles.USER,
      username: "munchkinconfidential@munchkin.com",
    });

    user = await user.save();

    expect(user._id).toBeDefined();

    const userId = String(user._id);

    const address_body = {
      name: "Test Address",
      address1: "111 Foo St",
      zip: "11111",
      city: "Foo Arbor",
      state: "CA",
      country: "US",
      phone: "8005551212",
    };

    const res = await request(app)
      .post("/address/" + userId)
      .send(address_body);

    console.log(res.error);
    expect(res.statusCode).toEqual(201);
  });
});

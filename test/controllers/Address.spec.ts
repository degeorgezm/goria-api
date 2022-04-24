/** @format */
import { connect } from "mongoose";
import request from "supertest";

import { app } from "../../src/server";
import { User } from "../../src/schemas";
import { Address } from "../../src/schemas";
import { Roles } from "../../src/schemas/Users/User";

const user_body = {
  firstName: "Munchkin",
  lastName: "Confidential",
  password: "password",
  email: "munchkinconfidential@munchkin.com",
  role: Roles.USER,
  username: "munchkinconfidential@munchkin.com",
};

const address_body = {
  name: "Test Address",
  address1: "111 Foo St",
  zip: "11111",
  city: "Foo Arbor",
  state: "CA",
  country: "US",
  phone: "8005551212",
};

const user_username = user_body.username;

describe("Address Tests", () => {
  (async () => {
    await app.listen(80);
    await connect(global.__MONGO_URI__, { autoIndex: true });
    console.log("server started");
  })();

  beforeAll(async () => {});

  afterAll(async () => {});

  test("address create route performs correctly", async () => {
    // Create new user for use throughout test
    let user = new User(user_body);

    user = await user.save();

    expect(user._id).toBeDefined();

    const user_id = String(user._id);

    const res = await request(app)
      .post("/address/" + user_id)
      .send(address_body);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toEqual({
      _id: res.body._id,
      twilio: "1" + address_body.phone,
      billing: false,
      shipping: false,
      createdAt: res.body.createdAt,
      updatedAt: res.body.updatedAt,
      user: user_id,
      ...address_body,
    });
  });

  test("address correctly updates billing & shipping settings", async () => {
    const users = await User.find().where("username", user_username);

    expect(users.length).toEqual(1);
    const user = users[0];
    expect(user._id).toBeDefined();

    const user_id = String(user._id);

    // Insert another address
    let res = await request(app)
      .post("/address/" + user_id)
      .send(address_body);

    expect(res.statusCode).toEqual(201);
    expect(res.body.billing).toEqual(false);
    expect(res.body.shipping).toEqual(false);

    // Insert another address
    res = await request(app).get("/address");

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toEqual(2);

    let address1 = res.body[0];
    let address2 = res.body[1];

    expect(address1._id).toBeDefined();
    expect({ shipping: address1.shipping, billing: address1.billing }).toEqual({
      shipping: false,
      billing: false,
    });

    expect(address2._id).toBeDefined();
    expect({ shipping: address2.shipping, billing: address2.billing }).toEqual({
      shipping: false,
      billing: false,
    });

    res = await request(app)
      .put("/address/" + address1._id)
      .send({
        shipping: true,
      });

    expect(res.statusCode).toEqual(200);

    address1 = await Address.findById(address1._id);
    expect(address1.shipping).toEqual(true);

    res = await request(app)
      .put("/address/" + address1._id)
      .send({
        billing: true,
      });

    expect(res.statusCode).toEqual(200);

    address1 = await Address.findById(address1._id);
    expect(address1.shipping).toEqual(true);
    expect(address1.billing).toEqual(true);

    res = await request(app)
      .put("/address/" + address2._id)
      .send({
        billing: true,
        shipping: true,
      });

    expect(res.statusCode).toEqual(200);

    address1 = await Address.findById(address1._id);
    address2 = await Address.findById(address2._id);

    expect(address1.billing).toEqual(false);
    expect(address2.billing).toEqual(true);
    expect(address1.shipping).toEqual(false);
    expect(address2.shipping).toEqual(true);
  });
});

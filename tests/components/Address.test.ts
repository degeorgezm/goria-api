/** @format */
import { connect, disconnect } from "mongoose";
import request from "supertest";

import { User, Address, IUser, Roles } from "../../src/models";
import { app } from "../../src/server";
import { JWT_AUTH_HEADER } from "../../src/config";

const user_body = {
  firstName: "Munchkin",
  lastName: "Confidential",
  password: "password",
  email: "munchkinconfidential@munchkin.com",
  role: Roles.USER,
  username: "munchkinconfidential@munchkin.com",
};

const admin_body = {
  firstName: "user",
  lastName: "admin",
  password: "password",
  email: "admin@as3ics.com",
  role: Roles.ADMIN,
  username: "admin",
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

describe("Address Tests", () => {
  let user: IUser;
  let jwt: string;

  const setup = async () => {
    await User.deleteMany({});

    user = new User(user_body);
    user = await user.save();

    let res = await request(app).post("/authorization").send({
      username: user_body.username,
      password: user_body.password,
    });

    jwt = res.header[JWT_AUTH_HEADER];
  };

  beforeAll(async () => {
    await connect(global.__MONGO_URI__, { autoIndex: true });
  });

  afterAll(async () => {
    await disconnect();
  });

  test("0. setup", async () => {
    await setup();

    expect(user).toBeDefined();
    expect(jwt).toBeDefined();
  });

  test("1. address create route performs correctly", async () => {
    expect(user).toBeDefined();
    expect(jwt).toBeDefined();

    let res = await request(app)
      .post("/address/" + user._id)
      .send(address_body);

    expect(res.statusCode).toEqual(404);
    expect(res.body).toEqual({
      error: "user not found",
    });

    res = await request(app)
      .post("/address/" + String(user._id))
      .set(JWT_AUTH_HEADER, jwt)
      .send(address_body);

    expect(res.body).toEqual({
      _id: res.body._id,
      twilio: "1" + address_body.phone,
      billing: false,
      shipping: false,
      createdAt: res.body.createdAt,
      updatedAt: res.body.updatedAt,
      user: String(user._id),
      ...address_body,
    });
    expect(res.statusCode).toEqual(201);

    res = await request(app)
      .post("/address/" + String(user._id))
      .set(JWT_AUTH_HEADER, jwt)
      .send({
        user: "foo",
        twilio: "foo",
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({
      error: {
        validation: "name,address1,zip,city,state,country,phone,!user,!twilio",
      },
    });
  });

  test("2. address read route performs correctly", async () => {
    const addresses = await Address.find();

    expect(addresses.length).toBe(1);

    let address = addresses[0];

    let res = await request(app)
      .get("/address/" + String(address._id))
      .set(JWT_AUTH_HEADER, jwt);

    expect(res.body).toBeInstanceOf(Object);
    expect(res.statusCode).toEqual(200);
  });

  test("3. address read all route performs correctly", async () => {
    let res = await request(app).get("/address").set(JWT_AUTH_HEADER, jwt);

    expect(res.body).toBeInstanceOf(Array);
    expect(res.statusCode).toEqual(200);
  });

  test("4. address update route performs correctly", async () => {
    const addresses = await Address.find();

    expect(addresses.length).toEqual(1);

    let address = addresses[0];

    // Insert another address
    let res = await request(app)
      .put("/address/" + address._id)
      .set(JWT_AUTH_HEADER, jwt)
      .send({
        phone: "1112223333",
      });

    expect(res.statusCode).toEqual(200);
    expect({
      phone: res.body.phone,
      twilio: res.body.twilio,
    }).toEqual({
      phone: "1112223333",
      twilio: "11112223333",
    });

    res = await request(app)
      .put("/address/" + address._id)
      .set(JWT_AUTH_HEADER, jwt)
      .send({
        _id: "foo",
        user: "foo",
        twilio: "foo",
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({ error: { validation: "!user,!twilio,!_id" } });
  });

  test("5. address billing & shipping triggers perform correctly", async () => {
    const users = await User.find().where("username", user_body.username);

    expect(users.length).toBeGreaterThanOrEqual(1);
    let user = users[0];
    expect(user._id).toBeDefined();

    const user_id = String(user._id);

    // Insert another address
    let res = await request(app)
      .post("/address/" + user_id)
      .set(JWT_AUTH_HEADER, jwt)
      .send(address_body);

    expect(res.statusCode).toEqual(201);
    expect(res.body.billing).toEqual(false);
    expect(res.body.shipping).toEqual(false);

    // Insert another address
    const addresses = await Address.find();

    let address1 = addresses[0];
    let address2 = addresses[1];

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
      .set(JWT_AUTH_HEADER, jwt)
      .send({
        shipping: true,
      });

    expect(res.statusCode).toEqual(200);

    address1 = await Address.findById(address1._id);
    expect(address1.shipping).toEqual(true);

    res = await request(app)
      .put("/address/" + address1._id)
      .set(JWT_AUTH_HEADER, jwt)
      .send({
        billing: true,
      });

    expect(res.statusCode).toEqual(200);

    address1 = await Address.findById(address1._id);
    expect(address1.shipping).toEqual(true);
    expect(address1.billing).toEqual(true);

    user = await User.findById(user_id);

    expect(user.billing_address).toEqual(address1._id);
    expect(user.shipping_address).toEqual(address1._id);

    res = await request(app)
      .put("/address/" + address2._id)
      .set(JWT_AUTH_HEADER, jwt)
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

  test("6. address delete route performs correctly", async () => {
    let addresses = await Address.find();

    expect(addresses.length).toEqual(2);

    const previous_id = String(addresses[1]._id);
    let res = await request(app).delete("/address/" + previous_id);

    expect(res.statusCode).toEqual(404);

    res = await request(app)
      .delete("/address/" + previous_id)
      .set(JWT_AUTH_HEADER, jwt);

    expect(res.statusCode).toEqual(200);

    addresses = await Address.find();

    expect(addresses.length).toEqual(1);

    expect(addresses[0]._id).not.toEqual(previous_id);

    res = await request(app)
      .delete("/address/" + previous_id)
      .set(JWT_AUTH_HEADER, jwt);

    expect(res.statusCode).toEqual(404);

    res = await request(app)
      .delete("/address/" + String(addresses[0]._id))
      .set(JWT_AUTH_HEADER, jwt);

    expect(res.statusCode).toEqual(200);

    addresses = await Address.find();

    expect(addresses.length).toEqual(0);

    const users = await User.find();

    const user = users[0];

    expect(user.billing_address).toEqual(null);
    expect(user.shipping_address).toEqual(null);
  });
});

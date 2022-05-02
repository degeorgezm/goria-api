/** @format */

import { connect, disconnect } from "mongoose";
import request from "supertest";

import { User, Roles } from "../../src/models";
import { app } from "../../src/server";

const user_body = {
  firstName: "Munchkin",
  lastName: "Confidential",
  password: "password",
  email: "munchkinconfidential@mas3ics.com",
  phone: "1111111111",
};

const admin_body = {
  firstName: "user",
  lastName: "admin",
  password: "password",
  email: "admin@as3ics.com",
  role: Roles.ADMIN,
  username: "admin",
};

describe("User Tests", () => {
  (async () => {
    await User.deleteMany({});
  })();

  beforeAll(async () => {
    await connect(global.__MONGO_URI__, { autoIndex: true });
  });

  afterAll(async () => {
    await disconnect();
  });

  test("1. user create route performs correctly", async () => {
    let res = await request(app).post("/user").send(user_body);

    const password = user_body.password;
    delete user_body.password;
    expect(res.statusCode).toEqual(201);

    expect(res.body).toEqual({
      _createdAt: res.body._createdAt,
      _updatedAt: res.body._updatedAt,
      role: Number(Roles.USER),
      _id: res.body._id,
      password: res.body.password,
      username: user_body.email,
      twilio: "1" + user_body.phone,
      ...user_body,
    });

    user_body["password"] = password;

    res = await request(app).post("/user").send({
      twilio: "foo",
      username: "foo",
      role: "foo",
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({
      error: {
        validation: "firstName,lastName,password,email,!username,!role,!twilio",
      },
    });
  });

  test("2. user read route performs correctly", async () => {
    const users = await User.find({ email: user_body.email });
    expect(users.length).toEqual(1);
    const user = users[0];

    let res = await request(app).get("/user/" + user._id);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Object);
  });

  test("3. user read all route performs correctly", async () => {
    let res = await request(app).get("/user");

    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
  });

  test("4. user update route performs correctly", async () => {
    const users = await User.find({ email: user_body.email });
    expect(users.length).toEqual(1);
    const user = users[0];

    let res = await request(app)
      .put("/user/" + user._id)
      .send({
        _id: "foo",
        twilio: "foo",
        role: "foo",
        username: "foo",
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({
      error: { validation: "!_id,!username,!role,!twilio" },
    });

    const new_name = user_body.firstName + "-updated";

    res = await request(app)
      .put("/user/" + user._id)
      .send({
        firstName: new_name,
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.firstName).toEqual(new_name);
  });

  test("5. user delete route performs correctly", async () => {
    let users = await User.find().where({ email: user_body.email });
    expect(users.length).toEqual(1);
    let user = users[0];

    let res = await request(app).delete("/user/" + user._id);

    expect(res.statusCode).toEqual(200);

    users = await User.find().where({ email: user_body.email });
    expect(users.length).toEqual(0);
  });
});

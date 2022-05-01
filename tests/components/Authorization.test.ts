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
  email: "email@munchkin.com",
  role: Roles.USER,
  username: "email@munchkin.com",
};

describe("Authorization Tests", () => {
  let jwt: string;
  let user: IUser;

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

    expect(jwt).toBeDefined();
    expect(user).toBeDefined();
  });

  test("1. authorization route performs correctly", async () => {
    expect(jwt).toBeDefined();
    expect(user).toBeDefined();

    let res = await request(app).post("/authorization").send({
      username: user_body.username,
      password: user_body.password,
    });

    expect(res.statusCode).toEqual(200);
    expect(res.header[JWT_AUTH_HEADER]).toBeDefined();

    jwt = res.header[JWT_AUTH_HEADER];

    res = await request(app).post("/authorization").send({
      username: user_body.username,
      password: "wrong-password",
    });

    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual({});
    expect(res.header[JWT_AUTH_HEADER]).toBeUndefined();
  });

  test("2. authorization verify token route performs correctly", async () => {
    expect(jwt).toBeDefined();

    let res = await request(app)
      .get("/authorization")
      .set(JWT_AUTH_HEADER, jwt);

    expect(res.statusCode).toEqual(200);

    res = await request(app)
      .get("/authorization")
      .set(JWT_AUTH_HEADER, "foo_bar" + jwt);

    expect(res.body).toEqual({ error: "user not found" });
    expect(res.statusCode).toEqual(404);
  });
});

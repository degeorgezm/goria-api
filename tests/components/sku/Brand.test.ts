/** @format */
import { connect, disconnect } from "mongoose";
import request from "supertest";

import { app } from "../../../src/server";
import { User, IUser, Roles, Brand, IBrand } from "../../../src/models";
import { JWT_AUTH_HEADER } from "../../../src/config";

const admin_body = {
  firstName: "Munchkin",
  lastName: "Confidential",
  password: "password",
  email: "munchkinconfidential@munchkin.com",
  role: Roles.ADMIN,
  username: "munchkinconfidential",
};

const user_body = {
  firstName: "John",
  lastName: "Doe",
  password: "password",
  email: "johndoe@email.com",
  role: Roles.USER,
  username: "johndoe@email.com",
};

const brand_body = {
  name: "Brand",
  sku_shortcode: "BR",
  display: true,
};

describe("Brand Tests", () => {
  let admin: IUser;
  let user: IUser;
  let jwt_admin: string;
  let jwt_user: string;

  const setup = async () => {
    await User.deleteMany({});
    await Brand.deleteMany({});

    admin = new User(admin_body);
    admin = await admin.save();

    user = new User(user_body);
    user = await user.save();

    let res = await request(app).post("/authorization").send({
      username: user_body.username,
      password: user_body.password,
    });

    jwt_user = res.header[JWT_AUTH_HEADER];

    res = await request(app).post("/authorization").send({
      username: admin_body.username,
      password: admin_body.password,
    });

    jwt_admin = res.header[JWT_AUTH_HEADER];
  };

  beforeAll(async () => {
    await connect(global.__MONGO_URI__, { autoIndex: true });
  });

  afterAll(async () => {
    await disconnect();
  });

  test("0. setup", async () => {
    await setup();

    expect(user).toBeInstanceOf(Object);
    expect(jwt_user).not.toEqual(undefined);
    expect(admin).toBeInstanceOf(Object);
    expect(jwt_admin).not.toEqual(undefined);
  });

  test("1. brand create endpoint performs correctly", async () => {
    let res = await request(app)
      .post("/sku/brand")
      .set(JWT_AUTH_HEADER, jwt_admin)
      .send(brand_body);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toBeInstanceOf(Object);
    expect(res.body).toEqual({
      ...brand_body,
      _id: res.body._id,
      createdAt: res.body.createdAt,
      updatedAt: res.body.updatedAt,
    });
  });

  test("2. brand create endpoint security check", async () => {
    let res = await request(app)
      .post("/sku/brand")
      .set(JWT_AUTH_HEADER, jwt_user)
      .send(brand_body);

    expect(res.statusCode).toEqual(401);
    expect(res.body).toEqual({ error: "unauthorized" });
  });
});

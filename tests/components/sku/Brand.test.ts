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
      _createdAt: res.body._createdAt,
      _updatedAt: res.body._updatedAt,
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

  test("3. brand create endpoint validators performs correctly", async () => {
    let res = await request(app)
      .post("/sku/brand")
      .set(JWT_AUTH_HEADER, jwt_admin)
      .send({
        _id: "foo",
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({
      error: { validation: "!_id,name,sku_shortcode,display" },
    });
  });

  test("4. brand read endpoint performs correctly", async () => {
    const brands = await Brand.find({});

    expect(brands.length).toEqual(1);

    let brand = brands[0];

    let res = await request(app).get("/sku/brand/" + String(brand._id));

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      ...brand_body,
      _id: res.body._id,
      _createdAt: res.body._createdAt,
      _updatedAt: res.body._updatedAt,
    });
  });

  test("5. brand read all endpoint performs correctly", async () => {
    const brands = await Brand.find({});

    expect(brands.length).toEqual(1);

    let res = await request(app).get("/sku/brand/");

    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toEqual(1);
  });

  test("6. brand update endpoint performs correctly", async () => {
    const brands = await Brand.find({});

    expect(brands.length).toEqual(1);

    let brand = brands[0];
    let updates = {
      name: brand.name + "-updated",
    };

    expect(brand.name).not.toEqual(updates.name);

    let res = await request(app)
      .put("/sku/brand/" + String(brand._id))
      .set(JWT_AUTH_HEADER, jwt_admin)
      .send(updates);

    expect(res.statusCode).toEqual(200);
    expect(res.body.name).toEqual(updates.name);

    brand = await Brand.findById(brand._id);
    expect(brand.name).toEqual(updates.name);
  });

  test("7. brand update endpoint security check", async () => {
    const brands = await Brand.find({});

    expect(brands.length).toEqual(1);

    let brand = brands[0];
    let updates = {
      name: brand.name + "-updated",
    };

    expect(brand.name).not.toEqual(updates.name);

    let res = await request(app)
      .put("/sku/brand/" + String(brand._id))
      .set(JWT_AUTH_HEADER, jwt_user)
      .send(updates);

    expect(res.statusCode).toEqual(401);
    expect(res.body).toEqual({ error: "unauthorized" });
  });

  test("8. brand update endpoint validators performs correctly", async () => {
    const brands = await Brand.find({});

    expect(brands.length).toEqual(1);

    let brand = brands[0];
    let updates = {
      name: brand.name + "-updated",
      _id: brand._id,
    };

    expect(brand.name).not.toEqual(updates.name);

    let res = await request(app)
      .put("/sku/brand/" + String(brand._id))
      .set(JWT_AUTH_HEADER, jwt_admin)
      .send(updates);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({ error: { validation: "!_id" } });
  });

  test("9. brand delete endpoint security check", async () => {
    const brands = await Brand.find({});

    expect(brands.length).toEqual(1);

    let brand = brands[0];

    let res = await request(app)
      .delete("/sku/brand/" + String(brand._id))
      .set(JWT_AUTH_HEADER, jwt_user);

    expect(res.statusCode).toEqual(401);
    expect(res.body).toEqual({ error: "unauthorized" });
  });

  test("10. brand delete endpoint performs correctly", async () => {
    let brands = await Brand.find({});

    expect(brands.length).toEqual(1);

    let brand = brands[0];

    let res = await request(app)
      .delete("/sku/brand/" + String(brand._id))
      .set(JWT_AUTH_HEADER, jwt_admin);

    brands = await Brand.find({});

    expect(res.statusCode).toEqual(200);
    expect(brands.length).toEqual(0);
    expect(res.body).toEqual({ acknowledged: true, deletedCount: 1 });
  });
});

/** @format */
import { connect, disconnect } from "mongoose";
import request from "supertest";

import { User, IUser, Roles, Variant, Type, IType } from "../../../src/models";
import { app } from "../../../src/server";
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

const type_body = {
  name: "Type",
  sku_shortcode: "TY",
  display: true,
};

const variant_body = {
  name: "Variant",
  sku_shortcode: "VR",
  type: undefined,
  display: true,
};

describe("Variant Tests", () => {
  let admin: IUser;
  let user: IUser;
  let jwt_admin: string;
  let jwt_user: string;
  let type: IType;

  const setup = async () => {
    await User.deleteMany({});
    await Variant.deleteMany({});
    await Type.deleteMany({});

    admin = new User(admin_body);
    admin = await admin.save();

    user = new User(user_body);
    user = await user.save();

    type = new Type(type_body);
    type = await type.save();

    variant_body.type = type._id;

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

    expect(type).toBeInstanceOf(Object);
    expect(user).toBeInstanceOf(Object);
    expect(variant_body.type).not.toEqual(undefined);
    expect(jwt_user).not.toEqual(undefined);
    expect(admin).toBeInstanceOf(Object);
    expect(jwt_admin).not.toEqual(undefined);
  });

  test("1. variant create endpoint performs correctly", async () => {
    let res = await request(app)
      .post("/sku/variant")
      .set(JWT_AUTH_HEADER, jwt_admin)
      .send(variant_body);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toBeInstanceOf(Object);
    expect(res.body).toEqual({
      _id: res.body._id,
      display: variant_body.display,
      name: variant_body.name,
      type: {
        _id: String(type._id),
        createdAt: res.body.type.createdAt,
        display: type.display,
        name: type.name,
        sku_shortcode: type.sku_shortcode,
        updatedAt: res.body.type.updatedAt,
      },
      sku_shortcode: variant_body.sku_shortcode,
      createdAt: res.body.createdAt,
      updatedAt: res.body.updatedAt,
    });
  });

  test("2. variant create endpoint security check", async () => {
    let res = await request(app)
      .post("/sku/variant")
      .set(JWT_AUTH_HEADER, jwt_user)
      .send(variant_body);

    expect(res.statusCode).toEqual(401);
    expect(res.body).toEqual({ error: "unauthorized" });
  });

  test("3. variant create endpoint validators performs correctly", async () => {
    let res = await request(app)
      .post("/sku/variant")
      .set(JWT_AUTH_HEADER, jwt_admin)
      .send({
        _id: "foo",
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({
      error: { validation: "!_id,name,sku_shortcode,display,type" },
    });
  });

  test("4. variant read endpoint performs correctly", async () => {
    const variants = await Variant.find({});

    expect(variants.length).toEqual(1);

    let variant = variants[0];

    let res = await request(app).get("/sku/variant/" + String(variant._id));

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      _id: res.body._id,
      display: variant_body.display,
      name: variant_body.name,
      type: {
        _id: String(type._id),
        createdAt: res.body.type.createdAt,
        display: type.display,
        name: type.name,
        sku_shortcode: type.sku_shortcode,
        updatedAt: res.body.type.updatedAt,
      },
      sku_shortcode: variant_body.sku_shortcode,
      createdAt: res.body.createdAt,
      updatedAt: res.body.updatedAt,
    });
  });

  test("5. variant read all endpoint performs correctly", async () => {
    const variants = await Variant.find({});

    expect(variants.length).toEqual(1);

    let res = await request(app).get("/sku/variant/");

    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toEqual(1);
  });

  test("6. variant update endpoint performs correctly", async () => {
    const variants = await Variant.find({});

    expect(variants.length).toEqual(1);

    let variant = variants[0];
    let updates = {
      name: variant.name + "-updated",
    };

    expect(variant.name).not.toEqual(updates.name);

    let res = await request(app)
      .put("/sku/variant/" + String(variant._id))
      .set(JWT_AUTH_HEADER, jwt_admin)
      .send(updates);

    expect(res.statusCode).toEqual(200);
    expect(res.body.name).toEqual(updates.name);

    variant = await Variant.findById(variant._id);
    expect(variant.name).toEqual(updates.name);
  });

  test("7. variant update endpoint security check", async () => {
    const variants = await Variant.find({});

    expect(variants.length).toEqual(1);

    let variant = variants[0];
    let updates = {
      name: variant.name + "-updated",
    };

    expect(variant.name).not.toEqual(updates.name);

    let res = await request(app)
      .put("/sku/variant/" + String(variant._id))
      .set(JWT_AUTH_HEADER, jwt_user)
      .send(updates);

    expect(res.statusCode).toEqual(401);
    expect(res.body).toEqual({ error: "unauthorized" });
  });

  test("8. variant update endpoint validators performs correctly", async () => {
    const variants = await Variant.find({});

    expect(variants.length).toEqual(1);

    let variant = variants[0];
    let updates = {
      name: variant.name + "-updated",
      _id: variant._id,
    };

    expect(variant.name).not.toEqual(updates.name);

    let res = await request(app)
      .put("/sku/variant/" + String(variant._id))
      .set(JWT_AUTH_HEADER, jwt_admin)
      .send(updates);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({ error: { validation: "!_id" } });
  });

  test("9. variant delete endpoint security check", async () => {
    const variants = await Variant.find({});

    expect(variants.length).toEqual(1);

    let variant = variants[0];

    let res = await request(app)
      .delete("/sku/variant/" + String(variant._id))
      .set(JWT_AUTH_HEADER, jwt_user);

    expect(res.statusCode).toEqual(401);
    expect(res.body).toEqual({ error: "unauthorized" });
  });

  test("10. variant delete endpoint performs correctly", async () => {
    let variants = await Variant.find({});

    expect(variants.length).toEqual(1);

    let variant = variants[0];

    let res = await request(app)
      .delete("/sku/variant/" + String(variant._id))
      .set(JWT_AUTH_HEADER, jwt_admin);

    variants = await Variant.find({});

    expect(res.statusCode).toEqual(200);
    expect(variants.length).toEqual(0);
    expect(res.body).toEqual({ acknowledged: true, deletedCount: 1 });
  });
});

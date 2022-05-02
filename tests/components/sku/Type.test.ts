/** @format */
import { connect, disconnect } from "mongoose";
import request from "supertest";

import { User, IUser, Roles, Type } from "../../../src/models";
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

describe("Type Tests", () => {
  let admin: IUser;
  let user: IUser;
  let jwt_admin: string;
  let jwt_user: string;

  const setup = async () => {
    await User.deleteMany({});
    await Type.deleteMany({});

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

  test("1. type create endpoint performs correctly", async () => {
    let res = await request(app)
      .post("/sku/type")
      .set(JWT_AUTH_HEADER, jwt_admin)
      .send(type_body);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toBeInstanceOf(Object);
    expect(res.body).toEqual({
      _id: res.body._id,
      display: type_body.display,
      name: type_body.name,
      sku_shortcode: type_body.sku_shortcode,
      _createdAt: res.body._createdAt,
      _updatedAt: res.body._updatedAt,
    });
  });

  test("2. type create endpoint security check", async () => {
    let res = await request(app)
      .post("/sku/type")
      .set(JWT_AUTH_HEADER, jwt_user)
      .send(type_body);

    expect(res.statusCode).toEqual(401);
    expect(res.body).toEqual({ error: "unauthorized" });
  });

  test("3. type create endpoint validators performs correctly", async () => {
    let res = await request(app)
      .post("/sku/type")
      .set(JWT_AUTH_HEADER, jwt_admin)
      .send({
        _id: "foo",
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({
      error: { validation: "!_id,name,sku_shortcode,display" },
    });
  });

  test("4. type read endpoint performs correctly", async () => {
    const types = await Type.find({});

    expect(types.length).toEqual(1);

    let type = types[0];

    let res = await request(app).get("/sku/type/" + String(type._id));

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      _id: res.body._id,
      ...type_body,
      _createdAt: res.body._createdAt,
      _updatedAt: res.body._updatedAt,
    });
  });

  test("5. type read all endpoint performs correctly", async () => {
    const types = await Type.find({});

    expect(types.length).toEqual(1);

    let res = await request(app).get("/sku/type/");

    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toEqual(1);
  });

  test("6. type update endpoint performs correctly", async () => {
    const types = await Type.find({});

    expect(types.length).toEqual(1);

    let type = types[0];
    let updates = {
      name: type.name + "-updated",
    };

    expect(type.name).not.toEqual(updates.name);

    let res = await request(app)
      .put("/sku/type/" + String(type._id))
      .set(JWT_AUTH_HEADER, jwt_admin)
      .send(updates);

    expect(res.statusCode).toEqual(200);
    expect(res.body.name).toEqual(updates.name);

    type = await Type.findById(type._id);
    expect(type.name).toEqual(updates.name);
  });

  test("7. type update endpoint security check", async () => {
    const types = await Type.find({});

    expect(types.length).toEqual(1);

    let type = types[0];
    let updates = {
      name: type.name + "-updated",
    };

    expect(type.name).not.toEqual(updates.name);

    let res = await request(app)
      .put("/sku/type/" + String(type._id))
      .set(JWT_AUTH_HEADER, jwt_user)
      .send(updates);

    expect(res.statusCode).toEqual(401);
    expect(res.body).toEqual({ error: "unauthorized" });
  });

  test("8. type update endpoint validators performs correctly", async () => {
    const types = await Type.find({});

    expect(types.length).toEqual(1);

    let type = types[0];
    let updates = {
      name: type.name + "-updated",
      _id: type._id,
    };

    expect(type.name).not.toEqual(updates.name);

    let res = await request(app)
      .put("/sku/type/" + String(type._id))
      .set(JWT_AUTH_HEADER, jwt_admin)
      .send(updates);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({ error: { validation: "!_id" } });
  });

  test("9. type delete endpoint security check", async () => {
    const types = await Type.find({});

    expect(types.length).toEqual(1);

    let type = types[0];

    let res = await request(app)
      .delete("/sku/type/" + String(type._id))
      .set(JWT_AUTH_HEADER, jwt_user);

    expect(res.statusCode).toEqual(401);
    expect(res.body).toEqual({ error: "unauthorized" });
  });

  test("10. type delete endpoint performs correctly", async () => {
    let types = await Type.find({});

    expect(types.length).toEqual(1);

    let type = types[0];

    let res = await request(app)
      .delete("/sku/type/" + String(type._id))
      .set(JWT_AUTH_HEADER, jwt_admin);

    types = await Type.find({});

    expect(res.statusCode).toEqual(200);
    expect(types.length).toEqual(0);
    expect(res.body).toEqual({ acknowledged: true, deletedCount: 1 });
  });
});

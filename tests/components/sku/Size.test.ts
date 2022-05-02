/** @format */
import { connect, disconnect, Schema } from "mongoose";
import request from "supertest";

import { User, IUser, Roles, Size, Type, IType } from "../../../src/models";
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

const size_body = {
  name: "Size",
  sku_shortcode: "SZ",
  type: undefined,
  display: true,
};

describe("Size Tests", () => {
  let admin: IUser;
  let user: IUser;
  let jwt_admin: string;
  let jwt_user: string;
  let type: IType;

  const setup = async () => {
    await User.deleteMany({});
    await Size.deleteMany({});
    await Type.deleteMany({});

    admin = new User(admin_body);
    admin = await admin.save();

    user = new User(user_body);
    user = await user.save();

    type = new Type(type_body);
    type = await type.save();

    size_body.type = type._id;

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
    expect(size_body.type).not.toEqual(undefined);
    expect(jwt_user).not.toEqual(undefined);
    expect(admin).toBeInstanceOf(Object);
    expect(jwt_admin).not.toEqual(undefined);
  });

  test("1. size create endpoint performs correctly", async () => {
    let res = await request(app)
      .post("/sku/size")
      .set(JWT_AUTH_HEADER, jwt_admin)
      .send(size_body);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toBeInstanceOf(Object);
    expect(res.body).toEqual({
      _id: res.body._id,
      display: size_body.display,
      name: size_body.name,
      type: {
        _id: String(type._id),
        _createdAt: res.body.type._createdAt,
        display: type.display,
        name: type.name,
        sku_shortcode: type.sku_shortcode,
        _updatedAt: res.body.type._updatedAt,
      },
      sku_shortcode: size_body.sku_shortcode,
      _createdAt: res.body._createdAt,
      _updatedAt: res.body._updatedAt,
    });
  });

  test("2. size create endpoint security check", async () => {
    let res = await request(app)
      .post("/sku/size")
      .set(JWT_AUTH_HEADER, jwt_user)
      .send(size_body);

    expect(res.statusCode).toEqual(401);
    expect(res.body).toEqual({ error: "unauthorized" });
  });

  test("3. size create endpoint validators performs correctly", async () => {
    let res = await request(app)
      .post("/sku/size")
      .set(JWT_AUTH_HEADER, jwt_admin)
      .send({
        _id: "foo",
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({
      error: { validation: "!_id,name,sku_shortcode,display,type" },
    });
  });

  test("4. size read endpoint performs correctly", async () => {
    const sizes = await Size.find({});

    expect(sizes.length).toEqual(1);

    let size = sizes[0];

    let res = await request(app).get("/sku/size/" + String(size._id));

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      _id: res.body._id,
      display: size_body.display,
      name: size_body.name,
      type: {
        _id: String(type._id),
        _createdAt: res.body.type._createdAt,
        display: type.display,
        name: type.name,
        sku_shortcode: type.sku_shortcode,
        _updatedAt: res.body.type._updatedAt,
      },
      sku_shortcode: size_body.sku_shortcode,
      _createdAt: res.body._createdAt,
      _updatedAt: res.body._updatedAt,
    });
  });

  test("5. size read all endpoint performs correctly", async () => {
    const sizes = await Size.find({});

    expect(sizes.length).toEqual(1);

    let res = await request(app).get("/sku/size/");

    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toEqual(1);
  });

  test("6. size update endpoint performs correctly", async () => {
    const sizes = await Size.find({});

    expect(sizes.length).toEqual(1);

    let size = sizes[0];
    let updates = {
      name: size.name + "-updated",
    };

    expect(size.name).not.toEqual(updates.name);

    let res = await request(app)
      .put("/sku/size/" + String(size._id))
      .set(JWT_AUTH_HEADER, jwt_admin)
      .send(updates);

    expect(res.statusCode).toEqual(200);
    expect(res.body.name).toEqual(updates.name);

    size = await Size.findById(size._id);
    expect(size.name).toEqual(updates.name);
  });

  test("7. size update endpoint security check", async () => {
    const sizes = await Size.find({});

    expect(sizes.length).toEqual(1);

    let size = sizes[0];
    let updates = {
      name: size.name + "-updated",
    };

    expect(size.name).not.toEqual(updates.name);

    let res = await request(app)
      .put("/sku/size/" + String(size._id))
      .set(JWT_AUTH_HEADER, jwt_user)
      .send(updates);

    expect(res.statusCode).toEqual(401);
    expect(res.body).toEqual({ error: "unauthorized" });
  });

  test("8. size update endpoint validators performs correctly", async () => {
    const sizes = await Size.find({});

    expect(sizes.length).toEqual(1);

    let size = sizes[0];
    let updates = {
      name: size.name + "-updated",
      _id: size._id,
    };

    expect(size.name).not.toEqual(updates.name);

    let res = await request(app)
      .put("/sku/size/" + String(size._id))
      .set(JWT_AUTH_HEADER, jwt_admin)
      .send(updates);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({ error: { validation: "!_id" } });
  });

  test("9. size delete endpoint security check", async () => {
    const sizes = await Size.find({});

    expect(sizes.length).toEqual(1);

    let size = sizes[0];

    let res = await request(app)
      .delete("/sku/size/" + String(size._id))
      .set(JWT_AUTH_HEADER, jwt_user);

    expect(res.statusCode).toEqual(401);
    expect(res.body).toEqual({ error: "unauthorized" });
  });

  test("10. size delete endpoint performs correctly", async () => {
    let sizes = await Size.find({});

    expect(sizes.length).toEqual(1);

    let size = sizes[0];

    let res = await request(app)
      .delete("/sku/size/" + String(size._id))
      .set(JWT_AUTH_HEADER, jwt_admin);

    sizes = await Size.find({});

    expect(res.statusCode).toEqual(200);
    expect(sizes.length).toEqual(0);
    expect(res.body).toEqual({ acknowledged: true, deletedCount: 1 });
  });
});

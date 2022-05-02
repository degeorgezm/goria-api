/** @format */
import { connect, disconnect } from "mongoose";
import request from "supertest";

import { User, IUser, Roles, Line } from "../../../src/models";
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

const line_body = {
  name: "Line",
  sku_shortcode: "GR",
  display: true,
};

describe("Line Tests", () => {
  let admin: IUser;
  let user: IUser;
  let jwt_admin: string;
  let jwt_user: string;

  const setup = async () => {
    await User.deleteMany({});
    await Line.deleteMany({});

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

    expect(user).toBeDefined();
    expect(jwt_user).toBeDefined();
    expect(admin).toBeDefined();
    expect(jwt_admin).toBeDefined();
  });

  test("1. line create endpoint performs correctly", async () => {
    let res = await request(app)
      .post("/sku/line")
      .set(JWT_AUTH_HEADER, jwt_admin)
      .send(line_body);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toBeInstanceOf(Object);
    expect(res.body).toEqual({
      ...line_body,
      _id: res.body._id,
      _createdAt: res.body._createdAt,
      _updatedAt: res.body._updatedAt,
    });
  });

  test("2. line create endpoint security check", async () => {
    let res = await request(app)
      .post("/sku/line")
      .set(JWT_AUTH_HEADER, jwt_user)
      .send(line_body);

    expect(res.statusCode).toEqual(401);
    expect(res.body).toEqual({ error: "unauthorized" });
  });

  test("3. line create endpoint validators performs correctly", async () => {
    let res = await request(app)
      .post("/sku/line")
      .set(JWT_AUTH_HEADER, jwt_admin)
      .send({
        _id: "foo",
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({
      error: { validation: "!_id,name,sku_shortcode,display" },
    });
  });

  test("4. line read endpoint performs correctly", async () => {
    const lines = await Line.find({});

    expect(lines.length).toEqual(1);

    let line = lines[0];

    let res = await request(app).get("/sku/line/" + String(line._id));

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      ...line_body,
      _id: res.body._id,
      _createdAt: res.body._createdAt,
      _updatedAt: res.body._updatedAt,
    });
  });

  test("5. line read all endpoint performs correctly", async () => {
    const lines = await Line.find({});

    expect(lines.length).toEqual(1);

    let res = await request(app).get("/sku/line/");

    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toEqual(1);
  });

  test("6. line update endpoint performs correctly", async () => {
    const lines = await Line.find({});

    expect(lines.length).toEqual(1);

    let line = lines[0];
    let updates = {
      name: line.name + "-updated",
    };

    expect(line.name).not.toEqual(updates.name);

    let res = await request(app)
      .put("/sku/line/" + String(line._id))
      .set(JWT_AUTH_HEADER, jwt_admin)
      .send(updates);

    expect(res.statusCode).toEqual(200);
    expect(res.body.name).toEqual(updates.name);

    line = await Line.findById(line._id);
    expect(line.name).toEqual(updates.name);
  });

  test("7. line update endpoint security check", async () => {
    const lines = await Line.find({});

    expect(lines.length).toEqual(1);

    let line = lines[0];
    let updates = {
      name: line.name + "-updated",
    };

    expect(line.name).not.toEqual(updates.name);

    let res = await request(app)
      .put("/sku/line/" + String(line._id))
      .set(JWT_AUTH_HEADER, jwt_user)
      .send(updates);

    expect(res.statusCode).toEqual(401);
    expect(res.body).toEqual({ error: "unauthorized" });
  });

  test("8. line update endpoint validators performs correctly", async () => {
    const lines = await Line.find({});

    expect(lines.length).toEqual(1);

    let line = lines[0];
    let updates = {
      name: line.name + "-updated",
      _id: line._id,
    };

    expect(line.name).not.toEqual(updates.name);

    let res = await request(app)
      .put("/sku/line/" + String(line._id))
      .set(JWT_AUTH_HEADER, jwt_admin)
      .send(updates);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({ error: { validation: "!_id" } });
  });

  test("9. line delete endpoint security check", async () => {
    const lines = await Line.find({});

    expect(lines.length).toEqual(1);

    let line = lines[0];

    let res = await request(app)
      .delete("/sku/line/" + String(line._id))
      .set(JWT_AUTH_HEADER, jwt_user);

    expect(res.statusCode).toEqual(401);
    expect(res.body).toEqual({ error: "unauthorized" });
  });

  test("10. line delete endpoint performs correctly", async () => {
    let lines = await Line.find({});

    expect(lines.length).toEqual(1);

    let line = lines[0];

    let res = await request(app)
      .delete("/sku/line/" + String(line._id))
      .set(JWT_AUTH_HEADER, jwt_admin);

    lines = await Line.find({});

    expect(res.statusCode).toEqual(200);
    expect(lines.length).toEqual(0);
    expect(res.body).toEqual({ acknowledged: true, deletedCount: 1 });
  });
});

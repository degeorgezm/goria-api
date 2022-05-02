/** @format */

import { connect, disconnect } from "mongoose";
import request from "supertest";
import { readFileSync } from "node:fs";

import { Image, User, Roles } from "../../src/models";
import { app } from "../../src/server";

const user_body = {
  firstName: "Munchkin",
  lastName: "Confidential",
  password: "password",
  email: "munchkin@as3ics.com",
  username: "munchkin@as3ics.com",
  phone: "1111111111",
  role: 7,
};

const admin_body = {
  firstName: "user",
  lastName: "admin",
  password: "password",
  email: "admin@as3ics.com",
  role: Roles.ADMIN,
  username: "admin",
};

describe("Image Tests", () => {
  (async () => {
    await User.deleteMany({});
  })();

  beforeAll(async () => {
    await connect(global.__MONGO_URI__, { autoIndex: true });
  });

  afterAll(async () => {
    await disconnect();
  });

  test("1. image create type='USER' route performs correctly", async () => {
    let user = new User(user_body);
    user = await user.save();
    expect(user._id).toBeDefined();

    let res = await request(app)
      .post("/image/user/" + user._id)
      .attach("image", readFileSync(__dirname + "/../utils/test.jpg"), {
        contentType: "image/jpg",
        filename: "test.jpg",
      });

    expect(res.body._id).toBeDefined();

    user = await User.findOne({ _id: user._id });

    expect(String(user.image)).toEqual(res.body._id);
  });

  test("2. image create type='PRODUCT' route performs correctly", async () => {});
  test("3. image read route performs correctly", async () => {
    const images = await Image.find();
    expect(images.length).toBeGreaterThanOrEqual(1);
    let image = images[0];
    expect(image._id).toBeDefined();

    let res = await request(app).get("/image/" + image._id);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Object);
  });

  test("4. image read all route performs correctly", async () => {
    let res = await request(app).get("/image");

    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
  });

  test("5. image update route performs correctly", async () => {
    const images = await Image.find();
    expect(images.length).toBeGreaterThanOrEqual(1);
    let image = images[0];
    expect(image._id).toBeDefined();

    let res = await request(app)
      .put("/image/" + image._id)
      .send({
        type: "user",
        _id: "foo",
        filename: "foo",
        key: "foo",
        user: "foo",
        product: "foo",
        variant: "foo",
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({
      error: {
        validation:
          "!_id,!filename,!user,!variant,!product,!key,!variant,!product",
      },
    });

    const new_alt = image.alt ? image.alt + "-new" : "alt-new";
    res = await request(app)
      .put("/image/" + image._id)
      .send({
        alt: new_alt,
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.alt).toEqual(new_alt);
  });

  test("6. image delete route performs correctly", async () => {
    let user = await User.findOne({ email: user_body.email });
    expect(user._id).toBeDefined();
    expect(user.image).toBeDefined();

    const orig_id = user.image;
    let res = await request(app).delete("/image/" + user.image);

    expect(res.statusCode).toEqual(200);

    user = await User.findOne({ email: user_body.email });
    expect(user.image).toEqual(null);

    let image = await Image.findById(orig_id);
    expect(image).toEqual(null);
  });
});

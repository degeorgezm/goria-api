/**
 * databsase.ts
 *
 * api.goria.com
 * by AS3ICS
 *
 * Zach DeGeorge
 * zach@as3ics.com
 *
 * @format
 * @abstract Initializes the mongodb databse connection
 *
 */

import { MongoClient } from "mongodb";

import { MONGODB_URL, MONGODB_DATABASE } from "./config";

const client = new MongoClient(MONGODB_URL);

export const connect = async () => {
  try {
    await client.connect();
    console.info("Database connected");
    // const test_collection = client.db("test").collection("test");
    // if (test_collection) {
    //   const test_entry = await test_collection.find({ test: "true" }).toArray();
    //   if (test_entry) {
    //     console.info("Test entry found: ", test_entry);
    //   }
    // }
  } catch (error) {
    console.error("Error connecting to database: ", error);
  }
};

export const db = client.db(MONGODB_DATABASE);

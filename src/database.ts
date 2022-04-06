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

import { MongoClient, Collection } from "mongodb";

import { MONGODB_URL, MONGODB_DATABASE } from "./config";

const client = new MongoClient(MONGODB_URL);

export const connect = async (): Promise<boolean> => {
  try {
    await client.connect();
    console.info("Database connected");
    return true;
  } catch (error) {
    console.error("Error connecting to database: ", error);
    return false;
  }
};

export const db = client.db(MONGODB_DATABASE);

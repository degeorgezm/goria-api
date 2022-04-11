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
 * @abstract Initializes the mongoose mongodb databse connection
 *
 */

import { connect as mongoose_connect } from "mongoose";

import { MONGODB_URL } from "./config";

/**
 *
 * @abstract Connects to the mongodb database or cluster using mongoose based on the MONGODB_URL environment variable
 *
 * @returns Promise<boolean>
 *
 */
export const connect = async (): Promise<boolean> => {
  try {
    await mongoose_connect(MONGODB_URL);
    console.info("Database connected");
    return true;
  } catch (error) {
    console.error("Error connecting to database: ", error);
    return false;
  }
};

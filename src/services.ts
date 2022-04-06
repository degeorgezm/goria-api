/** @format */

// External Dependencies

import { Collection } from "mongodb";

import { db, connect } from "./database";
import { User } from "./schemas";

// Global Variables

export const collections: {
  users?: Collection;
} = {};

// Initialize Connection

export const initialize = async () => {
  const connected = await connect();
  if (connected) {
    collections.users = db.collection(User.collection_name);
    console.log(
      `Successfully connected to database: ${
        db.databaseName
      } with collections: ${
        collections.users?.collectionName
      } - ${new Date().toLocaleString()}`
    );
  }
};

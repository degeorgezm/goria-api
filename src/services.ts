/** @format */

// External Dependencies

import { Roles } from "./schemas/Users/User";
import { connect } from "./database";

import { User } from "./schemas";

import { SECRET_KEY } from "./config";

// Global Variables

// Initialize Connection

export async function initialize() {
  await connect();

  const super_admins = await User.find({ role: Roles.SUPER_ADMIN });
  if (super_admins.length == 0) {
    console.info("Super Admin not found. Creating...");
    await User.create({
      firstName: "Zach",
      lastName: "DeGeorge",
      email: "zach@as3ics.com",
      username: "zach",
      password: SECRET_KEY,
      role: Roles.SUPER_ADMIN,
    });
    console.info("Super Admin created");
  } else {
    console.log("Super Admin found.");
  }
}

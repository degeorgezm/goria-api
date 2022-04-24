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

  const superAdmins = await User.find({ role: Roles.SUPER_ADMIN });
  if (superAdmins.length === 0) {
    /* tslint:disable-next-line no-console error */
    console.info("Super Admin not found. Creating...");
    await User.create({
      firstName: "Zach",
      lastName: "DeGeorge",
      email: "zach@as3ics.com",
      username: "zach",
      password: SECRET_KEY,
      role: Roles.SUPER_ADMIN,
    });
    /* tslint:disable-next-line no-console error */
    console.info("Super Admin created");
  } else {
    /* tslint:disable-next-line no-console error */
    console.info("Super Admin found.");
  }
}

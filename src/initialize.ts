/** @format */

// External Dependencies

import { connect } from "./database";

import { User, Roles, Meta } from "./models";

import {
  SECRET_KEY,
  META_KEY_PRODUCT_COUNT,
  SUPER_ADMIN_USERNAME,
  SUPER_ADMIN_EMAIL,
  SUPER_ADMIN_FNAME,
  SUPER_ADMIN_LNAME,
} from "./config";

// Global Variables

// Initialize Connection
export async function initialize() {
  await connect();

  const superAdminQuery = {
    firstName: SUPER_ADMIN_FNAME,
    lastName: SUPER_ADMIN_LNAME,
    email: SUPER_ADMIN_EMAIL,
    username: SUPER_ADMIN_USERNAME,
    password: SECRET_KEY,
    role: Roles.SUPER_ADMIN,
  };
  const superAdmin = await User.findOne(superAdminQuery);
  if (!superAdmin) {
    /* tslint:disable-next-line no-console error */
    console.info("Super Admin not found. Creating...");
    const admin = new User(superAdminQuery);
    await admin.save();
    /* tslint:disable-next-line no-console error */
    console.info("Super Admin created");
  }

  const productCountMeta = await Meta.findOne({ key: META_KEY_PRODUCT_COUNT });
  if (!productCountMeta) {
    /* tslint:disable-next-line no-console error */
    console.info("Product Count Meta not found. Creating...");
    const meta = new Meta({
      key: META_KEY_PRODUCT_COUNT,
      value: 0,
    });
    await meta.save();
    /* tslint:disable-next-line no-console error */
    console.info("Product Count Meta created");
  }
}

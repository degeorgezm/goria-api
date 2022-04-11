/**
 * index.ts
 *
 * api.goria.com
 * by AS3ICS
 *
 * Zach DeGeorge
 * zach@as3ics.com
 *
 * @format
 * @abstract Entry point into api.goria.com
 *
 */

import { initialize } from "./services";
import { start } from "./server";

async function main() {
  await initialize();

  await start();
}

main();

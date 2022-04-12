/** @format */

import { connect, model, Schema } from "mongoose";

import { MONGODB_URL, MONGODB_DATABASE } from "../src/config";

// 1. Create an interface representing a document in MongoDB.
interface ITest {
  _id: Schema.Types.ObjectId;
  test: String;
  save(): ITest;
}

// 2. Create a Schema corresponding to the document interface.
const testSchema = new Schema({
  test: { type: String, required: true },
});

// 3. Create a Model.
const Test = model<ITest>("Test", testSchema);

test().catch((err) => console.log(err));

async function test() {
  // 4. Connect to MongoDB
  await connect(MONGODB_URL);

  let test = new Test({
    test: "this is a test",
  });

  test = await test.save();

  console.log("Test passed! ID Generated: ", test._id.toString());
}

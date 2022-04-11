#!/Users/as3ics-dev/.nvm/versions/node/v14.19.0/bin/node

require('dotenv').config();

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.MONGODB_URL;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function test() {
		client.connect(async err => {
		console.log("Connected!");

		const collection = client.db("test").collection("test");

		if(collection) {
			console.log("Test collection found!");
			const entry = await collection.find({"test": "true"}).toArray();
			if(entry) {
				console.log("Test entry found");
				console.log(entry);
			}
		}

		client.close(err => {
			console.log("Disconnected");
		});
	});
}

test();

const assert = require("assert");
const { MongoClient } = require("mongodb");

require("dotenv").config();
const { MONGO_URI } = process.env;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const NUM_OF_ROWS = 8;
const SEATS_PER_ROW = 12;

const seats = [];
const row = ["A", "B", "C", "D", "E", "F", "G", "H"];
for (let r = 0; r < row.length; r++) {
  for (let s = 1; s < 13; s++) {
    seats.push({
      _id: `${row[r]}-${s}`,
      price: 225,
      isBooked: false,
    });
  }
}

const batchImport = async () => {
  try {
    const client = await MongoClient(MONGO_URI, options);
    await client.connect();
    console.log("connected");
    const db = client.db("booking");
    const r = await db.collection("seats").insertMany(seats);
    assert.equal(seats.length, r.insertedCount);

    client.close();
    console.log("disconnected");
  } catch (err) {
    console.log("Failed");
    console.log(err.stack);
  }
  client.close();
};

batchImport();

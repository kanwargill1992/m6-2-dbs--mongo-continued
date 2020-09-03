"use strict";
const { MongoClient } = require("mongodb");
const assert = require("assert");

require("dotenv").config();
const { MONGO_URI } = process.env;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const getSeats = async (req, res) => {
  try {
    const client = await MongoClient(MONGO_URI, options);
    await client.connect();
    console.log("connected");
    const db = client.db("booking");
    const r = await db.collection("seats").find().toArray();
    r
      ? res.status(200).json({
          seats: r,
          bookedSeats: {},
          numOfRows: 8,
          seatsPerRow: 12,
        })
      : res.status(404).json({ status: 404, message: "unavailable" });

    client.close();
    console.log("disconnected");
  } catch (err) {
    console.log(err);
  }
};

const bookSeat = async (req, res) => {
  const { seatId, creditCard, expiration, fullName, email } = req.body;
  if (!creditCard || !expiration) {
    return res.status(400).json({
      message: "Please provide credit card information!",
    });
  }

  if (!fullName || !email) {
    return res.status(400).json({
      message: "Please provide your name and email!",
    });
  }

  try {
    const client = await MongoClient(MONGO_URI, options);
    await client.connect();
    const db = client.db("booking");
    await db
      .collection("seats")
      .findOne({ _id: seatId }, async (err, result) => {
        if (result) {
          if (result.isBooked === true) {
            return res
              .status(400)
              .json({ message: "This seat has already been booked!" });
          } else {
            const bookedSeat = await db.collection("seats").updateOne(
              { _id: seatId },
              {
                $set: { isBooked: true, passenger: fullName, contact: email },
              }
            );
            assert.equal(1, bookedSeat.matchedCount);
            assert.equal(1, bookedSeat.modifiedCount);

            return res.status(200).json({
              success: true,
            });
          }
        } else return res.status(404).json({ message: "seat not found" });
      });
  } catch (error) {
    console.log(error);
  }
};

module.exports = { getSeats, bookSeat };

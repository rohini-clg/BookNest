require("dotenv").config();

const mongoose = require("mongoose");
const initData = require("./data");
const Listing = require("../models/listing");

const MONGO_URL = process.env.ATLASDB_URL;

async function main() {
  await mongoose.connect(MONGO_URL);
  console.log("Connected to Atlas");
}

main()
  .then(initDB)
  .catch(console.log);

async function initDB() {
  await Listing.deleteMany({});

  initData.data = initData.data.map((obj) => ({
    ...obj,
    owner: "6a48ae1436e6fd9fac912429",
    category: obj.category || "Rooms",
}));

  await Listing.insertMany(initData.data);

  console.log("Data initialized");
  process.exit();
}
const mongoose = require("mongoose");
const Question = require("./models/Question");
const fs = require("fs");
require("dotenv").config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    const data = JSON.parse(fs.readFileSync("question.json", "utf-8"));
    await Question.deleteMany(); // optional: clear old questions
    await Question.insertMany(data);
    console.log("✅ Questions seeded to MongoDB");
    process.exit();
  })
  .catch((err) => {
    console.error("❌ Error seeding questions:", err);
    process.exit(1);
  });

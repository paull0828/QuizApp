const mongoose = require("mongoose");

const ScoreSchema = new mongoose.Schema({
  name: String,
  surname: String,
  mobile: {
    type: String,
    required: true,
    unique: true,
  },
  score: Number,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Score", ScoreSchema);

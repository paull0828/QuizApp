const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  question: String,
  answers: [
    {
      text: String,
      correct: Boolean,
    },
  ],
});

module.exports = mongoose.model("Question", QuestionSchema);

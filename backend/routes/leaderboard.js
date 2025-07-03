const express = require("express");
const router = express.Router();
const Score = require("../models/Score");

// POST /api/submit-score
router.post("/submit-score", async (req, res) => {
  const { name, surname, mobile, score } = req.body;

  try {
    const existing = await Score.findOne({ mobile });

    if (existing) {
      return res.status(400).json({
        error:
          "You have already attempted the quiz. Only one attempt allowed per mobile number.",
      });
    }

    const newEntry = new Score({ name, surname, mobile, score });
    await newEntry.save();

    res.status(201).json({ created: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error saving score" });
  }
});

// GET /api/leaderboard (sorted, top 20)
router.get("/leaderboard", async (req, res) => {
  const page = parseInt(req.query.page) || 1; // Default to page 1
  const limit = parseInt(req.query.limit) || 10; // Default 10 items per page

  const skip = (page - 1) * limit;

  try {
    const total = await Score.countDocuments();
    const scores = await Score.find()
      .sort({ score: -1 }) // sort by highest score
      .skip(skip)
      .limit(limit);
    const allScores = await Score.find();
    const avgScore =
      allScores.reduce((sum, entry) => sum + entry.score, 0) /
      (allScores.length || 1);

    res.json({
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalEntries: total,
      data: scores,
      avgScore,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

// GET /api/check-mobile?mobile=1234567890
router.get("/check-mobile", async (req, res) => {
  const { mobile } = req.query.mobile;
  try {
    const existing = await Score.findOne({ mobile });
    res.json({ exists: !!existing });
  } catch (err) {
    res.status(500).json({ error: "Error checking mobile" });
  }
});

module.exports = router;

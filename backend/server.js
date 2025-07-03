const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const questionRoutes = require("./routes/question");
const leaderboardRoutes = require("./routes/leaderboard");

app.use("/api/questions", questionRoutes);
app.use("/api", leaderboardRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(process.env.PORT || 3000, () =>
      console.log("🚀 Server running on port 3000")
    );
  })
  .catch((err) => console.error("MongoDB connection error:", err));

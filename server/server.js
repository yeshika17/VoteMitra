const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");
const path = require("path");

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect DB (before routes is fine)
connectDB();

// API Routes
app.use("/api/vote", require("./routes/voteRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/elections", require("./routes/electionRoutes"));
app.use("/api/candidates", require("./routes/candidateRoutes"));

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  const clientPath = path.join(__dirname, "../client/dist");

  app.use(express.static(clientPath));

  // Express 5 compatible catch-all
  app.get("/*", (req, res) => {
    res.sendFile(path.join(clientPath, "index.html"));
  });
} else {
  // Dev test route
  app.get("/", (req, res) => {
    res.send("API is running...");
  });
}

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

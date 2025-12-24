const express = require("express");
const router = express.Router();
const {
  createElection,
  getElections,
  getElectionById,
  updateElection,
  deleteElection, // make sure this is imported
  getResults,
} = require("../controllers/electionController");
const { protect, admin } = require("../middleware/authMiddleware");

// Create election → admin only
router.post("/", protect, admin, createElection);

// Get all elections → any logged-in user
router.get("/", protect, getElections);

// Get election by ID → any logged-in user
router.get("/:id", protect, getElectionById);

// Delete election → admin only
router.delete("/:id", protect, admin, deleteElection);

// Get results → admin only
router.get("/:id/results", protect, admin, getResults);

module.exports = router;

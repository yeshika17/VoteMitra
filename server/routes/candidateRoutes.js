const express = require("express");
const router = express.Router();
const {
  addCandidate,
  getCandidatesByElection,
   getAllCandidates, 
  updateCandidate,
  deleteCandidate,
} = require("../controllers/candidateController");
const { protect,admin } = require("../middleware/authMiddleware");


// Add candidate → admin only
router.post("/", protect, admin, addCandidate);
router.get("/", protect, admin, getAllCandidates);

// Get candidates for a specific election → any logged-in user
router.get("/:electionId", protect, getCandidatesByElection);

// Update candidate → admin only
router.put("/:id", protect, admin, updateCandidate);

// Delete candidate → admin only
router.delete("/:id", protect, admin, deleteCandidate);

module.exports = router;

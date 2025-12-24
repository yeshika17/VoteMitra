const express = require("express");
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getAllVoters, 
  getLogs, 
  toggleVoterStatus 
} = require("../controllers/authController");
const { protect, admin } = require("../middleware/authMiddleware");

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Admin protected routes
router.get("/getvoters", protect, admin, getAllVoters);
router.get("/logs", protect, admin, getLogs);
router.put("/voters/:id/block", protect, admin, toggleVoterStatus);

module.exports = router;

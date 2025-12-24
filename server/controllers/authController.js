const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const Log = require("../models/LogModel");

// Generate JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// Register User
const registerUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const user = await User.create({ username, email, password, role });
    await Log.create({ message: `New user registered: ${user.username} (${user.role})` });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    await Log.create({ message: `${user.role.toUpperCase()} logged in: ${user.username}` });

    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get All Voters (Admin Only)
const getAllVoters = async (req, res) => {
  try {
    const voters = await User.find({ role: "voter" });
    res.status(200).json(voters);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Get Logs (Admin Only, Top 5)
const getLogs = async (req, res) => {
  try {
    const logs = await Log.find().sort({ createdAt: -1 }).limit(5);
    res.status(200).json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch logs" });
  }
};

// Toggle Voter Status (Block/Unblock)
const toggleVoterStatus = async (req, res) => {
  try {
    const voter = await User.findById(req.params.id);
    if (!voter) return res.status(404).json({ message: "Voter not found" });

    voter.isBlocked = !voter.isBlocked;
    await voter.save();

    await Log.create({ message: `Voter ${voter.username} is now ${voter.isBlocked ? "Blocked" : "Active"}` });

    res.status(200).json({ message: `Voter is now ${voter.isBlocked ? "Blocked" : "Active"}`, voter });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { registerUser, loginUser, getAllVoters, getLogs, toggleVoterStatus };

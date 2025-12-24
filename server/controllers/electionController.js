const Election = require("../models/electionModel");
const Candidate = require("../models/candidateModel");
const Log = require("../models/LogModel");

// ==========================
// Create Election (Admin Only)
// ==========================
const createElection = async (req, res) => {
  try {
    const { title, description, startDate, endDate } = req.body;
    if (!title || !startDate || !endDate) return res.status(400).json({ message: "Title and dates are required" });

    const election = await Election.create({ title, description, startDate, endDate, candidates: [], votes: [] });

    // Log creation
    await Log.create({ message: `Election created: ${election.title}` });

    res.status(201).json(election);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
// ==========================
// Get All Elections (Voter/Admin)
// ==========================
const getElections = async (req, res) => {
  try {
    const elections = await Election.find().populate("candidates", "name party photo");
    res.status(200).json(elections);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ==========================
// Get Single Election by ID
// ==========================
const getElectionById = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id).populate(
      "candidates",
      "name party photo votes"
    );
    if (!election) return res.status(404).json({ message: "Election not found" });
    res.status(200).json(election);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ==========================
// Update Election (Admin Only)
// ==========================
const updateElection = async (req, res) => {
  try {
    const election = await Election.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!election) return res.status(404).json({ message: "Election not found" });
    res.status(200).json(election);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ==========================
// Delete Election (Admin Only)
// ==========================
const deleteElection = async (req, res) => {
  try {
    const election = await Election.findByIdAndDelete(req.params.id);
    if (!election) return res.status(404).json({ message: "Election not found" });

    // Delete all candidates of this election
    await Candidate.deleteMany({ election: req.params.id });
 await Log.create({
      message: `Election deleted: ${election.title}`,
    });

    res.status(200).json({ message: "Election and related candidates deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ==========================
// End Election Manually (Admin Only)
// ==========================
const endElection = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ message: "Election not found" });

    election.endDate = new Date(); // Set endDate to now
    await election.save();

    res.status(200).json({ message: "Election ended successfully", election });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ==========================
// Get Election Results (Admin Only)
// ==========================
const getResults = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id).populate(
      "candidates",
      "name votes party"
    );

    if (!election) return res.status(404).json({ message: "Election not found" });

    // Aggregate results
    const results = election.candidates.map((candidate) => ({
      candidateId: candidate._id,
      name: candidate.name,
      party: candidate.party,
      votes: candidate.votes ? candidate.votes.length : 0,
    }));

    // Sort candidates by votes descending
    results.sort((a, b) => b.votes - a.votes);

    res.status(200).json({
      election: {
        id: election._id,
        title: election.title,
        description: election.description,
        startDate: election.startDate,
        endDate: election.endDate,
      },
      results,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createElection,
  getElections,
  getElectionById,
  updateElection,
  deleteElection,
  endElection,
  getResults,
};

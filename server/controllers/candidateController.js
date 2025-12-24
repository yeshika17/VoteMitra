const Candidate = require("../models/candidateModel");
const Election = require("../models/electionModel");
const Log = require("../models/LogModel");

// ==========================
// Add Candidate (Admin Only)
// ==========================
const addCandidate = async (req, res) => {
  try {
    const { name, photo, party, electionId } = req.body;
    if (!name || !electionId) return res.status(400).json({ message: "Candidate name and election ID required" });

    const candidate = await Candidate.create({ name, photo, party, election: electionId });

    // Log creation
    await Log.create({ message: `Candidate added: ${candidate.name} (${candidate.party})` });

    // Update election
    await Election.findByIdAndUpdate(electionId, { $push: { candidates: candidate._id } });

    res.status(201).json(candidate);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getAllCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find()
      .populate("election", "title");
    res.status(200).json(candidates);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ==========================
// Get Candidates by Election (Voter/Admin)
// ==========================
const getCandidatesByElection = async (req, res) => {
  try {
    const candidates = await Candidate.find({ election: req.params.electionId });
    res.status(200).json(candidates);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ==========================
// Update Candidate (Admin Only)
// ==========================
const updateCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!candidate) return res.status(404).json({ message: "Candidate not found" });
    res.status(200).json(candidate);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ==========================
// Delete Candidate (Admin Only)
// ==========================
const deleteCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndDelete(req.params.id);
    if (!candidate) return res.status(404).json({ message: "Candidate not found" });

    // Remove candidate from election's candidates array
    await Election.findByIdAndUpdate(candidate.election, { $pull: { candidates: candidate._id } });
await Log.create({
  message: `Candidate deleted: ${candidate.name} (${candidate.party})`,
});

    res.status(200).json({ message: "Candidate deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { addCandidate, getCandidatesByElection, getAllCandidates,  updateCandidate, deleteCandidate };

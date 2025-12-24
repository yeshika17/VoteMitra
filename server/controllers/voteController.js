const Election = require("../models/electionModel");
const Candidate = require("../models/candidateModel");
const User = require("../models/userModel");
// POST /api/vote
const vote = async (req, res) => {
  try {
    const voterId = req.user._id;
    const { electionId, candidateId } = req.body;

    if (!electionId || !candidateId) {
      return res.status(400).json({
        message: "Election ID and Candidate ID required",
      });
    }
      const voter = await User.findById(voterId);
    if (!voter) return res.status(404).json({ message: "Voter not found" });
if (voter.isBlocked) {
      return res.status(403).json({ message: "You are blocked from voting" });
    }
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }

    const now = new Date();
    if (now < election.startDate || now > election.endDate) {
      return res.status(400).json({ message: "Election is not active" });
    }

    //✅ already voted check
    if (election.votes.includes(voterId)) {
      return res.status(400).json({
        message: "You have already voted in this election",
      });
    }

    const candidate = await Candidate.findById(candidateId);
    if (!candidate || candidate.election.toString() !== electionId) {
      return res.status(400).json({
        message: "Invalid candidate for this election",
      });
    }

    // ✅ RECORD VOTE
    election.votes.push(voterId);
    await election.save();

    candidate.votes += 1;
    await candidate.save();

    res.status(200).json({ message: "Vote submitted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { vote };

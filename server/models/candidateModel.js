const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  party: { type: String, required: true },
  photo: { type: String, default: "" },

  election: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Election",
    required: true 
  },

  // ✅ ADD THIS
  votes: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Candidate", candidateSchema);

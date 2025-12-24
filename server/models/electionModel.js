const mongoose = require("mongoose");

const electionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  candidates: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
    },
  ],
  votes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // optional: array of voter IDs who voted
    },
  ],
}, { timestamps: true });

const Election = mongoose.model("Election", electionSchema);
module.exports = Election;

const mongoose = require("mongoose");

const logSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
    },
  },
  { timestamps: true } // <-- This automatically adds createdAt and updatedAt
);

module.exports = mongoose.model("Log", logSchema);

import React, { useState } from "react";

function CandidateForm({ onClose, onSubmit, elections }) {
  const [name, setName] = useState("");
  const [party, setParty] = useState("");
  const [photo, setPhoto] = useState("");
  const [selectedElection, setSelectedElection] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedElection) {
      alert("Please select an election");
      return;
    }

    const form = { name, party, photo };
    onSubmit(form, selectedElection);

    setName("");
    setParty("");
    setPhoto("");
    setSelectedElection("");
  };

  return (
    <div className="popup">
      <div className="popup-content">
        <h2>Add Candidate</h2>

        <form onSubmit={handleSubmit}>
          <input
            placeholder="Candidate Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            placeholder="Party"
            value={party}
            onChange={(e) => setParty(e.target.value)}
            required
          />

          <input
            placeholder="Photo URL"
            value={photo}
            onChange={(e) => setPhoto(e.target.value)}
          />

          {/* ✅ ELECTION DROPDOWN */}
          <select
            value={selectedElection}
            onChange={(e) => setSelectedElection(e.target.value)}
            required
          >
            <option value="">Select Election</option>
            {elections.map((e) => (
              <option key={e._id} value={e._id}>
                {e.title}
              </option>
            ))}
          </select>

          <button type="submit">Add</button>
          <button type="button" className="close-btn" onClick={onClose}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}

export default CandidateForm;

import React, { useEffect, useState } from "react";
import api from "../api/axios";
import "../css/VoterEntrance.css";

const VoteEntrance = () => {
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedElectionDetails, setSelectedElectionDetails] = useState(null);

  useEffect(() => {
    api.get("/api/elections").then((res) => {
      const ongoing = res.data.filter((e) => {
        const now = new Date();
        return now >= new Date(e.startDate) && now <= new Date(e.endDate);
      });
      setElections(ongoing);
    });
  }, []);

  const loadCandidates = async (electionId) => {
    setSelectedElection(electionId);
    setLoading(true);

    const electionInfo = elections.find((e) => e._id === electionId);
    setSelectedElectionDetails(electionInfo);

    try {
      const res = await api.get(`/api/candidates/${electionId}`);
      setCandidates(res.data);
    } catch (err) {
      console.error("Failed to load candidates:", err);
      setCandidates([]);
    }

    setLoading(false);
  };

  const closeCandidates = () => {
    setSelectedElection(null);
    setCandidates([]);
    setSelectedElectionDetails(null);
  };

  const voteCandidate = async (candidateId) => {
    if (!window.confirm("Are you sure you want to vote?")) return;

    try {
      await api.post("/api/vote", {
        candidateId,
        electionId: selectedElection,
      });
      alert("✅ Vote cast successfully");
      setHasVoted(true);
    } catch (err) {
      alert(err.response?.data?.message || "Voting failed");
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="vote-container">
      <h1>🗳️ Cast Your Vote</h1>

      {/* WELCOME MESSAGE */}
      {selectedElection === null && !hasVoted && (
        <div className="welcome-message">
          <p>Welcome to the Secure Online Voting Platform</p>
          <p className="tagline">Your voice matters. Make it count! 🌟</p>
        </div>
      )}

      {/* ELECTION SELECTION */}
      {selectedElection === null && (
        <div className="election-box">
          <h2>Select Election</h2>
          
          {elections.length === 0 && (
            <div className="no-elections">
              <p>📭 No active elections at the moment</p>
              <p className="info-text">Please check back later or contact the administrator</p>
            </div>
          )}

   <div className="election-info-banner">
  <p style={{ color: '#333', margin: 0, fontWeight: '700', fontSize: '1.3rem' }}>
    📊 {elections.length} Active Election{elections.length > 1 ? 's' : ''} Available
  </p>
</div>

          {elections.map((e) => (
            <button
              key={e._id}
              className="election-btn"
              onClick={() => loadCandidates(e._id)}
            >
              <div className="election-btn-content">
                <span className="election-name">{e.title}</span>
                <span className="election-date">
                  📅 Ends: {formatDate(e.endDate)}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* CANDIDATES SECTION */}
      {selectedElection && (
        <>
          <div className="election-header">
            <h2 className="election-title">
              {elections.find((e) => e._id === selectedElection)?.title}
            </h2>

            <button className="close-btn-small" onClick={closeCandidates}>
              ✖
            </button>
          </div>

          {/* ELECTION DETAILS */}
          {selectedElectionDetails && (
            <div className="election-details-card">
              <div className="detail-item">
                <span className="detail-label">📅 Start Date:</span>
                <span className="detail-value">{formatDate(selectedElectionDetails.startDate)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">⏰ End Date:</span>
                <span className="detail-value">{formatDate(selectedElectionDetails.endDate)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">👥 Total Candidates:</span>
                <span className="detail-value">{candidates.length}</span>
              </div>
            </div>
          )}

          {loading && <p className="loading-text">Loading candidates...</p>}

          {!loading && candidates.length === 0 && (
            <div className="no-candidates">
              <p>No candidates registered for this election yet</p>
            </div>
          )}

          {/* CANDIDATES GRID - NOW ON TOP */}
          <div className="candidate-grid">
            {candidates.map((c, index) => (
              <div key={c._id} className="candidate-card">
                <div className="candidate-number">#{index + 1}</div>
                <h3>{c.name}</h3>
                <p>
                  🏳️ Party: <b>{c.party}</b>
                </p>
                {c.manifesto && (
                  <p className="manifesto">
                    📢 "{c.manifesto}"
                  </p>
                )}
                <button
                  className="vote-btn"
                  onClick={() => voteCandidate(c._id)}
                  disabled={hasVoted}
                >
                  {hasVoted ? "Already Voted" : "Vote"}
                </button>
              </div>
            ))}
          </div>

          {/* VOTING INSTRUCTIONS - NOW BELOW CANDIDATES */}
          {candidates.length > 0 && (
            <div className="voting-instructions">
              <h3>📋 How to Vote:</h3>
              <ol>
                <li>Review all candidate profiles carefully</li>
                <li>Click the "Vote" button for your chosen candidate</li>
                <li>Confirm your selection when prompted</li>
                <li>Your vote will be recorded securely and anonymously</li>
              </ol>
              <p className="warning">⚠️ Note: You can only vote once per election</p>
            </div>
          )}

          {/* FOOTER INFO */}
          <div className="footer-info">
            <p>🔒 Your vote is secure, encrypted, and anonymous</p>
            <p>💡 Need help? Contact support at yeshika139@gmail.com</p>
          </div>
        </>
      )}
    </div>
  );
};

export default VoteEntrance;
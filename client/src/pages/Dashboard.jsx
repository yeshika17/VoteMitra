import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import api from "../api/axios";
import "../css/AdminDashboard.css";
import CandidateForm from "./Candidateform.jsx";
import { useLocation } from "react-router-dom";
import dashboardImg from "../img/download.jpg";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalElections: 0,
    totalVoters: 0,
    totalCandidates: 0,
    ongoingElections: 0,
  });

  const [showCandidateForm, setShowCandidateForm] = useState(false);
  const [selectedElectionId, setSelectedElectionId] = useState(null);
  // At the top of AdminDashboard component
  const [declaredResult, setDeclaredResult] = useState([]);
  const [showResultPopup, setShowResultPopup] = useState(false);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchTerm = queryParams.get("search")?.toLowerCase() || "";

  // 2. Create filtered lists (These update automatically when searchTerm changes)

  const addCandidate = async (form, electionId) => {
    try {
      const finalForm = {
        ...form,
        electionId       // backend expects THIS exact key
      };

      await api.post(`/api/candidates`, finalForm);

      setShowCandidateForm(false);  // close popup
      fetchData();                  // refresh UI

    } catch (err) {
      console.log("ERROR RESPONSE:", err.response?.data);
      alert("Error adding candidate");
    }
  };

  const [elections, setElections] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [voters, setVoters] = useState([]);
  const [logs, setLogs] = useState([]);

  const [newElection, setNewElection] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
  });
  const displayElections = elections.filter((e) =>
    e.title.toLowerCase().includes(searchTerm)
  );

  const displayVoters = voters.filter((v) =>
    v.username.toLowerCase().includes(searchTerm) ||
    v._id.toLowerCase().includes(searchTerm)
  );

  const displayCandidates = candidates.filter((c) =>
    c.name.toLowerCase().includes(searchTerm) ||
    c.party.toLowerCase().includes(searchTerm)
  );
  // ---------------------------------------------------
  // FETCH DATA
  // ---------------------------------------------------
  const getStatus = (e) => {
    const now = new Date();
    if (now < new Date(e.startDate)) return "Upcoming";
    if (now > new Date(e.endDate)) return "Ended";
    return "Ongoing";
  };


  const openCandidateForm = () => {
    if (elections.length === 0) {
      alert("Create an election first!");
      return;
    }
    // default: first election
    setShowCandidateForm(true);
  };
  const fetchData = async () => {
    try {
      // 1️⃣ Load elections first
      const electionRes = await api.get("/api/elections");
      setElections(electionRes.data);

      // 2️⃣ Load candidates only when election exists
      let candidateData = [];
      if (electionRes.data.length > 0) {

        const candidateRes = await api.get("/api/candidates/");
        candidateData = candidateRes.data;
        setCandidates(candidateData);
      }

      // 3️⃣ Load voters
      const voterRes = await api.get("/api/auth/getvoters");
      setVoters(voterRes.data);
      console.log("VOTERS RESPONSE:", voterRes.data);


     // 4️⃣ Load logs
      const logRes = await api.get("/api/auth/logs");
      setLogs(logRes.data);

      // 5️⃣ Stats
      const ongoing = electionRes.data.filter(
        (e) =>
          new Date(e.startDate) <= new Date() &&
          new Date(e.endDate) >= new Date()
      ).length;

      setStats({
        totalElections: electionRes.data.length,
        totalCandidates: candidateData.length,
        totalVoters: voterRes.data.length,
        ongoingElections: ongoing,
      });
    } catch (err) {
      console.error("Error loading data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ---------------------------------------------------
  // CREATE ELECTION
  // ---------------------------------------------------
  const handleCreateElection = async (e) => {
    e.preventDefault();

    if (!newElection.title || !newElection.startDate || !newElection.endDate) {
      alert("Please fill all fields");
      return;
    }

    try {
      await api.post("/api/elections", newElection);
      setNewElection({ title: "", description: "", startDate: "", endDate: "" });
      fetchData();
    } catch (err) {
      console.error("Error creating election:", err);
    }
  };

  // ------------------------------
  // DELETE ELECTION
  // ------------------------------
  const deleteElection = async (id) => {
    if (!window.confirm("Are you sure you want to delete this election?")) return;

    try {
      // Call backend DELETE route
      await api.delete(`/api/elections/${id}`);
      alert("Election deleted successfully");
      // Refresh data after deletion
      fetchData();
    } catch (err) {
      console.error("Error deleting election:", err);

      // Show better error message
      if (err.response) {
        alert(`Delete failed: ${err.response.data.message || err.response.statusText}`);
      } else {
        alert("Delete failed: Network or server ror");
      }
    }
  };

  // ---------------------------------------------------
  // BLOCK / UNBLOCK VOTER
  // ---------------------------------------------------
 const toggleVoterStatus = async (id) => {
  try {
    await api.put(`/api/auth/voters/${id}/block`); // call backend toggle route
    fetchData(); // refresh voter list
  } catch (err) {
    console.error("Error updating voter:", err);
    alert("Failed to update voter status");
  }
};

  // ------------------------------
  // DELETE CANDIDATE
  // ------------------------------
  const deleteCandidate = async (id) => {
    if (!window.confirm("Are you sure you want to delete this candidate?")) return;

    try {
      await api.delete(`/api/candidates/${id}`);
      alert("Candidate deleted successfully");
      fetchData();
    } catch (err) {
      console.error("Error deleting candidate:", err);
      alert("Failed to delete candidate");
    }
  };

  // ---------------------------------------------------
  // CHART
  // ---------------------------------------------------
  const resultsData = {
    labels: candidates.map((c) => c.name),
    datasets: [
      {
        label: "Votes (Demo Data)",
        data: candidates.map(() => Math.floor(Math.random() * 100)),
        backgroundColor: ["#36A2EB", "#FF6384", "#FFCE56", "#5FBD89"],
      },
    ],
  };

  return (
    <div className="admin-dashboard">
      <h1>🧑‍💼 Admin Dashboard</h1>

      {/* Quick Stats */}
      <div className="stats-container">
        <div className="stat-card">🗳️ Elections: {stats.totalElections}</div>
        <div className="stat-card">👥 Voters: {stats.totalVoters}</div>
        <div className="stat-card">🧍 Candidates: {stats.totalCandidates}</div>
        <div className="stat-card">📊 Ongoing: {stats.ongoingElections}</div>
      </div>

      <div className="dashboard-content-wrapper">
        {/* Left Column */}
        <div className="dashboard-top-row">
          {/* CREATE ELECTIONS */}
          <section className="election-section">
            <h2>Create Elections</h2>
            <form className="election-form" onSubmit={handleCreateElection}>
              <input
                type="text"
                placeholder="Election Title"
                value={newElection.title}
                onChange={(e) =>
                  setNewElection({ ...newElection, title: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Description"
                value={newElection.description}
                onChange={(e) =>
                  setNewElection({ ...newElection, description: e.target.value })
                }
              />
              <label>Start Date</label>
              <input
                type="date"
                
                value={newElection.startDate}
                onChange={(e) =>
                  setNewElection({ ...newElection, startDate: e.target.value })
                }
              /> <label>End Date</label>
              <input
                type="date"
                value={newElection.endDate}
                onChange={(e) =>
                  setNewElection({ ...newElection, endDate: e.target.value })
                }
              />
              <button type="submit">Create Election</button>
            </form>

            {/* EXISTING ELECTIONS */}
            <div className="election-list">
              <h3>Existing Elections</h3>
              <ul>
                {displayElections.map((e) => (
                  <li key={e._id}>
                    {e.title} — <b>{getStatus(e)}</b>
                    <button onClick={() => deleteElection(e._id)}>Delete</button>
                  </li>
                ))}
                {displayElections.length === 0 && <p>No elections found.</p>}
              </ul>
            </div>
          </section>
          <img src={dashboardImg} alt="Vote karo" className="dashboard-image" />

         

        </div>

        {/* Right Column */}
        <div className="dashboard-bottom-row">
          {/* VOTER MANAGEMENT */}

 {/* CANDIDATES */}
          <section className="candidate-section">
            <h2>Manage Candidates</h2>

            <button onClick={openCandidateForm} className="add-btn">
              ➕ Add Candidate
            </button>

            <table>
              <thead>
                <tr>
                  <th>Candidate ID</th>
                  <th>Name</th>
                  <th>Party</th>
                  <th>Election</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {displayCandidates.length === 0 ? (
                  <tr><td colSpan="5" style={{ textAlign: "center" }}>No candidates found</td></tr>
                ) : (
                  displayCandidates.map((c) => (
                    <tr key={c._id}>
                      <td>{c._id.slice(-4)}</td>
                      <td>{c.name}</td>
                      <td>{c.party}</td>
                      <td>{c.election?.title || "N/A"}</td>
                      <td><button onClick={() => deleteCandidate(c._id)}>Delete</button></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* FORM POPUP */}
            {showCandidateForm && (
              <CandidateForm
                onClose={() => setShowCandidateForm(false)}
                onSubmit={addCandidate}
                elections={elections}   // ✅ PASS THIS
              />
            )}

          </section>
         
          <section className="users-section">
            <h2>Manage Voters</h2>
            <table>
              <thead>
                <tr>
                  <th>Voter ID</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
             <tbody>
  {displayVoters.length === 0 ? (
    <tr><td colSpan="4" style={{ textAlign: "center" }}>No voters found</td></tr>
  ) : (
    displayVoters.map((v) => (
      <tr key={v._id}>
        <td>{v._id.slice(-4)}</td>
        <td>{v.username}</td>
        <td>{v.isBlocked ? "Blocked" : "Active"}</td>
        <td>
          <button onClick={() => toggleVoterStatus(v._id)}>
            {v.isBlocked ? "Unblock" : "Block"}
          </button>
        </td>
      </tr>
    ))
  )}
</tbody>

            </table>
          </section>

          {/* CHART */}
<section className="results-section">
  <h2>View Results</h2>

  {/* Election Selector */}
  <select
    value={selectedElectionId || ""}
    onChange={(e) => setSelectedElectionId(e.target.value)}
  >
    <option value="">-- Select Election --</option>
    {elections.map((e) => (
      <option key={e._id} value={e._id}>
        {e.title}
      </option>
    ))}
  </select>

  {/* Popup showing top 5 candidates */}
 {showResultPopup && declaredResult.length > 0 && (
  <>
    <div className="result-overlay" onClick={() => setShowResultPopup(false)}></div>
    <div className="result-popup">
      <h3>🏆 Election Results (Top 5)</h3>
      {declaredResult.map((c, idx) => (
        <div key={c._id} className={`candidate-card ${idx}`}>
          <b>{idx + 1}. {c.name}</b> ({c.party}) — Votes: {c.votes}
        </div>
      ))}
      <button onClick={() => setShowResultPopup(false)}>Close</button>
    </div>
  </>
)}


  {selectedElectionId && (
    <div style={{ marginTop: "20px" }}>
      {/* Chart */}
      <Bar
        data={{
          labels: candidates
            .filter((c) => c.election?._id === selectedElectionId)
            .map((c) => c.name),
          datasets: [
            {
              label: "Votes",
              data: candidates
                .filter((c) => c.election?._id === selectedElectionId)
                .map((c) => c.votes),
              backgroundColor: ["#36A2EB", "#FF6384", "#FFCE56", "#5FBD89"],
            },
          ],
        }}
      />

      {/* Buttons */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
        <button
          onClick={() => {
            const result = candidates
              .filter((c) => c.election?._id === selectedElectionId)
              .sort((a, b) => b.votes - a.votes)
              .slice(0, 5); // only top 5
            setDeclaredResult(result);
            setShowResultPopup(true); // show popup
          }}
        >
          🎉 Declare Result
        </button>

        <button
          onClick={() => {
            const electionCandidates = candidates.filter(
              (c) => c.election?._id === selectedElectionId
            );

            const csvContent =
              "data:text/csv;charset=utf-8," +
              ["Name,Party,Votes"]
                .concat(
                  electionCandidates.map((c) => `${c.name},${c.party},${c.votes}`)
                )
                .join("\n");

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute(
              "download",
              `ElectionResults_${selectedElectionId}.csv`
            );
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
        >
          💾 Download CSV
        </button>
      </div>

      {/* Result Cards Below Chart */}
      {declaredResult && declaredResult.length > 0 && (
        <div className="result-cards">
          {declaredResult.map((c, idx) => (
            <div
              key={c._id}
              style={{
                padding: "10px",
                margin: "5px 0",
                background: "#f0f8ff",
                borderRadius: "10px",
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <div>
                <b>{idx + 1}. {c.name}</b> ({c.party})
              </div>
              <div>Votes: {c.votes}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )}
</section>



          {/* LOGS */}
          <section className="logs-section">
            <h2>Activity Logs</h2>
            <ul>
              {logs.map((log) => (
                <li key={log._id}>🔔 {log.message}</li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

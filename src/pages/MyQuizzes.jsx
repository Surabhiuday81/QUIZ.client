// client/src/pages/MyQuizzes.jsx
import React, { useEffect, useState } from "react";
import API from "../api/api";
import '../styles/MyQuizzes.css'; // Assuming this file contains all the required CSS classes
import { useNavigate } from "react-router-dom";

/**
 * MyQuizzes page
 * - Fetches GET /api/quizzes/my
 * - Renders cards for each quiz with stats
 * - Clicking "Leaderboard" opens a modal that fetches GET /api/quizzes/:id/leaderboard
 */

// Helper to format date strings consistently
function formatDateString(d) {
  if (!d) return "—";
  const dt = new Date(d);
  return dt.toLocaleString();
}

export default function MyQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const [leaderboardOpenFor, setLeaderboardOpenFor] = useState(null); // quizId
  const [leaderboardTitle, setLeaderboardTitle] = useState("");
  const [leaderboardRows, setLeaderboardRows] = useState([]);
  const [lbLoading, setLbLoading] = useState(false);
  const [lbErr, setLbErr] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    loadMyQuizzes();
    // eslint-disable-next-line
  }, []);

  async function loadMyQuizzes() {
    setLoading(true);
    setErr(null);
    try {
      const res = await API.get("/quizzes/my"); 
      // Handle data coming as an array or nested under a key like 'quizzes'
      setQuizzes(res.data.quizzes || res.data || []); 
    } catch (e) {
      console.error("Failed to load my quizzes", e);
      setErr(e?.response?.data?.error || e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  async function openLeaderboard(quizId, title) {
    setLeaderboardOpenFor(quizId);
    setLeaderboardTitle(title);
    setLbLoading(true);
    setLbErr(null);
    setLeaderboardRows([]);
    try {
      // Endpoint used by the modal logic
      const res = await API.get(`/quizzes/${quizId}/leaderboard?limit=50`);
      setLeaderboardRows(res.data.leaderboard || []);
    } catch (e) {
      console.error("Failed to load leaderboard", e);
      setLbErr(e?.response?.data?.error || e.message || "Failed to load leaderboard");
    } finally {
      setLbLoading(false);
    }
  }

  function closeLeaderboard() {
    setLeaderboardOpenFor(null);
    setLeaderboardRows([]);
    setLbErr(null);
    setLeaderboardTitle("");
  }
  
  async function handleRegenerate(quizId, idx) {
    try {
      const res = await API.post(`/quizzes/${quizId}/regenerate-share`);
      const updated = { ...quizzes[idx], shareCode: res.data.shareCode, shareExpiresAt: res.data.shareExpiresAt };
      const copy = quizzes.slice();
      copy[idx] = updated;
      setQuizzes(copy);
      alert("New private link generated and expiry set to 24 hours.");
    } catch (e) {
      console.error("Regenerate error", e);
      alert(e?.response?.data?.error || "Failed to regenerate link");
    }
  }

  function copyLink(code) {
    const url = `${window.location.origin}/p/${code}`;
    navigator.clipboard.writeText(url).then(() => {
      alert("Link copied to clipboard");
    }).catch(() => {
      prompt("Copy this URL", url);
    });
  }

  return (
    <div className="app-container-max">
      <div className="header-flex-container">
        <h2 className="header-impact">📚 My Quizzes</h2>
        <div className="text-muted-small">Manage quizzes you created</div>
      </div>

      {err && <div className="alert-error-prominent">{err}</div>}
      {loading && <p className="loading-state">Loading...</p>}

      {!loading && quizzes.length === 0 && (
        <div className="card-empty-state">
          <p>You haven't created any quizzes yet.</p>
          <button className="button-action button-generate-primary" onClick={() => navigate("/create")}>
            + Create a quiz
          </button>
        </div>
      )}

      <div className="quiz-list-grid">
        {quizzes.map((q, idx) => {
          // 🏆 FIX APPLIED: Robust data retrieval for statistics 
          // Check for nested 'stats' object or use 'q' itself, and check for common key names.
          const quizStats = q.stats || q;
          const stats = {
              totalAttempts: quizStats.totalAttempts || quizStats.attempts || 0,
              avgScore: quizStats.avgScore || 0,
              lastAttempt: quizStats.lastAttempt || quizStats.lastFinishedAt || null,
          };
          
          return (
            <div key={q._id} className="quiz-card-item quiz-card-grid-layout">
              <div className="quiz-info-block">
                <div className="quiz-header-row">
                  <h3 className="quiz-title-prominent">{q.title}</h3>
                  
                  {/* Status/Question Count Metadata */}
                  <div className="quiz-status-metadata">
                    <span className={`status-badge ${q.isPublic ? 'status-public' : 'status-private'}`}>
                      {q.isPublic ? "Public" : "Private"}
                    </span>
                    &bull; {q.questionsCount} {q.questionsCount === 1 ? "question" : "questions"}
                  </div>
                </div>

                <div className="quiz-description-text">{q.description?.slice(0, 200) || "No description provided."}</div>
              
                {/* Stats Row - Now correctly using the resolved 'stats' object */}
                <div className="quiz-stats-row">
                  <div className="stat-group">
                    <div className="stat-label">Attempts</div>
                    <div className="stat-value">{stats.totalAttempts}</div>
                  </div>

                  <div className="stat-group">
                    <div className="stat-label">Avg score</div>
                    <div className="stat-value">{Math.round((stats.avgScore || 0) * 100) / 100}</div>
                  </div>

                  <div className="stat-group">
                    <div className="stat-label">Last attempt</div>
                    <div className="stat-value-small">{stats.lastAttempt ? formatDateString(stats.lastAttempt) : "—"}</div>
                  </div>
                </div>
                
                {/* Private Share Link Block */}
                {q.isPublic === false && q.shareCode && (
                  <div className="private-link-block">
                    <div className="private-link-details">
                      <div className="private-link-header">Private Link</div>
                      <code className="private-link-code">{window.location.origin}/p/{q.shareCode}</code>
                      <div className="private-link-expiry">
                          Expires: {q.shareExpiresAt ? formatDateString(q.shareExpiresAt) : "—"}
                      </div>
                    </div>

                    <div className="button-tray-inline">
                      <button className="button-action button-primary-icon" onClick={() => copyLink(q.shareCode)}>
                          📋 Copy
                      </button>
                      <button className="button-action button-secondary-ghost" onClick={() => handleRegenerate(q._id, idx)}>
                          🔄 Regenerate
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Action Column */}
              <div className="quiz-action-column quiz-action-column-right">
                <div className="button-tray-stacked">
                  <button 
                    className="button-action button-leaderboard-accent" 
                    onClick={() => openLeaderboard(q._id, q.title)}
                  >
                    🏆 Leaderboard
                  </button>
                  <button className="button-action button-primary-ghost" onClick={() => navigate(`/quiz/${q._id}`)}>
                    View Quiz
                  </button>
                  <button className="button-action button-primary-ghost" onClick={() => navigate(`/edit-quiz/${q._id}`)}>
                    Edit Quiz
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Leaderboard modal */}
      {leaderboardOpenFor && (
        <div className="modal-overlay">
          <div className="modal-content-large">
            <div className="modal-header-flex">
              <h3 className="section-header-xlarge">Leaderboard for: {leaderboardTitle}</h3>
              <button onClick={closeLeaderboard} className="button-action button-ghost-secondary">Close</button>
            </div>

            <div className="modal-body">
              {lbLoading && <p className="loading-state">Loading leaderboard...</p>}
              {lbErr && <div className="alert-error-prominent">{lbErr}</div>}

              {!lbLoading && !lbErr && leaderboardRows.length === 0 && <p className="text-muted-center">No attempts yet for this quiz.</p>}

              {!lbLoading && leaderboardRows.length > 0 && (
                <table className="data-table-compact">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>User</th>
                      <th>Best Score</th>
                      <th>Attempts</th>
                      <th>Last Finished</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboardRows.map((r, idx) => (
                      <tr key={String(r.userId) || idx} className={idx < 3 ? 'highlight-row' : ''}>
                        <td className="rank-cell">{idx + 1}</td>
                        <td>{r.username || r.email || "User"}</td>
                        <td><strong style={{color: 'var(--color-accent)'}}>{r.bestScore}</strong></td>
                        <td>{r.attempts}</td>
                        <td>{r.lastFinishedAt ? formatDateString(r.lastFinishedAt) : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// client/src/pages/Leaderboard.jsx
import React, { useEffect, useState } from "react";
import API from "../api/api";
import '../styles/Leaderboard.css';

export default function Leaderboard() {
  const [list, setList] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setErr(null);
      try {
        // NOTE: Logic remains unchanged, fetching global leaderboard
        const res = await API.get("/leaderboard?limit=50"); 
        if (!mounted) return;
        setList(res.data.top || []);
        setMyRank(res.data.myRank ?? null);
      } catch (e) {
        console.error("Failed to load leaderboard", e);
        setErr(e?.response?.data?.error || e.message || "Failed to load leaderboard");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="leaderboard-container">
      <h2 className="leaderboard-header">Global Leaderboard</h2>

      {loading && <p className="loading-state">Loading leaderboard...</p>}
      
      {err && (
        <div className="alert-error-prominent">
          {err}
        </div>
      )}

      {!loading && !err && (
        <>
          {myRank !== null && (
            <div className="user-rank-display">
              Your rank: <strong>#{myRank}</strong>
            </div>
          )}

          {list.length === 0 ? (
            <div className="card-empty-state">
              <p>No leaderboard entries yet. Be the first to score points!</p>
              <p className="text-muted-small">Create and share quizzes or attempt public quizzes to appear here.</p>
            </div>
          ) : (
            <ol className="leaderboard-list">
              {list.map((u, idx) => (
                <li key={u.username} className="leaderboard-item">
                  <div className="leaderboard-item-left">
                    <span className="rank-number">#{idx + 1}</span>
                    <div className="user-info-group">
                      <strong className="username-text">{u.username}</strong>
                      <div className="attempt-count-text">{u.stats?.quizzesAttempted ?? 0} attempts</div>
                    </div>
                  </div>
                  <div className="leaderboard-item-right">
                    <div className="points-value">{u.points ?? 0} pts</div>
                    <div className="correct-count-text">{u.stats?.totalCorrect ?? 0} correct</div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </>
      )}
    </div>
  );
}
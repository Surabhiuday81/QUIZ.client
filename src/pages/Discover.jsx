// client/src/pages/Discover.jsx
import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";

export default function Discover() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [attemptMap, setAttemptMap] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [err, setErr] = useState(null);
  const navigate = useNavigate();

  const user = useMemo(() => {
    const rawUser = localStorage.getItem("user");
    return rawUser ? JSON.parse(rawUser) : null;
  }, []);

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line
  }, []);

  async function loadAll() {
    setLoading(true);
    setErr(null);
    try {
      const res = await API.get("/quizzes?public=true&active=true");
      setQuizzes(Array.isArray(res.data) ? res.data : []);

      if (user && user.username) {
        const s = await API.get(`/users/${encodeURIComponent(user.username)}/stats?recent=200`);
        const recent = (s.data && s.data.recent) || [];
        const map = {};
        recent.forEach((session) => {
          const quizId = session.quiz && session.quiz._id ? String(session.quiz._id) : String(session.quiz);
          if (!quizId) return;
          const sessionTime = session.finishedAt ? new Date(session.finishedAt).getTime() : 0;
          if (!map[quizId] || sessionTime > map[quizId]._t) {
            map[quizId] = {
              score: session.score ?? 0,
              totalQuestions: session.totalQuestions ?? 0,
              _t: sessionTime
            };
          }
        });
        setAttemptMap(map);
      }
    } catch (e) {
      console.error("Failed to load data:", e);
      setErr(e?.response?.data?.error || e.message || "Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  }

  // --- CLIENT-SIDE SEARCH FILTER ---
  const filteredQuizzes = useMemo(() => {
    if (!searchTerm) return quizzes;
    const lowerCaseTerm = searchTerm.toLowerCase();

    return quizzes.filter(q => (
      q.title?.toLowerCase().includes(lowerCaseTerm) ||
      q.topic?.toLowerCase().includes(lowerCaseTerm) ||
      q.description?.toLowerCase().includes(lowerCaseTerm)
    ));
  }, [quizzes, searchTerm]);

  function handleStart(quizId, isAttempted) {
    if (isAttempted) return;
    
    const token = localStorage.getItem("token");
    if (!token) {
      if (window.confirm("You must log in to start this quiz. Go to login?")) {
        navigate("/auth");
      }
      return;
    }
    navigate(`/play?quizId=${quizId}`);
  }

  // Helper to determine badge background color
  function getScoreBadgeStyle(score, total) {
      if (total === 0) return { background: '#fef3c7', color: '#92400e' };
      const percentage = score / total;
      if (percentage >= 0.8) return { background: '#d1fae5', color: '#065f46' }; // Success
      if (percentage >= 0.5) return { background: '#ffedd5', color: '#92400e' }; // Moderate
      return { background: '#fee2e2', color: '#991b1b' }; // Low
  }

  return (
    <div style={styles.container}>
      
      {/* --- HEADER & SEARCH BAR --- */}
      <div style={styles.headerArea}>
        <div>
          <h1 style={styles.headerTitle}>Explore Public Quizzes</h1>
          <div style={styles.headerSubtitle}>
            {user ? `Welcome back, ${user.username}` : "Available for all users."}
          </div>
        </div>
        
        <input
            type="text"
            placeholder={`Search ${quizzes.length} quizzes...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchBar}
        />
      </div>

      {err && <div style={styles.alertError}>{err}</div>}
      {loading && <p style={styles.loadingState}>Loading quizzes...</p>}

      {!loading && quizzes.length === 0 && (
        <div style={styles.emptyStateCard}>
          <p>No public quizzes found. Create one to get started!</p>
        </div>
      )}
      
      {/* --- QUIZ LIST --- */}
      <div style={styles.quizList}>
        {filteredQuizzes.map((q) => {
          const quizId = q._id || q.id;
          const attempted = attemptMap[quizId];
          const totalQuestions = q.questionsCount || q.questions?.length || 0;
          const isAttempted = !!attempted;
          const scoreBadgeStyle = attempted ? getScoreBadgeStyle(attempted.score, totalQuestions) : {};

          return (
            <div key={quizId} className="card-anim" style={styles.quizCard}>
                
                {/* Left/Main Content Block */}
                <div style={styles.quizInfoBlock}>
                    <h3 style={styles.quizCardTitle}>{q.title}</h3>
                    
                    <div style={styles.quizMetadata}>
                        <span style={styles.pillBadge}>{q.topic || "General"}</span>
                        <span>{totalQuestions} questions</span>
                    </div>
                    
                    <p style={styles.quizDescription}>
                        {q.description?.slice(0, 160) || "No description provided."}
                        {q.description?.length > 160 ? '...' : ''}
                    </p>
                </div>

                {/* Right/Action Block */}
                <div style={styles.quizActionBlock}>
                    
                    {/* Status/Score Row */}
                    <div style={styles.statusScoreRow}>
                        {isAttempted ? (
                             <div style={{...styles.scoreBadge, ...scoreBadgeStyle}}>
                                Score: **{attempted.score}/{totalQuestions}**
                            </div>
                        ) : (
                            <div style={styles.scoreBadgeNotAttempted}>
                                Not Attempted
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div style={styles.buttonTray}>
                        <Link to={`/quiz/${quizId}`} style={styles.buttonViewLink}>
                            <button style={styles.buttonView}>View</button>
                        </Link>
                        
                        <button
                            onClick={() => handleStart(quizId, isAttempted)}
                            disabled={isAttempted}
                            title={isAttempted ? "You have already attempted this quiz." : "Start quiz"}
                            style={isAttempted ? styles.buttonAttempted : styles.buttonStart}
                        >
                            {isAttempted ? "Revising" : "Start Quiz"}
                        </button>
                    </div>

                </div>
            </div>
          );
        })}
      </div>
      
      {!loading && filteredQuizzes.length === 0 && quizzes.length > 0 && (
         <p style={styles.noResults}>No quizzes match your search criteria "{searchTerm}".</p>
      )}
    </div>
  );
}

// --- LOCAL STYLES (Lightweight, centralized CSS replacement) ---
const styles = {
    container: {
        maxWidth: 1200,
        margin: "30px auto",
        padding: "0 20px",
        fontFamily: 'system-ui, sans-serif',
    },
    headerArea: {
        marginBottom: '30px',
        paddingBottom: '15px',
        borderBottom: '2px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        flexWrap: 'wrap',
    },
    headerTitle: {
        fontSize: '2.2rem',
        fontWeight: 800,
        margin: 0,
        color: 'var(--text-heading)',
    },
    headerSubtitle: {
        fontSize: '1rem',
        color: 'var(--muted)',
        marginTop: '5px',
    },
    searchBar: {
        padding: '10px 15px',
        borderRadius: '8px',
        border: '1px solid var(--border)',
        width: '350px',
        maxWidth: '100%',
        fontSize: '0.95rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        background: 'var(--card)',
        color: 'var(--text)',
        marginTop: '15px', // For wrapping on small screens
    },
    alertError: {
        padding: '15px',
        background: '#fee2e2',
        color: '#991b1b',
        borderRadius: '10px',
        marginBottom: '20px',
        fontWeight: 600,
    },
    loadingState: {
        padding: '20px',
        textAlign: 'center',
        color: 'var(--muted)',
    },
    emptyStateCard: {
        padding: '30px',
        borderRadius: '12px',
        background: 'var(--card)',
        border: '1px dashed var(--border)',
        textAlign: 'center',
        marginTop: '20px',
    },
    noResults: {
        padding: '15px',
        textAlign: 'center',
        color: 'var(--muted)',
        background: 'var(--bg)',
        borderRadius: '8px',
        marginTop: '20px',
    },

    // --- QUIZ CARD DESIGN ---
    quizList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        marginTop: '20px',
    },
    quizCard: {
        padding: '20px',
        borderRadius: '12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        border: '1px solid var(--border)',
        backgroundColor: 'var(--card)',
        minHeight: '100px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    },
    quizInfoBlock: {
        flex: 1,
        marginRight: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    quizCardTitle: {
        margin: 0,
        fontSize: '1.3rem',
        fontWeight: 700,
        color: 'var(--text-heading)',
    },
    quizMetadata: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontSize: '0.9rem',
        color: 'var(--muted)',
    },
    pillBadge: {
        background: 'var(--bg)',
        padding: '4px 10px',
        borderRadius: '20px',
        fontWeight: 600,
        color: 'var(--text-body)',
        border: '1px solid var(--border)',
    },
    quizDescription: {
        marginTop: '8px',
        fontSize: '0.9rem',
        color: 'var(--text-body)',
    },

    // --- ACTION BLOCK ---
    quizActionBlock: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        alignItems: 'flex-end',
        minWidth: '220px',
        paddingLeft: '20px',
        borderLeft: '1px solid var(--border)',
    },
    statusScoreRow: {
        // Aligned top right
    },
    scoreBadge: {
        fontSize: '0.9rem',
        fontWeight: 700,
        padding: '6px 10px',
        borderRadius: '8px',
        textAlign: 'center',
    },
    scoreBadgeNotAttempted: {
        fontSize: '0.9rem',
        fontWeight: 500,
        color: 'var(--muted)',
        padding: '6px 10px',
        border: '1px dashed var(--border)',
        borderRadius: '8px',
    },

    // Action Buttons
    buttonTray: {
        display: 'flex',
        gap: '10px',
        width: '100%',
        justifyContent: 'flex-end',
    },
    buttonBase: {
        padding: '10px 15px',
        borderRadius: '8px',
        fontSize: '0.95rem',
        fontWeight: 600,
        border: 'none',
        transition: 'all 0.2s',
        cursor: 'pointer',
    },
    buttonStart: {
        padding: '10px 18px',
        background: 'var(--accent)',
        color: 'white',
        flexGrow: 1,
    },
    buttonAttempted: {
        padding: '10px 18px',
        background: 'var(--bg)',
        color: 'var(--muted)',
        border: '1px solid var(--border)',
        cursor: 'not-allowed',
        flexGrow: 1,
    },
    buttonView: {
        padding: '10px 15px',
        background: 'var(--bg)',
        color: 'var(--text-heading)',
        border: '1px solid var(--border)',
        flexGrow: 1,
    },
    buttonViewLink: {
        textDecoration: 'none',
        flexGrow: 0.5,
    }
};
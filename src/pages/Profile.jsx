// client/src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/api";

// Helper to format large numbers
function formatNumber(num) {
  return num?.toLocaleString() || 0;
}

// Custom Stat Display Component
function StatBox({ icon, value, label, color = '#2563eb' }) {
  return (
    <div style={styles.statBox}>
      <div style={{...styles.statIcon, background: color}}>{icon}</div>
      <div style={styles.statText}>
        <div style={styles.statValue}>{formatNumber(value)}</div>
        <div style={styles.statLabel}>{label}</div>
      </div>
    </div>
  );
}


export default function Profile() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Added for navigation to quiz results

  const userRaw = localStorage.getItem("user");
  const localUser = userRaw ? JSON.parse(userRaw) : null;
  const username = localUser?.username;

  useEffect(() => {
    async function load() {
      if (!username) return;
      try {
        // NOTE: If the backend needs an ID instead of username for stats, adjust here.
        const res = await API.get(`/users/${username}/stats`);
        setStats(res.data);
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [username]);

  if (!localUser)
    return (
      <div style={{ padding: 30, textAlign: 'center' }}>
        <h2 style={{ color: '#ef4444' }}>Authentication Required</h2>
        <p>Please log in to view your profile and quiz statistics.</p>
      </div>
    );

  if (loading) return <div style={{ padding: 30, textAlign: 'center' }}>Loading profile data...</div>;

  const { user, recent } = stats;

  return (
    <div style={styles.container}>
      <h1 style={styles.pageTitle}>👋 Welcome back, {user.username}!</h1>

      {/* --- 1. KEY STATISTICS DASHBOARD --- */}
      <div style={styles.statsGrid}>
        <StatBox
          icon="⭐"
          value={user.points}
          label="Total Points Earned"
          color="#2563eb"
        />
        <StatBox
          icon="📝"
          value={user.stats?.quizzesAttempted ?? 0}
          label="Quizzes Attempted"
          color="#f59e0b"
        />
        <StatBox
          icon="✅"
          value={user.stats?.totalCorrect ?? 0}
          label="Total Correct Answers"
          color="#10b981"
        />
      </div>
      
      {/* --- 2. ACCOUNT DETAILS & JOIN DATE --- */}
      <div style={styles.detailsSection}>
        <h3 style={styles.sectionHeader}>Account Details</h3>
        <div style={styles.infoRow}>
            <span>Email:</span>
            <strong style={{ color: 'var(--text-heading)' }}>{user.email}</strong>
        </div>
        <div style={styles.infoRow}>
            <span>Joined:</span>
            <strong>{new Date(user.joinedAt).toLocaleDateString()}</strong>
        </div>
      </div>

      {/* --- 3. RECENT SESSIONS --- */}
      <h3 style={styles.sectionHeader}>Recent Quiz Sessions</h3>
      {recent.length === 0 && <p style={{ color: '#64748b' }}>No recent attempts found.</p>}

      <div style={styles.sessionList}>
        {recent.map((s) => (
          <div 
            key={s._id} 
            style={styles.sessionCard}
            onClick={() => navigate(`/result/${s._id}`)} // Link to results page
          >
            <div style={styles.sessionInfo}>
              <strong style={{ fontSize: '1.1rem' }}>{s.quiz?.topic || "Quiz Attempt"}</strong>
              <div style={styles.sessionScore}>
                Score: <span style={{ fontWeight: 700, color: s.score / s.totalQuestions > 0.5 ? '#10b981' : '#f59e0b' }}>
                    {s.score}
                </span>/{s.totalQuestions}
              </div>
            </div>
            <div style={styles.sessionMeta}>
              <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                {new Date(s.finishedAt).toLocaleString()}
              </span>
              <span style={styles.viewResultBtn}>View Result →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 1000,
    margin: "30px auto",
    padding: "0 20px",
    fontFamily: 'system-ui, sans-serif',
  },
  pageTitle: {
    fontSize: '2rem',
    fontWeight: 800,
    marginBottom: '30px',
    color: 'var(--text-heading)',
  },
  sectionHeader: {
    fontSize: '1.5rem',
    fontWeight: 700,
    marginTop: '40px',
    marginBottom: '15px',
    borderBottom: '2px solid #e2e8f0',
    paddingBottom: '5px',
    color: 'var(--text-heading)',
  },
  
  // --- STATS GRID ---
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '40px',
  },
  statBox: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px 20px',
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    border: '1px solid #e2e8f0',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    fontSize: '1.5rem',
    color: '#fff',
    marginRight: '15px',
  },
  statText: {
    lineHeight: 1.3,
  },
  statValue: {
    fontSize: '1.8rem',
    fontWeight: 800,
    color: 'var(--text-heading)',
  },
  statLabel: {
    fontSize: '0.9rem',
    color: '#64748b',
    fontWeight: 500,
  },

  // --- ACCOUNT DETAILS ---
  detailsSection: {
    padding: 20,
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    border: '1px solid #e2e8f0',
    marginBottom: 40,
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px dashed #f1f5f9',
    fontSize: '1rem',
    color: '#475569',
  },
  
  // --- RECENT SESSIONS LIST ---
  sessionList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  sessionCard: {
    padding: 15,
    background: '#fff',
    borderRadius: 10,
    border: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'background 0.2s, box-shadow 0.2s, transform 0.1s',
    cursor: 'pointer',
  },
  sessionCard: {
    padding: 15,
    background: '#fff',
    borderRadius: 10,
    border: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'background 0.2s, box-shadow 0.2s, transform 0.1s',
    cursor: 'pointer',
    '&:hover': {
      background: '#f8fafc',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      transform: 'translateY(-1px)',
    }
  },
  sessionInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  sessionScore: {
    fontSize: '0.9rem',
    color: '#475569',
  },
  sessionMeta: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '4px',
  },
  viewResultBtn: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#2563eb',
    marginTop: '5px',
  }
};
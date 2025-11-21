// client/src/pages/QuizResult.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/api";

export default function QuizResult() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Data containers
  const [quiz, setQuiz] = useState(null); // Quiz title, etc.
  const [stats, setStats] = useState({ score: 0, total: 0, percent: 0 });
  const [reviewedQuestions, setReviewedQuestions] = useState([]);

  // Animation state
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    fetchSessionAndGrade();
  }, [sessionId]);

  async function fetchSessionAndGrade() {
    try {
      setLoading(true);
      
      // 1. Fetch the Session (contains score, details array, and quiz ID)
      const sessionRes = await API.get(`/sessions/${sessionId}`);
      const session = sessionRes.data;

      // CRITICAL: We rely on the backend to provide the 'details' array for review
      const finalDetails = session.details || []; 
      
      if (finalDetails.length === 0) {
           throw new Error("Session is not finished or details are unavailable.");
      }

      // 2. Fetch the original Quiz (for title/topic)
      const quizId = typeof session.quiz === 'object' ? session.quiz._id : session.quiz;
      const quizRes = await API.get(`/quizzes/${quizId}`);
      
      setQuiz(quizRes.data);

      // 3. Process Stats
      const currentScore = session.score || 0;
      const total = session.totalQuestions || 0;
      setStats({
        score: currentScore,
        total: total,
        percent: total > 0 ? Math.round((currentScore / total) * 100) : 0
      });

      setReviewedQuestions(finalDetails);
      animateScore(currentScore);
      
    } catch (err) {
      console.error("Error loading results:", err);
      setError("Failed to load quiz results. Ensure the session is finished.");
    } finally {
      setLoading(false);
    }
  }

  function animateScore(target) {
    let start = 0;
    const duration = 1000;
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = target / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setAnimatedScore(target);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(start));
      }
    }, stepTime);
  }

  if (loading) return <div style={{ padding: 30, textAlign: 'center' }}>Loading results...</div>;
  if (error) return <div style={{ padding: 30, textAlign: 'center', color: '#ef4444' }}>{error}</div>;

  // Determine circle color
  const circleColor = stats.percent >= 70 ? "#10b981" : stats.percent >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <div style={{ maxWidth: 800, margin: "24px auto", padding: "12px", fontFamily: "sans-serif" }}>
      
      {/* --- HEADER --- */}
      <div style={{ textAlign: "center", marginBottom: 30 }}>
        <h1 style={{ margin: "0 0 10px 0", fontSize: "2rem", color: "#333" }}>{quiz?.title || "Quiz Result"}</h1>
        <p style={{ color: "#666" }}>{quiz?.topic || "Quiz Completed"}</p>
      </div>

      {/* --- SCORE CIRCLE --- */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 40 }}>
        <div style={{ position: "relative", width: 180, height: 180 }}>
          <svg width="180" height="180" viewBox="0 0 120 120" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" strokeWidth="12" />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke={circleColor}
              strokeWidth="12"
              strokeDasharray={`${(stats.percent / 100) * 339.29} 339.29`}
              strokeLinecap="round"
              style={{ transition: "stroke-dasharray 1s ease-out" }}
            />
          </svg>
          <div style={{
            position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
            textAlign: "center"
          }}>
            <div style={{ fontSize: 32, fontWeight: "bold", color: "#333" }}>
              {animatedScore}/{stats.total}
            </div>
            <div style={{ fontSize: 14, color: "#888" }}>Score</div>
          </div>
        </div>
      </div>

      {/* --- QUESTIONS LIST --- */}
      <h3 style={{ borderBottom: "2px solid #eee", paddingBottom: 10, marginBottom: 20 }}>
        Detailed Review
      </h3>
      
      <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
        {reviewedQuestions.map((q, idx) => (
          <QuestionCard key={q.qid} q={q} index={idx} />
        ))}
      </div>

      {/* --- BUTTONS --- */}
      <div style={{ marginTop: 40, display: "flex", justifyContent: "center", gap: 15 }}>
        <button 
          onClick={() => navigate("/dashboard")}
          style={btnStyle}
        >
          Back to Dashboard
        </button>
        <button 
           onClick={() => navigate(`/quizzes/${quiz?._id}`)}
           style={{ ...btnStyle, background: "#3b82f6", color: "white", border: "none" }}
        >
          Retake Quiz
        </button>
      </div>
    </div>
  );
}

/* ============================== */
/* QUESTION CARD COMPONENT        */
/* ============================== */

function QuestionCard({ q, index }) {
  const [open, setOpen] = useState(false);

  // Styles based on correctness
  const borderColor = q.isCorrect === true ? "#10b981" : q.isCorrect === false ? "#ef4444" : "#ccc";
  const bgColor = q.isCorrect === true ? "#ecfdf5" : q.isCorrect === false ? "#fef2f2" : "#f9fafb";
  const icon = q.isCorrect === true ? "✅" : "❌";

  return (
    <div 
      style={{ 
        border: `1px solid ${borderColor}`, 
        borderRadius: 10, 
        background: bgColor,
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
      }}
    >
      {/* Card Header (Always Visible) */}
      <div 
        onClick={() => setOpen(!isOpen)}
        style={{ padding: 15, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
        <div style={{ flex: 1 }}>
          <span style={{ fontWeight: "bold", marginRight: 10 }}>Q{index + 1}.</span>
          <span>{q.question}</span>
        </div>
        <div style={{ marginLeft: 15, fontSize: 14, fontWeight: "bold", minWidth: 60, textAlign: "right", color: borderColor }}>
          {icon} {open ? "▲" : "▼"}
        </div>
      </div>

      {/* Card Details (Collapsible) */}
      {open && (
        <div style={{ padding: "0 15px 15px 15px", borderTop: "1px dashed #ddd", marginTop: 5, paddingTop: 15 }}>
          
          {/* User Answer */}
          <div style={{ marginBottom: 8 }}>
            <span style={{ fontWeight: 600, color: "#555" }}>Your Answer: </span>
            <span style={{ 
               color: q.isCorrect ? "#059669" : "#dc2626", 
               textDecoration: !q.isCorrect ? "line-through" : "none" 
            }}>
              {q.userAnswer ?? "(Skipped)"}
            </span>
          </div>

          {/* Correct Answer */}
          <div style={{ marginBottom: 8 }}>
            <span style={{ fontWeight: 600, color: "#555" }}>Correct Answer: </span>
            <span style={{ color: "#059669", fontWeight: "bold" }}>
              {q.expected || "N/A"}
            </span>
          </div>

          {/* Explanation */}
          {q.explanation && (
            <div style={{ marginTop: 15, background: "rgba(255,255,255,0.8)", padding: 10, borderRadius: 6 }}>
              <strong style={{ fontSize: 12, textTransform: "uppercase", color: "#666" }}>Explanation:</strong>
              <p style={{ margin: "5px 0 0 0", fontSize: 14, color: "#333", lineHeight: 1.4 }}>
                {q.explanation}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ============================== */
/* BUTTON STYLE                   */
/* ============================== */

const btnStyle = {
  padding: "10px 16px",
  borderRadius: 8,
  border: "1px solid #ccc",
  background: "#f7f7f7",
  cursor: "pointer",
  fontSize: 16
};
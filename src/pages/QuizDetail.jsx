// client/src/pages/QuizDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/api";

/**
 * QuizDetail.jsx
 * Displays quiz details and shows startAt, endAt, and attempt duration.
 * Minimal change: added UI to display the new time fields.
 */

export default function QuizDetail() {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [id]);

  async function load() {
    setLoading(true);
    try {
      const res = await API.get(`/quizzes/${id}`);
      setQuiz(res.data);
    } catch (err) {
      console.error("Failed to load quiz", err);
      setQuiz(null);
    } finally {
      setLoading(false);
    }
  }

  function handleStart() {
    const token = localStorage.getItem("token");
    if (!token) {
      if (confirm("You must log in to start this quiz. Go to login?")) {
        navigate("/auth");
      }
      return;
    }
    navigate(`/play?quizId=${id}`);
  }

  if (loading) return <div style={{ padding: 20 }}>Loading quiz...</div>;
  if (!quiz) return <div style={{ padding: 20 }}>Quiz not found.</div>;

  // availability
  const now = new Date();
  const startAt = quiz.startAt ? new Date(quiz.startAt) : null;
  const endAt = quiz.endAt ? new Date(quiz.endAt) : null;
  const isLive = (!startAt || startAt <= now) && (!endAt || endAt > now);

  const attemptSeconds = quiz.settings?.attemptDurationSeconds ?? quiz.settings?.timeLimitSeconds ?? null;
  const attemptMinutes = attemptSeconds ? Math.ceil(attemptSeconds / 60) : null;

  return (
    <div style={{ maxWidth: 900, margin: "24px auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0 }}>{quiz.title}</h2>
          <div style={{ color: "var(--muted)" }}>{quiz.topic} • {quiz.questions?.length ?? 0} questions</div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ marginBottom: 8 }}>
            <strong>{isLive ? "Live" : (startAt ? "Not Live" : "Open")}</strong>
          </div>

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button onClick={handleStart} disabled={!isLive} style={{ padding: "8px 12px", borderRadius: 8 }}>
              Start Quiz ▶
            </button>
            <button onClick={() => window.history.back()} style={{ padding: "8px 12px", borderRadius: 8 }}>Back</button>
          </div>
        </div>
      </div>

      <section style={{ marginTop: 12 }}>
        <p>{quiz.description}</p>

        <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
          <div style={{ background: "var(--card)", padding: 10, borderRadius: 8, border: "1px solid var(--border)" }}>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>Start</div>
            <div style={{ fontWeight: 700 }}>{startAt ? startAt.toLocaleString() : "Immediately"}</div>
          </div>

          <div style={{ background: "var(--card)", padding: 10, borderRadius: 8, border: "1px solid var(--border)" }}>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>End</div>
            <div style={{ fontWeight: 700 }}>{endAt ? endAt.toLocaleString() : "No end"}</div>
          </div>

          <div style={{ background: "var(--card)", padding: 10, borderRadius: 8, border: "1px solid var(--border)" }}>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>Attempt duration</div>
            <div style={{ fontWeight: 700 }}>{attemptMinutes ? `${attemptMinutes} min` : "No per-attempt limit"}</div>
          </div>
        </div>

        <hr style={{ margin: "12px 0" }} />

      </section>
    </div>
  );
}

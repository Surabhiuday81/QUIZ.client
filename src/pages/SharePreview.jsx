// client/src/pages/SharePreview.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/api";

/**
 * SharePreview.jsx (updated)
 * - Fetches quiz metadata by share code.
 * - If logged in: calls POST /api/sessions/quizzes/:id/start to begin a session, then navigates to /play?sessionId=...
 * - If not logged in: redirects to /login with redirect to /play?quizId=...
 *
 * Notes:
 * - Make sure your API axios instance attaches Authorization header for authenticated requests.
 *   Example (if you store JWT in localStorage under 'token'):
 *     import axios from "axios";
 *     const API = axios.create({ baseURL: process.env.REACT_APP_API_BASE || "http://localhost:5000/api" });
 *     const token = localStorage.getItem("token");
 *     if (token) API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
 *   If your auth key is named differently, adapt accordingly.
 */

export default function SharePreview() {
  const { shareCode } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (!shareCode) {
      setErr("Missing share code.");
      setLoading(false);
      return;
    }
    let mounted = true;
    async function load() {
      setLoading(true);
      setErr(null);
      try {
        const res = await API.get(`/quizzes/by-share/${encodeURIComponent(shareCode)}`);
        if (!mounted) return;
        setQuiz(res.data);
      } catch (e) {
        console.error("Failed to load share preview", e);
        const msg = e?.response?.data?.error || e?.message || "This link is invalid or expired.";
        if (!mounted) return;
        setErr(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [shareCode]);

  function copyLink() {
    const url = `${window.location.origin}/p/${shareCode}`;
    navigator.clipboard.writeText(url).then(() => {
      alert("Link copied to clipboard");
    }).catch(() => {
      prompt("Copy this URL", url);
    });
  }

  function openInNewTab() {
    const url = `${window.location.origin}/p/${shareCode}`;
    window.open(url, "_blank", "noopener");
  }

  function isLoggedIn() {
    // adjust to your auth storage. Common options:
    // - JWT token stored at localStorage.getItem('token')
    // - user object stored at localStorage.getItem('loggedInUser')
    // This function should return true if user is authenticated and API will include token header.
    const token = localStorage.getItem("token");
    return Boolean(token);
  }

  async function handleStart() {
    if (!quiz) return;

    // If not logged in, send user to login first with final redirect to the player start.
    if (!isLoggedIn()) {
      const target = `/play?quizId=${quiz._id}`;
      const redirect = encodeURIComponent(target);
      navigate(`/login?redirect=${redirect}`);
      return;
    }

    // Logged in -> start session via server (auth required)
    try {
      setStarting(true);
      setErr(null);

      // IMPORTANT: ensure API axios instance attaches Authorization header (example above).
      // Call the start endpoint which creates a session snapshot on server and returns sessionId.
      const res = await API.post(`/sessions/quizzes/${quiz._id}/start`);

      // Expected response contains { sessionId, expiresAt, questions, totalQuestions }
      const { sessionId } = res.data || {};
      if (!sessionId) {
        throw new Error("Server did not return sessionId");
      }

      // Navigate to player with sessionId (player will load session by id)
      navigate(`/play?sessionId=${sessionId}`);
    } catch (e) {
      console.error("Failed to start session", e);
      const status = e?.response?.status;
      if (status === 401 || status === 403) {
        // token invalid -> force re-login
        const target = `/play?quizId=${quiz._id}`;
        const redirect = encodeURIComponent(target);
        alert("Please log in to start the quiz.");
        navigate(`/login?redirect=${redirect}`);
        return;
      }
      setErr(e?.response?.data?.error || e?.message || "Failed to start quiz. Try again.");
    } finally {
      setStarting(false);
    }
  }

  if (loading) {
    return <div style={{ padding: 20 }}>Loading preview…</div>;
  }

  if (err) {
    return (
      <div style={{ padding: 20, maxWidth: 800, margin: "12px auto" }}>
        <div style={{ background: "#fee2e2", color: "#991b1b", padding: 12, borderRadius: 8 }}>{err}</div>
        <div style={{ marginTop: 12 }}>
          <button onClick={() => navigate(-1)}>Go back</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "18px auto", padding: "0 12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h1 style={{ marginBottom: 6 }}>{quiz.title}</h1>
          <div style={{ color: "#64748b", marginBottom: 8 }}>{quiz.topic} • {quiz.questions.length} {quiz.questions.length === 1 ? "question" : "questions"}</div>
          <div style={{ color: "#475569" }}>{quiz.description || "No description provided."}</div>
          <div style={{ marginTop: 12, color: "#94a3b8", fontSize: 13 }}>
            Note: This is a private preview. Users with this link can view the quiz. Starting the quiz requires login.
            {quiz.shareExpiresAt && <div style={{ marginTop: 6 }}>Link expires: {new Date(quiz.shareExpiresAt).toLocaleString()}</div>}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={copyLink}>Copy link</button>
            <button onClick={openInNewTab}>Open in new tab</button>
          </div>

          <div style={{ marginTop: 8 }}>
            <button
              onClick={handleStart}
              disabled={starting}
              style={{ background: "#2563eb", color: "#fff", padding: "10px 14px", border: "none", borderRadius: 8 }}
            >
              {starting ? "Starting…" : "Start (login required)"}
            </button>
          </div>
        </div>
      </div>

      <hr style={{ margin: "18px 0" }} />

      <div>
        <h3 style={{ marginBottom: 8 }}>Sample Questions</h3>
        <div style={{ display: "grid", gap: 12 }}>
          {quiz.questions.slice(0, 3).map((q, i) => (
            <div key={q.qid || i} style={{ padding: 12, borderRadius: 8, border: "1px solid #e6eefb" }}>
              <div style={{ fontWeight: 700 }}>{i + 1}. {q.question}</div>
              {q.type === "mcq" && (
                <ul style={{ marginTop: 8 }}>
                  {(q.choices || []).map((c, idx) => <li key={idx}>{String.fromCharCode(65 + idx)}. {c}</li>)}
                </ul>
              )}
              {q.type === "tf" && <div style={{ marginTop: 8 }}>True / False</div>}
              {q.type === "short" && <div style={{ marginTop: 8 }}>Short answer</div>}
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <button onClick={() => navigate(-1)}>Back</button>
      </div>
    </div>
  );
}

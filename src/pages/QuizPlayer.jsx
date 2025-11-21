// client/src/pages/QuizPlayer.jsx
import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api/api";
import '../styles/QuizPlayer.css';


/* parse query params */
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

/* small helper: shallow compare two answer maps (strings/numbers) */
function answersEqual(a = {}, b = {}) {
  const ka = Object.keys(a || {});
  const kb = Object.keys(b || {});
  if (ka.length !== kb.length) return false;
  for (const k of ka) {
    if (String(a[k] ?? "") !== String(b[k] ?? "")) return false;
  }
  return true;
}

/**
 * QuestionBlock
 * - Holds a local input state for text fields so typing isn't interrupted by parent re-renders/autosaves.
 * - Commits to parent via onCommit when input blurs or user presses Enter.
 * - For MCQ/TF, commits immediately and shows clear selection styles and a check icon.
 */
function QuestionBlock({ q, idx, initialAnswer, disabled, onCommit }) {
  const qid = q.qid || `q${idx + 1}`;
  const [local, setLocal] = useState(initialAnswer ?? "");
  const inputRef = useRef(null);

  useEffect(() => {
    // sync when initialAnswer changes externally (e.g., load)
    setLocal(initialAnswer ?? "");
  }, [initialAnswer]);

  // commit helper (calls parent onCommit)
  const commit = useCallback(
    (val) => {
      setLocal(val);
      if (onCommit) onCommit(qid, val);
    },
    [qid, onCommit]
  );

  // handle enter key on text input
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commit(local);
      // optional: move focus to next input
      // try focusing next by DOM (not necessary)
    }
  };

  // visual helpers
  const selectedIndex = typeof local === "number" || (typeof local === "string" && /^\d+$/.test(String(local))) ? Number(local) : null;

  // MCQ
  if (q.type === "mcq") {
    return (
      <div key={qid} className="question-block">
        <div className="question-text"><strong>{idx + 1}. {q.question}</strong></div>
        <div className="mcq-choices-grid">
          {(q.choices || []).map((c, i) => {
            const isSelected = selectedIndex === i;
            return (
              <button
                key={i}
                type="button"
                onClick={() => !disabled && commit(i)}
                disabled={disabled}
                className={`quiz-choice-button mcq-choice-button ${isSelected ? 'selected' : ''}`}
              >
                <div className="mcq-choice-content">
                  <div className="mcq-choice-letter">{String.fromCharCode(65 + i)}</div>
                  <div>{c}</div>
                </div>
                {isSelected && <div className="quiz-choice-check">✓</div>}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // TF
  if (q.type === "tf") {
    return (
      <div key={qid} className="question-block">
        <div className="question-text"><strong>{idx + 1}. {q.question}</strong></div>
        <div className="tf-choices-flex">
          <button
            type="button"
            onClick={() => !disabled && commit("true")}
            disabled={disabled}
            className={`quiz-choice-button ${local === "true" ? 'selected' : ''}`}
          >
            <span>True</span>
            {local === "true" && <span className="quiz-choice-check">✓</span>}
          </button>

          <button
            type="button"
            onClick={() => !disabled && commit("false")}
            disabled={disabled}
            className={`quiz-choice-button ${local === "false" ? 'selected' : ''}`}
          >
            <span>False</span>
            {local === "false" && <span className="quiz-choice-check">✓</span>}
          </button>
        </div>
      </div>
    );
  }

  // short answer (text) — local-controlled to avoid caret jumps
  return (
    <div key={qid} className="question-block">
      <div className="question-text"><strong>{idx + 1}. {q.question}</strong></div>
      <input
        ref={inputRef}
        type="text"
        value={local}
        disabled={disabled}
        placeholder="Type your answer here"
        onChange={(e) => setLocal(e.target.value)}
        onBlur={() => commit(local)}
        onKeyDown={handleKeyDown}
        className="short-answer-input"
      />
      <div className="short-answer-hint">Press Enter or click outside to save this answer. Autosave runs every 10s.</div>
    </div>
  );
}

export default function QuizPlayer() {
  const query = useQuery();
  const navigate = useNavigate();
  const quizId = query.get("quizId");
  const sessionIdFromQuery = query.get("sessionId");

  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState(sessionIdFromQuery || null);
  const [questions, setQuestions] = useState([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [answers, setAnswers] = useState({}); // qid -> answer (committed)
  const [sessionStatus, setSessionStatus] = useState(null);
  const [expiresAt, setExpiresAt] = useState(null);
  const [attemptDurationSeconds, setAttemptDurationSeconds] = useState(null);

  const [timeLeftSec, setTimeLeftSec] = useState(null);
  const [warn60, setWarn60] = useState(false);
  const [warn10, setWarn10] = useState(false);

  const [submitted, setSubmitted] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [error, setError] = useState(null);

  // autosave housekeeping
  const lastSavedAnswersRef = useRef({});
  const hasUnsavedChangesRef = useRef(false);
  const autosaveIntervalRef = useRef(null);
  const [savingState, setSavingState] = useState({ saving: false, savedAt: null, lastError: null });
  const autosaveRetryCountRef = useRef(0);
  const autoSaveIntervalMs = 10_000; // autosave every 10s

  // init session
  useEffect(() => {
    let mounted = true;
    async function init() {
      setLoading(true);
      setError(null);
      try {
        if (sessionIdFromQuery && !quizId) {
          const res = await API.get(`/sessions/${sessionIdFromQuery}`);
          const s = res.data;
          if (!mounted) return;
          setSessionId(s._id);
          setQuestions(s.questions || []);
          setTotalQuestions(s.totalQuestions || (s.questions && s.questions.length) || 0);
          setExpiresAt(s.expiresAt ? new Date(s.expiresAt) : null);
          setAttemptDurationSeconds(s.attemptDurationSeconds ?? null);
          setSessionStatus(s.status || null);
          
          if (s.status && s.status !== "in-progress") {
             setSubmitted(true);
             // ✨ REDIRECT IF ALREADY SUBMITTED
             navigate(`/results/${s._id}`, { replace: true });
             return; // Stop processing if already finished
          }

          setAnswers(s.answers || {});
          lastSavedAnswersRef.current = s.answers || {};

        } else if (quizId) {
          const res = await API.post(`/sessions/quizzes/${quizId}/start`);
          const d = res.data;
          setSessionId(d.sessionId);
          setQuestions(d.questions || []);
          setTotalQuestions(d.totalQuestions || (d.questions && d.questions.length) || 0);
          setExpiresAt(d.expiresAt ? new Date(d.expiresAt) : null);
          setAttemptDurationSeconds(d.attemptDurationSeconds ?? null);
          setSessionStatus("in-progress");
          setAnswers({});
          lastSavedAnswersRef.current = {};
        } else {
          setError("No quizId or sessionId provided.");
        }
      } catch (err) {
        console.error("Session init failed", err);
        setError(err?.response?.data?.error || err.message || "Failed to start or load session");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    init();
    return () => { mounted = false; };
    // eslint-disable-next-line
  }, [quizId, sessionIdFromQuery]);

  // countdown timer
  useEffect(() => {
    if (!expiresAt) { setTimeLeftSec(null); return; }
    let stopped = false;
    function tick() {
      if (stopped) return;
      const now = new Date();
      const diff = Math.max(0, Math.ceil((new Date(expiresAt).getTime() - now.getTime()) / 1000));
      setTimeLeftSec(diff);
      if (diff <= 60 && diff > 10) setWarn60(true);
      if (diff <= 10) setWarn10(true);
      // auto-submit handled elsewhere
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => { stopped = true; clearInterval(id); };
  }, [expiresAt]);

  // parent commit handler: called by QuestionBlock on blur/choice click
  const handleCommit = useCallback((qid, value) => {
    setAnswers((prev) => {
      const next = { ...prev, [qid]: value };
      hasUnsavedChangesRef.current = !answersEqual(next, lastSavedAnswersRef.current);
      return next;
    });
  }, []);

  // autosave interval (acts on parent 'answers' only; typing uses local state)
  useEffect(() => {
    if (autosaveIntervalRef.current) { clearInterval(autosaveIntervalRef.current); autosaveIntervalRef.current = null; }

    // don't autosave if session finished/timed-out or submitted
    if (!sessionId || submitted || (sessionStatus && (sessionStatus === "finished" || sessionStatus === "timed-out"))) return;

    autosaveIntervalRef.current = setInterval(() => {
      if (hasUnsavedChangesRef.current) performAutosave();
    }, autoSaveIntervalMs);

    const onBeforeUnload = () => {
      if (hasUnsavedChangesRef.current && navigator && navigator.sendBeacon) {
        try {
          const payload = JSON.stringify({ answers });
          const url = (API.defaults && API.defaults.baseURL ? API.defaults.baseURL : "") + `/sessions/${sessionId}/save`;
          const blob = new Blob([payload], { type: "application/json" });
          navigator.sendBeacon(url, blob);
        } catch (e) {
          console.warn("sendBeacon failed", e);
        }
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      if (autosaveIntervalRef.current) clearInterval(autosaveIntervalRef.current);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
    // eslint-disable-next-line
  }, [sessionId, submitted, sessionStatus, answers]);

  // autosave function
  const performAutosave = useCallback(async () => {
    if (!sessionId) return;
    const payload = Object.assign({}, answers);
    if (answersEqual(payload, lastSavedAnswersRef.current)) { hasUnsavedChangesRef.current = false; return; }

    setSavingState((s) => ({ ...s, saving: true, lastError: null }));
    try {
      await API.patch(`/sessions/${sessionId}/save`, { answers: payload });
      lastSavedAnswersRef.current = payload;
      hasUnsavedChangesRef.current = false;
      autosaveRetryCountRef.current = 0;
      setSavingState({ saving: false, savedAt: new Date(), lastError: null });
      console.debug("[autosave] saved", sessionId);
    } catch (err) {
      console.error("[autosave] failed", err);
      autosaveRetryCountRef.current = (autosaveRetryCountRef.current || 0) + 1;
      setSavingState((s) => ({ ...s, saving: false, lastError: err?.message || "Autosave failed" }));
      if (autosaveRetryCountRef.current <= 1) setTimeout(() => performAutosave(), 2000);
    }
    // eslint-disable-next-line
  }, [sessionId, answers]);

  // manual submit
  async function manualSubmit() {
    if (!sessionId) { setError("No active session"); return; }
    if (!window.confirm("Submit now?")) return;
    try { await performAutosave(); } catch (e) { console.warn("final autosave failed", e); }
    await submitSession({ manual: true });
  }

  // auto-submit when time expires
  const hasAutoSubmittedRef = useRef(false);
  useEffect(() => {
    if (!sessionId || submitted) return;
    if (timeLeftSec === null) return;
    if (timeLeftSec <= 0 && !hasAutoSubmittedRef.current) {
      hasAutoSubmittedRef.current = true;
      try {
        if (navigator.sendBeacon) {
          const payload = JSON.stringify({ answers });
          const url = (API.defaults && API.defaults.baseURL ? API.defaults.baseURL : "") + `/sessions/${sessionId}/save`;
          const blob = new Blob([payload], { type: "application/json" });
          navigator.sendBeacon(url, blob);
        }
      } catch (e) {
        console.warn("sendBeacon on expire failed", e);
      }
      submitSession({ auto: true }).catch((e) => {
        console.error("Auto submit failed", e);
        setError("Auto-submit failed; please submit manually.");
      });
    }
    // eslint-disable-next-line
  }, [timeLeftSec, sessionId, submitted]);

  // submit session
  async function submitSession({ manual = false, auto = false } = {}) {
    if (!sessionId) return;
    setLoading(true);
    try {
      const payload = { answers: Object.assign({}, answers) };
      const res = await API.post(`/sessions/${sessionId}/submit`, payload);
      setSubmitted(true);
      setSessionStatus("finished");
      if (autosaveIntervalRef.current) { clearInterval(autosaveIntervalRef.current); autosaveIntervalRef.current = null; }
      
      // ✨ NEW: REDIRECT TO RESULTS PAGE
      navigate(`/results/${sessionId}`, { replace: true });

    } catch (err) {
      console.error("submit failed", err);
      setError(err?.response?.data?.error || err.message || "Submit failed");
      // If submission fails, re-enable inputs/reset loading state if it wasn't a fatal error
      setSubmitted(false); 
      setSessionStatus("in-progress");
      throw err;
    } finally {
      // setLoading(false) is now handled implicitly by the redirect leaving the component
    }
  }

  const formattedTimeLeft = useMemo(() => {
    if (timeLeftSec === null || timeLeftSec === undefined) return "No limit";
    const mm = Math.floor(timeLeftSec / 60);
    const ss = timeLeftSec % 60;
    return `${mm}:${String(ss).padStart(2, "0")}`;
  }, [timeLeftSec]);

  const progressPct = useMemo(() => {
    if (!attemptDurationSeconds || timeLeftSec === null || timeLeftSec === undefined) return null;
    const total = Number(attemptDurationSeconds);
    const left = Math.max(0, Number(timeLeftSec));
    return Math.round((left / total) * 100);
  }, [attemptDurationSeconds, timeLeftSec]);

  // UI render
  if (loading) return <div className="quiz-loading">Loading session...</div>;
  
  if (error) return (
    <div className="quiz-player-container">
      <div className="quiz-error-message">{error}</div>
      <button onClick={() => navigate(-1)}>Back</button>
    </div>
  );

  // inputs enabled when session is not finished/timed-out and not submitted
  const inputsEnabled = !submitted && sessionStatus !== "finished" && sessionStatus !== "timed-out";

  return (
    <div className="quiz-player-container">
      <div className="quiz-header">
        <div>
          <h2 style={{ margin: 0 }}>Quiz Attempt</h2>
          <div className="quiz-header-info">{totalQuestions} questions</div>
        </div>

        <div className="quiz-timer-block">
          <div className="quiz-timer-label">Time left</div>
          <div className="quiz-timer-value">{formattedTimeLeft}</div>
          {progressPct !== null && (
            <div className="quiz-progress-bar-container">
              <div className={`quiz-progress-bar ${progressPct <= 10 ? 'warning' : ''}`} style={{ width: `${progressPct}%` }} />
            </div>
          )}
        </div>
      </div>

      {warn60 && !submitted && <div className="quiz-warning-60">Less than 60 seconds remaining — please finish soon.</div>}
      {warn10 && !submitted && <div className="quiz-warning-10">Less than 10 seconds left! Auto-submit is imminent.</div>}

      <div className="quiz-questions-list">
        {questions.map((q, idx) => (
          <QuestionBlock
            key={q.qid || idx}
            q={q}
            idx={idx}
            initialAnswer={answers[q.qid]}
            disabled={!inputsEnabled}
            onCommit={handleCommit}
          />
        ))}
      </div>

      <div className="quiz-action-bar">
        <button className="submit-button" disabled={submitted} onClick={() => manualSubmit()}>
          Submit
        </button>

        <button className="exit-button" onClick={() => { if (window.confirm("Leave quiz? You can resume only if it hasn't expired.")) navigate("/"); }}>
          Exit
        </button>

        <div className="saving-state-info">
          {savingState.saving ? "Saving…" : (savingState.savedAt ? `Saved ✓ ${new Date(savingState.savedAt).toLocaleTimeString()}` : "Not saved")}
          {savingState.lastError && <span className="saving-state-error"> (Autosave error)</span>}
        </div>
      </div>
    </div>
  );
}
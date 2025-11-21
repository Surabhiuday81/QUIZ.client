// client/src/pages/QuizPreview.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function QuizPreview() {
  const raw = sessionStorage.getItem("quiz_preview");
  const preview = raw ? JSON.parse(raw) : null;
  const navigate = useNavigate();

  if (!preview) return <div style={{ maxWidth: 700, margin: "40px auto" }}><p>No preview found. Generate a quiz first.</p></div>;

  function handleStartSavedQuiz() {
    // If preview has an _id (saved), go to play; otherwise save first or start practice
    if (preview._id || preview.id) {
      navigate(`/play?quizId=${preview._id || preview.id}`);
      return;
    }
    // not saved — ask to save or practice
    if (confirm("This preview is not saved. Save quiz now? (You must be logged in)")) {
      navigate("/create");
    } else {
      // start as practice: store as 'practice_quiz' and go to a simple practice player (not timed)
      sessionStorage.setItem("practice_quiz", JSON.stringify(preview));
      navigate("/play?practice=true");
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "24px auto" }}>
      <h2>Preview: {preview.title || "Untitled"}</h2>
      <p>{preview.description}</p>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button onClick={handleStartSavedQuiz}>Start (if saved) / Practice</button>
        <button onClick={() => navigate("/create")}>Back to Create</button>
      </div>

      <div>
        {preview.questions.map((q, i) => (
          <div key={q.qid || i} style={{ padding: 8, borderBottom: "1px solid #eee" }}>
            <h4>{i + 1}. {q.question}</h4>
            {q.type === "mcq" && (
              <ul>
                {q.choices.map((c, idx) => <li key={idx}>{String.fromCharCode(65+idx)}. {c}</li>)}
              </ul>
            )}
            <div style={{ fontStyle: "italic", color: "#6b7280" }}>(Answer hidden in preview)</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// client/src/pages/CreateQuiz.jsx (Final Design Attempt: High Space and Impact)
import React, { useEffect, useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";
import '../styles/CreateQuiz.css';

/**
 * CreateQuiz.jsx
 * This version maximizes visual space, increases padding, uses distinct separators,
 * and assumes CSS classes for cool, prominent input field styles.
 */

export default function CreateQuiz() {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const [numQuestions, setNumQuestions] = useState(5);
  const [isPublic, setIsPublic] = useState(true);
  const [durationMinutes, setDurationMinutes] = useState(""); 

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  const [shareCodeInfo, setShareCodeInfo] = useState(null); 
  const [generateShare, setGenerateShare] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const raw = sessionStorage.getItem("quiz_preview");
    if (raw) {
      try {
        setPreview(JSON.parse(raw));
      } catch (e) { /* silent fail */ }
    }
  }, []);

  async function handleGenerate(e) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    try {
      const res = await API.post("/quizzes/generate", {
        topic: topic || "General Knowledge",
        difficulty,
        maxQuestions: Number(numQuestions)
      });
      setPreview(res.data);
      sessionStorage.setItem("quiz_preview", JSON.stringify(res.data));
    } catch (error) {
      console.error("Generate failed", error);
      setErr(error?.response?.data?.error || error.message || "Failed to generate preview");
    } finally {
      setLoading(false);
    }
  }

  function validateDuration(value) {
    if (value === "" || value === null) return true;
    const n = Number(value);
    return !isNaN(n) && n > 0 && n <= 24 * 60;
  }

  async function doSave(publish = false) {
    setErr(null);
    if (!validateDuration(durationMinutes)) {
      setErr("Duration is invalid. Enter minutes (positive). Max 1440.");
      return;
    }
    if (!preview || !preview.questions || preview.questions.length === 0) {
      setErr("Generate a preview first before saving or publishing.");
      return;
    }

    setSaving(true);
    try {
      const settings = {};
      if (durationMinutes !== "" && durationMinutes !== null) settings.attemptDurationSeconds = Math.round(Number(durationMinutes) * 60);

      const body = {
        title: preview.title || `Quiz: ${topic || "Untitled"}`,
        description: preview.description || "",
        topic,
        isPublic,
        questions: preview.questions,
        settings,
        publish,
        generateShare: !isPublic && generateShare,
        shareExpiresHours: 24
      };

      const res = await API.post("/quizzes", body);

      if (res.data && res.data.shareCode) {
        setShareCodeInfo({ shareCode: res.data.shareCode, shareExpiresAt: res.data.shareExpiresAt });
      }

      sessionStorage.removeItem("quiz_preview");
      setPreview(null);

      navigate("/my-quizzes");
    } catch (error) {
      console.error("Save failed", error);
      setErr(error?.response?.data?.error || error.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  function copyLink(code) {
    const url = `${window.location.origin}/p/${code}`;
    navigator.clipboard.writeText(url).then(() => {
      alert("Link copied to clipboard");
    }).catch(() => {
      alert("Copy failed — select and copy manually: " + url);
    });
  }

  return (
    // Max width increased, generous outer padding
    <div className="app-container-max"> 
      <h2 className="header-impact">✨ Configure Quiz Generation</h2>

      {/* --- FORM SECTION: High Contrast Panel --- */}
      <div className="card-panel-xlarge">
        <form onSubmit={handleGenerate} className="form-layout-grid-gap">
          
          {/* Group 1 */}
          <div className="form-group-padded">
            <label htmlFor="topic" className="label-large">Topic</label>
            <input 
              id="topic"
              className="input-glow input-large" // Prominent input style
              value={topic} 
              onChange={(e) => setTopic(e.target.value)} 
              placeholder="e.g. Quantum Physics, Renaissance Art" 
            />
          </div>

          <div className="form-group-padded">
            <label htmlFor="difficulty" className="label-large">Difficulty</label>
            <select 
              id="difficulty"
              className="input-glow select-large" // Prominent select style
              value={difficulty} 
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="easy">Level 1: Easy (Basic Concepts)</option>
              <option value="medium">Level 2: Medium (Application)</option>
              <option value="hard">Level 3: Hard (Complex Problems)</option>
            </select>
          </div>
          
          <div className="separator-line-subtle"></div>

          {/* Group 2 */}
          <div className="form-group-padded">
            <label htmlFor="numQuestions" className="label-large">Question Count (1-50)</label>
            <input 
              id="numQuestions"
              className="input-glow input-large"
              type="number" 
              min={1} 
              max={50} 
              value={numQuestions} 
              onChange={(e) => setNumQuestions(e.target.value)} 
            />
          </div>
          
          <div className="form-group-padded">
            <label htmlFor="durationMinutes" className="label-large">Duration (in Minutes)</label>
            <input 
              id="durationMinutes"
              className="input-glow input-large"
              value={durationMinutes} 
              onChange={(e) => setDurationMinutes(e.target.value)} 
              placeholder="Leave blank for no limit" 
              inputMode="numeric"
            />
            <div className="hint-small">Max 1440 minutes (24 hours).</div>
          </div>
          
          <div className="separator-line-subtle"></div>

          {/* Group 3: Visibility */}
          <div className="form-group-padded">
              <label htmlFor="visibility" className="label-large">Quiz Visibility</label>
              <select 
                id="visibility"
                className="input-glow select-large"
                value={isPublic ? "public" : "private"} 
                onChange={(e) => setIsPublic(e.target.value === "public")}
              >
                <option value="public">🌐 Public (Visible on Explore Page)</option>
                <option value="private">🔒 Private (Requires Unique Share Link)</option>
              </select>
          </div>

          <div className="form-group-padded checkbox-group-stacked">
              <label className="label-large" style={{visibility: 'hidden'}}>Share Option Padding</label>
              {!isPublic && (
                <label className="checkbox-toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={generateShare} 
                    onChange={(e) => setGenerateShare(e.target.checked)} 
                    className="checkbox-input-hidden"
                  />
                  <span className="checkbox-slider-round"></span>
                  <span className="checkbox-text-prominent">Generate Private Share Link</span>
                  <div className="hint-small">Link is valid for 24 hours.</div>
                </label>
              )}
          </div>

          <div className="separator-line-subtle"></div>

          <div className="button-tray-wide">
            <button type="submit" className="button-action button-generate-primary" disabled={loading}>
              {loading ? "Processing AI Request..." : "🧠 Generate & Load Preview"}
            </button>
            <button 
              type="button" 
              onClick={() => { setPreview(null); sessionStorage.removeItem("quiz_preview"); }}
              className="button-ghost-secondary"
            >
              Clear Preview
            </button>
          </div>
        </form>
      </div>

      {/* --- ACTION BAR (Sticky/Prominent) --- */}
      <div className="action-bar-sticky-prominent">
        <div className="button-tray action-buttons-wide">
          <button 
            onClick={() => doSave(false)} 
            disabled={saving || !preview}
            className="button-action button-ghost-primary"
          >
            {saving ? "Saving..." : "💾 Save Draft"}
          </button>
          <button 
            onClick={() => doSave(true)} 
            disabled={saving || !preview} 
            className="button-action button-publish-accent shimmer-border-glow"
          >
            {saving ? "Publishing..." : "🔥 Publish Now (Set Active)"}
          </button>
          <button onClick={() => navigate("/my-quizzes")} className="button-action button-text-subtle">
            Cancel
          </button>
        </div>
      </div>

      {err && <div className="alert-error-prominent">{err}</div>}

      <div className="divider-prominent"></div>
      
      {/* --- PREVIEW SECTION --- */}
      <h3 className="section-header-xlarge">🔬 Quiz Structure Preview</h3>
      <div className="card-panel-xlarge quiz-preview-panel">
        {!preview && <div className="placeholder-content">Enter the configuration above and hit "Generate Preview."</div>}
        {preview && (
          <div className="preview-content-high-contrast">
            <h4 className="preview-title-large">{preview.title || "Untitled Quiz"}</h4>
            <p className="preview-description-muted">{preview.description || "No description provided."}</p>
            
            <div className="question-list-grid">
              {preview.questions?.map((q, i) => (
                <div key={q.qid || i} className="question-card-minimal">
                  <span className="question-number-badge">{i + 1}</span>
                  <p className="question-text-bold">{q.question}</p>
                  
                  {q.type === "mcq" && (
                    <ul className="choices-list-compact">
                      {q.choices.map((c, id) => (
                        <li key={id} className="choice-item-list">
                          <span className="choice-marker-subtle">{String.fromCharCode(65 + id)}</span> {c}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* --- SHARE INFO SECTION --- */}
      {shareCodeInfo && (
        <div className="share-link-card-prominent">
          <div className="share-header-bold">✅ Private Link Generated</div>
          <div className="share-details-flex">
            <input 
              value={`${window.location.origin}/p/${shareCodeInfo.shareCode}`} 
              readOnly 
              className="input-glow share-input-prominent"
            />
            <button onClick={() => copyLink(shareCodeInfo.shareCode)} className="button-icon-primary">
              📋 Copy Link
            </button>
          </div>
          <div className="hint-small share-expiry-text-highlight">
            Link Expires: {new Date(shareCodeInfo.shareExpiresAt).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
}
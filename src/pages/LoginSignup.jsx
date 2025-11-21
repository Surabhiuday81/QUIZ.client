// client/src/pages/LoginSignup.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register, login } from "../api/api";

// --- STYLING CONSTANTS (Modernized Aesthetic) ---
const STYLES = {
  container: {
    // Relying on the global `card-anim` class for background/shadow/animation
    maxWidth: 420, // Reduced max width for a cleaner, centered card look
    margin: "40px auto", // Increased vertical margin
    padding: 30, // Increased padding inside the card
  },
  title: {
    fontWeight: 700,
    fontSize: '1.8rem',
    marginBottom: 20,
    color: 'var(--text-heading)',
    textAlign: 'center',
  },
  tabGroup: {
    display: "flex",
    gap: 12,
    marginBottom: 30, // Increased spacing
    padding: '4px',
    borderRadius: 12,
    background: 'var(--border)', // Use border color as the track background
  },
  tabButton: (isActive) => ({
    flex: 1,
    background: isActive ? "var(--accent)" : "transparent",
    color: isActive ? "#fff" : "var(--muted)",
    padding: 10,
    border: "none",
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '0.95rem',
    transition: 'background 250ms ease, color 250ms ease, box-shadow 250ms ease',
    boxShadow: isActive ? '0 4px 10px rgba(37, 99, 235, 0.4)' : 'none', // Subtle shadow when active
    willChange: 'background, box-shadow',
  }),
  errorBox: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: 12,
    borderRadius: 8,
    border: "1px solid #fca5a5",
    marginBottom: 20,
    fontSize: '0.9rem',
  },
  submitButton: (loading) => ({
    flex: 1,
    padding: 12,
    borderRadius: 8,
    border: 'none',
    background: loading ? 'var(--muted)' : 'var(--accent)',
    color: '#fff',
    fontWeight: 700,
    fontSize: '1rem',
    cursor: loading ? 'not-allowed' : 'pointer',
    transition: 'background 250ms ease',
  }),
  // Note: Input and label styles are assumed to be handled by a global 'form' class or structure
};
// -----------------------------

export default function LoginSignup() {
  const [tab, setTab] = useState("login"); // 'login' | 'signup'
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  /**
   * Handles form submission for both login and signup.
   */
  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    if (!email || !password) {
        setErr("Email and password are required.");
        setLoading(false);
        return;
    }

    try {
      let data;
      if (tab === "signup") {
        if (!username) {
          setErr("Please provide a username.");
          setLoading(false);
          return;
        }
        data = await register({ username, email, password });
      } else {
        data = await login({ email, password });
      }
      
      saveAuth(data);

    } catch (error) {
      console.error("Authentication Error:", error);
      const msg = error?.response?.data?.error || error.message || "Authentication failed. Please check your credentials.";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Saves authentication tokens and redirects the user.
   */
  function saveAuth(data) {
    if (data.token && data.user) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        
        navigate("/");
        window.location.reload();
    } else {
        setErr("Server returned invalid authentication data.");
    }
  }

  return (
    // Apply card and entrance animation classes
    <div className="card-anim enter-up" style={STYLES.container}>
      <h2 style={STYLES.title}>
        {tab === "signup" ? "Create Your Account" : "Sign In to GenAI Quiz"}
      </h2>

      {/* Tab Selector */}
      <div style={STYLES.tabGroup}>
        <button 
          onClick={() => setTab("login")} 
          style={STYLES.tabButton(tab === "login")}
          disabled={loading}
          aria-label="Switch to Login Tab"
        >
          Login
        </button>
        <button 
          onClick={() => setTab("signup")} 
          style={STYLES.tabButton(tab === "signup")}
          disabled={loading}
          aria-label="Switch to Sign up Tab"
        >
          Sign up
        </button>
      </div>

      {/* Error Message */}
      {err && (
        <div style={STYLES.errorBox} role="alert">
          {err}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="form">
        {tab === "signup" && (
          <label htmlFor="username">
            Username
            <input 
              id="username"
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              placeholder="e.g., QuizMaster_77"
              required={tab === "signup"}
              disabled={loading}
            />
          </label>
        )}

        <label htmlFor="email">
          Email
          <input 
            id="email"
            type="email"
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="you@example.com"
            required
            disabled={loading}
          />
        </label>

        <label htmlFor="password">
          Password
          <input 
            id="password"
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="Strong Password"
            required
            disabled={loading}
          />
        </label>

        <div style={STYLES.submitGroup}>
          <button 
            type="submit" 
            disabled={loading} 
            style={STYLES.submitButton(loading)}
          >
            {loading ? (
                <>
                  <span className="spinner" /> 
                  {tab === "signup" ? "Creating..." : "Signing in..."}
                </>
              ) : (
                tab === "signup" ? "Create Account" : "Sign In"
              )}
          </button>
        </div>
      </form>
    </div>
  );
}
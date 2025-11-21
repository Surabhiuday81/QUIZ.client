// client/src/pages/LoginSignup.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register, login } from "../api/api";

export default function LoginSignup() {
  const [tab, setTab] = useState("login"); // 'login' | 'signup'
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      if (tab === "signup") {
        if (!username) return setErr("Please provide a username");
        const data = await register({ username, email, password });
        saveAuth(data);
      } else {
        const data = await login({ email, password });
        saveAuth(data);
      }
    } catch (error) {
      console.error(error);
      const msg = error?.response?.data?.error || error.message || "Auth failed";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }

  function saveAuth(data) {
    // store token + user
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    navigate("/");
    window.location.reload();
  }

  return (
    <div className="card" style={{ maxWidth: 560, margin: "24px auto" }}>
      <h2>{tab === "signup" ? "Create account" : "Sign in"}</h2>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button onClick={() => setTab("login")} style={{ flex: 1, background: tab === "login" ? "#2563eb" : "#eee", color: tab === "login" ? "#fff" : "#111", padding: 8, border: "none", borderRadius: 6 }}>
          Login
        </button>
        <button onClick={() => setTab("signup")} style={{ flex: 1, background: tab === "signup" ? "#2563eb" : "#eee", color: tab === "signup" ? "#fff" : "#111", padding: 8, border: "none", borderRadius: 6 }}>
          Sign up
        </button>
      </div>

      {err && <div style={{ background: "#fee2e2", color: "#991b1b", padding: 8, borderRadius: 6, marginBottom: 8 }}>{err}</div>}

      <form onSubmit={handleSubmit} className="form">
        {tab === "signup" && (
          <label>
            Username
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" />
          </label>
        )}

        <label>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </label>

        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
        </label>

        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button type="submit" disabled={loading} style={{ flex: 1 }}>{loading ? "Please wait..." : tab === "signup" ? "Create account" : "Sign in"}</button>
        </div>
      </form>
    </div>
  );
}

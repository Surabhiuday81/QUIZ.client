// client/src/components/Navbar.jsx
import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

/**
 * Navbar with:
 * - Brand
 * - Dark mode toggle (persists to localStorage)
 * - Login / Profile dropdown
 *
 * Injects theme + animation CSS once.
 */

const STYLE_ID = "app-theme-and-anim-styles";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [openMenu, setOpenMenu] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const menuRef = useRef();
  const navigate = useNavigate();

  // Inject CSS once
  useEffect(() => {
    if (!document.getElementById(STYLE_ID)) {
      const s = document.createElement("style");
      s.id = STYLE_ID;
      s.innerHTML = `
/* Theme tokens */
:root {
  --bg: #f7f9fb; /* Slightly off-white background */
  --card: #ffffff;
  --muted: #64748b;
  --border: #e2e8f0;
  --text: #0f172a;
  --text-heading: #1e293b;
  --accent: #2563eb;
  --success: #10b981;
}

html.dark {
  --bg: #0d1a2f; /* Deeper dark background */
  --card: #1c273e;
  --muted: #94a3b8;
  --border: #334155;
  --text: #e2e8f0;
  --text-heading: #fff;
  --accent: #60a5fa;
  --success: #34d399;
}

/* Apply */
body {
  background: var(--bg);
  color: var(--text);
  transition: background 220ms ease, color 220ms ease;
  min-height: 100vh;
}

/* Cards & hover lift */
.card-anim {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(2,6,23,0.08); /* Lighter base shadow */
  transition: transform 220ms ease, box-shadow 220ms ease, background 220ms ease, border 220ms ease;
  will-change: transform;
}

.card-anim:hover {
  transform: translateY(-4px); /* Subtler lift */
  box-shadow: 0 8px 20px rgba(2,6,23,0.15); /* Sharper hover shadow */
}

/* Entrance animation: fade + slide */
@keyframes enterUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

.enter-up {
  animation: enterUp 420ms cubic-bezier(.2,.9,.2,1) both;
}

/* Simple icon button */
.icon-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 10px; /* Increased padding */
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 150ms ease;
}
.icon-btn:hover { background: rgba(0,0,0,0.05); }
.icon-btn:focus { outline: 2px solid var(--accent); outline-offset: 2px; }

html.dark .icon-btn:hover { background: rgba(255,255,255,0.08); }

/* small dropdown */
.dropdown-item {
  padding: 12px 16px; /* Increased padding */
  cursor: pointer;
  transition: background 150ms ease;
  font-size: 0.95rem;
}
.dropdown-item:hover { background: rgba(0,0,0,0.05); }
html.dark .dropdown-item:hover { background: rgba(255,255,255,0.08); }
      `;
      document.head.appendChild(s);
    }
  }, []);

  // load user and theme on mount
  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch (e) {
        setUser(null);
      }
    }
    const dark = localStorage.getItem("darkmode");
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = dark === "true" || (dark === null && prefersDark);
    applyDark(initial);
  }, []);

  // close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function applyDark(value) {
    setIsDark(Boolean(value));
    try {
      if (value) document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
      localStorage.setItem("darkmode", value ? "true" : "false");
    } catch (e) {
      console.warn("Failed to set dark mode", e);
    }
  }

  function toggleDark() {
    applyDark(!isDark);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
    window.location.reload();
  }

  return (
    <header style={styles.header}>
      <div style={styles.container}>

        {/* LEFT — Brand */}
        <Link to="/" style={styles.brand}>
          <svg width="32" height="32" viewBox="0 0 24 24" style={{ marginRight: 10 }}>
            {/* Using a subtle drop shadow for the logo box */}
            <defs>
                <filter id="logoShadow" x="0" y="0" width="200%" height="200%">
                    <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="var(--accent)" floodOpacity="0.4"/>
                </filter>
            </defs>
            <rect x="2" y="2" width="20" height="20" rx="5" fill="var(--accent)" filter="url(#logoShadow)" />
            <text x="12" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="#fff">AI</text>
          </svg>
          <span style={styles.brandText}>GenAI Quiz</span>
        </Link>

        {/* CENTER — Navigation Links */}
        <nav style={styles.centerNav}>
            <Link to="/discover" style={styles.navLink}>Discover</Link>
            <Link to="/create" style={styles.navLink}>Create</Link>
            {/* Added a Leaderboard link for quick access */}
            <Link to="/leaderboard" style={styles.navLink}>Leaderboard</Link>
        </nav>

        {/* RIGHT — Dark toggle + Login/Profile */}
        <div style={styles.right}>
          <button title="Toggle dark mode" onClick={toggleDark} className="icon-btn" aria-label="Toggle dark mode" style={{ marginRight: 4 }}>
            {isDark ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" fill="var(--accent)"/></svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 4v2M12 18v2M4 12H2M22 12h-2M5 5L3.5 3.5M20.5 20.5 19 19M19 5l1.5-1.5M3.5 20.5 5 19" stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round"/></svg>
            )}
          </button>

          {!user && (
            <Link to="/auth" style={styles.loginBtn}>
              Login / Signup
            </Link>
          )}

          {user && (
            <div style={{ position: "relative" }} ref={menuRef}>
              <div
                style={styles.avatarWrapper}
                onClick={() => setOpenMenu((p) => !p)}
                aria-haspopup="true"
                aria-expanded={openMenu}
                role="button"
              >
                {user.avatar ? (
                  <img src={user.avatar} alt="avatar" style={styles.avatar} />
                ) : (
                  <div style={styles.avatarPlaceholder}>
                    {(user.username || "U")[0].toUpperCase()}
                  </div>
                )}
              </div>

              {openMenu && (
                <div style={styles.dropdown} className="enter-up card-anim">
                  <div style={styles.dropdownInfo}>
                      <span style={{fontWeight: 700}}>{user.username}</span>
                      <span style={{fontSize: '0.8rem', color: 'var(--muted)'}}>{user.email}</span>
                  </div>
                  <hr style={styles.dropdownSeparator}/>
                  <Link to="/profile" className="dropdown-item" style={styles.dropdownItem} onClick={() => setOpenMenu(false)}>
                    Profile & Stats
                  </Link>
                  <Link to="/my-quizzes" className="dropdown-item" style={styles.dropdownItem} onClick={() => setOpenMenu(false)}>
                    My Quizzes
                  </Link>
                  <div className="dropdown-item" style={{ ...styles.dropdownItem, color: "var(--accent)", borderTop: '1px solid var(--border)' }} onClick={handleLogout}>
                    Logout
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/* ------------------- STYLES ------------------- */

const styles = {
  header: {
    borderBottom: "1px solid var(--border)",
    background: "var(--card)", /* Used card color for better integration */
    position: "sticky",
    top: 0,
    zIndex: 50,
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)", /* Subtle shadow for lift */
  },
  container: {
    maxWidth: 1400, /* Increased width to match HomePage */
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 24px", /* Increased vertical padding */
  },
  brand: {
    display: "flex",
    alignItems: "center",
    color: "var(--text-heading)",
    textDecoration: "none",
    fontSize: 22, /* Slightly larger brand text */
  },
  brandText: {
    fontWeight: 800
  },
  centerNav: { /* Navigation links added to center */
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    gap: '30px',
    margin: '0 40px',
  },
  navLink: {
    textDecoration: 'none',
    color: 'var(--text)',
    fontWeight: 600,
    padding: '5px 0',
    transition: 'color 150ms ease',
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  loginBtn: {
    padding: "10px 16px",
    background: "var(--accent)",
    color: "#fff",
    borderRadius: 8,
    textDecoration: "none",
    fontWeight: 700,
    fontSize: '0.95rem',
  },
  avatarWrapper: {
    cursor: "pointer",
    padding: '2px', // Slight padding for click target
    borderRadius: '50%',
    transition: 'opacity 150ms ease',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: "50%",
    objectFit: "cover",
  },
  avatarPlaceholder: {
    width: 38,
    height: 38,
    borderRadius: "50%",
    background: 'var(--border)',
    color: "var(--accent)",
    border: "2px solid var(--accent)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: 800,
    fontSize: 16,
  },
  dropdown: {
    position: "absolute",
    top: 50,
    right: 0,
    width: 220,
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: 10,
    boxShadow: "0 8px 28px rgba(2,6,23,0.2)",
    overflow: "hidden",
    zIndex: 100,
  },
  dropdownInfo: {
      display: 'flex',
      flexDirection: 'column',
      padding: '12px 16px',
      borderBottom: '1px dashed var(--border)',
  },
  dropdownSeparator: {
      height: 1,
      border: 'none',
      backgroundColor: 'var(--border)',
      margin: 0,
  },
  dropdownItem: {
    padding: "12px 16px",
    cursor: "pointer",
    fontSize: 15,
    textDecoration: 'none',
    color: 'var(--text)',
    display: 'block', // Ensure Link takes full width
  }
};
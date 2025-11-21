// client/src/components/Navbar.jsx
import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

/**
 * Navbar with:
 * - Brand
 * - Dark mode toggle (persists to localStorage)
 * - Login / Profile dropdown (now includes Leaderboard)
 *
 * Injects theme + structural CSS once, including mobile-responsive styles.
 */

const STYLE_ID = "app-theme-and-anim-styles";

// Helper function to get the current viewport width for dynamic style adjustments
const getViewportWidth = () => window.innerWidth;
const IS_MOBILE_BREAKPOINT = 768;

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [openMenu, setOpenMenu] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(getViewportWidth());
  const menuRef = useRef();
  const navigate = useNavigate();

  // Inject CSS once (Theme tokens + Structural/Responsive CSS)
  useEffect(() => {
    if (!document.getElementById(STYLE_ID)) {
      const s = document.createElement("style");
      s.id = STYLE_ID;
      s.innerHTML = `
/* Theme tokens (unchanged) */
:root {
  --bg: #f7f9fb;
  --card: #ffffff;
  --muted: #64748b;
  --border: #e2e8f0;
  --text: #0f172a;
  --text-heading: #1e293b;
  --accent: #2563eb;
  --success: #10b981;
}

html.dark {
  --bg: #0d1a2f;
  --card: #1c273e;
  --muted: #94a3b8;
  --border: #334155;
  --text: #e2e8f0;
  --text-heading: #fff;
  --accent: #60a5fa;
  --success: #34d399;
}

/* Apply (unchanged) */
body {
  background: var(--bg);
  color: var(--text);
  transition: background 220ms ease, color 220ms ease;
  min-height: 100vh;
}

/* Utility classes (unchanged) */
.card-anim {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(2,6,23,0.08);
  transition: transform 220ms ease, box-shadow 220ms ease, background 220ms ease, border 220ms ease;
  will-change: transform;
}
.card-anim:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(2,6,23,0.15);
}
@keyframes enterUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
.enter-up {
  animation: enterUp 420ms cubic-bezier(.2,.9,.2,1) both;
}
.icon-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 10px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 150ms ease;
}
.icon-btn:hover { background: rgba(0,0,0,0.05); }
.icon-btn:focus { outline: 2px solid var(--accent); outline-offset: 2px; }
html.dark .icon-btn:hover { background: rgba(255,255,255,0.08); }
.dropdown-item {
  padding: 12px 16px;
  cursor: pointer;
  transition: background 150ms ease;
  font-size: 0.95rem;
}
.dropdown-item:hover { background: rgba(0,0,0,0.05); }
html.dark .dropdown-item:hover { background: rgba(255,255,255,0.08); }

/* --- Structural CSS (Desktop/Mobile) --- */

/* Center Nav is now permanently hidden as requested (or removed from the DOM) */
.navbar-center-nav {
    display: none;
}
      `;
      document.head.appendChild(s);
    }
  }, []);

  // Window resize observer for dynamic inline styles
  useEffect(() => {
    function handleResize() {
        setViewportWidth(getViewportWidth());
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  // load user and theme on mount (unchanged logic)
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

  // close menu when clicking outside (unchanged logic)
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

  // --- Dynamic Styles for Mobile Responsiveness ---
  const isMobile = viewportWidth < IS_MOBILE_BREAKPOINT;

  const dynamicStyles = {
    container: {
      maxWidth: 1400,
      margin: "0 auto",
      display: "flex",
      alignItems: "center",
      // Changed justify-content to space-between to fill space vacated by center nav
      justifyContent: "space-between",
      padding: isMobile ? "10px 16px" : "10px 24px",
    },
    brand: {
      display: "flex",
      alignItems: "center",
      color: "var(--text-heading)",
      textDecoration: "none",
      fontSize: isMobile ? 18 : 22,
    },
    brandText: {
      fontWeight: 800
    },
    // centerNav is no longer needed
    navLink: {
      // Style is kept but element removed from render
      textDecoration: 'none',
      color: 'var(--text)',
      fontWeight: 600,
      padding: '5px 0',
      transition: 'color 150ms ease',
    },
    right: {
      display: "flex",
      alignItems: "center",
      gap: isMobile ? 8 : 12,
    },
    loginBtn: {
      padding: isMobile ? "8px 12px" : "10px 16px",
      background: "var(--accent)",
      color: "#fff",
      borderRadius: isMobile ? 6 : 8,
      textDecoration: "none",
      fontWeight: 700,
      fontSize: isMobile ? '0.85rem' : '0.95rem',
      whiteSpace: 'nowrap',
    },
    avatar: {
      width: isMobile ? 32 : 38,
      height: isMobile ? 32 : 38,
      borderRadius: "50%",
      objectFit: "cover",
    },
    avatarPlaceholder: {
      width: isMobile ? 32 : 38,
      height: isMobile ? 32 : 38,
      borderRadius: "50%",
      background: 'var(--border)',
      color: "var(--accent)",
      border: "2px solid var(--accent)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontWeight: 800,
      fontSize: isMobile ? 14 : 16,
    },
    dropdown: {
      position: "absolute",
      top: isMobile ? 45 : 50,
      right: 0,
      width: isMobile ? 200 : 220,
      background: "var(--card)",
      border: "1px solid var(--border)",
      borderRadius: 10,
      boxShadow: "0 8px 28px rgba(2,6,23,0.2)",
      overflow: "hidden",
      zIndex: 100,
    },
    dropdownItem: {
      padding: "12px 16px",
      cursor: "pointer",
      fontSize: 15,
      textDecoration: 'none',
      color: 'var(--text)',
      display: 'block',
    },
    // Non-responsive/Static styles are kept as original
    header: {
        borderBottom: "1px solid var(--border)",
        background: "var(--card)",
        position: "sticky",
        top: 0,
        zIndex: 50,
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    },
    avatarWrapper: {
        cursor: "pointer",
        padding: '2px',
        borderRadius: '50%',
        transition: 'opacity 150ms ease',
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
  };
  // ----------------------------------------------------

  return (
    <header style={dynamicStyles.header}>
      <div style={dynamicStyles.container}>

        {/* LEFT — Brand */}
        <Link to="/" style={dynamicStyles.brand}>
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
          <span style={dynamicStyles.brandText}>GenAI Quiz</span>
        </Link>

        {/* CENTER — Navigation Links (Removed content) */}
        {/* Keeping the container element with a permanent 'display: none' via injected CSS for now */}
        <nav className="navbar-center-nav">
            {/* Discover and Create links removed */}
            {/* Leaderboard link moved to dropdown */}
        </nav>

        {/* RIGHT — Dark toggle + Login/Profile */}
        <div style={dynamicStyles.right}>
          <button title="Toggle dark mode" onClick={toggleDark} className="icon-btn" aria-label="Toggle dark mode" style={{ marginRight: 4 }}>
            {isDark ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" fill="var(--accent)"/></svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 4v2M12 18v2M4 12H2M22 12h-2M5 5L3.5 3.5M20.5 20.5 19 19M19 5l1.5-1.5M3.5 20.5 5 19" stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round"/></svg>
            )}
          </button>

          {!user && (
            <Link to="/auth" style={dynamicStyles.loginBtn}>
              {isMobile ? "Login" : "Login / Signup"}
            </Link>
          )}

          {user && (
            <div style={{ position: "relative" }} ref={menuRef}>
              <div
                style={dynamicStyles.avatarWrapper}
                onClick={() => setOpenMenu((p) => !p)}
                aria-haspopup="true"
                aria-expanded={openMenu}
                role="button"
              >
                {user.avatar ? (
                  <img src={user.avatar} alt="avatar" style={dynamicStyles.avatar} />
                ) : (
                  <div style={dynamicStyles.avatarPlaceholder}>
                    {(user.username || "U")[0].toUpperCase()}
                  </div>
                )}
              </div>

              {openMenu && (
                <div style={dynamicStyles.dropdown} className="enter-up card-anim">
                  <div style={dynamicStyles.dropdownInfo}>
                      <span style={{fontWeight: 700}}>{user.username}</span>
                      <span style={{fontSize: '0.8rem', color: 'var(--muted)'}}>{user.email}</span>
                  </div>
                  <hr style={dynamicStyles.dropdownSeparator}/>
                  <Link to="/profile" className="dropdown-item" style={dynamicStyles.dropdownItem} onClick={() => setOpenMenu(false)}>
                    Profile & Stats
                  </Link>
                  <Link to="/leaderboard" className="dropdown-item" style={dynamicStyles.dropdownItem} onClick={() => setOpenMenu(false)}>
                    Leaderboard 🏆
                  </Link>
                  <Link to="/my-quizzes" className="dropdown-item" style={dynamicStyles.dropdownItem} onClick={() => setOpenMenu(false)}>
                    My Quizzes
                  </Link>
                  <div className="dropdown-item" style={{ ...dynamicStyles.dropdownItem, color: "var(--accent)", borderTop: '1px solid var(--border)' }} onClick={handleLogout}>
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
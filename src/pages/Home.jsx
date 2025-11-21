// client/src/pages/Home.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Helper function remains (used for background color calculation)
function hexToAlpha(hex, alpha = 0.12) {
  if (!hex) return `rgba(2,6,23,${alpha})`;
  const h = hex.replace("#", "");
  const bigint = parseInt(h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

// Footer Component
function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer style={styles.footer}>
      <div style={styles.footerContent}>
        <p style={{ margin: 0 }}>© {currentYear} AI Quiz Platform. All rights reserved.</p>
        <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)" }}>
          Powered by Generative AI.
        </p>
      </div>
    </footer>
  );
}

// Benefit Card Component
function BenefitCard({ icon, title, description, color, idx }) {
    const delay = `${idx * 100}ms`;
    return (
        <div 
            className="benefit-card enter-up" 
            style={{
                ...styles.benefitCardBase, 
                animationDelay: delay,
                borderLeft: `3px solid ${color}`,
            }}
        >
            <div style={{ fontSize: 32, marginBottom: 8 }}>{icon}</div>
            <h4 style={styles.benefitTitle}>{title}</h4>
            <p style={styles.benefitDescription}>{description}</p>
        </div>
    );
}

// Process Step Component (NEW)
function ProcessStep({ step, title, description, icon }) {
    return (
        <div style={styles.processStepContainer}>
            <div style={styles.processStepIcon}>{icon}</div>
            <div style={styles.processStepNumber}>{step}</div>
            <h4 style={styles.processStepTitle}>{title}</h4>
            <p style={styles.processStepDescription}>{description}</p>
        </div>
    );
}

// ActionCard Component
function ActionCard({ title, subtitle, color, action, idx, isPrimary, icon }) {
  const delay = `${idx * 80}ms`;
  
  const cardBg = isPrimary ? '#2563eb' : 'var(--card)';
  const cardBorder = isPrimary ? '#2563eb' : 'var(--border)';
  const textColor = isPrimary ? '#fff' : 'var(--text)';
  const subTextColor = isPrimary ? hexToAlpha('#fff', 0.8) : 'var(--muted)';
  
  const ctaColor = isPrimary ? color : '#fff';
  const ctaBg = isPrimary ? 'rgba(255, 255, 255, 0.9)' : color;

  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={action}
      onKeyDown={(e) => (e.key === "Enter" ? action() : null)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`card-anim enter-up`}
      style={{
        ...styles.cardBase,
        animationDelay: delay,
        background: cardBg,
        color: textColor,
        border: `1px solid ${cardBorder}`,
        boxShadow: isHovered 
          ? `0 10px 25px ${isPrimary ? 'rgba(37, 99, 235, 0.4)' : 'rgba(0,0,0,0.15)'}` 
          : '0 4px 12px rgba(0,0,0,0.05)',
        transform: isHovered ? 'translateY(-5px)' : 'translateY(0)',
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ fontSize: 48 }}>{icon}</div> 

        <div>
          <div style={styles.cardTitle}>{title}</div>
          <div style={{ color: subTextColor, fontSize: '0.95rem' }}>{subtitle}</div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
        <button 
          style={{ 
            ...styles.cta, 
            background: ctaBg, 
            color: ctaColor, 
            transform: isHovered ? 'scale(1.03)' : 'scale(1)',
          }}
        >
          Get Started
        </button>
      </div>
    </div>
  );
}


// Main Component
export default function Home() {
  const navigate = useNavigate();

  function goCreate() {
    navigate("/create");
  }
  function goDiscover() {
    navigate("/discover");
  }

  const actionCards = [
    {
      title: "Create a Quiz",
      subtitle: "Generate and save a full quiz on any custom topic in moments.",
      color: "#2563eb",
      action: goCreate,
      isPrimary: true,
      icon: "✨",
    },
    {
      title: "Discover & Play",
      subtitle: "Browse public quizzes, challenge friends, and join live sessions.",
      color: "#f59e0b",
      action: goDiscover,
      isPrimary: false,
      icon: "📚",
    }
  ];

  const benefitCards = [
    {
        icon: "⚡",
        title: "Instant Generation",
        description: "Generate structured, ready-to-use quizzes for any subject using our powerful AI.",
        color: "#2563eb",
    },
    {
        icon: "🔒",
        title: "Secure & Private",
        description: "Keep your custom content private or choose to share publicly with a secure link.",
        color: "#10b981",
    },
    {
        icon: "🏆",
        title: "Leaderboards & Scoring",
        description: "Engage your users with real-time scoring, grading, and session leaderboards.",
        color: "#f59e0b",
    }
  ];

  const processSteps = [
    {
      step: 1,
      icon: "✍️",
      title: "Input Topic",
      description: "Tell the AI what you want a quiz on (e.g., 'Quantum Physics' or '1990s Pop Music').",
    },
    {
      step: 2,
      icon: "🤖",
      title: "AI Generates",
      description: "The platform instantly creates multiple-choice and short answer questions, complete with explanations.",
    },
    {
      step: 3,
      icon: "🚀",
      title: "Share & Play",
      description: "Publish your quiz and share the link, or dive into a live session with others.",
    },
  ];

  return (
    <div style={styles.wrap}>
      {/* Inject CSS for efficient styling */}
      <style>{CSS_RULES}</style> 
      
      {/* --- HERO SECTION --- */}
      <div style={styles.hero}>
        <p style={styles.welcomeText}>👋 Welcome to the future of learning!</p>
        <h1 style={styles.heroTitle}>
          Instantly Generate & Share Engaging Quizzes
        </h1>
        <p style={styles.heroSubtitle}>
          Leverage **GenAI** to create interactive quizzes on any topic in seconds, and challenge your community with timed sessions.
        </p>
      </div>
      
      {/* --- ACTION GRID --- */}
      <div style={styles.grid}>
        {actionCards.map((c, i) => (
          <ActionCard key={c.title} idx={i} {...c} />
        ))}
      </div>

      <div style={styles.tipText}>
        <strong style={{ fontWeight: 700, color: 'var(--text)' }}>New User Tip:</strong> Start with the **Create a Quiz** option to see the AI generator in action! Quizzes are saved automatically to your profile.
      </div>

      {/* --- NEW SECTION: HOW IT WORKS --- */}
      <div style={styles.processSection}>
        <h2 style={styles.processHeader}>The Simple Process: How It Works</h2>
        <div style={styles.processGrid}>
          {processSteps.map((p, i) => (
            <ProcessStep key={p.step} {...p} />
          ))}
        </div>
      </div>

      {/* --- WHY CHOOSE US? SECTION --- */}
      <div style={styles.benefitsSection}>
        <h2 style={styles.benefitsHeader}>Why Choose Our Platform?</h2>
        <div style={styles.benefitsGrid}>
            {benefitCards.map((b, i) => (
                <BenefitCard key={b.title} idx={i} {...b} />
            ))}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

// --- CSS RULES (For efficient hover transitions, added to component) ---
const CSS_RULES = `
  /* Global transition for cards */
  .card-anim, .benefit-card {
    transition: transform 0.3s ease-out, box-shadow 0.3s ease-out;
  }
  
  /* Shared Hover Effects */
  .secondary-card:hover, .benefit-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0,0,0,0.15);
  }
  
  /* Primary Card Hover */
  .primary-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(37, 99, 235, 0.4);
  }
`;

// --- Inline Styles (Refined for structure and width increase) ---
const styles = {
  // ✨ INCREASED WIDTH: Max width set to 1600px
  wrap: { 
    maxWidth: 1600, 
    margin: "0 auto", 
    padding: "0 16px", // Maintain horizontal padding for small screens
    paddingBottom: '50px'
  },
  
  // Hero Styles
  hero: { 
    textAlign: "center", 
    marginBottom: 40, 
    padding: "30px 0 20px 0"
  },
  welcomeText: {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: '#10b981',
    textTransform: 'uppercase',
    letterSpacing: '0.1em'
  },
  heroTitle: {
    margin: 0,
    fontSize: '2.8rem',
    fontWeight: 900,
    lineHeight: 1.15,
    color: 'var(--text-heading)'
  },
  heroSubtitle: { 
    marginTop: 14, 
    color: "var(--muted)", 
    maxWidth: 800, // Widened max width for better utilization
    margin: '14px auto 0 auto',
    fontSize: '1.05rem'
  },
  
  // Action Card Grid
  grid: { 
    display: "grid", 
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
    gap: 20 
  },
  // Card Base Structure
  cardBase: { 
    padding: 24, 
    borderRadius: 16, 
    minHeight: 200, 
    cursor: 'pointer',
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: 22, 
    fontWeight: 800, 
    marginBottom: 4
  },
  
  cta: { 
    padding: "10px 20px", 
    borderRadius: 8, 
    border: "none", 
    fontWeight: 700,
    fontSize: '1rem',
    transition: 'transform 0.2s',
  },

  // Process Section (NEW)
  processSection: {
      marginTop: 60,
      marginBottom: 60,
      padding: '20px',
      textAlign: 'center',
      borderTop: '1px solid var(--border)',
      paddingTop: 40,
  },
  processHeader: {
      fontSize: '2rem',
      fontWeight: 800,
      marginBottom: 40,
      color: 'var(--text-heading)',
  },
  processGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
      gap: 30,
      textAlign: 'center',
  },
  processStepContainer: {
      padding: 15,
      position: 'relative',
  },
  processStepIcon: {
      fontSize: 48,
      marginBottom: 10,
  },
  processStepNumber: {
      fontSize: '2.5rem',
      fontWeight: 900,
      color: 'var(--border)',
      position: 'absolute',
      top: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      opacity: 0.1,
      zIndex: -1,
  },
  processStepTitle: {
      fontSize: '1.4rem',
      fontWeight: 700,
      color: 'var(--text-heading)',
      margin: '0 0 8px 0',
  },
  processStepDescription: {
      fontSize: '0.95rem',
      color: 'var(--muted)',
      margin: 0,
  },

  // Benefits Section Styles
  benefitsSection: {
      marginTop: 80,
      marginBottom: 60,
      padding: '20px',
      textAlign: 'center',
      borderTop: '1px solid var(--border)',
      paddingTop: 40,
  },
  benefitsHeader: {
      fontSize: '2rem',
      fontWeight: 800,
      marginBottom: 40,
      color: 'var(--text-heading)',
  },
  // Widened min width for benefits cards
  benefitsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", 
      gap: 20,
      textAlign: 'left',
  },
  benefitCardBase: {
      padding: 20,
      borderRadius: 12,
      background: 'var(--card)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      transition: 'transform 0.3s ease-out, box-shadow 0.3s ease-out', 
      minHeight: 180,
  },
  benefitTitle: {
      fontSize: '1.25rem',
      fontWeight: 700,
      color: 'var(--text-heading)',
      margin: '0 0 8px 0',
  },
  benefitDescription: {
      fontSize: '0.9rem',
      color: 'var(--muted)',
      margin: 0,
  },
  
  tipText: {
    maxWidth: 900, 
    margin: "40px auto 30px",
    color: "var(--muted)", 
    fontSize: 13, 
    textAlign: 'center'
  },
  
  // Footer Styles
  footer: {
    padding: "20px 0",
    marginTop: "20px",
    borderTop: "1px solid var(--border)",
    textAlign: "center",
  },
  footerContent: {
    maxWidth: 900, 
    margin: "0 auto", 
    color: "var(--muted)"
  }
};
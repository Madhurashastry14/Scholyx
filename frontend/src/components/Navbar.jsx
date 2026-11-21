import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth.js";
import LogoMark from "./LogoMark";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const { status, user, logout } = useAuth();
  const navigate = useNavigate();
  const firstName = user?.full_name?.trim().split(/\s+/)[0];

  const handleLogout = async () => {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);

    try {
      await logout();
    } finally {
      navigate("/login");
    }
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        <LogoMark />
        <span className="logo-word">
          Schol<span>yx</span>
        </span>
      </Link>

      <button
        className="menu-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle navigation menu"
        aria-expanded={menuOpen}
      >
        ☰
      </button>

      <div className={`nav-links ${menuOpen ? "active" : ""}`}>
        <Link to="/" onClick={() => setMenuOpen(false)}>
          Home
        </Link>
        <Link to="/scholarships" onClick={() => setMenuOpen(false)}>
          Scholarships
        </Link>
        <Link to="/about" onClick={() => setMenuOpen(false)}>
          About
        </Link>

        {status === "authenticated" ? (
          <div className="nav-user">
            {firstName && (
              <span className="nav-user-name">Hi, {firstName}</span>
            )}
            <button
              type="button"
              className="nav-logout-btn"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              {loggingOut ? "Logging out…" : "Logout"}
            </button>
          </div>
        ) : status === "loading" ? null : (
          <div className="nav-buttons">
            <Link
              to="/login"
              className="login-btn"
              onClick={() => setMenuOpen(false)}
            >
              Login
            </Link>
            <Link
              to="/register"
              className="get-started-btn"
              onClick={() => setMenuOpen(false)}
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;

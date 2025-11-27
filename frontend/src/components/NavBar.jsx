import {
  LineChart,
  BookOpen,
  Users,
  Activity,
  Settings,
  Zap,
  Search,
  LogIn,
  UserPlus,
  Trophy,
  Menu,
  X,
  TrendingUp,
} from "lucide-react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import React, { useState, useEffect, useRef } from "react";
import { searchBar } from "../api/StockApi";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { Offcanvas } from "react-bootstrap";

export default function NavBar() {
  // State for mobile menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const closeMenu = () => setIsMobileMenuOpen(false);
  const toggleMenu = () => setIsMobileMenuOpen((v) => !v);
  const { pathname } = useLocation();

  // Close drawer after navigation
  useEffect(() => {
    closeMenu();
  }, [pathname]);

  const navItemsMain = [
    { name: "Dashboard", icon: LineChart, link: "/dashboard" },
    { name: "Popular", icon: TrendingUp, link: "/popular" },
    { name: "Tournament", icon: Trophy, link: "/tournament" },
    { name: "Trade", icon: Users, link: "/trade" },
    { name: "History", icon: Activity, link: "/history" },
  ];

  const navItemsSupport = [
    { name: "Get Started", icon: Zap, link: "/get-started" },
    { name: "Settings", icon: Settings, link: "/settings" },
  ];

  const navItemsAccount = [
    { name: "Sign In", icon: LogIn, isActive: false, link: "/signin" },
    {
      name: "Create Account",
      icon: UserPlus,
      isActive: false,
      link: "/signup",
    },
  ];

  const navStyle = {
    width: "250px",
    minHeight: "100vh",
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 1000,
    boxShadow: "2px 0 15px rgba(0, 0, 0, 0.1)",
    borderTopRightRadius: "20px",
    borderBottomRightRadius: "20px",
  };

  const linkClass =
    "d-flex align-items-center rounded-lg p-3 text-decoration-none transition-colors duration-200";

  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/signin");
  };

  // Reusable nav content for both desktop sidebar and mobile drawer
  const NavContent = ({ onLinkClick }) => (
    <>
      <div className="mb-5 px-1 pt-2">
        <Link
          className="navbar-brand fw-bold fs-4 text-dark d-flex align-items-center"
          to="/"
          onClick={onLinkClick}
        >
          <span className="me-2 text-danger">TRD</span>
          <span className="text-secondary">Wars</span>
        </Link>
      </div>

      <div className="mb-3 px-1">
        <SearchInline onNavigate={() => { if (onLinkClick) onLinkClick(); }} />
      </div>

      <div className="flex-grow-1">
        <h6 className="text-uppercase text-muted fw-semibold mb-2 px-1">
          Main
        </h6>
        <ul className="nav nav-pills flex-column mb-4">
          {navItemsMain.map((item) => {
            const Icon = item.icon;
            return (
              <li className="nav-item mb-1" key={item.name}>
                <NavLink
                  to={item.link}
                  onClick={onLinkClick}
                  className={({ isActive }) =>
                    `${linkClass} ${
                      isActive
                        ? "bg-red-100 text-danger fw-semibold"
                        : "text-gray-600 hover:bg-gray-100"
                    } w-100`
                  }
                >
                  <Icon className="me-3" size={20} />
                  {item.name}
                </NavLink>
              </li>
            );
          })}
        </ul>

        <h6 className="text-uppercase text-muted fw-semibold mb-2 px-1">
          Support
        </h6>
        <ul className="nav nav-pills flex-column">
          {navItemsSupport.map((item) => {
            const Icon = item.icon;
            return (
              <li className="nav-item mb-1" key={item.name}>
                {item.link ? (
                  <NavLink
                    to={item.link}
                    onClick={onLinkClick}
                    className={({ isActive }) =>
                      `${linkClass} ${
                        isActive
                          ? "bg-red-100 text-danger fw-semibold"
                          : "text-gray-600 hover:bg-gray-100"
                      } w-100`
                    }
                  >
                    <Icon className="me-3" size={20} />
                    {item.name}
                  </NavLink>
                ) : (
                  <a className={`${linkClass} text-gray-600 w-100`} href="#">
                    <Icon className="me-3" size={20} />
                    {item.name}
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-auto pt-3 border-top border-light">
        {auth ? (
          <div className="flex align-items-center justify-content-between p-2 w-100">
            <Link
              className="d-flex align-items-center p-2 text-decoration-none"
              to="/account"
              onClick={onLinkClick}
            >
              <div className="me-3">
                <img
                  src="https://placehold.co/40x40/007bff/ffffff?text=TW"
                  alt="User Avatar"
                  className="rounded-circle"
                />
              </div>
              <div>
                <div className="fw-semibold text-dark">{auth.name}</div>
                <div className="text-muted small">{auth.email}</div>
              </div>
            </Link>

            <div className="d-flex justify-content-center mt-4">
              <motion.button
                className="btn btn-danger btn-medium w-10 fw-medium text-white"
                style={{
                  borderRadius: "12px",
                }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  handleLogout();
                  if (onLinkClick) onLinkClick();
                }}
              >
                Logout
              </motion.button>
            </div>
          </div>
        ) : (
          <ul className="nav nav-pills flex-column">
            {navItemsAccount.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.link}
                  onClick={onLinkClick}
                  className={`${linkClass} w-100`}
                >
                  <li className="nav-item mb-1">
                    <Icon className="me-3" size={20} />
                    {item.name}
                  </li>
                </Link>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );

  function SearchInline({ onNavigate }) {
    const [q, setQ] = useState('')
    const [suggestions, setSuggestions] = useState([])
    const [loading, setLoading] = useState(false)
    const timer = useRef(null)
    const navigate = useNavigate()

    useEffect(() => {
      if (!q || q.length < 1) {
        setSuggestions([])
        setLoading(false)
        return
      }

      setLoading(true)
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => {
        searchBar(q)
          .then((res) => setSuggestions((res.data && res.data.result) || []))
          .catch(() => setSuggestions([]))
          .finally(() => setLoading(false))
      }, 300)

      return () => clearTimeout(timer.current)
    }, [q])

    function select(sym) {
      setQ('')
      setSuggestions([])
      navigate(`/stocks/${sym}`)
      if (onNavigate) onNavigate(sym)
    }

    return (
      <div className="position-relative">
        <div className="input-group">
          <span className="input-group-text"><Search size={16} /></span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="form-control"
            placeholder="Search for Stock"
            aria-label="Quick symbol search"
          />
        </div>

        {q && suggestions && suggestions.length > 0 && (
          <ul className="list-group position-absolute w-100 mt-1" style={{ zIndex: 2000 }}>
            {suggestions.slice(0, 6).map((s) => (
              <li key={s.symbol} className="list-group-item list-group-item-action" style={{ cursor: 'pointer' }} onClick={() => select(s.symbol)}>
                <strong>{s.symbol}</strong> <span className="text-muted">{s.description}</span>
              </li>
            ))}
          </ul>
        )}

        {q && loading && <div className="small text-muted mt-1">Searching...</div>}
      </div>
    )
  }

  return (
    <>
      {/* Mobile header (≤ md) */}
      <div
        className="d-md-none position-fixed top-0 start-0 w-100 bg-white"
        style={{
          height: "64px",
          zIndex: 1050,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}
      >
        <div className="d-flex align-items-center justify-content-between px-3 h-100">
          <button
            className="btn btn-link p-2"
            onClick={toggleMenu}
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-drawer"
            style={{ minWidth: "44px", minHeight: "44px" }}
          >
            <Menu size={24} />
          </button>
          <Link to="/" className="fw-bold fs-5 text-decoration-none">
            <span className="text-danger">TRD</span>
            <span className="text-secondary">Wars</span>
          </Link>
          <div style={{ width: "44px" }} />
        </div>
      </div>

      {/* Desktop sidebar (≥ md) */}
      <nav
        style={navStyle}
        className="d-none d-md-flex bg-white p-4 flex-column"
      >
        <NavContent />
      </nav>

      {/* Mobile drawer (Offcanvas) */}
      <Offcanvas
        id="mobile-drawer"
        placement="start"
        show={isMobileMenuOpen}
        onHide={closeMenu}
        restoreFocus
        scroll={false}
        backdrop
        aria-labelledby="mobile-drawer-title"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title id="mobile-drawer-title">Navigation</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="d-flex flex-column">
          <NavContent onLinkClick={closeMenu} />
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

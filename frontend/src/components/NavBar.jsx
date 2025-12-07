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
  ChevronDown,
} from "lucide-react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import React, { useState, useEffect, useRef } from "react";
import { searchBar } from "../api/StockApi";
import { useAuth } from "../context/AuthContext";
import { useAccount } from "../context/AccountContext";
import { motion as Motion } from "framer-motion";
import { Offcanvas } from "react-bootstrap";
import { Wallet } from "lucide-react";

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
    // TODO: removed settings -- can add back if we find a reason to
    // { name: "Settings", icon: Settings, link: "/settings" },
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
    width: "270px",
    minHeight: "100vh",
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 1000,
  };

  const linkClass =
    "d-flex align-items-center rounded-3 p-3 text-decoration-none nav-link-modern";

  const { auth, logout } = useAuth();
  const {
    accounts,
    selectedAccountId,
    selectedAccount,
    setSelectedAccountId,
    loading: accountLoading,
  } = useAccount();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/signin");
  };

  // Reusable nav content for both desktop sidebar and mobile drawer
  const NavContent = ({ onLinkClick }) => (
    <>
      <div className="nav-glow one" />
      <div className="nav-glow two" />

      <div className="mb-5 pt-2 position-relative">
        <Link
          className="brand-mark text-decoration-none d-flex align-items-center gap-3"
          to="/"
          onClick={onLinkClick}
        >
          <span className="brand-logo shadow-sm">TW</span>
          <span>
            <div className="fw-bold fs-5">TRD Wars</div>
          </span>
        </Link>
      </div>

      <div className="mb-3">
        <SearchInline
          onNavigate={() => {
            if (onLinkClick) onLinkClick();
          }}
        />
      </div>

      <div className="flex-grow-1 position-relative">
        <h6 className="text-uppercase nav-section-label fw-semibold mb-1">
          Main
        </h6>
        <ul className="nav nav-pills flex-column mb-2">
          {navItemsMain.map((item) => {
            const Icon = item.icon;
            return (
              <li className="nav-item mb-1" key={item.name}>
                <NavLink
                  to={item.link}
                  onClick={onLinkClick}
                  className={({ isActive }) =>
                    `${linkClass} ${isActive ? "active fw-semibold" : ""} w-100`
                  }
                >
                  <Icon className="me-3" size={20} />
                  {item.name}
                </NavLink>
              </li>
            );
          })}
        </ul>

        <h6 className="text-uppercase nav-section-label fw-semibold mb-1">
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
                        isActive ? "active fw-semibold" : ""
                      } w-100`
                    }
                  >
                    <Icon className="me-3" size={20} />
                    {item.name}
                  </NavLink>
                ) : (
                  <a className={`${linkClass} w-100`} href="#">
                    <Icon className="me-3" size={20} />
                    {item.name}
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-auto pt-3 nav-footer position-relative w-100">
        {auth ? (
          <div>
            {/* Account Switcher */}
            {!accountLoading && accounts.length > 0 && (
              <div className="mb-4">
                <label
                  className="d-block mb-2 small text-uppercase text-center"
                  style={{
                    letterSpacing: "0.1em",
                    color: "rgba(232,237,255,0.65)",
                    fontSize: "0.8rem",
                  }}
                >
                  <Wallet
                    size={16}
                    className="me-1"
                    style={{ verticalAlign: "text-bottom" }}
                  />
                  Active Account
                </label>
                <div className="account-select-wrapper position-relative">
                  <select
                    className={`form-select form-select-sm w-100 account-select text-center ${
                      accounts.length > 1 ? "has-dropdown" : ""
                    }`}
                    style={{
                      paddingTop: "0.5rem",
                      paddingBottom: "0.5rem",
                      fontSize: "1.1rem",
                    }}
                    value={selectedAccountId ?? ""}
                    onChange={(e) => {
                      const newAccountId = e.target.value
                        ? Number(e.target.value)
                        : null;
                      setSelectedAccountId(newAccountId);
                    }}
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name || "Main Account"}
                      </option>
                    ))}
                  </select>
                  {accounts.length > 1 && (
                    <ChevronDown
                      size={16}
                      className="dropdown-indicator"
                      aria-hidden="true"
                    />
                  )}
                </div>
                {selectedAccount && (
                  <div
                    className="small mt-2 text-center"
                    style={{ color: "rgba(232,237,255,0.75)" }}
                  >
                    Cash Balance: $
                    {selectedAccount.cash?.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }) || "0.00"}
                  </div>
                )}
              </div>
            )}

            <hr className="my-4 text-white-50" />

            <div className="nav-user-block">
              <Link
                className="d-flex align-items-center gap-3 text-decoration-none flex-grow-1"
                to="/account"
                onClick={onLinkClick}
              >
                <img
                  src={`https://placehold.co/40x40/6B8EF0/ffffff?text=${
                    auth.name?.toUpperCase()?.[0]
                  }`}
                  alt="User Avatar"
                  className="avatar"
                />
                <div className="text-light">
                  <div className="fw-semibold">{auth.name}</div>
                  <div
                    className="small"
                    style={{ color: "rgba(255,255,255,0.7)" }}
                  >
                    {auth.email}
                  </div>
                </div>
              </Link>
            </div>

            <div className="d-flex justify-content-center mt-3">
              <Motion.button
                className="btn btn-danger nav-logout-btn text-white"
                whileTap={{ scale: 0.92 }}
                onClick={() => {
                  handleLogout();
                  if (onLinkClick) onLinkClick();
                }}
              >
                Logout
              </Motion.button>
            </div>
          </div>
        ) : (
          <ul className="nav nav-pills flex-column">
            {navItemsAccount.map((item) => {
              const Icon = item.icon;
              return (
                <li className="nav-item mb-1" key={item.name}>
                  <NavLink
                    to={item.link}
                    onClick={onLinkClick}
                    className={({ isActive }) =>
                      `${linkClass} ${
                        isActive ? "active fw-semibold" : ""
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
        )}
      </div>
    </>
  );

  function SearchInline({ onNavigate }) {
    const [q, setQ] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const timer = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
      if (!q || q.length < 1) {
        setSuggestions([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        searchBar(q)
          .then((res) => setSuggestions((res.data && res.data.result) || []))
          .catch(() => setSuggestions([]))
          .finally(() => setLoading(false));
      }, 300);

      return () => clearTimeout(timer.current);
    }, [q]);

    function select(sym) {
      setQ("");
      setSuggestions([]);
      navigate(`/stocks/${sym}`);
      if (onNavigate) onNavigate(sym);
    }

    return (
      <div className="position-relative">
        <div className="nav-search p-2">
          <div className="input-group">
            <span className="input-group-text">
              <Search size={16} />
            </span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="form-control"
              placeholder="Search for Stock"
              aria-label="Quick symbol search"
            />
          </div>
        </div>

        {q && suggestions && suggestions.length > 0 && (
          <ul
            className="list-group position-absolute w-100 mt-1 search-suggestions"
            style={{ zIndex: 2000 }}
          >
            {suggestions.slice(0, 6).map((s) => (
              <li
                key={s.symbol}
                className="list-group-item list-group-item-action"
                style={{ cursor: "pointer" }}
                onClick={() => select(s.symbol)}
              >
                <strong>{s.symbol}</strong>{" "}
                <span className="text-muted">{s.description}</span>
              </li>
            ))}
          </ul>
        )}

        {q && loading && (
          <div className="small text-white text-center mt-1">Searching...</div>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Mobile header (≤ md) */}
      <div
        className="d-md-none position-fixed top-0 start-0 w-100 nav-shell"
        style={{
          height: "64px",
          zIndex: 1050,
        }}
      >
        <div className="d-flex align-items-center justify-content-between px-3 h-100">
          <button
            className="btn btn-link p-2 text-light"
            onClick={toggleMenu}
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-drawer"
            style={{ minWidth: "44px", minHeight: "44px" }}
          >
            <Menu size={24} />
          </button>
          <Link to="/" className="fw-bold fs-5 text-decoration-none text-light">
            <span className="text-gradient">TRD</span>
            <span className="ms-1 text-light">Wars</span>
          </Link>
          <div style={{ width: "44px" }} />
        </div>
      </div>

      {/* Desktop sidebar (≥ md) */}
      <nav
        style={navStyle}
        className="d-none d-md-flex nav-shell p-4 flex-column"
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
        className="nav-shell text-light"
      >
        <Offcanvas.Header closeButton closeVariant="white">
          <Offcanvas.Title id="mobile-drawer-title" className="text-light">
            Navigation
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="d-flex flex-column">
          <NavContent onLinkClick={closeMenu} />
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

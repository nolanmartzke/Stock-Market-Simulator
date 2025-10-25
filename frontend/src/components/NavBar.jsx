import { LineChart, BookOpen, Users, Activity, Settings, Zap, LogIn, UserPlus, Trophy } from "lucide-react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import React from "react";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";




export default function NavBar() {
  const navItemsMain = [
    { name: "Dashboard", icon: LineChart, link: "/dashboard" },
    { name: "Leaderboard", icon: Trophy, link: "/leaderboard" },
    { name: "Trade", icon: Users, link: "/trade" },
    { name: "History", icon: Activity, link: "/history" },
  ];

  const navItemsSupport = [
    { name: "Get Started", icon: Zap, link: "/get-started" },
    { name: "Settings", icon: Settings, link: "/settings" },
  ];

  const navItemsAccount = [
    { name: "Sign In", icon: LogIn, isActive: false, link: "/signin" },
    { name: "Create Account", icon: UserPlus, isActive: false, link: "/signup" },
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
    navigate('/signin');
  };

  return (
    <nav style={navStyle} className="bg-white p-4 d-flex flex-column">
      <div className="mb-5 px-1 pt-2">
        <Link
          className="navbar-brand fw-bold fs-4 text-dark d-flex align-items-center"
          to="/"
        >
          <span className="me-2 text-danger">TRD</span>
          <span className="text-secondary">Wars</span>
        </Link>
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
                  className={({ isActive }) =>
                    `${linkClass} ${isActive ? 'bg-red-100 text-danger fw-semibold' : 'text-gray-600 hover:bg-gray-100'} w-100`
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
                    className={({ isActive }) =>
                      `${linkClass} ${isActive ? 'bg-red-100 text-danger fw-semibold' : 'text-gray-600 hover:bg-gray-100'} w-100`
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

        {auth ?
          <div className="flex align-items-center justify-content-between p-2 w-100">
            <Link className="d-flex align-items-center p-2 text-decoration-none" to="/account">
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
                whileTap={{ scale: 0.9 }} // animation upon click
                onClick={handleLogout}
              >
                Logout
              </motion.button>
            </div>
          </div>
          :
          <ul className="nav nav-pills flex-column">
            {navItemsAccount.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.name} to={item.link} className={`${linkClass} w-100`}>
                  <li className="nav-item mb-1" key={item.name}>
                    <Icon className="me-3" size={20} />
                    {item.name}
                  </li>
                </Link>
              );
            })}
          </ul>

        }
      </div>
    </nav >
  );
}

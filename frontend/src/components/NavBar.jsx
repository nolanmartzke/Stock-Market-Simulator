import React from "react";
import {
  LineChart,
  BookOpen,
  Users,
  Activity,
  Settings,
  Zap,
} from "lucide-react";

export default function NavBar() {
  const navItemsMain = [
    { name: "Reports", icon: LineChart, isActive: true },
    { name: "Trade", icon: Users, isActive: false },
    { name: "History", icon: Activity, isActive: false },
  ];

  const navItemsSupport = [
    { name: "Get Started", icon: Zap, isActive: false },
    { name: "Settings", icon: Settings, isActive: false },
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

  return (
    <nav style={navStyle} className="bg-white p-4 d-flex flex-column">
      <div className="mb-5 px-1 pt-2">
        <a
          className="navbar-brand fw-bold fs-4 text-dark d-flex align-items-center"
          href="#"
        >
          <span className="me-2 text-danger">TRD</span>
          <span className="text-secondary">Wars</span>
        </a>
      </div>

      <div className="flex-grow-1">
        <h6 className="text-uppercase text-muted fw-semibold mb-2 px-1">
          Main
        </h6>
        <ul className="nav nav-pills flex-column mb-4">
          {navItemsMain.map((item) => {
            const Icon = item.icon;
            const isActiveClass = item.isActive
              ? "bg-red-100 text-danger fw-semibold"
              : "text-gray-600 hover:bg-gray-100";
            return (
              <li className="nav-item mb-1" key={item.name}>
                <a className={`${linkClass} ${isActiveClass} w-100`} href="#">
                  <Icon className="me-3" size={20} />
                  {item.name}
                </a>
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
            const isActiveClass = item.isActive
              ? "bg-red-100 text-danger fw-semibold"
              : "text-gray-600 hover:bg-gray-100";

            return (
              <li className="nav-item mb-1" key={item.name}>
                <a className={`${linkClass} ${isActiveClass} w-100`} href="#">
                  <Icon className="me-3" size={20} />
                  {item.name}
                </a>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-auto pt-3 border-top border-light">
        <div className="d-flex align-items-center p-2">
          <div className="me-3">
            <img
              src="https://placehold.co/40x40/007bff/ffffff?text=TW"
              alt="User Avatar"
              className="rounded-circle"
            />
          </div>
          <div>
            <div className="fw-semibold text-dark">Trade Warrior</div>
            <div className="text-muted small">warrior@example.com</div>
          </div>
        </div>
      </div>
    </nav>
  );
}

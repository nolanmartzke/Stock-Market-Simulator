import React from "react";
import { Outlet } from "react-router-dom";
import NavBar from "../components/NavBar";

/**
 * MainLayout - Layout for authenticated app pages
 * Renders fixed sidebar (NavBar) + main content area with left margin
 * Uses Outlet for nested routes
 */
export default function MainLayout() {
  return (
    <div className="app-root bg-light min-vh-100">
      <NavBar />
      <div className="main-content" style={{ marginLeft: "250px" }}>
        <Outlet />
      </div>
    </div>
  );
}

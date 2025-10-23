import React from "react";
import { Outlet } from "react-router-dom";

/**
 * AuthLayout - Minimal layout for authentication pages (SignIn, SignUp)
 * No sidebar, no main header - just centers content on screen
 * Relies on existing Bootstrap theme and token bridge from App.css
 */
export default function AuthLayout() {
  return (
    <main className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="container py-5">
        <Outlet />
      </div>
    </main>
  );
}

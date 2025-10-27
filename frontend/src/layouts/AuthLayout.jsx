import React from "react";
import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <main className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="container py-5">
        <Outlet />
      </div>
    </main>
  );
}

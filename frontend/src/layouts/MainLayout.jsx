import React from "react";
import { Outlet } from "react-router-dom";
import NavBar from "../components/NavBar";
import { Toaster } from "sonner";

export default function MainLayout() {
  return (
    <div className="app-root bg-light min-vh-100">
      <NavBar />
      <div className="main-content">
        <Toaster
          position="bottom-center"
          theme="light"
          richColors
          closeButton
          expand
          offset={12}
          toastOptions={{
            duration: 3200,
            className: "border-0 shadow-lg",
            descriptionClassName: "text-dark",
            style: {
              background: "#f0f6ff",
              color: "#0c1a33",
              border: "3px solid #2b7bff",
              boxShadow:
                "0 18px 40px rgba(0,0,0,0.3), 0 0 0 4px rgba(43,123,255,0.18)",
              borderRadius: "18px",
              fontWeight: 600,
              letterSpacing: "0.01em",
              fontSize: "16px",
              lineHeight: "1.35",
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
            },
          }}
        />
        <Outlet />
      </div>
    </div>
  );
}

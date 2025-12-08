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
          theme="dark"
          richColors
          closeButton
          expand
          offset={12}
          toastOptions={{
            duration: 3200,
            className: "border-0",
            descriptionClassName: "text-white-50",
            style: {
              background:
                "linear-gradient(135deg, rgba(10,15,30,0.95), rgba(20,35,70,0.92))",
              color: "#f1f5ff",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "0 20px 55px rgba(0,0,0,0.35)",
              borderRadius: "16px",
              backdropFilter: "blur(10px)",
              fontSize: "16px",
              lineHeight: "1.35",
              padding: "12px 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            },
          }}
        />
        <Outlet />
      </div>
    </div>
  );
}

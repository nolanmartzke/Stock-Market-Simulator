import "./App.css";
import React from "react";
import NavBar from "./components/NavBar";
import Home from "./pages/Home";

export default function App() {
  return (
    <div className="app-root bg-light min-vh-100">
      <NavBar />
      <div className="main-content" style={{ marginLeft: "250px" }}>
        <Home />
      </div>
    </div>
  );
}

import "./App.css";
import React from "react";
import { Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Account from "./pages/Account";
import ProtectedRoute from "./components/ProtectedRoute";


export default function App() {
  return (
    <>
      <div className="app-root bg-light min-vh-100">
        <NavBar />
        <div className="main-content" style={{ marginLeft: "250px" }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
          </Routes>
        </div>
      </div>
    </>
  );
}

import "./App.css";
import React from "react";
import { Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Account from "./pages/Account";
import ProtectedRoute from "./components/ProtectedRoute";
import History from "./pages/History";
import Trade from "./pages/Trade";
import Reports from "./pages/Reports";
import Leaderboard from "./pages/Leaderboard";
import GetStarted from "./pages/GetStarted";
import SettingsPage from "./pages/Settings";


export default function App() {
  return (
    <>
      <div className="app-root bg-light min-vh-100">
        <NavBar />
        <div className="main-content" style={{ marginLeft: "250px" }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
            <Route path="/get-started" element={<GetStarted />} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
            <Route path="/trade" element={<ProtectedRoute><Trade /></ProtectedRoute>} />
          </Routes>
        </div>
      </div>
    </>
  );
}

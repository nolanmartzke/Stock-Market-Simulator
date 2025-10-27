import "./App.css";
import React from "react";
import { Routes, Route } from "react-router-dom";
import AuthLayout from "./layouts/AuthLayout";
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

// Pages
import Landing from "./pages/Landing";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import AlreadyLoggedIn from "./pages/AlreadyLoggedIn";
import Home from "./pages/Home";
import Account from "./pages/Account";
import History from "./pages/History";
import Trade from "./pages/Trade";
import Reports from "./pages/Reports";
import Leaderboard from "./pages/Leaderboard";
import GetStarted from "./pages/GetStarted";
import SettingsPage from "./pages/Settings";
import ErrorPage from "./pages/ErrorPage";
import Stock from "./pages/Stock";
import Popular from "./pages/Popular";

export default function App() {
  const { auth } = useAuth();
  const isAuthenticated = !!auth;
  return (

    <Routes>
      {/* Landing page */}
      <Route path="/" element={<Landing />} />

      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route
          path="/signin"
          element={isAuthenticated ? <AlreadyLoggedIn /> : <SignIn />}
        />
        <Route
          path="/signup"
          element={isAuthenticated ? <AlreadyLoggedIn /> : <SignUp />}
        />
      </Route>

      {/* App routes */}
      <Route element={<MainLayout />}>
        <Route path="/home" element={<Home />} />
        <Route path="/get-started" element={<GetStarted />} />
        <Route path="/popular" element={<Popular />} />

        {/* Protected routes */}
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute>
              <Leaderboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trade"
          element={
            <ProtectedRoute>
              <Trade />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stocks/:query"
          element={
            <ProtectedRoute>
              <Stock />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<ErrorPage />} />
      </Route>
    </Routes>
>>>>>>> frontend/src/App.jsx
  );
}

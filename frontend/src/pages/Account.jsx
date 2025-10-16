import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const Account = () => {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!auth) return null;

  return (
    <div className="min-vh-100 bg-light d-flex align-items-center">
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card shadow-lg border-0" style={{ borderRadius: 20 }}>
              <div className="card-body p-4 p-md-5">
                {/* Header */}
                <div className="d-flex align-items-center mb-4">
                  <div
                    className="d-inline-flex align-items-center justify-content-center bg-primary rounded-circle me-3"
                    style={{ width: "50px", height: "50px" }}
                  >
                    <User className="text-white" size={24} />
                  </div>
                  <h1 className="h4 mb-0 fw-bold text-dark">Account Settings</h1>
                </div>

                {/* Name Field */}
                <div className="mb-3">
                  <label className="form-label fw-medium text-dark">
                    <User className="me-2" size={16} />
                    Name
                  </label>
                  <input
                    className="form-control form-control-lg"
                    style={{ borderRadius: "12px" }}
                    value={auth?.name ?? ""}
                    disabled
                    readOnly
                  />
                </div>

                {/* Email Field */}
                <div className="mb-4">
                  <label className="form-label fw-medium text-dark">
                    <User className="me-2" size={16} />
                    Email
                  </label>
                  <input
                    className="form-control form-control-lg"
                    style={{ borderRadius: "12px" }}
                    value={auth?.email ?? ""}
                    disabled
                    readOnly
                  />
                </div>

                {/* Future Features Placeholder */}
                <div className="alert alert-secondary mb-4" role="alert">
                  <small>Profile edits and password changes will appear here in a future update.</small>
                </div>

                {/* Logout Button */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="btn btn-outline-secondary btn-lg w-100 fw-medium text-dark"
                  style={{ borderRadius: 12 }}
                >
                  <LogOut size={18} className="me-2" />
                  Log Out
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
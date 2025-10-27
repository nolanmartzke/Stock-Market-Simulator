import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { CheckCircle } from "lucide-react";

/**
 * AlreadyLoggedIn - Shown when authenticated users visit /signin or /signup
 * Provides options to go to dashboard or logout
 */
export default function AlreadyLoggedIn() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/signin");
  };

  return (
    <section className="py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-6">
            <div
              className="card shadow-lg border-0"
              style={{ borderRadius: "20px" }}
            >
              <div className="card-body text-center p-4 p-md-5">
                {/* Success icon */}
                <div className="mb-4">
                  <div
                    className="d-inline-flex align-items-center justify-content-center bg-success bg-opacity-10 rounded-circle"
                    style={{ width: "80px", height: "80px" }}
                  >
                    <CheckCircle className="text-success" size={40} />
                  </div>
                </div>

                {/* Message */}
                <h1 className="h4 fw-bold text-dark mb-2">
                  You're already logged in
                </h1>
                {auth?.name && (
                  <p className="text-muted mb-4">
                    Signed in as <strong>{auth.name}</strong>
                  </p>
                )}

                {/* Actions */}
                <div className="d-flex flex-column flex-sm-row justify-content-center gap-3 mb-3">
                  <Link
                    to="/account"
                    className="btn btn-danger btn-lg"
                    style={{ borderRadius: "12px" }}
                  >
                    Go to Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="btn btn-outline-secondary btn-lg"
                    style={{ borderRadius: "12px" }}
                  >
                    Log out
                  </button>
                </div>

                {/* Helper text */}
                <p className="mt-3 small text-muted mb-0">
                  Or pick another page from the main app.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { changeName } from "../api/AuthAPI";

/**
 * Account page that shows read-only profile data and placeholder forms
 * for upcoming edit/change-password flows. Redirects to the landing page
 * when the user signs out.
 */
const Account = () => {
  const { auth, logout, login } = useAuth();
  const navigate = useNavigate();

  const [newName, setNewName] = useState();


  useEffect( () => {
    setNewName(auth?.name ?? "");
  }, [auth])

  function handleNameChange() {
    changeName(auth.email, newName)
      .then(res => {
        if (res.status === 200)
          login(res.data);
      })
  }

  /**
   * Clears the auth context/local storage and returns the user to the
   * marketing page so no private data remains visible.
   */
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Guard: wait for auth state before rendering the account shell.
  if (!auth) return null;

  return (
    <div className="min-vh-100 bg-light d-flex align-items-center">
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div
              className="card shadow-lg border-0"
              style={{ borderRadius: 20 }}
            >
              <div className="card-body p-4 p-md-5">
                {/* Header */}
                <div className="d-flex align-items-center mb-4">
                  <User size={28} className="me-2" />
                  <h1 className="h4 mb-0">Account Settings</h1>
                </div>

                {/* Edit Profile (placeholder) */}
                <h2 className="h6 text-uppercase text-secondary mb-3">
                  Edit Profile
                </h2>


                <div className="mb-3">
                  <label className="form-label fw-medium">Name</label>
                  <input
                    className="form-control form-control-lg"
                    style={{ borderRadius: "12px" }}
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label fw-medium">Email</label>
                  <input
                    className="form-control form-control-lg"
                    style={{ borderRadius: "12px" }}
                    value={auth?.email ?? ""}
                    disabled
                    readOnly
                  />
                </div>
                <button
                  className="btn btn-primary mt-2"
                  style={{ borderRadius: "12px" }}
                  disabled={newName == auth?.name}
                  onClick={handleNameChange}
                >
                  Save changes
                </button>



                <hr className="my-4" />

                {/* Change Password (placeholder) */}
                <h2 className="h6 text-uppercase text-secondary mb-3">
                  Change Password (coming soon)
                </h2>
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label fw-medium">
                      Current password
                    </label>
                    <input
                      type="password"
                      className="form-control form-control-lg"
                      style={{ borderRadius: "12px" }}
                      placeholder="••••••••"
                      disabled
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-medium">New password</label>
                    <input
                      type="password"
                      className="form-control form-control-lg"
                      style={{ borderRadius: "12px" }}
                      placeholder="Min 8 chars"
                      disabled
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-medium">
                      Confirm new password
                    </label>
                    <input
                      type="password"
                      className="form-control form-control-lg"
                      style={{ borderRadius: "12px" }}
                      placeholder="Match new password"
                      disabled
                    />
                  </div>
                </div>
                <small className="text-secondary d-block mt-2">
                  Requirements will appear here (length, character mix, etc.).
                </small>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="btn btn-outline-secondary w-100 mt-3"
                  style={{ borderRadius: 12 }}
                  disabled
                >
                  Update password
                </motion.button>

                <hr className="my-4" />

                {/* Logout (existing behavior) */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="btn btn-outline-secondary w-100 fw-medium"
                  style={{ borderRadius: 12 }}
                >
                  <LogOut size={18} className="me-2" />
                  Log out
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

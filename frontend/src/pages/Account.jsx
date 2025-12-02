import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, LogOut } from "lucide-react";
import { motion as Motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { changeName, changePassword} from "../api/AuthAPI";

/**
 * Account page that shows read-only profile data and placeholder forms
 * for upcoming edit/change-password flows. Redirects to the landing page
 * when the user signs out.
 */
const Account = () => {
  const { auth, logout, login } = useAuth();
  const navigate = useNavigate();

  const [newName, setNewName] = useState();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [passwordButtonStatus, setPasswordButtonStatus] = useState(false);

  const [updatePasswordText, setUpdatePasswordText] = useState("Update password");


  useEffect( () => {
    setNewName(auth?.name ?? "");
  }, [auth])

  useEffect( () => {

    setPasswordButtonStatus(false);

    if (!newPassword)
      setErrorMessage("");
    else if (newPassword.length < 8)
      setErrorMessage("Password Must Be Atleast 8 Characters");
    else if (newPasswordConfirm && newPassword != newPasswordConfirm)
      setErrorMessage("Passwords Do Not Match");
    else {
      setErrorMessage("");
      setPasswordButtonStatus(true)
    }

  }, [oldPassword, newPassword, newPasswordConfirm])


  function handleNameChange() {
    changeName(auth.email, newName)
      .then(res => {
        if (res.status === 200)
          login(res.data);
      })
  }

  function clickedUpdatePassword() {

    setUpdatePasswordText("Updating...");

    changePassword(auth.email, oldPassword, newPassword)
      .then(res => {
        if (res.status === 200){
          login(res.data);
          setUpdatePasswordText("Successfully Updated");
        }
      })
      .catch(err => {
        if (err.response?.status === 403)
          setUpdatePasswordText("Wrong Old Password");
        else
          setUpdatePasswordText("Error");
      })
      .finally(() => {
        setTimeout(() => setUpdatePasswordText("Update password"), 1500);
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
                  Change Password
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
                      placeholder="Enter Current Password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-medium">New password</label>
                    <input
                      type="password"
                      className="form-control form-control-lg"
                      style={{ borderRadius: "12px" }}
                      placeholder="Min 8 chars"
                      disabled={!oldPassword}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
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
                      disabled={!oldPassword}
                      value={newPasswordConfirm}
                      onChange={(e) => setNewPasswordConfirm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="text-danger mt-2" style={{ height: "20px" }}>
                  {errorMessage}
                </div>
                <Motion.button
                  whileTap={{ scale: 0.95 }}
                  className="btn btn-primary w-100 mt-3"
                  style={{ borderRadius: 12 }}
                  onClick={clickedUpdatePassword}
                  disabled={!passwordButtonStatus}
                >
                  {updatePasswordText}
                </Motion.button>

                <hr className="my-4" />

                {/* Logout (existing behavior) */}
                <Motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="btn btn-outline-secondary w-100 fw-medium"
                  style={{ borderRadius: 12 }}
                >
                  <LogOut size={18} className="me-2" />
                  Log out
                </Motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;

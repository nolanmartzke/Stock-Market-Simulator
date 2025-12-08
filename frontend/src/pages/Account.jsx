import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, LogOut, Plus } from "lucide-react";
import { motion as Motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { changeName, changePassword } from "../api/AuthAPI";
import { createAccount, getAccounts } from "../api/AccountApi";
import { useAccount } from "../context/AccountContext";

/**
 * Account page that shows read-only profile data and placeholder forms
 * for upcoming edit/change-password flows. Redirects to the landing page
 * when the user signs out.
 */
const Account = () => {
  const { auth, logout, login } = useAuth();
  const { setSelectedAccountId } = useAccount();

  const navigate = useNavigate();

  const [newName, setNewName] = useState();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [passwordButtonStatus, setPasswordButtonStatus] = useState(false);

  const [updatePasswordText, setUpdatePasswordText] =
    useState("Update password");

  const [accounts, setAccounts] = useState([]);
 const [newAccountName, setNewAccountName] = useState("");
  const [createAccountStatus, setCreateAccountStatus] = useState("idle");

  useEffect(() => {
    setNewName(auth?.name ?? "");
  }, [auth]);

  useEffect(() => {
    if (!auth?.id) return;
    getAccounts(auth.id)
      .then((res) => setAccounts(res.data || []))
      .catch((err) => console.error("Failed to load accounts", err));
  }, [auth]);

  function handleCreateAccount() {
    if (!newAccountName.trim() || !auth?.id) return;
    setCreateAccountStatus("creating");
    createAccount(auth.id, newAccountName.trim())
      .then((res) => {
        setAccounts((prev) => [...prev, res.data]);
        setNewAccountName("");
        setCreateAccountStatus("success");
        setTimeout(() => setCreateAccountStatus("idle"), 1500);

        setSelectedAccountId(res.data.id);
      })
      .catch(() => {
        setCreateAccountStatus("error");
        setTimeout(() => setCreateAccountStatus("idle"), 1500);
      });
  }

  useEffect(() => {
    setPasswordButtonStatus(false);

    if (!newPassword) setErrorMessage("");
    else if (newPassword.length < 8)
      setErrorMessage("Password Must Be Atleast 8 Characters");
    else if (newPasswordConfirm && newPassword != newPasswordConfirm)
      setErrorMessage("Passwords Do Not Match");
    else {
      setErrorMessage("");
      setPasswordButtonStatus(true);
    }
  }, [oldPassword, newPassword, newPasswordConfirm]);

  function handleNameChange() {
    changeName(auth.email, newName).then((res) => {
      if (res.status === 200) login(res.data);
    });
  }

  function clickedUpdatePassword() {
    setUpdatePasswordText("Updating...");

    changePassword(auth.email, oldPassword, newPassword)
      .then((res) => {
        if (res.status === 200) {
          login(res.data);
          setUpdatePasswordText("Successfully Updated");
        }
      })
      .catch((err) => {
        if (err.response?.status === 403)
          setUpdatePasswordText("Wrong Old Password");
        else setUpdatePasswordText("Error");
      })
      .finally(() => {
        setTimeout(() => setUpdatePasswordText("Update password"), 1500);
      });
  }

  /**
   * Clears the auth context/local storage and returns the user to the
   * marketing page so no private data remains visible.
   */
  const handleLogout = () => {
    logout();
    navigate("/");
  };
  const { selectedAccountId } = useAccount();

  // Guard: wait for auth state before rendering the account shell.
  if (!auth) return null;

  return (
    <div
      className="min-vh-100 d-flex align-items-center"
      style={{
        background:
          "radial-gradient(160% 140% at 80% 0%, rgba(92,99,255,0.12), transparent 40%), radial-gradient(140% 120% at 10% 80%, rgba(14,165,233,0.12), transparent 45%), linear-gradient(135deg, #0b0f1e 0%, #05060d 100%)",
        color: "#e7ecf7",
      }}
    >
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-md-10 col-lg-8">
            <div
              className="p-4 p-md-5"
              style={{
                background: "rgba(13, 17, 38, 0.82)",
                borderRadius: "24px",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 30px 70px rgba(0, 0, 0, 0.35)",
                backdropFilter: "blur(14px)",
              }}
            >
              {/* Header */}
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="d-inline-flex align-items-center justify-content-center rounded-3"
                    style={{
                      width: 48,
                      height: 48,
                      background: "linear-gradient(135deg, #22c55e, #0ea5e9)",
                      color: "#0b1023",
                      fontWeight: 800,
                    }}
                  >
                    <User size={24} />
                  </div>
                  <div>
                    <div
                      className="text-uppercase small"
                      style={{
                        letterSpacing: "0.18em",
                        color: "rgba(232,237,255,0.65)",
                      }}
                    >
                      Profile
                    </div>
                    <h1 className="h4 mb-0 text-light">Account Settings</h1>
                  </div>
                </div>
                <div
                  className="px-3 py-2 rounded-pill fw-semibold"
                  style={{
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    color: "#0b1023",
                  }}
                >
                  Active member
                </div>
              </div>

              <hr className="my-4 text-white-50" />

              {/* Trading Accounts */}
              <div
                className="text-uppercase small mb-3"
                style={{
                  letterSpacing: "0.18em",
                  color: "rgba(232,237,255,0.6)",
                }}
              >
                Trading Accounts
              </div>
              <div className="mb-3">
                {accounts.map((acc) => (
                  (() => {
                    const accountId = Number(acc.id);
                    const isSelected = accountId === selectedAccountId;
                    const hoverProps = isSelected ? 
                      { whileHover: { scale: 1.01, boxShadow: "0 12px 28px rgba(34,197,94,0.25)", },}
                      : 
                      { whileHover: { scale: 1.01, background: "rgba(255,255,255,0.06)", borderColor: "rgba(99,102,241,0.6)", boxShadow: "0 10px 24px rgba(0,0,0,0.25)",},};

                    return (
                      <Motion.div
                        key={acc.id}
                        className="d-flex justify-content-between align-items-center p-3 mb-2 rounded-3"
                        style={{
                          background: isSelected? "linear-gradient(135deg, rgba(34,197,94,0.35), rgba(14,165,233,0.28))" : "rgba(255,255,255,0.04)",
                          border: isSelected? "1px solid rgba(34,197,94,0.9)" : "1px solid rgba(255,255,255,0.12)",
                          boxShadow: isSelected? "0 10px 28px rgba(14,165,233,0.25)" : "none",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                        {...hoverProps}
                        whileTap={{ scale: 0.985 }}
                        onClick={() => setSelectedAccountId(accountId)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setSelectedAccountId(accountId);
                          }
                        }}
                      >
                        <span className="text-light">{acc.name || "Main Account"}</span>
                        <span style={{ color: "#9aa6d4" }}>
                          $
                          {acc.cash?.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </Motion.div>
                    );
                  })()
                ))}
              </div>
              <div className="d-flex gap-2">
                <input
                  className="form-control form-control-lg account-input"
                  style={{
                    borderRadius: "14px",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.14)",
                    color: "#f5f7ff",
                    caretColor: "#f5f7ff",
                  }}
                  placeholder="New account name"
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value)}
                />
                <Motion.button
                  whileTap={{ scale: 0.96 }}
                  className="btn fw-semibold text-white px-4"
                  style={{
                    borderRadius: "14px",
                    background: newAccountName.trim()
                      ? "linear-gradient(135deg, #22c55e, #0ea5e9)"
                      : "rgba(255,255,255,0.08)",
                    border: "none",
                  }}
                  disabled={
                    !newAccountName.trim() || createAccountStatus === "creating"
                  }
                  onClick={handleCreateAccount}
                >
                  <Plus size={18} className="me-1" />
                  {createAccountStatus === "creating"
                    ? "Creating..."
                    : createAccountStatus === "success"
                    ? "Created!"
                    : createAccountStatus === "error"
                    ? "Error"
                    : "Create"}
                </Motion.button>
              </div>

              <hr className="my-4 text-white-50" />


              {/* Edit Profile */}
              <div className="mb-4">
                <div
                  className="text-uppercase small mb-2"
                  style={{
                    letterSpacing: "0.18em",
                    color: "rgba(232,237,255,0.6)",
                  }}
                >
                  Edit Profile
                </div>
                <div className="mb-3">
                  <label className="form-label fw-medium text-light">
                    Name
                  </label>
                  <input
                    className="form-control form-control-lg account-input"
                    style={{
                      borderRadius: "14px",
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.14)",
                      color: "#f5f7ff",
                      caretColor: "#f5f7ff",
                    }}
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label fw-medium text-light">
                    Email
                  </label>
                  <input
                    className="form-control form-control-lg account-input"
                    style={{
                      borderRadius: "14px",
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.14)",
                      color: "#f5f7ff",
                      caretColor: "#f5f7ff",
                    }}
                    value={auth?.email ?? ""}
                    disabled
                    readOnly
                  />
                </div>
                <Motion.button
                  whileTap={{ scale: 0.96 }}
                  className="btn w-100 mt-3 py-2 fs-5 fw-semibold text-white"
                  style={{
                    borderRadius: "14px",
                    background: "linear-gradient(135deg, #22c55e, #0ea5e9)",
                    border: "none",
                    boxShadow: "0 14px 40px rgba(14,165,233,0.25)",
                  }}
                  disabled={newName == auth?.name}
                  onClick={handleNameChange}
                >
                  Save changes
                </Motion.button>
              </div>

              <hr className="my-4 text-white-50" />

              {/* Change Password */}
              <div
                className="text-uppercase small mb-3"
                style={{
                  letterSpacing: "0.18em",
                  color: "rgba(232,237,255,0.6)",
                }}
              >
                Change Password
              </div>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label fw-medium text-light">
                    Current password
                  </label>
                  <input
                    type="password"
                    className="form-control form-control-lg account-input"
                    style={{
                      borderRadius: "14px",
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.14)",
                      color: "#f5f7ff",
                      caretColor: "#f5f7ff",
                    }}
                    placeholder="Enter current password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-medium text-light">
                    New password
                  </label>
                  <input
                    type="password"
                    className="form-control form-control-lg account-input"
                    style={{
                      borderRadius: "14px",
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.14)",
                      color: "#f5f7ff",
                      caretColor: "#f5f7ff",
                    }}
                    placeholder="Min 8 chars"
                    disabled={!oldPassword}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-medium text-light">
                    Confirm new password
                  </label>
                  <input
                    type="password"
                    className="form-control form-control-lg account-input"
                    style={{
                      borderRadius: "14px",
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.14)",
                      color: "#f5f7ff",
                      caretColor: "#f5f7ff",
                    }}
                    placeholder="Match new password"
                    disabled={!oldPassword}
                    value={newPasswordConfirm}
                    onChange={(e) => setNewPasswordConfirm(e.target.value)}
                  />
                </div>
              </div>
              <div className="text-danger mt-2" style={{ minHeight: "20px" }}>
                {errorMessage}
              </div>
              <Motion.button
                whileTap={{ scale: 0.96 }}
                className="btn w-100 mt-3 fw-semibold py-2 fs-5 text-white"
                style={{
                  borderRadius: 14,
                  background: passwordButtonStatus
                    ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                    : "rgba(255,255,255,0.08)",
                  border: "none",
                  color: passwordButtonStatus ? "#0b1023" : "#9aa6d4",
                  boxShadow: passwordButtonStatus
                    ? "0 14px 40px rgba(99,102,241,0.25)"
                    : "none",
                }}
                onClick={clickedUpdatePassword}
                disabled={!passwordButtonStatus}
              >
                {updatePasswordText}
              </Motion.button>

              <hr className="my-4 text-white-50" />


              {/* Logout */}
              <Motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleLogout}
                className="btn w-100 fw-semibold text-white"
                style={{
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "#e7ecf7",
                }}
              >
                <LogOut size={18} className="me-2" />
                Log out
              </Motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;

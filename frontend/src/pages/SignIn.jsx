import React, { useState } from "react";
import { LogIn, User, Lock } from "lucide-react";
import { signIn } from '../api/AuthAPI';
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | invalidCreds | accountNotFound | error
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    setStatus("loading");

    signIn(email, password)
      .then(response => {
        console.log("Sign-in successful:", response.data);
        setStatus("success");
        login(response.data); // adds to localStorage
        setTimeout(() => navigate("/account"), 1000); // navigate to account after 1 secs
      })
      .catch(error => {
        console.error("Sign-in error:", error.response ? error.response.data : error.message);
        error.response.status == 401 ? setStatus("invalidCreds")
          : error.response.status == 404 ? setStatus("accountNotFound")
            : setStatus("error")
        setTimeout(() => setStatus("idle"), 1500); // revert to idle after 1.5 secs
      });
  };

  return (
    <div className="min-vh-100 bg-light d-flex align-items-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5 col-xl-4">
            <div
              className="card shadow-lg border-0"
              style={{ borderRadius: "20px" }}
            >
              <div className="card-body p-5">
                {/* Header */}
                <div className="text-center mb-4">
                  <div
                    className="d-inline-flex align-items-center justify-content-center bg-primary rounded-circle mb-3"
                    style={{ width: "60px", height: "60px" }}
                  >
                    <LogIn className="text-white" size={28} />
                  </div>
                  <h2 className="h3 fw-bold text-dark mb-2">Welcome Back</h2>
                  <p className="text-muted">
                    Sign in to your Trade Wars account
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="form-label fw-medium text-dark">
                      <User className="me-2" size={16} />
                      Email
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      style={{ borderRadius: "12px", fontSize: "16px" }}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-medium text-dark">
                      <Lock className="me-2" size={16} />
                      Password
                    </label>
                    <input
                      type="password"
                      className="form-control form-control-lg"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      style={{ borderRadius: "12px", fontSize: "16px" }}
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={status === "loading"}
                    className="btn btn-lg w-100 fw-medium text-white"
                    style={{
                      borderRadius: "12px",
                      backgroundColor:
                        {
                          idle: "var(--bs-primary)",
                          loading: "var(--bs-secondary)",
                          success: "var(--bs-success)",
                          invalidCreds: "var(--bs-danger)",
                          accountNotFound: "var(--bs-danger)",
                          error: "var(--bs-danger)",
                        }[status],
                    }}
                    // animation upon click
                    whileTap={{ scale: 0.95 }}
                    animate={{ scale: status === "success" ? [1, 1.1, 1] : 1 }}
                  >
                    <AnimatePresence mode="wait">
                      <motion.span // fades the text in and out 
                        key={status}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        {status === "loading" ? "Signing In..."
                          : status === "success" ? "✅ Success"
                            : status === "invalidCreds" ? "Invalid Credentials"
                              : status === "accountNotFound" ? "Account Not Found"
                                : status === "error" ? "Unknown Error"
                                  : "Sign In" // default
                        }
                      </motion.span>
                    </AnimatePresence>
                  </motion.button>

                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;

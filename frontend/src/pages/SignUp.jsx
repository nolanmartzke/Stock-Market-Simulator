import React, { useState } from "react";
import { UserPlus, User, Lock, Shield } from "lucide-react";
import { signUp } from '../api/AuthAPI';
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

function SignUp() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | conflict |error
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    setStatus("loading");

    signUp(email, password, name)
      .then(response => {
        console.log("Sign-up successful:", response.data);
        setStatus("success");
        setTimeout(() => navigate("/signin"), 1500); // navigate to signin page after 1.5 secs
      })
      .catch(error => {
        console.error("Sign-up error:", error.response ? error.response.data : error.message);
        error.response.status == 409 ? setStatus("conflict")
          : setStatus("error")
        setTimeout(() => setStatus("idle"), 2000); // revert to idle after 2 secs
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
                    className="d-inline-flex align-items-center justify-content-center bg-success rounded-circle mb-3"
                    style={{ width: "60px", height: "60px" }}
                  >
                    <UserPlus className="text-white" size={28} />
                  </div>
                  <h2 className="h3 fw-bold text-dark mb-2">Create Account</h2>
                  <p className="text-muted"></p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>

                  <div className="mb-4">
                    <label className="form-label fw-medium text-dark">
                      <User className="me-2" size={16} />
                      Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      required
                      style={{ borderRadius: "12px" }}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-medium text-dark">
                      <User className="me-2" size={16} />
                      Email
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      style={{ borderRadius: "12px" }}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-medium text-dark">
                      <Lock className="me-2" size={16} />
                      Password
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      required
                      style={{ borderRadius: "12px" }}
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
                          conflict: "var(--bs-danger)",
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
                            : status === "conflict" ? "Email Taken"
                              : status === "error" ? "Unknown Error"
                                : "Create Account" // default
                        }
                      </motion.span>
                    </AnimatePresence>
                  </motion.button>

                </form>

                {/* Footer */}
                <div className="text-center mt-4">
                  <p className="text-muted small mb-0">
                    Already have an account?{" "}
                    <a
                      href="#"
                      className="text-decoration-none text-primary fw-medium"
                    >
                      Sign in
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;

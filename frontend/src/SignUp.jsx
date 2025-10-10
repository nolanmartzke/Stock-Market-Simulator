import React, { useState } from "react";
import { UserPlus, User, Lock, Shield } from "lucide-react";
import { signUp } from './api/AuthAPI';

function SignUp() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        setUsername('');
        setRePassword('');
        setPassword('');
        // No action on submit for now

        signUp(username, password)
            .then(response => {
                console.log("Sign-up successful:", response.data);
            })
            .catch(error => {
                console.error("Sign-up error:", error.response ? error.response.data : error.message);
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
                      Username
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Username"
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

                  <div className="mb-4">
                    <label className="form-label fw-medium text-dark">
                      <Shield className="me-2" size={16} />
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      value={rePassword}
                      onChange={(e) => setRePassword(e.target.value)}
                      placeholder="Confirm Password"
                      required
                      style={{ borderRadius: "12px" }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-success w-100 fw-medium"
                    style={{ borderRadius: "12px" }}
                  >
                    Create Account
                  </button>
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

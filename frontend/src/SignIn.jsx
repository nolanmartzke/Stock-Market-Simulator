import React, { useState } from "react";
import { LogIn, User, Lock } from "lucide-react";
import { signIn } from './api/AuthAPI';

const SignIn = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        setUsername('');
        setPassword('');

        signIn(username, password)
            .then(response => {
                console.log("Sign-in successful:", response.data);
            })
            .catch(error => {
                console.error("Sign-in error:", error.response ? error.response.data : error.message);
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
                      Username
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
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

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-100 fw-medium"
                    style={{ borderRadius: "12px" }}
                  >
                    Sign In
                  </button>
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

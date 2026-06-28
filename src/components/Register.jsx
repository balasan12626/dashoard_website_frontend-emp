import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Password strength calculation
function calculatePasswordStrength(password) {
  if (!password) return { score: 0, label: "None", color: "var(--text-secondary)" };
  
  let score = 0;
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  };
  
  Object.values(checks).forEach(check => {
    if (check) score++;
  });
  
  const strength = [
    { min: 0, label: "Weak", color: "#ef4444" },
    { min: 1, label: "Fair", color: "#f59e0b" },
    { min: 2, label: "Fair", color: "#f59e0b" },
    { min: 3, label: "Good", color: "#eab308" },
    { min: 4, label: "Strong", color: "#22c55e" },
    { min: 5, label: "Very Strong", color: "#10b981" }
  ];
  
  const level = strength.find((s, i) => i === score) || strength[strength.length - 1];
  
  return {
    score,
    label: level.label,
    color: level.color,
    checks
  };
}

const getFriendlyErrorMessage = (err) => {
  return err.message || "Failed to create account. Please try again.";
};

export default function Register() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { currentUser, register } = useAuth();
  const navigate = useNavigate();
  
  const passwordStrength = calculatePasswordStrength(password);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  useEffect(() => {
    if (currentUser) {
      navigate("/dashboard");
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email || !password || !name || !username) {
      setError("Please fill out all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      setError("Password must contain uppercase, lowercase, and numbers.");
      return;
    }

    setAuthLoading(true);
    try {
      await register({ name, email, password });
      setShowSuccess(true);
      setEmail("");
      setName("");
      setUsername("");
      setPassword("");
      setConfirmPassword("");
      setTimeout(() => navigate("/login"), 3500);
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setAuthLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <div style={{
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, var(--bg-deeper) 0%, #0B1020 100%)",
        fontFamily: "'Outfit', sans-serif",
        padding: "20px"
      }}>
        <div style={{
          textAlign: "center",
          animation: "slideIn 0.5s ease-out"
        }}>
          <div style={{
            width: 80,
            height: 80,
            background: "linear-gradient(135deg, #10b981 0%, #14b8a6 100%)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 40,
            margin: "0 auto 20px",
            boxShadow: "0 20px 50px rgba(16, 185, 129, 0.3)"
          }}>
            âœ“
          </div>
          <h1 style={{
            fontSize: 32,
            fontWeight: 900,
            color: "var(--text-primary)",
            margin: "0 0 10px"
          }}>
            Account Created!
          </h1>
          <p style={{
            fontSize: 16,
            color: "var(--text-muted)",
            marginBottom: 30,
            maxWidth: 400
          }}>
            Your account has been successfully created. A verification email has been sent to your inbox. Redirecting to login...
          </p>
          <div style={{
            fontSize: 12,
            color: "var(--text-secondary)",
            animation: "pulse 2s ease-in-out infinite"
          }}>
            â³ Redirecting in 3 seconds...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="register-page" style={{
      display: "flex",
      minHeight: "100vh",
      background: "linear-gradient(135deg, var(--bg-deeper) 0%, #0B1020 100%)",
      fontFamily: "'Outfit', sans-serif",
      overflow: "hidden"
    }}>
      {/* LEFT SIDE - INFO */}
      <div className="register-page__info" style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "60px 50px",
        background: "linear-gradient(180deg, rgba(20, 184, 166, 0.1) 0%, transparent 100%)",
        color: "var(--text-primary)",
        borderRight: "1px solid rgba(255,255,255,0.05)"
      }}>
        <div>
          <h1 style={{
            fontSize: 40,
            fontWeight: 900,
            lineHeight: 1.2,
            marginBottom: 20,
            background: "linear-gradient(135deg, var(--text-primary) 0%, var(--text-muted) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text"
          }}>
            Join Bluspring
          </h1>
          
          <p style={{
            fontSize: 16,
            color: "var(--text-muted)",
            lineHeight: 1.6,
            marginBottom: 40,
            maxWidth: 400
          }}>
            Get instant access to enterprise-grade expense analytics and real-time insights.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE - SIGNUP FORM */}
      <div className="register-page__main" style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 50px",
        overflowY: "auto"
      }}>
        <div className="register-page__form-wrapper" style={{
          width: "100%",
          maxWidth: 450,
          animation: "slideIn 0.4s ease-out"
        }}>
          {/* Header */}
          <div style={{ marginBottom: 30 }}>
            <h2 style={{
              fontSize: 28,
              fontWeight: 800,
              color: "var(--text-primary)",
              margin: 0
            }}>Create Account</h2>
            <p style={{
              fontSize: 13,
              color: "var(--text-secondary)",
              marginTop: 6
            }}>Join thousands of companies using Bluspring</p>
          </div>

          {error && (
            <div style={{
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#fca5a5",
              padding: 14,
              borderRadius: 10,
              fontSize: 13,
              marginBottom: 20,
              lineHeight: 1.5,
              display: "flex",
              alignItems: "flex-start",
              gap: 10
            }}>
              <span style={{ marginTop: 2 }}>âš ï¸</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* Full Name */}
            <div>
              <label style={{
                display: "block",
                fontSize: 12,
                fontWeight: 700,
                color: "var(--text-muted)",
                marginBottom: 6,
                textTransform: "uppercase",
                letterSpacing: 0.5
              }}>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                style={{
                  width: "100%",
                  padding: "11px 13px",
                  borderRadius: "8px",
                  background: "var(--border-color)",
                  border: "1px solid rgba(99, 102, 241, 0.3)",
                  color: "var(--text-primary)",
                  fontSize: 13,
                  outline: "none",
                  boxSizing: "border-box",
                  caretColor: "#6366f1"
                }}
              />
            </div>

            {/* Email */}
            <div>
              <label style={{
                display: "block",
                fontSize: 12,
                fontWeight: 700,
                color: "var(--text-muted)",
                marginBottom: 6,
                textTransform: "uppercase",
                letterSpacing: 0.5
              }}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                style={{
                  width: "100%",
                  padding: "11px 13px",
                  borderRadius: "8px",
                  background: "var(--border-color)",
                  border: "1px solid rgba(99, 102, 241, 0.3)",
                  color: "var(--text-primary)",
                  fontSize: 13,
                  outline: "none",
                  boxSizing: "border-box",
                  caretColor: "#6366f1"
                }}
              />
            </div>

            {/* Username */}
            <div>
              <label style={{
                display: "block",
                fontSize: 12,
                fontWeight: 700,
                color: "var(--text-muted)",
                marginBottom: 6,
                textTransform: "uppercase",
                letterSpacing: 0.5
              }}>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="johndoe"
                style={{
                  width: "100%",
                  padding: "11px 13px",
                  borderRadius: "8px",
                  background: "var(--border-color)",
                  border: "1px solid rgba(99, 102, 241, 0.3)",
                  color: "var(--text-primary)",
                  fontSize: 13,
                  outline: "none",
                  boxSizing: "border-box",
                  caretColor: "#6366f1"
                }}
              />
            </div>

            {/* Password Policy Info */}
            <div style={{
              background: "rgba(99, 102, 241, 0.08)", border: "1px solid rgba(99, 102, 241, 0.2)",
              borderRadius: 8, padding: "10px 12px", fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.5
            }}>
              ðŸ”’ <strong style={{ color: "var(--text-muted)" }}>Password Policy:</strong> Min 8 characters, must include uppercase, lowercase, number, and optional special character.
            </div>

            {/* Password */}
            <div>
              <label style={{
                display: "block",
                fontSize: 12,
                fontWeight: 700,
                color: "var(--text-muted)",
                marginBottom: 6,
                textTransform: "uppercase",
                letterSpacing: 0.5
              }}>Password</label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                  style={{
                    width: "100%",
                    padding: "11px 40px 11px 13px",
                    borderRadius: "8px",
                    background: "var(--border-color)",
                    border: "1px solid rgba(99, 102, 241, 0.3)",
                    color: "var(--text-primary)",
                    fontSize: 13,
                    outline: "none",
                    boxSizing: "border-box",
                    caretColor: "#6366f1"
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: 12,
                    background: "none",
                    border: "none",
                    fontSize: 16,
                    color: "#6366f1",
                    cursor: "pointer",
                    padding: 0
                  }}
                >
                  {showPassword ? "ðŸ‘ï¸" : "ðŸ‘ï¸â€ðŸ—¨ï¸"}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 600 }}>Strength</span>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: passwordStrength.color
                    }}>{passwordStrength.label}</span>
                  </div>
                  <div style={{
                    height: 4,
                    background: "var(--border-color)",
                    borderRadius: 2,
                    overflow: "hidden"
                  }}>
                    <div style={{
                      width: `${(passwordStrength.score / 5) * 100}%`,
                      height: "100%",
                      background: passwordStrength.color,
                      transition: "width 0.3s ease",
                      borderRadius: 2
                    }} />
                  </div>

                  {/* Requirements Checklist */}
                  <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                    {[
                      { check: passwordStrength.checks.length, label: "8+ characters" },
                      { check: passwordStrength.checks.uppercase, label: "Uppercase letter" },
                      { check: passwordStrength.checks.lowercase, label: "Lowercase letter" },
                      { check: passwordStrength.checks.number, label: "Number" },
                      { check: passwordStrength.checks.special, label: "Special character" }
                    ].map((req, i) => (
                      <div key={i} style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: 11,
                        color: req.check ? "#10b981" : "var(--text-secondary)",
                        transition: "color 0.2s"
                      }}>
                        <span style={{
                          width: 16,
                          height: 16,
                          border: `1px solid ${req.check ? "#10b981" : "var(--text-muted)"}`,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 10,
                          fontWeight: 700,
                          background: req.check ? "rgba(16, 185, 129, 0.1)" : "transparent",
                          color: req.check ? "#10b981" : "transparent"
                        }}>
                          {req.check ? "âœ“" : ""}
                        </span>
                        <span>{req.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label style={{
                display: "block",
                fontSize: 12,
                fontWeight: 700,
                color: "var(--text-muted)",
                marginBottom: 6,
                textTransform: "uppercase",
                letterSpacing: 0.5
              }}>Confirm Password</label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                  style={{
                    width: "100%",
                    padding: "11px 40px 11px 13px",
                    borderRadius: "8px",
                    background: "var(--border-color)",
                    border: "1px solid rgba(" + (passwordsMatch ? "16, 185, 129" : "99, 102, 241") + ", 0.3)",
                    color: "var(--text-primary)",
                    fontSize: 13,
                    outline: "none",
                    boxSizing: "border-box",
                    caretColor: "#6366f1",
                    transition: "border-color 0.2s"
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  style={{
                    position: "absolute",
                    right: 12,
                    background: "none",
                    border: "none",
                    fontSize: 16,
                    color: "#6366f1",
                    cursor: "pointer",
                    padding: 0
                  }}
                >
                  {showConfirm ? "ðŸ‘ï¸" : "ðŸ‘ï¸â€ðŸ—¨ï¸"}
                </button>
              </div>
              {confirmPassword && (
                <div style={{
                  marginTop: 6,
                  fontSize: 11,
                  color: passwordsMatch ? "#10b981" : "#ef4444",
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }}>
                  {passwordsMatch ? "âœ“" : "âœ—"} {passwordsMatch ? "Passwords match" : "Passwords don't match"}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={authLoading || !passwordsMatch || passwordStrength.score < 3}
              style={{
                width: "100%",
                padding: 12,
                borderRadius: "8px",
                background: authLoading || !passwordsMatch || passwordStrength.score < 3
                  ? "rgba(16, 185, 129, 0.3)"
                  : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                border: "none",
                color: "var(--text-primary)",
                fontWeight: 700,
                fontSize: 13,
                cursor: authLoading || !passwordsMatch || passwordStrength.score < 3 ? "not-allowed" : "pointer",
                marginTop: 10,
                boxShadow: "0 8px 24px rgba(16, 185, 129, 0.25)",
                transition: "all 0.3s",
                textTransform: "uppercase",
                letterSpacing: 0.5,
                opacity: authLoading || !passwordsMatch || passwordStrength.score < 3 ? 0.5 : 1
              }}
            >
              {authLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* Login Link */}
          <div style={{
            marginTop: 20,
            textAlign: "center",
            fontSize: 13,
            color: "var(--text-secondary)"
          }}>
            <p style={{ margin: 0, marginBottom: 4 }}>Need help creating an account?<br/>Contact Administrator</p>
            <a href="mailto:prakash.r@bluspring.com" style={{ color: "#14b8a6", textDecoration: "none", fontWeight: 700 }}>
              âœ‰ï¸ prakash.r@bluspring.com
            </a>
          </div>

            <div style={{
              marginTop: 30,
              textAlign: "center",
              fontSize: 13,
              color: "var(--text-secondary)"
            }}>
              Already have an account? <Link to="/login" style={{
                color: "#14b8a6",
                textDecoration: "none",
                fontWeight: 700,
                transition: "color 0.2s"
              }}>Login</Link>
            </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        input::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }
        
        @media (max-width: 1100px) {
          .register-page {
            flex-direction: column;
          }
          .register-page__info {
            display: none !important;
          }
          .register-page__main {
            padding: 30px 20px;
          }
          .register-page__form-wrapper {
            max-width: 100%;
            padding: 0;
          }
        }
      `}</style>
    </div>
  );
}

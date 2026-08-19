import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../styles/login.css";
import { loginAPI, sendOtpAPI, resetPasswordAPI } from "../services/api";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: mobile, 2: otp
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  
  // Password visibility states for forgot password
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error("Enter email & password");
      return;
    }

    try {
      setIsLoading(true);

      const res = await loginAPI({
        email: username,
        password: password,
      });

      console.log("LOGIN RES:", res);

      if (res && (res.success === true || res.data?.token || res.token)) {
        const token = res.data?.token || res.token;

        if (token) {
          localStorage.setItem("token", token);
          sessionStorage.setItem("isAdmin", "true");

          toast.success(res?.message || "Login Successful!!");
          navigate("/dashboard", { replace: true });
        } else {
          toast.error("No token received");
        }
      } else {
        toast.error(res?.message || "Invalid Credentials!!");
      }
    } catch (err) {
      console.error("Login Error:", err);
      toast.error(
        err?.response?.data?.message ||
        err?.message ||
        "Login Failed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!mobile) {
      toast.error("Enter mobile number");
      return;
    }

    // Validate mobile number (10 digits)
    if (!/^\d{10}$/.test(mobile)) {
      toast.error("Enter a valid 10-digit mobile number");
      return;
    }

    try {
      setForgotLoading(true);
      const res = await sendOtpAPI({ mobile });

      console.log("OTP Response:", res);

      // Check multiple possible success conditions
      const isSuccess = 
        res?.success === true || 
        res?.status === 'success' || 
        res?.message === "OTP sent successfully" ||
        res?.message?.toLowerCase()?.includes('sent') ||
        res?.data?.mobile;

      if (isSuccess) {
        toast.success(res?.message || "OTP sent successfully");
        setForgotStep(2);
      } else {
        toast.error(res?.message || "Failed to send OTP");
      }
    } catch (err) {
      console.error("OTP Error:", err);
      if (err?.response?.data?.message?.includes('sent') || 
          err?.response?.status === 200 ||
          err?.response?.data?.data?.mobile) {
        toast.success(err?.response?.data?.message || "OTP sent successfully");
        setForgotStep(2);
      } else {
        toast.error(err?.response?.data?.message || "Failed to send OTP");
      }
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otp || !newPassword || !confirmPassword) {
      toast.error("Please fill all fields");
      return;
    }

    // Validate OTP (4 digits)
    if (!/^\d{4}$/.test(otp)) {
      toast.error("Enter a valid 4-digit OTP");
      return;
    }

    // Validate password length
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setForgotLoading(true);

      const res = await resetPasswordAPI({
        mobile,
        otp,
        new_password: newPassword,
      });

      console.log("Reset Response:", res);

      if (res?.message === "Password reset successfully" || res?.success) {
        toast.success("Password reset successfully!!");
        closeForgotModal();
      } else {
        toast.error(res?.message || "Failed to reset password");
      }
    } catch (err) {
      console.error("Reset Error:", err);
      toast.error(
        err?.response?.data?.message || "Failed to reset password"
      );
    } finally {
      setForgotLoading(false);
    }
  };

  const closeForgotModal = () => {
    setShowForgotModal(false);
    setForgotStep(1);
    setMobile("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handleBackToLogin = () => {
    closeForgotModal();
  };

  return (
    <div className="login-wrapper">
      {/* Animated Background Circles */}
      <div className="bg-circle circle-1"></div>
      <div className="bg-circle circle-2"></div>
      <div className="bg-circle circle-3"></div>
      <div className="bg-circle circle-4"></div>
      <div className="bg-circle circle-5"></div>

      <div className="single-card">
        <div className="brand-content">
          <div className="brand-icon">🎱</div>
          <h1 className="brand-title">Tambola Lottery</h1>
          <p className="brand-tagline">Play Smart. Win Big.</p>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          <div className="input-group">
            <label>Email</label>
            <div className="login-input-icon">
              <span className="login-input-icon-left">📧</span>
              <input
                type="email"
                placeholder="admin@gmail.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="login-input-icon">
              <span className="login-input-icon-left">🔒</span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            <div className="forgot-password">
              <span
                onClick={() => setShowForgotModal(true)}
                style={{ cursor: 'pointer', color: '#FFD700', fontSize: '14px' }}
              >
                Forgot Password?
              </span>
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? "Logging..." : "Login"}
          </button>
        </form>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="modal-overlay" onClick={closeForgotModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {forgotStep === 1 
                  ? "🔐 Forgot Password" 
                  : "🔄 Reset Password"
                }
              </h3>
              <button
                className="modal-close"
                onClick={closeForgotModal}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              {forgotStep === 1 ? (
                // Step 1: Send OTP
                <>
                  <p className="modal-description">
                    <span className="emoji">📱</span> Enter your registered mobile number to receive an OTP
                  </p>
                  <div className="input-group">
                    <label>📞 Mobile Number</label>
                    <input
                      type="tel"
                      placeholder="Enter 10-digit mobile number"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                      maxLength="10"
                      autoFocus
                    />
                  </div>
                  <button
                    className="modal-btn"
                    onClick={handleSendOtp}
                    disabled={forgotLoading || !mobile}
                  >
                    {forgotLoading ? (
                      <>
                        <span className="spinner"></span> Sending...
                      </>
                    ) : (
                      "📨 Send OTP"
                    )}
                  </button>
                  <button
                    className="modal-btn-secondary"
                    onClick={handleBackToLogin}
                  >
                    ← Back to Login
                  </button>
                </>
              ) : (
                // Step 2: Reset Password
                <>
                  <p className="modal-description">
                    <span className="emoji">✅</span> OTP sent to <strong>{mobile}</strong>
                  </p>
                  <div className="input-group">
                    <label>🔑 Enter OTP</label>
                    <input
                      type="text"
                      placeholder="Enter 4-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      maxLength="4"
                      autoFocus
                    />
                  </div>
                  <div className="input-group">
                    <label>🔒 New Password</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Min 6 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="password-toggle-modal"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        aria-label="Toggle password visibility"
                      >
                        {showNewPassword ? "🙈" : "👁️"}
                      </button>
                    </div>
                  </div>
                  <div className="input-group">
                    <label>✅ Confirm Password</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Re-enter new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="password-toggle-modal"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label="Toggle password visibility"
                      >
                        {showConfirmPassword ? "🙈" : "👁️"}
                      </button>
                    </div>
                  </div>
                  <button
                    className="modal-btn"
                    onClick={handleResetPassword}
                    disabled={forgotLoading || !otp || !newPassword || !confirmPassword}
                  >
                    {forgotLoading ? (
                      <>
                        <span className="spinner"></span> Updating...
                      </>
                    ) : (
                      "🔄 Update Password"
                    )}
                  </button>
                  <button
                    className="modal-btn-secondary"
                    onClick={() => {
                      setForgotStep(1);
                      setOtp("");
                      setNewPassword("");
                      setConfirmPassword("");
                      setShowNewPassword(false);
                      setShowConfirmPassword(false);
                    }}
                  >
                    ← Back
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
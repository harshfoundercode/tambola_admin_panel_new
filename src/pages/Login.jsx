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
  const [forgotLoading, setForgotLoading] = useState(false);
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

      // Check if login is successful
      if (res && (res.success === true || res.data?.token || res.token)) {
        // Get token from response
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

    try {
      setForgotLoading(true);
      const res = await sendOtpAPI({ mobile });

      console.log("OTP Response:", res);

      // Check multiple possible success conditions
      if (res.success || res.status === 'success' || res.message?.includes('sent') || res.message?.includes('OTP')) {
        toast.success(res?.message || "OTP sent successfully");
        setForgotStep(2);
      } else {
        toast.error(res?.message || "Failed to send OTP");
      }
    } catch (err) {
      console.error("OTP Error:", err);
      // Even if there's an error, let's check if it's actually successful
      if (err?.response?.status === 200 || err?.response?.data?.message?.includes('sent')) {
        toast.success("OTP sent successfully");
        setForgotStep(2);
      } else {
        toast.error(err?.response?.data?.message || "Failed to send OTP");
      }
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otp || !newPassword) {
      toast.error("Enter OTP and new password");
      return;
    }

    try {
      setForgotLoading(true);

      const res = await resetPasswordAPI({
        mobile,
        otp,
        new_password: newPassword,
      });

      console.log(res);

      if (res?.message === "Password reset successfully") {
        toast.success("Password reset successfully!!");

        setShowForgotModal(false);
        setForgotStep(1);
        setMobile("");
        setOtp("");
        setNewPassword("");
      } else {
        toast.error("Failed to reset password");
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to reset password"
      );
    } finally {
      setForgotLoading(false);
    }
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
              >
                👁️
              </button>
            </div>
            <div className="forgot-password">
              <span
                onClick={() => setShowForgotModal(true)}
                style={{ cursor: 'pointer', color: '#3B82F6', fontSize: '14px' }}
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
        <div className="modal-overlay" onClick={() => setShowForgotModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{forgotStep === 1 ? "Forgot Password" : "Reset Password"}</h3>
              <button
                className="modal-close"
                onClick={() => setShowForgotModal(false)}
              >
                ×
              </button>
            </div>

            {forgotStep === 1 ? (
              <div className="modal-body">
                <div className="input-group">
                  <label>Mobile Number</label>
                  <input
                    type="tel"
                    placeholder="Enter mobile number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                  />
                </div>
                <button
                  className="modal-btn"
                  onClick={handleSendOtp}
                  disabled={forgotLoading}
                >
                  {forgotLoading ? "Sending..." : "Send OTP"}
                </button>
                {/* Temporary test button */}
                <button
                  className="modal-btn"
                  onClick={() => setForgotStep(2)}
                  style={{ marginTop: '8px', background: '#64748B' }}
                >
                  Test Reset UI
                </button>
              </div>
            ) : (
              <div className="modal-body">
                <div className="input-group">
                  <label>Mobile: {mobile}</label>
                </div>
                <div className="input-group">
                  <label>Enter OTP</label>
                  <input
                    type="text"
                    placeholder="Enter 4-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength="4"
                  />
                </div>
                <div className="input-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <button
                  className="modal-btn"
                  onClick={handleResetPassword}
                  disabled={forgotLoading}
                >
                  {forgotLoading ? "Updating..." : "Update Password"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

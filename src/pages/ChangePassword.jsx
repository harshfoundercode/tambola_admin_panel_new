import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { changePasswordAPI } from "../services/api";
import { toast } from "react-toastify";
import "../styles/changePassword.css";

function ChangePassword() {
  const [formData, setFormData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: ""
  });
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  });
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.old_password || !formData.new_password || !formData.confirm_password) {
      toast.error("All fields are required");
      return;
    }

    if (formData.new_password !== formData.confirm_password) {
      toast.error("New passwords do not match");
      return;
    }

    if (formData.new_password.length < 4) {
      toast.error("New password must be at least 4 characters long");
      return;
    }

    try {
      setLoading(true);
      
      const response = await changePasswordAPI({
        old_password: formData.old_password,
        new_password: formData.new_password
      });

      if (response.success) {
        toast.success(response.message || "Password changed successfully");
        setFormData({
          old_password: "",
          new_password: "",
          confirm_password: ""
        });
        setTimeout(() => {
          navigate("/admin-profile");
        }, 1500);
      } else {
        toast.error(response.message || "Failed to change password");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-password-container">
      <div className="change-password-header">
        <h1>🔐 Change Password</h1>
        <p>Update your account password</p>
      </div>

      <div className="change-password-card">
        <form onSubmit={handleSubmit} className="password-form">
          <div className="form-group">
            <label htmlFor="old_password">Current Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPasswords.old ? "text" : "password"}
                id="old_password"
                name="old_password"
                value={formData.old_password}
                onChange={handleInputChange}
                placeholder="Enter current password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => togglePasswordVisibility('old')}
              >
                {showPasswords.old ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="new_password">New Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPasswords.new ? "text" : "password"}
                id="new_password"
                name="new_password"
                value={formData.new_password}
                onChange={handleInputChange}
                placeholder="Enter new password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => togglePasswordVisibility('new')}
              >
                {showPasswords.new ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirm_password">Confirm New Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPasswords.confirm ? "text" : "password"}
                id="confirm_password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleInputChange}
                placeholder="Confirm new password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => togglePasswordVisibility('confirm')}
              >
                {showPasswords.confirm ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate("/admin-profile")}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? "Changing..." : "Change Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChangePassword;
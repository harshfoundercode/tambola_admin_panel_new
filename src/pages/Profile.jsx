import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminProfileAPI, updateAdminProfileAPI } from "../services/api";
import { toast } from "react-toastify";
import "../styles/profile.css";

function getInitials(name = "") {
    return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function formatDate(dateString) {
    if (!dateString) return "—";
    // If it's a plain date (YYYY-MM-DD), append time to avoid timezone shift
    // If it already has T (ISO timestamp), use directly
    const normalized = dateString.includes("T")
        ? dateString
        : dateString.slice(0, 10) + "T00:00:00";
    const d = new Date(normalized);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-IN", {
        year: "numeric", month: "long", day: "numeric",
    });
}

const IconMail = () => (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m2 7 10 7 10-7" />
    </svg>
);
const IconPhone = () => (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6.6 10.8a15.2 15.2 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.2c1.1.4 2.3.6 3.6.6a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C9.6 21 3 14.4 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.3.2 2.5.6 3.6a1 1 0 0 1-.2 1L6.6 10.8z" />
    </svg>
);
const IconCake = () => (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8" />
        <path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 1.5 1 2 1" /><path d="M2 21h20M7 8v3m5-7v7m5-4v4" />
    </svg>
);
const IconUser = () => (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
);
const IconCalendarPlus = () => (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M8 2v4m8-4v4" /><rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M3 10h18M12 14v4m-2-2h4" />
    </svg>
);
const IconRefresh = () => (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.8 1 6.46 2.64L21 8" /><path d="M21 3v5h-5" />
    </svg>
);
const IconPencil = () => (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);
const IconSave = () => (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
        <polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
    </svg>
);

function Profile() {
    const [adminProfile, setAdminProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({ name: "", email: "", mobile: "", dob: "" });
    const navigate = useNavigate();

    useEffect(() => { fetchProfile(); }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await getAdminProfileAPI();
            console.log("Admin profile response:", response);
            if (response.success) {
                setAdminProfile(response.data);
            } else {
                setError(response.message || "Failed to fetch profile");
            }
        } catch (err) {
            console.error("Error fetching admin profile:", err);
            if (err.response?.status === 401 || err.response?.status === 403) {
                localStorage.removeItem("token");
                sessionStorage.removeItem("isAdmin");
                navigate("/", { replace: true });
                return;
            }
            setError(err.response?.data?.message || err.message || "Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = () => {
        setFormData({
            name: adminProfile.name || "",
            email: adminProfile.email || "",
            mobile: adminProfile.mobile || "",
            dob: adminProfile.dob ? adminProfile.dob.split("T")[0] : "",
        });
        setIsEditing(true);
    };

    const handleCancel = () => setIsEditing(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!formData.name.trim()) return toast.error("Name is required");
        if (!formData.email.trim()) return toast.error("Email is required");
        if (!formData.mobile.trim()) return toast.error("Mobile is required");
        if (!formData.dob) return toast.error("Date of birth is required");

        try {
            setSaving(true);
            const payload = {
                name: formData.name.trim(),
                email: formData.email.trim(),
                mobile: formData.mobile.trim(),
                dob: formData.dob,
            };
            const response = await updateAdminProfileAPI(payload);
            if (response.success) {
                setAdminProfile(response.data);
                setIsEditing(false);
                toast.success(response.message || "Profile updated successfully");
            } else {
                toast.error(response.message || "Failed to update profile");
            }
        } catch (err) {
            console.error("Error updating profile:", err);
            toast.error(err.response?.data?.message || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loader"></div>
                <p>Loading player details...</p>
            </div>
        );
    }

    if (error) return (
        <div className="profile-error">
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="retry-btn">Try Again</button>
        </div>
    );

    if (!adminProfile) return (
        <div className="profile-error"><p>No profile data available</p></div>
    );

    return (
        <div className="profile-container">
            {/* <div className="profile-header">
        <h1>Admin Profile</h1>
        <p>Manage your account information</p>
      </div> */}

            <div className="profile-card">
                {/* Hero */}
                <div className="profile-avatar-section">
                    <div className="profile-avatar-wrap">
                        <div className="profile-avatar-ring">
                            <span className="profile-avatar-initials">
                                {getInitials(isEditing ? formData.name : adminProfile.name)}
                            </span>
                        </div>
                        <div className="profile-status-dot" title="Active" />
                    </div>
                    <div className="profile-basic-info">
                        <h2>{adminProfile.name}</h2>
                        <p className="profile-role">Super Administrator</p>
                        <span className="profile-status">✓ Active</span>
                    </div>
                    <div className="profile-id-block">
                        <div className="profile-id-label">Admin</div>
                        {/* <div className="profile-id-value">#{adminProfile.admin_id}</div> */}
                    </div>
                </div>

                {/* Body */}
                <div className="profile-details">
                    {/* Section header */}
                    <div className="profile-section-row">
                        <span className="section-label">Contact details</span>
                        {!isEditing && (
                            <button className="profile-edit-btn" onClick={handleEditClick}>
                                <IconPencil /> Edit profile
                            </button>
                        )}
                    </div>

                    {/* VIEW mode */}
                    {!isEditing && (
                        <div className="fields-grid">
                            <div className="field-item full-width">
                                <div className="field-label"><IconMail /> Email address</div>
                                <div className="field-value">{adminProfile.email}</div>
                            </div>
                            <div className="field-item">
                                <div className="field-label"><IconPhone /> Mobile</div>
                                <div className="field-value">{adminProfile.mobile}</div>
                            </div>
                            <div className="field-item">
                                <div className="field-label"><IconCake /> Date of birth</div>
                                <div className="field-value">{formatDate(adminProfile.dob)}</div>
                            </div>
                        </div>
                    )}

                    {/* EDIT mode */}
                    {isEditing && (
                        <div className="edit-fields-grid">
                            <div className="edit-field full-width">
                                <label htmlFor="name"><IconUser /> Full name</label>
                                <input type="text" id="name" name="name" value={formData.name}
                                    onChange={handleInputChange} placeholder="Enter full name" />
                            </div>
                            <div className="edit-field full-width">
                                <label htmlFor="email"><IconMail /> Email address</label>
                                <input type="email" id="email" name="email" value={formData.email}
                                    onChange={handleInputChange} placeholder="Enter email address" />
                            </div>
                            <div className="edit-field">
                                <label htmlFor="mobile"><IconPhone /> Mobile</label>
                                <input type="tel" id="mobile" name="mobile" value={formData.mobile}
                                    onChange={handleInputChange} placeholder="Enter mobile number" />
                            </div>
                            <div className="edit-field">
                                <label htmlFor="dob"><IconCake /> Date of birth</label>
                                <input type="date" id="dob" name="dob" value={formData.dob}
                                    onChange={handleInputChange} />
                            </div>
                            <div className="edit-field disabled-field">
                                <label htmlFor="createdAt"><IconCalendarPlus /> Account created</label>
                                <input type="text" id="createdAt" value={formatDate(adminProfile.createdAt)} disabled />
                            </div>
                            <div className="edit-field disabled-field">
                                <label htmlFor="updatedAt"><IconRefresh /> Last updated</label>
                                <input type="text" id="updatedAt" value={formatDate(adminProfile.updatedAt)} disabled />
                            </div>
                            <div className="edit-actions full-width">
                                <button className="btn-cancel-edit" onClick={handleCancel} disabled={saving}>
                                    Cancel
                                </button>
                                <button className="btn-save-edit" onClick={handleSave} disabled={saving}>
                                    <IconSave />
                                    {saving ? "Saving..." : "Save changes"}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Meta footer */}
                    <div className="profile-meta">
                        <div className="meta-item">
                            <div className="meta-icon"><IconCalendarPlus /></div>
                            <div>
                                <div className="meta-label">Account created</div>
                                <div className="meta-value">{formatDate(adminProfile.createdAt)}</div>
                            </div>
                        </div>
                        <div className="meta-item">
                            <div className="meta-icon"><IconRefresh /></div>
                            <div>
                                <div className="meta-label">Last updated</div>
                                <div className="meta-value">{formatDate(adminProfile.updatedAt)}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;
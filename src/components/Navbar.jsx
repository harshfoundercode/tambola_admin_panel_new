import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getAdminProfileAPI } from "../services/api";
import "../styles/navbar.css";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const [adminProfile, setAdminProfile] = useState(null);

  // Fetch admin profile on component mount
  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const response = await getAdminProfileAPI();
        if (response.success) {
          setAdminProfile(response.data);
        }
      } catch (error) {
        console.error("Error fetching admin profile:", error);
        
        // If authentication error, don't redirect from navbar
        // Just use fallback data from localStorage
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.warn("Authentication error in navbar, using fallback data");
        }
      }
    };

    fetchAdminProfile();
  }, []);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsSearchOpen(false);
        setIsAdminDropdownOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const getPageTitle = () => {
    const path = location.pathname === "/" ? "Dashboard" : location.pathname.slice(1);
    return path.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const getPageIcon = () => {
    const icons = {
      "/": "📊",
      "/games": "🎮",
      "/create-game": "➕",
      "/live-game": "🔴",
      "/tickets": "🎫",
      "/players": "👥",
      "/claims": "🏆",
      "/winners": "🥇",
      "/admin": "👑",
    };
    return icons[location.pathname] || "📄";
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchTerm);
    if (isMobile) setIsSearchOpen(false);
    setSearchTerm("");
  };

  // Logout function
  const handleLogout = () => {
    // Clear all localStorage items
  sessionStorage.removeItem("isAdmin");
    localStorage.removeItem("adminName");
    localStorage.removeItem("adminEmail");
    
    // Close dropdown if open
    setIsAdminDropdownOpen(false);
    
    // Navigate to login page
    navigate("/");
  };

  // Admin user data from API or fallback
  const adminUser = adminProfile ? {
    name: adminProfile.name,
    email: adminProfile.email,
    role: "Super Administrator",
    avatar: `https://ui-avatars.com/api/?background=1E3A8A&color=fff&name=${encodeURIComponent(adminProfile.name)}`,
    joinedDate: new Date(adminProfile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
  } : {
    name: localStorage.getItem("adminName") || "Admin User",
    email: localStorage.getItem("adminEmail") || "admin@easylottery.com",
    role: "Super Administrator",
    avatar: `https://ui-avatars.com/api/?background=1E3A8A&color=fff&name=${encodeURIComponent(localStorage.getItem("adminName") || "Admin")}`,
    joinedDate: "Jan 2024",
  };

  return (
    <>
      <div className="navbar-white">
        {/* Left Section */}
        <div className="navbar-left-white">
          <div className="page-info-white">
            <span className="page-icon-white">{getPageIcon()}</span>
            {!isMobile && <h1 className="page-title-white">{getPageTitle()}</h1>}
          </div>
        </div>

       

        {/* Right Section */}
        <div className="navbar-right-white">
        

          {/* Admin Profile Dropdown */}
          <div className="admin-dropdown-wrapper">
            <div 
              className="admin-profile-btn" 
              onClick={() => setIsAdminDropdownOpen(!isAdminDropdownOpen)}
            >
              <div className="admin-avatar">
                <img src={adminUser.avatar} alt="Admin" />
                <span className="online-status"></span>
              </div>
              {!isMobile && (
                <div className="admin-info">
                  <span className="admin-name">{adminUser.name}</span>
                  <span className="admin-role">{adminUser.role}</span>
                </div>
              )}
              <span className="dropdown-arrow">▼</span>
            </div>

            {/* Dropdown Menu */}
            {isAdminDropdownOpen && (
              <>
                <div className="admin-dropdown">
                  <div className="dropdown-header">
                    <div className="dropdown-avatar">
                      <img src={adminUser.avatar} alt="Admin" />
                    </div>
                    <div className="dropdown-user-info">
                      <h4>{adminUser.name}</h4>
                      <p>{adminUser.email}</p>
                      <span className="user-role-badge">{adminUser.role}</span>
                    </div>
                  </div>
                  
                  <div className="dropdown-divider"></div>
                  
                  <div className="dropdown-menu-items">
                    <div className="dropdown-item" onClick={() => { setIsAdminDropdownOpen(false); navigate("/admin-profile"); }}>
                      <span className="item-icon">👤</span>
                      <div className="item-content">
                        <span className="item-title">My Profile</span>
                        <span className="item-desc">View and edit your profile</span>
                      </div>
                    </div>
                    
                    <div className="dropdown-item" onClick={() => { setIsAdminDropdownOpen(false); navigate("/change-password"); }}>
                      <span className="item-icon">⚙️</span>
                      <div className="item-content">
                        <span className="item-title">Account Settings</span>
                        <span className="item-desc">Manage your account preferences</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="dropdown-divider"></div>
                  
                  <div className="dropdown-footer">
                    <div className="dropdown-item logout-item" onClick={handleLogout}>
                      <span className="item-icon">🚪</span>
                      <div className="item-content">
                        <span className="item-title">Logout</span>
                        <span className="item-desc">Sign out of your account</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="dropdown-overlay" onClick={() => setIsAdminDropdownOpen(false)}></div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Menu */}
      {isMobile && isAdminDropdownOpen && (
        <>
          <div className="mobile-admin-menu">
            <div className="mobile-menu-header">
              <div className="mobile-avatar">
                <img src={adminUser.avatar} alt="Admin" />
              </div>
              <div className="mobile-user-info">
                <h4>{adminUser.name}</h4>
                <p>{adminUser.email}</p>
                <span className="mobile-role-badge">{adminUser.role}</span>
              </div>
            </div>
            
            <div className="mobile-menu-items">
              <div onClick={() => { setIsAdminDropdownOpen(false); navigate("/admin-profile"); }} className="mobile-menu-item">
                <span>👤</span>
                <span>My Profile</span>
              </div>
              <div onClick={() => { setIsAdminDropdownOpen(false); navigate("/change-password"); }} className="mobile-menu-item">
                <span>⚙️</span>
                <span>Account Settings</span>
              </div>
              <div className="mobile-divider"></div>
              <div className="mobile-menu-item logout" onClick={handleLogout}>
                <span>🚪</span>
                <span>Logout</span>
              </div>
            </div>
          </div>
          <div className="mobile-overlay" onClick={() => setIsAdminDropdownOpen(false)}></div>
        </>
      )}
    </>
  );
}

export default Navbar;
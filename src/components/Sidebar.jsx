import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import "../styles/sidebar.css";

function Sidebar() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileMenuOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const menuItems = [
    // Main
    { path: "/dashboard", name: "Dashboard", icon: "📊" },
    { path: "/player-details", name: "Users Details", icon: "👤" },
    { path: "/create-agent", name: "Create Agents", icon: "➕" },
    { path: "/agents", name: "Agents", icon: "🧑‍💼" },
    { path: "/create-game", name: "Create Game", icon: "➕" },
    { path: "/games", name: "Manage Games", icon: "🎮" },
   
    { path: "/live-game", name: "Live Game", icon: "🔴" },
    { path: "/tickets", name: "Tickets", icon: "🎫" },
    { path: "/withdraw-request", name: "Withdrawal Requests", icon: "🪙" },

    { path: "/winners", name: "Winners", icon: "🥇" },
    { path: "/prizes", name: "Manage Prizes", icon: "🎁" },
    { path: "/add-offer", name: "Add Offer", icon: "🏷️" },
    { path: "/add-banner", name: "Add Banner", icon: "🖼️" },
    { path: "/policies", name: "Policies", icon: "📄" },

    { path: "/videos", name: "Videos", icon: "🎥" },
    { path: "/how-it-works", name: "How it works", icon: "ℹ️" },
    { path: "/winner-banner", name: "Winner Banner", icon: "📸" },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          className={`mobile-menu-toggle ${isMobileMenuOpen ? "active" : ""}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      )}

      {/* Overlay for mobile */}
      {isMobile && isMobileMenuOpen && (
        <div className="sidebar-overlay" onClick={closeMobileMenu}></div>
      )}

      {/* Sidebar */}
      <div
        className={`sidebar ${isMobile ? "mobile" : ""} ${isMobileMenuOpen ? "mobile-open" : ""}`}
      >
        <div className="sidebar-header">
          <h2> Tambola</h2>
          <p className="sidebar-subtitle">Business Growth Platform</p>
          {isMobile && (
            <button
              className="mobile-close-btn"
              onClick={closeMobileMenu}
            ></button>
          )}
        </div>

        <ul className="sidebar-menu">
          {menuItems.map((item, index) => {
            // Add divider before admin section
            if (item.path === "/admin") {
              return (
                <div key="admin-section">
                  <li className="menu-divider"></li>
                  <li className="menu-section-title">
                    <span className="menu-text">ADMIN PANEL</span>
                  </li>
                  <li key={item.path} className={isActive(item.path)}>
                    <Link to={item.path} onClick={closeMobileMenu}>
                      <span className="menu-icon">{item.icon}</span>
                      <span className="menu-text">{item.name}</span>
                      {isActive(item.path) && (
                        <span className="active-indicator"></span>
                      )}
                    </Link>
                  </li>
                </div>
              );
            }

            return (
              <li key={item.path} className={isActive(item.path)}>
                <Link to={item.path} onClick={closeMobileMenu}>
                  <span className="menu-icon">{item.icon}</span>
                  <span className="menu-text">{item.name}</span>
                  {isActive(item.path) && (
                    <span className="active-indicator"></span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}

export default Sidebar;

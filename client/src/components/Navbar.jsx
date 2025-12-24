import React, { useContext, useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../css/Navbar.css";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [showContactPopup, setShowContactPopup] = useState(false);
  const navigate = useNavigate();
  const contactRef = useRef(null);

  // Close popup if clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (contactRef.current && !contactRef.current.contains(event.target)) {
        setShowContactPopup(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const target = user?.role === "admin" ? "/admin/dashboard" : "/dashboard";
    navigate(`${target}?search=${searchQuery}`);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    const target = user?.role === "admin" ? "/admin/dashboard" : "/dashboard";
    navigate(`${target}?search=${value}`);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Left: Logo */}
        <div className="nav-left">
          <Link to="/" className="logo">
            <span className="logo-icon">🗳️</span>
            <span className="logo-text">VoteEase</span>
          </Link>
        </div>

        {/* Center: Search Bar */}
        {user && (
          <div className="nav-center">
            <form className="search-bar" onSubmit={handleSearchSubmit}>
              <input
                type="text"
                placeholder="Search candidates, voters..."
                value={searchQuery}
                onChange={handleInputChange} 
              />
              <button type="submit" className="search-icon">🔍</button>
            </form>
          </div>
        )}

        {/* Right: Menu Links */}
        <div className="nav-right">
          {user ? (
            <div className="menu-items">
              
              {/* CONTACT US WRAPPER */}
              <div className="contact-wrapper" ref={contactRef}>
                <button 
                  className="nav-link contact-trigger" 
                  onClick={() => setShowContactPopup(!showContactPopup)}
                >
                  Contact Us
                </button>

                {showContactPopup && (
                  <div className="cutu-popup">
                    
                    <h4 >Contact Me! ✨</h4>
                    <div className="contact-details">
                      <p>📞 <strong>Phone:</strong> +91 981344 5640</p>
                      <p>📧 <strong>Gmail:</strong> yeshikagola139@gmail.com</p>
                    </div>
                    <div className="cutu-footer">🌸 Have a lovely day!</div>
                  </div>
                )}
              </div>

              {user.role === "admin" && (
                <Link to="/admin/dashboard" className="nav-link admin-link">Admin Panel</Link>
              )}

              <div className="user-section">
                <span className="user-badge">
                  {user.name} <small>({user.role})</small>
                </span>
                <button className="logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="register-btn">Get Started</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
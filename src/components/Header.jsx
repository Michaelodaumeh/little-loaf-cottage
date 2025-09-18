import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import "./css/Header.css";

export default function Header() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo Section */}
        <div className="logo-section">
          <Link to="/" className="logo" aria-label="Little Loaf Cottage - Home">
            <img src={logo} alt="Little Loaf Cottage Logo" className="logo-img" />
            <span className="logo-text">Little Loaf Cottage</span>
          </Link>
        </div>

        {/* Navigation Section */}
        <nav className="nav-section" role="navigation" aria-label="Main navigation">
          <ul className="nav-links" role="menubar">
            <li role="none">
              <Link 
                to="/" 
                className={`nav-link ${isActive("/") ? "active" : ""}`}
                role="menuitem"
                aria-current={isActive("/") ? "page" : undefined}
              >
                Home
              </Link>
            </li>
            <li role="none">
              <Link 
                to="/menu" 
                className={`nav-link ${isActive("/menu") ? "active" : ""}`}
                role="menuitem"
                aria-current={isActive("/menu") ? "page" : undefined}
              >
                Menu
              </Link>
            </li>
            <li role="none">
              <Link 
                to="/order" 
                className={`nav-link ${isActive("/order") ? "active" : ""}`}
                role="menuitem"
                aria-current={isActive("/order") ? "page" : undefined}
              >
                Order
              </Link>
            </li>
            <li role="none">
              <Link 
                to="/contact" 
                className={`nav-link ${isActive("/contact") ? "active" : ""}`}
                role="menuitem"
                aria-current={isActive("/contact") ? "page" : undefined}
              >
                Contact
              </Link>
            </li>
            <li role="none">
              <Link 
                to="/testimonials" 
                className={`nav-link ${isActive("/testimonials") ? "active" : ""}`}
                role="menuitem"
                aria-current={isActive("/testimonials") ? "page" : undefined}
              >
                Testimonials
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

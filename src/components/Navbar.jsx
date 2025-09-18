import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Navbar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="container">
        <Link to="/" className="logo" aria-label="Little Loaf Cottage - Home">
          <img src={logo} alt="Little Loaf Cottage Logo" className="logo-img" />
          <span>Little Loaf Cottage</span>
        </Link>
        <ul role="menubar">
          <li role="none">
            <Link 
              to="/" 
              className={isActive("/") ? "active" : ""}
              role="menuitem"
              aria-current={isActive("/") ? "page" : undefined}
            >
              Home
            </Link>
          </li>
          <li role="none">
            <Link 
              to="/menu" 
              className={isActive("/menu") ? "active" : ""}
              role="menuitem"
              aria-current={isActive("/menu") ? "page" : undefined}
            >
              Menu
            </Link>
          </li>
          <li role="none">
            <Link 
              to="/order" 
              className={isActive("/order") ? "active" : ""}
              role="menuitem"
              aria-current={isActive("/order") ? "page" : undefined}
            >
              Order
            </Link>
          </li>
          <li role="none">
            <Link 
              to="/contact" 
              className={isActive("/contact") ? "active" : ""}
              role="menuitem"
              aria-current={isActive("/contact") ? "page" : undefined}
            >
              Contact
            </Link>
          </li>
          <li role="none">
            <Link 
              to="/testimonials" 
              className={isActive("/testimonials") ? "active" : ""}
              role="menuitem"
              aria-current={isActive("/testimonials") ? "page" : undefined}
            >
              Testimonials
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

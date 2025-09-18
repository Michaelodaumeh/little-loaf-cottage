// Import React Router components for navigation
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Import all page components
import Home from "./components/Home";
import Menu from "./components/Menu";
import Order from "./components/Order";
import Contact from "./components/Contact";
import Testimonials from "./components/Testimonials";
import Header from "./components/Header";

// Import OrderProvider to manage global order state
import { OrderProvider } from "./contexts/OrderContext";

/**
 * Main App Component
 * This is the root component that sets up the entire application structure
 */
function App() {
  return (
    // OrderProvider wraps the entire app to provide order state to all components
    <OrderProvider>
      {/* Router enables navigation between different pages */}
      <Router>
        {/* Skip link for accessibility - allows screen readers to jump to main content */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        
        {/* Header component with logo and navigation */}
        <Header />
        
        {/* Main content area where page components will render */}
        <main id="main-content">
          {/* Routes define which component to show for each URL path */}
          <Routes>
            <Route path="/" element={<Home />} />           {/* Home page - "/" */}
            <Route path="/menu" element={<Menu />} />       {/* Menu page - "/menu" */}
            <Route path="/order" element={<Order />} />     {/* Order page - "/order" */}
            <Route path="/contact" element={<Contact />} /> {/* Contact page - "/contact" */}
            <Route path="/testimonials" element={<Testimonials />} /> {/* Testimonials page - "/testimonials" */}
          </Routes>
        </main>
      </Router>
    </OrderProvider>
  );
}

export default App;

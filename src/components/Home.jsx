import { Link } from "react-router-dom";
import cinnamonRollsImg from "../assets/cinnamon-rolls.jpg";
import { useScrollAnimation } from "../hooks/useScrollAnimation";
import "./css/Home.css";

export default function Home() {
  const [heroRef, heroVisible] = useScrollAnimation(0.1);
  const [productsRef, productsVisible] = useScrollAnimation(0.1);
  const [aboutRef, aboutVisible] = useScrollAnimation(0.1);
  const [ctaRef, ctaVisible] = useScrollAnimation(0.1);

  const featuredProducts = [
    {
      name: "Artisan Sourdough",
      price: 12,
      description: "Handcrafted with a 48-hour fermentation process",
      emoji: "🥖",
      image: cinnamonRollsImg // Using the same image for now
    },
    {
      name: "Chocolate Chip Cookies",
      price: 3,
      description: "Soft, chewy cookies with premium chocolate chips",
      emoji: "🍪",
      image: cinnamonRollsImg // Using the same image for now
    },
    {
      name: "Cinnamon Rolls",
      price: 6,
      description: "Freshly baked with cream cheese frosting",
      emoji: "🥐",
      image: cinnamonRollsImg
    }
  ];

  return (
    <div className="page">
      {/* Hero Section */}
      <section className="hero" ref={heroRef}>
        <div className={`hero-content ${heroVisible ? 'fade-in-up' : ''}`}>
          <h1>Welcome to Little Loaf Cottage</h1>
          <p className="lead">
            Artisan bread and pastries crafted with traditional techniques and premium ingredients. 
            Experience the authentic taste of homemade baking that brings families together.
          </p>
          <div className="hero-cta">
            <Link to="/menu" className="btn-primary hover-lift">
              View Our Menu
            </Link>
            <Link to="/order" className="btn-outline hover-lift">
              Order Now
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="page-content" ref={productsRef}>
        <div className={`text-center mb-5 ${productsVisible ? 'fade-in-up' : ''}`}>
          <h2>Featured Products</h2>
          <p className="lead">Handcrafted specialties, baked fresh daily with traditional methods</p>
        </div>
        
        <div className="card-grid">
          {featuredProducts.map((product, index) => (
            <div key={index} className={`product-card hover-lift ${productsVisible ? 'fade-in-up' : ''}`} style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="product-image">
                <img 
                  src={product.image} 
                  alt={`${product.name} - ${product.description}`}
                  loading="lazy"
                  onError={(e) => {
                    // Fallback to emoji if image fails to load
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="product-emoji-fallback" style={{ display: 'none' }} aria-hidden="true">
                  <span>{product.emoji}</span>
                </div>
              </div>
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <div className="product-price">${product.price}</div>
                <p className="product-description">{product.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section className="page-content" ref={aboutRef} style={{ background: 'var(--soft-gray)', margin: 'var(--spacing-2xl) 0', padding: 'var(--spacing-2xl) 0', borderRadius: 'var(--radius-lg)' }}>
        <div className={`text-center ${aboutVisible ? 'fade-in-up' : ''}`}>
          <h2>Our Story</h2>
          <p className="lead" style={{ maxWidth: '800px', margin: '0 auto' }}>
            Little Loaf Cottage began as a family tradition, passed down through generations. 
            We believe that exceptional bread comes from premium ingredients, time-honored techniques, 
            and unwavering dedication. Every morning, our master bakers begin before dawn to knead, 
            proof, and bake our artisan breads and pastries, ensuring each product meets our 
            exacting standards of quality and taste.
          </p>
        </div>
      </section>

      {/* Call to Action */}
      <section className="page-content text-center" ref={ctaRef}>
        <div className={ctaVisible ? 'fade-in-up' : ''}>
          <h2>Ready to Experience Excellence?</h2>
          <p className="lead">Order our artisan breads and pastries for delivery, or visit our bakery for the complete experience.</p>
          <div className="hero-cta">
            <Link to="/order" className="btn-primary hover-lift">
              Place Your Order
            </Link>
            <Link to="/contact" className="btn-outline hover-lift">
              Visit Our Bakery
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

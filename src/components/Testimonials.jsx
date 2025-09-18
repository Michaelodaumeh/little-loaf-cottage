import { useState, useEffect } from "react";
import "./css/Testimonials.css";

export default function Testimonials() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      text: "The sourdough is absolutely incredible! I've been buying bread from Little Loaf Cottage for over a year now, and it's consistently the best I've ever had. The crust is perfect, and the inside is so flavorful.",
      author: "Sarah L.",
      location: "Local Customer",
      rating: 5,
      product: "Artisan Sourdough"
    },
    {
      text: "My kids absolutely love the chocolate chip cookies! They're always asking me to get more. The cookies are soft, chewy, and have the perfect amount of chocolate chips. Fresh every single time!",
      author: "Mark D.",
      location: "Father of Three",
      rating: 5,
      product: "Chocolate Chip Cookies"
    },
    {
      text: "Every bite feels like home. The cinnamon rolls are to die for, and the banana bread reminds me of my grandmother's recipe. Little Loaf Cottage has become our family's go-to bakery.",
      author: "Emma W.",
      location: "Regular Customer",
      rating: 5,
      product: "Cinnamon Rolls & Banana Bread"
    },
    {
      text: "I ordered a custom cake for my daughter's birthday, and it was absolutely beautiful and delicious! The team went above and beyond to make it special. Highly recommend for special occasions!",
      author: "Jennifer M.",
      location: "Birthday Mom",
      rating: 5,
      product: "Custom Birthday Cake"
    },
    {
      text: "The apple cider donuts are a seasonal favorite in our house! We look forward to them every fall. The warm spices and perfect texture make them irresistible. Worth every penny!",
      author: "Robert K.",
      location: "Seasonal Customer",
      rating: 5,
      product: "Apple Cider Donuts"
    },
    {
      text: "I've tried bakeries all over the city, and nothing compares to Little Loaf Cottage. The quality is consistently excellent, and the staff is always friendly and helpful. It's become my weekly tradition!",
      author: "Lisa T.",
      location: "Weekly Customer",
      rating: 5,
      product: "Various Breads & Pastries"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < rating ? '#DAA520' : '#ddd', fontSize: '1.2rem' }}>
        ★
      </span>
    ));
  };

  return (
    <div className="page">
      <div className="page-content">
        <div className="text-center mb-5">
          <h2>What Our Customers Say</h2>
          <p>Don't just take our word for it - hear from our happy customers!</p>
        </div>

        {/* Featured Testimonial Carousel */}
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto var(--spacing-xl)', position: 'relative' }}>
          <div className="testimonial">
            <div className="testimonial-text">
              "{testimonials[currentTestimonial].text}"
            </div>
            <div className="testimonial-author">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-xs)' }}>
                <div>
                  <strong>{testimonials[currentTestimonial].author}</strong>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-light)' }}>
                    {testimonials[currentTestimonial].location}
                  </p>
                </div>
                <div>
                  {renderStars(testimonials[currentTestimonial].rating)}
                </div>
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--primary-brown)', fontStyle: 'italic' }}>
                About: {testimonials[currentTestimonial].product}
              </div>
            </div>
          </div>

          {/* Carousel Indicators */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: 'var(--spacing-xs)', 
            marginTop: 'var(--spacing-md)' 
          }}>
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: index === currentTestimonial ? 'var(--primary-brown)' : 'var(--light-brown)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
              />
            ))}
          </div>
        </div>

        {/* All Testimonials Grid */}
        <div className="card-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial">
              <div className="testimonial-text">
                "{testimonial.text}"
              </div>
              <div className="testimonial-author">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-xs)' }}>
                  <div>
                    <strong>{testimonial.author}</strong>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-light)' }}>
                      {testimonial.location}
                    </p>
                  </div>
                  <div>
                    {renderStars(testimonial.rating)}
                  </div>
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--primary-brown)', fontStyle: 'italic' }}>
                  About: {testimonial.product}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center" style={{ marginTop: 'var(--spacing-2xl)' }}>
          <h3>Ready to Experience the Difference?</h3>
          <p>Join our community of satisfied customers and taste the quality that keeps them coming back!</p>
          <div className="hero-cta">
            <a href="/menu" className="btn-primary">
              View Our Menu
            </a>
            <a href="/order" className="btn-outline">
              Place Your Order
            </a>
          </div>
        </div>

        {/* Trust Indicators */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: 'var(--spacing-lg)', 
          marginTop: 'var(--spacing-2xl)',
          textAlign: 'center'
        }}>
          <div className="card">
            <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>⭐</div>
            <h4>5-Star Rated</h4>
            <p>Consistently excellent reviews from our customers</p>
          </div>
          <div className="card">
            <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>🍞</div>
            <h4>Fresh Daily</h4>
            <p>Baked fresh every morning with premium ingredients</p>
          </div>
          <div className="card">
            <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>❤️</div>
            <h4>Made with Love</h4>
            <p>Every product is crafted with care and attention to detail</p>
          </div>
        </div>
      </div>
    </div>
  );
}

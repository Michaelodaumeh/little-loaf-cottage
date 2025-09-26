// Import React hooks for state management and performance optimization
import { useState, useCallback, useMemo } from "react";

// Import React Router hook for navigation
import { useNavigate } from "react-router-dom";

// Import the image asset (currently using same image for all items)
import cinnamonRollsImg from "../assets/cinnamon-rolls.jpg";

// Import the order context hook to access global order state
import { useOrder } from "../contexts/OrderContext";

// Import notification component for success messages
import Notification from "./Notification";

// Import component-specific CSS styles
import "./css/Menu.css";

/**
 * Menu Component
 * This component displays the bakery's menu items and allows customers to add items to their order
 * It includes an order summary sidebar that shows selected items with quantity controls
 */
export default function Menu() {
  // ===== HOOKS AND STATE =====
  
  // React Router hook for programmatic navigation
  const navigate = useNavigate();
  
  // Access order state and functions from the global OrderContext
  const { 
    selectedItems,      // Array of items currently in the order
    addToOrder,         // Function to add items to order
    removeFromOrder,    // Function to remove items from order
    showMessage,        // Boolean for notification visibility
    setShowMessage,     // Function to control notification visibility
    messageText,        // Text content of notifications
    totalPrice          // Calculated total price of all items
  } = useOrder();

  /**
   * Navigates to the order page with current selected items
   * This function is memoized to prevent unnecessary re-renders
   */
  const goToOrder = useCallback(() => {
    navigate("/order", { state: { selectedItems } });
  }, [navigate, selectedItems]);

  // ===== MENU DATA =====
  
  /**
   * Array of menu items available for order
   * Each item contains:
   * - name: Display name of the item
   * - price: Price in dollars
   * - description: Brief description of the item
   * - emoji: Emoji icon for visual appeal
   * - image: Image asset (currently all using same image)
   * - category: Category for grouping items
   */
  const menuItems = [
    { 
      name: "Artisan Sourdough", 
      price: 12, 
      description: "Handcrafted with a 48-hour fermentation process",
      emoji: "🥖",
      image: cinnamonRollsImg,
      category: "Bread"
    },
    { 
      name: "Sandwich Bread", 
      price: 10, 
      description: "Perfect for your daily sandwiches",
      emoji: "🍞",
      image: cinnamonRollsImg,
      category: "Bread"
    },
    { 
      name: "Chocolate Chip Cookies", 
      price: 1, 
      description: "Soft, chewy cookies with premium chocolate chips",
      emoji: "🍪",
      image: cinnamonRollsImg,
      category: "Cookies"
    },
    { 
      name: "Apple Cider Donut (2 pack)", 
      price: 6, 
      description: "Seasonal favorite with warm spices",
      emoji: "🍩",
      image: cinnamonRollsImg,
      category: "Donuts"
    },
    { 
      name: "Pecan Banana Bread", 
      price: 4, 
      description: "Moist and nutty, perfect for breakfast",
      emoji: "🍌",
      image: cinnamonRollsImg,
      category: "Quick Bread"
    },
    { 
      name: "Cinnamon Rolls", 
      price: 6, 
      description: "Freshly baked with cream cheese frosting",
      emoji: "🥐",
      image: cinnamonRollsImg,
      category: "Pastries"
    },
    { 
      name: "Express Brownie", 
      price: 4, 
      description: "Rich, fudgy brownies made with dark chocolate",
      emoji: "🍫",
      image: cinnamonRollsImg,
      category: "Desserts"
    },
    { 
      name: "Mini Banana Bread", 
      price: 5, 
      description: "Individual-sized loaves, great for gifting",
      emoji: "🍞",
      image: cinnamonRollsImg,
      category: "Quick Bread"
    },
  ];


  // ===== COMPUTED VALUES =====
  
  /**
   * Extracts unique categories from menu items
   * This is memoized to prevent recalculation on every render
   * @returns {Array} Array of unique category names
   */
  const categories = useMemo(() => {
    return [...new Set(menuItems.map(item => item.category))];
  }, []);

  // ===== RENDER =====
  
  return (
    <div className="page">
      <div className="page-content">
        {/* Page Header */}
        <div className="text-center mb-5">
          <h1>Our Menu</h1>
          <p className="lead">Artisan breads and pastries crafted with traditional techniques</p>
        </div>

        {/* Success Notification */}
        <Notification
          type="success"
          message={messageText}
          isVisible={showMessage}
          onClose={() => setShowMessage(false)}
          duration={2000}
        />


        <div className="menu-grid">
          {menuItems.map((item, index) => (
            <div key={index} className="modern-product-card">
              <div className="product-image-container">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="product-image"
                  loading="lazy"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="product-emoji-fallback">
                  <span>{item.emoji}</span>
                </div>
                <div className="product-overlay">
                  <button 
                    onClick={() => addToOrder(item)}
                    className="add-to-cart-btn"
                  >
                    <span>+</span> Add to Order
                  </button>
                </div>
              </div>
              <div className="product-details">
                <div className="product-header">
                  <h3 className="product-name">{item.name}</h3>
                  <div className="product-price">${item.price}</div>
                </div>
                <div className="product-category">{item.category}</div>
                <p className="product-description">{item.description}</p>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    addToOrder(item);
                  }}
                  className="add-to-cart-btn-mobile"
                  style={{ 
                    cursor: 'pointer',
                    touchAction: 'manipulation',
                    WebkitTapHighlightColor: 'transparent'
                  }}
                >
                  <span>+</span> Add to Order
                </button>
              </div>
            </div>
          ))}
        </div>

        {selectedItems.length > 0 ? (
          <div className="modern-order-summary">
            <div className="order-header">
              <h3>Your Order</h3>
              <div className="item-count">{selectedItems.length} items</div>
            </div>
            
            <div className="order-items">
              {(() => {
                // Group items by name and show unique items with quantities
                const uniqueItems = selectedItems.reduce((acc, item) => {
                  const existing = acc.find(i => i.name === item.name);
                  if (existing) {
                    existing.quantity += 1;
                  } else {
                    acc.push({ ...item, quantity: 1 });
                  }
                  return acc;
                }, []);
                
                return uniqueItems.map((item, index) => (
                  <div key={index} className="order-item-modern">
                    {/* Item Image */}
                    <div style={{ width: '50px', height: '50px', marginRight: 'var(--spacing-sm)', flexShrink: 0 }}>
                      <img 
                        src={item.image} 
                        alt={item.name}
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover', 
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-light)'
                        }}
                        onError={(e) => {
                          // If image fails to load, show emoji fallback
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div 
                        style={{ 
                          display: 'none', 
                          width: '100%', 
                          height: '100%', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          fontSize: '1.5rem',
                          backgroundColor: 'var(--soft-gray)',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-light)'
                        }} 
                        aria-hidden="true"
                      >
                        <span>{item.emoji}</span>
                      </div>
                    </div>
                    
                    {/* Item Info */}
                    <div className="item-info" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginRight: 'var(--spacing-sm)' }}>
                      <span className="item-name">{item.name}</span>
                      <span className="item-price">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                      {/* Quantity Controls */}
                      <button 
                        onClick={() => {
                          // Remove one instance of this item
                          const itemIndex = selectedItems.findIndex(selectedItem => selectedItem.name === item.name);
                          if (itemIndex !== -1) {
                            removeFromOrder(itemIndex);
                          }
                        }}
                        style={{ 
                          background: 'var(--soft-gray)', 
                          border: '1px solid var(--border-light)', 
                          color: 'var(--text-muted)', 
                          width: '20px', 
                          height: '20px', 
                          borderRadius: '50%', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          cursor: 'pointer', 
                          transition: 'all var(--transition-fast)', 
                          fontSize: '0.8rem', 
                          fontWeight: '600'
                        }}
                        title="Decrease quantity"
                      >
                        −
                      </button>
                      <span style={{ 
                        minWidth: '16px', 
                        textAlign: 'center', 
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        color: 'var(--text-dark)'
                      }}>
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => addToOrder(item)}
                        style={{ 
                          background: 'var(--primary-pink)', 
                          border: '1px solid var(--primary-pink)', 
                          color: 'white', 
                          width: '20px', 
                          height: '20px', 
                          borderRadius: '50%', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          cursor: 'pointer', 
                          transition: 'all var(--transition-fast)', 
                          fontSize: '0.8rem', 
                          fontWeight: '600'
                        }}
                        title="Increase quantity"
                      >
                        +
                      </button>
                      <button 
                        onClick={() => {
                          // Remove all instances of this item
                          const indicesToRemove = selectedItems
                            .map((selectedItem, idx) => selectedItem.name === item.name ? idx : -1)
                            .filter(idx => idx !== -1)
                            .reverse(); // Remove from end to avoid index shifting
                          
                          indicesToRemove.forEach(idx => removeFromOrder(idx));
                        }}
                        className="remove-btn"
                        title="Remove all of this item"
                        style={{ marginLeft: 'var(--spacing-xs)' }}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ));
              })()}
            </div>
            
            <div className="order-footer">
              <div className="order-total-modern">
                Total: ${totalPrice.toFixed(2)}
              </div>
              <button onClick={goToOrder} className="checkout-btn">
                Proceed to Checkout
              </button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 'var(--spacing-lg)', color: 'var(--text-muted)' }}>
            No items in your order yet. Add some delicious items from our menu!
          </div>
        )}
      </div>
    </div>
  );
}
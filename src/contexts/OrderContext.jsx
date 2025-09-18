// Import React hooks for state management and context
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

// Create a React Context for sharing order state across components
const OrderContext = createContext();

/**
 * Custom hook to access order context
 * This hook provides access to all order-related functions and state
 * Must be used within an OrderProvider component
 */
export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};

// ===== LOCAL STORAGE HELPER FUNCTIONS =====
// These functions handle saving and loading order data to/from browser storage

// Key used to store order data in localStorage
const STORAGE_KEY = 'little-loaf-cottage-order';

/**
 * Saves order items to browser's localStorage
 * This allows orders to persist even if the user closes the browser
 * @param {Array} items - Array of order items to save
 */
const saveOrderToStorage = (items) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.warn('Failed to save order to localStorage:', error);
  }
};

/**
 * Loads order items from browser's localStorage
 * This restores the user's order when they return to the website
 * @returns {Array} Array of saved order items, or empty array if none found
 */
const loadOrderFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.warn('Failed to load order from localStorage:', error);
    return [];
  }
};

/**
 * OrderProvider Component
 * This component provides order state and functions to all child components
 * It manages the global order state, localStorage persistence, and notifications
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to wrap
 */
export const OrderProvider = ({ children }) => {
  // ===== STATE MANAGEMENT =====
  
  // Array of items currently in the order
  const [selectedItems, setSelectedItems] = useState([]);
  
  // Controls whether to show notification messages
  const [showMessage, setShowMessage] = useState(false);
  
  // Text content of the notification message
  const [messageText, setMessageText] = useState('');

  // ===== EFFECTS =====
  
  /**
   * Load saved order from localStorage when component mounts
   * This runs once when the app starts to restore any saved orders
   */
  useEffect(() => {
    const savedOrder = loadOrderFromStorage();
    if (savedOrder.length > 0) {
      setSelectedItems(savedOrder);
      // Show a welcome back message if there are saved items
      setMessageText(`Welcome back! You have ${savedOrder.length} item${savedOrder.length > 1 ? 's' : ''} in your order.`);
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 4000);
    }
  }, []);

  // ===== ORDER MANAGEMENT FUNCTIONS =====

  /**
   * Adds an item to the order
   * @param {Object} item - The item to add (must have name, price, description, etc.)
   */
  const addToOrder = useCallback((item) => {
    setSelectedItems(prev => {
      const newItems = [...prev, item];
      saveOrderToStorage(newItems); // Save to localStorage
      return newItems;
    });
    // Show success notification with item name
    setMessageText(`${item.name} added to order!`);
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 2000);
  }, []);

  /**
   * Removes an item from the order by index
   * @param {number} index - The index of the item to remove
   */
  const removeFromOrder = useCallback((index) => {
    setSelectedItems(prev => {
      const newItems = prev.filter((_, i) => i !== index);
      saveOrderToStorage(newItems); // Save to localStorage
      return newItems;
    });
  }, []);

  /**
   * Clears all items from the order
   * Used after successful order completion
   */
  const clearOrder = useCallback(() => {
    setSelectedItems([]);
    saveOrderToStorage([]); // Clear localStorage
  }, []);

  // ===== CALCULATED VALUES =====
  
  /**
   * Calculates the total price of all items in the order
   * @returns {number} Total price of all items
   */
  const totalPrice = selectedItems.reduce((total, item) => total + item.price, 0);

  // ===== CONTEXT VALUE =====
  
  // Object containing all state and functions to share with child components
  const value = {
    selectedItems,        // Array of order items
    addToOrder,          // Function to add items
    removeFromOrder,     // Function to remove items
    clearOrder,          // Function to clear all items
    showMessage,         // Boolean for notification visibility
    setShowMessage,      // Function to control notification visibility
    messageText,         // Text content of notifications
    totalPrice           // Calculated total price
  };

  // Provide the context value to all child components
  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};

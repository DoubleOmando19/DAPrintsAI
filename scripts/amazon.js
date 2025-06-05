import { cart, addToCart } from '../data/cart.js';
import { products } from '../data/products.js';
import { formatCurrency } from './utils/money.js';

/**
 * Amazon.js - Enhanced with Stripe Integration Support
 * 
 * This file has been modified to:
 * 1. Add cart total calculation functionality
 * 2. Expose cart items and details
 * 3. Implement an event system for cart updates
 * 4. Prepare hooks for Stripe payment integration
 */

// Custom event for cart updates - will be used by Stripe integration
const CART_UPDATED_EVENT = 'cart-updated';

// Array to store event listeners
const eventListeners = {};

/**
 * Event system to allow other modules (like Stripe) to listen for cart changes
 */
export const cartEvents = {
  // Add event listener for cart updates
  on: function (eventName, callback) {
    if (!eventListeners[eventName]) {
      eventListeners[eventName] = [];
    }
    eventListeners[eventName].push(callback);
    return this;
  },

  // Remove event listener
  off: function (eventName, callback) {
    if (eventListeners[eventName]) {
      eventListeners[eventName] = eventListeners[eventName].filter(
        listener => listener !== callback
      );
    }
    return this;
  },

  // Trigger event with data
  emit: function (eventName, data) {
    if (eventListeners[eventName]) {
      eventListeners[eventName].forEach(callback => {
        callback(data);
      });
    }
    return this;
  }
};

/**
 * Calculate the total price of all items in the cart
 * @returns {number} Total price in cents
 */
export function calculateCartTotal() {
  try {
    let totalCents = 0;

    // Iterate through each item in the cart
    cart.forEach((cartItem) => {
      // Find the product details for this cart item
      const product = products.find(product => product.id === cartItem.id);

      if (product) {
        // Add the price of this item (price * quantity) to the total
        totalCents += product.priceCents * cartItem.quantity;
      } else {
        console.error(`Product with ID ${cartItem.id} not found`);
      }
    });

    return totalCents;
  } catch (error) {
    console.error('Error calculating cart total:', error);
    return 0;
  }
}

/**
 * Get all items in the cart with their details
 * @returns {Array} Array of cart items with product details
 */
export function getCartItems() {
  try {
    return cart.map(cartItem => {
      const product = products.find(product => product.id === cartItem.id);

      if (product) {
        return {
          id: cartItem.id,
          quantity: cartItem.quantity,
          name: product.name,
          priceCents: product.priceCents,
          image: product.image,
          totalPriceCents: product.priceCents * cartItem.quantity
        };
      } else {
        console.error(`Product with ID ${cartItem.id} not found`);
        return {
          id: cartItem.id,
          quantity: cartItem.quantity,
          error: 'Product details not found'
        };
      }
    });
  } catch (error) {
    console.error('Error getting cart items:', error);
    return [];
  }
}

/**
 * Format the cart total as currency
 * @returns {string} Formatted cart total
 */
export function getFormattedCartTotal() {
  return formatCurrency(calculateCartTotal());
}

/**
 * Enhanced version of addToCart that triggers events
 * @param {string} productId - ID of the product to add
 */
export function enhancedAddToCart(productId) {
  // Call the original addToCart function
  addToCart(productId);

  // Update the cart quantity in the UI
  updateCartQuantity();

  // Emit cart updated event for Stripe integration
  cartEvents.emit(CART_UPDATED_EVENT, {
    cartItems: getCartItems(),
    cartTotal: calculateCartTotal()
  });
}

// Generate HTML for product display
let productsHTML = '';

products.forEach((product) => {
  productsHTML += `
    <div class="product-container">
      <div class="product-image-container">
        <img class="product-image" src="${product.image}">
        <div cursor: pointer; title="Copyright 2025 Alcaide" style="display: flex; font-family: copperplate; margin-top: 160px; margin-left: -60px; width: 20px; height: 10px;">C</div>
      </div>

      <div class="product-name limit-text-to-2-lines">
        ${product.name}
      </div>

      <div class="product-rating-container">
        <img class="product-rating-stars" src="images/ratings/rating-${product.rating.stars * 10}.png">
        <div class="product-rating-count link-primary">
          ${product.rating.count}
        </div>
      </div>

      <div class="product-price">
        $${formatCurrency(product.priceCents)}
      </div>
      
      <div class="product-quality-container stripe-buy-button">
        <!-- Stripe button placeholder - will be replaced by dynamic Stripe integration -->
        <a style="margin-top: -10px; text-decoration: none; font-family: copperplate; color: black;" 
           href="#" 
           class="js-stripe-checkout" 
           data-product-id="${product.id}">
      </div> 
      
      <div class="product-spacer"></div>

      <div class="added-to-cart">
        <img src="images/icons/checkmark.png">
        Added
      </div>

      <button class="add-to-cart-button button-primary js-add-to-cart"
      data-product-id="${product.id}">
        Buy Digital Download
      </button>
    </div>
  `;
});

document.querySelector('.js-products-grid').innerHTML = productsHTML;

/**
 * Update the cart quantity displayed in the UI
 */
function updateCartQuantity() {
  let cartQuantity = 0;

  cart.forEach((cartItem) => {
    cartQuantity += cartItem.quantity;
  });

  document.querySelector('.js-cart-quantity')
    .innerHTML = cartQuantity;
}

// Add event listeners to all add-to-cart buttons
document.querySelectorAll('.js-add-to-cart').forEach((button) => {
  button.addEventListener('click', () => {
    const productId = button.dataset.productId;

    // Use the enhanced addToCart function that triggers events
    enhancedAddToCart(productId);

    // The updateCartQuantity is now called inside enhancedAddToCart
  });
});

// Initialize cart quantity on page load
updateCartQuantity();

// Export cart-related functions for Stripe integration
export {
  updateCartQuantity,
  cart
};
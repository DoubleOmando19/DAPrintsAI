/**
 * Integration Module for Amazon Cart and Stripe Payments
 * 
 * This module serves as the bridge between the Amazon cart functionality and Stripe payment processing.
 * It initializes both systems and establishes the necessary connections between them.
 * 
 * Version: 1.0.0
 * Last Updated: 2025-06-04
 */

import { cartEvents, calculateCartTotal, getCartItems } from './amazon.js';
import { initializeStripe, createCheckoutSession, redirectToCheckout, handlePaymentSuccess, handlePaymentFailure } from './stripe.js';

// Configuration object for the integration
const config = {
  // Stripe configuration
  stripe: {
    // The publishable key should be loaded from environment variables in production
    publishableKey: null, // Will be set during initialization
    elementsOptions: {
      appearance: {
        theme: 'stripe',
        variables: {
          colorPrimary: '#0066c0', // Amazon blue
          colorBackground: '#ffffff',
          colorText: '#333333',
          colorDanger: '#ff0000',
          fontFamily: 'Arial, sans-serif',
          spacingUnit: '4px',
          borderRadius: '4px'
        }
      }
    }
  },

  // Integration settings
  settings: {
    autoInitialize: true,
    enableDebugLogs: false,
    checkoutButtonSelector: '.js-stripe-checkout',
    cartUpdateEventName: 'cart-updated'
  }
};

/**
 * Initialize the integration between Amazon cart and Stripe payments
 * @param {Object} options - Configuration options
 * @returns {Object} The initialized integration instance
 */
export function initializeIntegration(options = {}) {
  try {
    // Merge provided options with default config
    const mergedConfig = {
      ...config,
      stripe: { ...config.stripe, ...options.stripe },
      settings: { ...config.settings, ...options.settings }
    };

    // Log initialization if debug is enabled
    if (mergedConfig.settings.enableDebugLogs) {
      console.log('Initializing Amazon-Stripe integration with config:', mergedConfig);
    }

    // Ensure we have a Stripe publishable key
    if (!mergedConfig.stripe.publishableKey) {
      throw new Error('Stripe publishable key is required for integration');
    }

    // Initialize Stripe with the publishable key
    const stripeInstance = initializeStripe(mergedConfig.stripe.publishableKey);

    if (!stripeInstance) {
      throw new Error('Failed to initialize Stripe');
    }

    // Set up event listeners for cart updates
    setupCartEventListeners(mergedConfig);

    // Set up checkout buttons if they exist in the DOM
    setupCheckoutButtons(mergedConfig);

    // Return the integration instance
    return {
      config: mergedConfig,
      stripe: stripeInstance,

      // Method to manually trigger checkout
      checkout: async () => {
        try {
          const cartTotal = calculateCartTotal();
          const cartItems = getCartItems();

          if (cartTotal <= 0 || cartItems.length === 0) {
            throw new Error('Cart is empty');
          }

          const session = await createCheckoutSession(cartTotal, cartItems);
          await redirectToCheckout(session.id);
          return session;
        } catch (error) {
          handlePaymentFailure(error);
          throw error;
        }
      }
    };
  } catch (error) {
    console.error('Failed to initialize Amazon-Stripe integration:', error);
    displayErrorMessage('Payment integration failed to initialize. Please refresh the page and try again.');
    return null;
  }
}

/**
 * Set up event listeners for cart updates
 * @param {Object} config - Integration configuration
 */
function setupCartEventListeners(config) {
  // Listen for cart update events
  cartEvents.on(config.settings.cartUpdateEventName, (data) => {
    if (config.settings.enableDebugLogs) {
      console.log('Cart updated:', data);
    }

    // Update checkout buttons with new cart total
    updateCheckoutButtons(data.cartTotal);
  });
}

/**
 * Set up checkout buttons in the DOM
 * @param {Object} config - Integration configuration
 */
function setupCheckoutButtons(config) {
  const buttons = document.querySelectorAll(config.settings.checkoutButtonSelector);

  if (buttons.length === 0 && config.settings.enableDebugLogs) {
    console.warn(`No checkout buttons found with selector: ${config.settings.checkoutButtonSelector}`);
    return;
  }

  buttons.forEach(button => {
    // Remove any existing event listeners
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);

    // Add click event listener
    newButton.addEventListener('click', async (event) => {
      event.preventDefault();

      try {
        // Show loading state
        newButton.disabled = true;
        newButton.classList.add('loading');

        // Get current cart data
        const cartTotal = calculateCartTotal();
        const cartItems = getCartItems();

        if (cartTotal <= 0 || cartItems.length === 0) {
          throw new Error('Your cart is empty');
        }

        // Create checkout session and redirect
        const session = await createCheckoutSession(cartTotal, cartItems);
        await redirectToCheckout(session.id);
      } catch (error) {
        handlePaymentFailure(error);
      } finally {
        // Reset button state
        newButton.disabled = false;
        newButton.classList.remove('loading');
      }
    });
  });

  // Initialize button states
  updateCheckoutButtons(calculateCartTotal());
}

/**
 * Update checkout buttons based on cart total
 * @param {number} cartTotal - Total amount in cart in cents
 */
function updateCheckoutButtons(cartTotal) {
  const buttons = document.querySelectorAll(config.settings.checkoutButtonSelector);

  buttons.forEach(button => {
    if (cartTotal <= 0) {
      button.disabled = true;
      button.classList.add('disabled');
      button.textContent = 'Checkout (Cart Empty)';
    } else {
      button.disabled = false;
      button.classList.remove('disabled');
      button.textContent = `Checkout ($${(cartTotal / 100).toFixed(2)})`;
    }
  });
}

/**
 * Display an error message to the user
 * @param {string} message - Error message to display
 */
function displayErrorMessage(message) {
  console.error(message);

  // Create or update error message element
  let errorElement = document.querySelector('.integration-error-message');

  if (!errorElement) {
    errorElement = document.createElement('div');
    errorElement.className = 'integration-error-message error-message';
    document.body.appendChild(errorElement);
  }

  errorElement.textContent = message;
  errorElement.style.display = 'block';

  // Hide after 5 seconds
  setTimeout(() => {
    errorElement.style.display = 'none';
  }, 5000);
}

/**
 * Check if the URL contains a session ID parameter and handle payment result
 */
export function handlePaymentReturn() {
  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('session_id');

  if (sessionId) {
    // Handle successful payment
    handlePaymentSuccess(sessionId)
      .catch(error => {
        console.error('Error handling payment return:', error);
      });
  }

  // Check for error parameters
  const errorType = urlParams.get('error_type');
  const errorMessage = urlParams.get('error_message');

  if (errorType || errorMessage) {
    // Handle payment failure
    handlePaymentFailure({
      type: errorType || 'unknown_error',
      message: errorMessage || 'Payment failed'
    });
  }
}

// Auto-initialize if enabled in config
if (config.settings.autoInitialize && typeof window !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      // Load publishable key from data attribute if available
      const keyElement = document.querySelector('[data-stripe-publishable-key]');
      if (keyElement) {
        config.stripe.publishableKey = keyElement.dataset.stripePublishableKey;
      }

      // Initialize integration
      if (config.stripe.publishableKey) {
        initializeIntegration();
      } else {
        console.error('Stripe publishable key not found. Integration not initialized.');
      }

      // Handle payment return if on a return URL
      handlePaymentReturn();
    });
  } else {
    // DOM already loaded
    const keyElement = document.querySelector('[data-stripe-publishable-key]');
    if (keyElement) {
      config.stripe.publishableKey = keyElement.dataset.stripePublishableKey;
    }

    if (config.stripe.publishableKey) {
      initializeIntegration();
    } else {
      console.error('Stripe publishable key not found. Integration not initialized.');
    }

    // Handle payment return if on a return URL
    handlePaymentReturn();
  }
}

// Export additional utilities
export {
  config,
  setupCartEventListeners,
  setupCheckoutButtons,
  updateCheckoutButtons,
  displayErrorMessage
};
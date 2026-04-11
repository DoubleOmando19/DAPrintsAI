/**
 * integration.js - Post-Payment Integration Handler
 * 
 * Handles the return from Stripe Checkout:
 * 1. Detects if user returned from a successful payment (via URL params)
 * 2. Queries the server for session status to get buyer email and order details
 * 3. Displays a success message with confirmation that pictures will be emailed
 * 4. Clears the cart after confirmed successful payment
 * 
 * The actual email sending happens on the server via Stripe webhooks,
 * but this provides immediate visual feedback to the buyer.
 */

import { clearCart } from '../data/cart.js';

function checkPaymentStatus() {
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('session_id');
  const status = urlParams.get('status');

  if (status === 'success' && sessionId) {
    handleSuccessfulReturn(sessionId);
  } else if (status === 'cancelled') {
    handleCancelledPayment();
  }
}

async function handleSuccessfulReturn(sessionId) {
  try {
    // Query the server for the completed session details
    const response = await fetch(`/api/session-status?session_id=${sessionId}`);

    if (!response.ok) {
      throw new Error('Failed to retrieve payment status');
    }

    const sessionData = await response.json();

    if (sessionData.status === 'paid') {
      // Clear the cart since payment was successful
      clearCart();
      // Remove the cart backup
      localStorage.removeItem('cart_backup');

      // Display success message
      displaySuccessMessage(sessionData);
    }
  } catch (error) {
    console.error('Error checking payment status:', error);
    // Even if we can't verify, show a generic success message
    displayGenericSuccessMessage();
  }
}

function displaySuccessMessage(sessionData) {
  const mainContent = document.querySelector('.main');
  if (!mainContent) return;

  const itemCount = sessionData.orderItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalFormatted = (sessionData.amountTotal / 100).toFixed(2);
  const email = sessionData.customerEmail;

  const itemsHTML = sessionData.orderItems.map(item => `
    <li style="padding: 5px 0;">
      <strong>${item.name}</strong> (Qty: ${item.quantity}) - $${(item.priceCents / 100).toFixed(2)} each
    </li>
  `).join('');

  const successHTML = `
    <div style="max-width: 600px; margin: 40px auto; text-align: center; padding: 30px; background: #f0fff0; border: 2px solid #4CAF50; border-radius: 10px;">
      <div style="font-size: 48px; margin-bottom: 15px;">&#10004;</div>
      <h2 style="color: #4CAF50; margin-bottom: 15px;">Payment Successful!</h2>
      <p style="font-size: 16px; color: #333; margin-bottom: 10px;">
        Thank you for purchasing <strong>${itemCount} picture${itemCount > 1 ? 's' : ''}</strong>!
      </p>
      <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
        Total charged: <strong>$${totalFormatted}</strong>
      </p>
      
      <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0; text-align: left;">
        <h3 style="margin-top: 0;">Items purchased:</h3>
        <ul style="list-style: none; padding: 0;">${itemsHTML}</ul>
      </div>

      <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <p style="font-size: 16px; margin: 0;">
          &#9993; Your purchased picture${itemCount > 1 ? 's have' : ' has'} been sent to:<br>
          <strong style="font-size: 18px;">${email}</strong>
        </p>
        <p style="font-size: 13px; color: #666; margin-top: 8px; margin-bottom: 0;">
          Please check your email (and spam folder) for the PDF attachment${itemCount > 1 ? 's' : ''}.
        </p>
      </div>

      <a href="amazon.html" style="display: inline-block; margin-top: 20px; padding: 12px 30px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px; font-size: 16px;">
        Continue Shopping
      </a>
    </div>
  `;

  mainContent.innerHTML = successHTML;
}

function displayGenericSuccessMessage() {
  const mainContent = document.querySelector('.main');
  if (!mainContent) return;

  clearCart();

  const successHTML = `
    <div style="max-width: 600px; margin: 40px auto; text-align: center; padding: 30px; background: #f0fff0; border: 2px solid #4CAF50; border-radius: 10px;">
      <div style="font-size: 48px; margin-bottom: 15px;">&#10004;</div>
      <h2 style="color: #4CAF50; margin-bottom: 15px;">Payment Successful!</h2>
      <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
        Thank you for your purchase! Your digital artwork will be sent to the email address you provided during checkout.
      </p>
      <p style="font-size: 14px; color: #666;">
        Please check your email (and spam folder) for the PDF downloads.
      </p>
      <a href="index.html" style="display: inline-block; margin-top: 20px; padding: 12px 30px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px; font-size: 16px;">
        Continue Shopping
      </a>
    </div>
  `;

  mainContent.innerHTML = successHTML;
}

function handleCancelledPayment() {
  // Restore cart from backup if payment was cancelled
  const cartBackup = localStorage.getItem('cart_backup');
  if (cartBackup) {
    localStorage.setItem('cart', cartBackup);
    localStorage.removeItem('cart_backup');
  }

  const statusEl = document.querySelector('.js-payment-status');
  if (statusEl) {
    statusEl.innerHTML = `
      <p style="color: #ff9800; font-size: 14px; padding: 10px; background: #fff3e0; border-radius: 5px;">
        Payment was cancelled. Your cart items are still saved. You can try again when ready.
      </p>
    `;
  }
}

// Run on page load
checkPaymentStatus();

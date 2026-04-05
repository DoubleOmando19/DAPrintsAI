import { cart, clearCart } from '../../data/cart.js';
import { getProduct } from '../../data/products.js';
import { getDeliveryOption } from '../../data/deliveryOptions.js';
import { formatCurrency } from '../utils/money.js';

export function renderPaymentSummary() {
  let productPriceCents = 0;
  let shippingPriceCents = 0;

  cart.forEach((cartItem) => {
    const product = getProduct(cartItem.productId);
    productPriceCents += product.priceCents * cartItem.quantity;

    const deliveryOption = getDeliveryOption(cartItem.deliveryOptionId);
    shippingPriceCents += deliveryOption.priceCents;
  });

  const totalBeforeTaxCents = productPriceCents + shippingPriceCents;
  const totalCents = totalBeforeTaxCents;

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const paymentSummaryHTML = `
    <div class="payment-summary-title">
      Order Summary
    </div>

    <div class="payment-summary-row">
      <div>Items (${itemCount}):</div>
      <div class="payment-summary-money">
        $${formatCurrency(productPriceCents)}
      </div>
    </div>

    <div class="payment-summary-row">
      <div>Shipping &amp; handling:</div>
      <div class="payment-summary-money">
        $${formatCurrency(shippingPriceCents)}
      </div>
    </div>

    <div class="payment-summary-row subtotal-row">
      <div>Total:</div>
      <div class="payment-summary-money">
        $${formatCurrency(totalBeforeTaxCents)}
      </div>
    </div>

    <div class="payment-summary-row total-row">
      <div>Order total:</div>
      <div class="payment-summary-money">
        $${formatCurrency(totalCents)}
      </div>
    </div>

    <button class="place-order-button button-primary js-place-order-button"
      ${cart.length === 0 ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>
      Place your order
    </button>

    <div class="js-payment-status" style="margin-top: 10px; text-align: center;"></div>
  `;

  document.querySelector('.js-payment-summary')
    .innerHTML = paymentSummaryHTML;

  // Add event listener to the place order button
  const placeOrderBtn = document.querySelector('.js-place-order-button');
  if (placeOrderBtn && cart.length > 0) {
    placeOrderBtn.addEventListener('click', async () => {
      placeOrderBtn.disabled = true;
      placeOrderBtn.textContent = 'Processing...';

      const statusEl = document.querySelector('.js-payment-status');

      try {
        // Wait for Stripe to initialize from the config fetch
        const stripe = await window.stripePromise;
        if (!stripe) {
          throw new Error('Stripe has not been initialized. Please refresh the page.');
        }

        // Build line items for Stripe Checkout - supports multiple items
        const lineItems = cart.map((cartItem) => {
          const product = getProduct(cartItem.productId);
          return {
            id: cartItem.productId,
            name: product.name,
            image: product.image,
            image1: product.image1,
            quantity: cartItem.quantity,
            priceCents: product.priceCents
          };
        });

        // Create a Stripe Checkout Session on the server
        // This supports purchasing multiple pictures in a single transaction
        const response = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            lineItems: lineItems,
            totalAmountCents: totalCents
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to create checkout session');
        }

        const session = await response.json();

        // Clear the cart after successful session creation
        // (Cart will be restored if payment fails via session storage backup)
        const cartBackup = JSON.stringify(cart);
        localStorage.setItem('cart_backup', cartBackup);

        // Redirect to Stripe Checkout - handles payment for ALL items in the cart
        const result = await stripe.redirectToCheckout({
          sessionId: session.id
        });

        if (result.error) {
          // Restore cart if redirect failed
          localStorage.setItem('cart', cartBackup);
          throw new Error(result.error.message);
        }
      } catch (error) {
        console.error('Payment Error:', error);
        statusEl.innerHTML = `
          <p style="color: red; font-size: 14px;">
            ${error.message || 'There was an error processing your payment. Please try again.'}
          </p>
        `;
        placeOrderBtn.disabled = false;
        placeOrderBtn.textContent = 'Place your order';
      }
    });
  }
}

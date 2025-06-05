import { cart } from '../../data/cart.js';
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
    shippingPriceCents += deliveryOption.priceCents
  });

  const totalBeforeTaxCents = productPriceCents + shippingPriceCents;

  const totalCents = totalBeforeTaxCents;

  const paymentSummaryHTML = `
    <div class="payment-summary-title">
      Order Summary
    </div>

    <div class="payment-summary-row">
      <div>Items:</div>
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

    <button class="place-order-button button-primary js-place-order-button">
      Place your order
    </button>
  `;

  document.querySelector('.js-payment-summary')
    .innerHTML = paymentSummaryHTML;
    
  // Add event listener to the place order button
  document.querySelector('.js-place-order-button')
    .addEventListener('click', () => {
      // Check if stripe is available (it should be defined in the HTML)
      if (typeof stripe === 'undefined') {
        console.error('Stripe has not been initialized');
        alert('Payment system is not available. Please try again later.');
        return;
      }
      
      // Create a session object with order details
      const orderData = {
        items: cart.map(item => {
          const product = getProduct(item.productId);
          return {
            id: item.productId,
            name: product.name,
            quantity: item.quantity,
            price: product.priceCents
          };
        }),
        totalAmount: totalCents
      };
      
      // In a real implementation, you would make an API call to your server to create a Stripe checkout session
      // For example:
      // fetch('/create-checkout-session', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(orderData),
      // })
      // .then(response => response.json())
      // .then(session => {
      //   return stripe.redirectToCheckout({ sessionId: session.id });
      // })
      // .catch(error => {
      //   console.error('Error:', error);
      //   alert('There was an error processing your payment. Please try again.');
      // });
      
      // For demonstration purposes, we'll simulate the redirect
      alert('Redirecting to Stripe payment page...');
      console.log('Order data that would be sent to Stripe:', orderData);
      
      // In a real implementation, this would be replaced with the actual Stripe redirect
      // stripe.redirectToCheckout({ sessionId: 'cs_test_...' });
    });
}
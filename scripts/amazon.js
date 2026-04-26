import { cart, addToCart, getCartTotalQuantity } from '../data/cart.js';
import { products } from '../data/products.js';
import { formatCurrency } from './utils/money.js';


let productsHTML = '';

products.forEach((product) => {
  productsHTML += `
    <div class="product-container">
      <div class="product-image-container">
        <img class="product-image" src="${product.image}">
        <div style="cursor: pointer; display: flex; font-family: copperplate; margin-top: 170px; margin-left: -222px; width: 20px; height: 10px;" title="Copyright 2025 Alcaide">C</div>
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

      <div class="product-spacer"></div>

      <div class="added-to-cart js-added-to-cart-${product.id}" style="display: none;">
        <img src="images/icons/checkmark.png">
        Added
      </div>

      <button class="add-to-cart-button button-primary js-add-to-cart"
        data-product-id="${product.id}">
        Add to Cart
      </button>
    </div>
  `;
});

document.querySelector('.js-products-grid').innerHTML = productsHTML;

function updateCartQuantity() {
  const cartQuantity = getCartTotalQuantity();
  document.querySelector('.js-cart-quantity').innerHTML = cartQuantity;
}

// Initialize cart quantity on page load
updateCartQuantity();

document.querySelectorAll('.js-add-to-cart').forEach((button) => {
  button.addEventListener('click', () => {
    const productId = button.dataset.productId;
    addToCart(productId);
    updateCartQuantity();

    // Show "Added" confirmation briefly
    const addedMessage = document.querySelector(`.js-added-to-cart-${productId}`);
    if (addedMessage) {
      addedMessage.style.display = '';
      setTimeout(() => {
        addedMessage.style.display = 'none';
      }, 2000);
    }
  });
});

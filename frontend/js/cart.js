/**
 * ShopEasy Shopping Cart Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  await loadCart();
});

async function loadCart() {
  const container = document.getElementById('cart-container');
  if (!container) return;

  container.innerHTML = `
    <div class="spinner-container">
      <div class="spinner"></div>
      <p>Loading your shopping cart...</p>
    </div>
  `;

  try {
    const res = await api.cart.get();
    const cart = res.data.cart;

    if (!cart.items || cart.items.length === 0) {
      renderEmptyCart();
      return;
    }

    renderCartView(cart);
  } catch (err) {
    if (err.status === 401) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🔒</div>
          <h2 class="empty-title">Authentication Required</h2>
          <p class="empty-text">Please log in to view and manage your shopping cart.</p>
          <a href="/login.html?redirect=/cart.html" class="btn btn-primary">Log In</a>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">⚠️</div>
          <h2 class="empty-title">Error Loading Cart</h2>
          <p class="empty-text">${escapeHtml(err.message)}</p>
          <button class="btn btn-primary" onclick="loadCart()">Retry</button>
        </div>
      `;
    }
  }
}

function renderEmptyCart() {
  const container = document.getElementById('cart-container');
  container.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">🛒</div>
      <h2 class="empty-title">Your shopping cart is empty</h2>
      <p class="empty-text">Looks like you haven't added anything to your cart yet. Explore our featured products and find great deals!</p>
      <a href="/index.html" class="btn btn-primary">Start Shopping</a>
    </div>
  `;
}

function renderCartView(cart) {
  const container = document.getElementById('cart-container');
  const threshold = cart.freeShippingThreshold || 200000;
  const progressPercent = Math.min(100, Math.round((cart.subtotal / threshold) * 100));
  const remainingForFree = Math.max(0, threshold - cart.subtotal);

  const fallbackSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="90" height="90" viewBox="0 0 90 90"><rect width="90" height="90" fill="%23f1f5f9"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="10" fill="%2394a3b8">Image</text></svg>`;

  container.innerHTML = `
    <div class="cart-layout">
      <!-- Items Section -->
      <div class="cart-items-card">
        <div class="cart-header-row">
          <div class="cart-header-title">Shopping Items (${cart.totalItems})</div>
          <button class="btn btn-secondary btn-sm" onclick="handleClearCart()">Empty Cart</button>
        </div>

        <div class="cart-list">
          ${cart.items
            .map(
              (item) => `
            <div class="cart-item" id="cart-item-${item.product._id}">
              <img 
                src="${escapeHtml(item.product.imageUrl)}" 
                alt="${escapeHtml(item.product.name)}" 
                class="cart-item-image"
                onerror="this.onerror=null; this.src='${fallbackSvg}'"
              />
              <div class="cart-item-details">
                <span class="cart-item-category">${escapeHtml(item.product.category || '')}</span>
                <a href="/product.html?id=${item.product._id}" class="cart-item-name">${escapeHtml(item.product.name)}</a>
                <span class="cart-item-unit-price">${formatCurrency(item.product.price)} each</span>
              </div>
              
              <div class="qty-controls">
                <button class="qty-btn" onclick="updateItemQuantity('${item.product._id}', ${item.quantity - 1})">-</button>
                <input type="text" class="qty-input" value="${item.quantity}" readonly />
                <button class="qty-btn" onclick="updateItemQuantity('${item.product._id}', ${item.quantity + 1})" ${item.quantity >= item.product.stockQuantity ? 'disabled' : ''}>+</button>
              </div>

              <div class="cart-item-total">
                <span class="cart-item-subtotal">${formatCurrency(item.subtotal)}</span>
                <button class="cart-item-remove" onclick="removeItem('${item.product._id}')">
                  <span>🗑️</span> Remove
                </button>
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      </div>

      <!-- Order Summary Card -->
      <div class="cart-summary-card">
        <h3 class="summary-title">Order Summary</h3>

        <div class="free-shipping-progress-box">
          <div class="free-shipping-text">
            ${
              cart.isFreeShippingEligible
                ? '🎉 Congratulations! You have unlocked Free Shipping!'
                : `Add <strong>${formatCurrency(remainingForFree)}</strong> more to unlock <strong>Free Delivery</strong>!`
            }
          </div>
          <div class="progress-bar-track">
            <div class="progress-bar-fill" style="width: ${progressPercent}%;"></div>
          </div>
        </div>

        <div class="summary-row">
          <span>Items Subtotal (${cart.totalItems})</span>
          <span>${formatCurrency(cart.subtotal)}</span>
        </div>

        <div class="summary-row">
          <span>Standard Delivery</span>
          <span>${cart.shippingFee === 0 ? '<span style="color:var(--success);font-weight:700;">FREE</span>' : formatCurrency(cart.shippingFee)}</span>
        </div>

        <div class="summary-row total-row">
          <span>Estimated Total</span>
          <span style="color: var(--primary);">${formatCurrency(cart.total)}</span>
        </div>

        <div style="margin-top: 24px; display: flex; flex-direction: column; gap: 12px;">
          <a href="/checkout.html" class="btn btn-primary btn-lg" style="width: 100%;">
            Proceed to Checkout &rarr;
          </a>
          <a href="/index.html" class="btn btn-secondary" style="width: 100%; text-align: center;">
            Continue Shopping
          </a>
        </div>
      </div>
    </div>
  `;
}

async function updateItemQuantity(productId, newQty) {
  try {
    const res = await api.cart.updateQty(productId, newQty);
    showToast(newQty <= 0 ? 'Item removed from cart' : 'Cart updated', 'info');
    await updateCartBadge();
    if (!res.data.cart.items || res.data.cart.items.length === 0) {
      renderEmptyCart();
    } else {
      renderCartView(res.data.cart);
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function removeItem(productId) {
  try {
    const res = await api.cart.removeItem(productId);
    showToast('Item removed from cart', 'info');
    await updateCartBadge();
    if (!res.data.cart.items || res.data.cart.items.length === 0) {
      renderEmptyCart();
    } else {
      renderCartView(res.data.cart);
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function handleClearCart() {
  if (!confirm('Are you sure you want to empty your entire cart?')) return;

  try {
    await api.cart.clear();
    showToast('Cart cleared', 'info');
    await updateCartBadge();
    renderEmptyCart();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

/**
 * ShopEasy Checkout Controller
 */

let currentCartData = null;

document.addEventListener('DOMContentLoaded', async () => {
  await initCheckout();
});

async function initCheckout() {
  const container = document.getElementById('checkout-container');
  if (!container) return;

  // 1. Verify user authentication
  try {
    const authRes = await api.auth.getMe();
    const user = authRes.data.user;

    // Pre-fill user details if available
    prefillUserData(user);
  } catch (err) {
    window.location.href = `/login.html?redirect=/checkout.html`;
    return;
  }

  // 2. Fetch and validate cart
  try {
    const cartRes = await api.cart.get();
    currentCartData = cartRes.data.cart;

    if (!currentCartData.items || currentCartData.items.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="padding: 60px 20px;">
          <div class="empty-icon">🛒</div>
          <h2 class="empty-title">Your cart is empty</h2>
          <p class="empty-text">Please add items to your shopping cart before proceeding to checkout.</p>
          <a href="/index.html" class="btn btn-primary">Start Shopping</a>
        </div>
      `;
      return;
    }

    renderCheckoutSummary(currentCartData);
    bindCheckoutForm();
  } catch (err) {
    showToast('Failed to load checkout details: ' + err.message, 'error');
  }
}

function prefillUserData(user) {
  const nameInput = document.getElementById('ship-name');
  const phoneInput = document.getElementById('ship-phone');
  const streetInput = document.getElementById('ship-street');
  const cityInput = document.getElementById('ship-city');
  const stateInput = document.getElementById('ship-state');
  const zipInput = document.getElementById('ship-zip');

  if (nameInput) nameInput.value = user.name || '';
  if (phoneInput && user.phone) phoneInput.value = user.phone;

  if (user.shippingAddress) {
    if (streetInput && user.shippingAddress.street) streetInput.value = user.shippingAddress.street;
    if (cityInput && user.shippingAddress.city) cityInput.value = user.shippingAddress.city;
    if (stateInput && user.shippingAddress.state) stateInput.value = user.shippingAddress.state;
    if (zipInput && user.shippingAddress.postalCode) zipInput.value = user.shippingAddress.postalCode;
  }
}

function renderCheckoutSummary(cart) {
  const itemsContainer = document.getElementById('checkout-items-list');
  const subtotalEl = document.getElementById('checkout-subtotal');
  const shippingEl = document.getElementById('checkout-shipping');
  const totalEl = document.getElementById('checkout-total');

  if (itemsContainer) {
    itemsContainer.innerHTML = cart.items
      .map(
        (item) => `
        <div class="checkout-item-row">
          <div class="checkout-item-title">
            <strong>${escapeHtml(item.product.name)}</strong>
            <span style="color: var(--text-muted); font-size: 0.8rem;"> &times; ${item.quantity}</span>
          </div>
          <div style="font-weight: 600;">${formatCurrency(item.subtotal)}</div>
        </div>
      `
      )
      .join('');
  }

  if (subtotalEl) subtotalEl.textContent = formatCurrency(cart.subtotal);
  if (shippingEl) {
    shippingEl.innerHTML = cart.shippingFee === 0 ? '<span style="color:var(--success);font-weight:700;">FREE</span>' : formatCurrency(cart.shippingFee);
  }
  if (totalEl) totalEl.textContent = formatCurrency(cart.total);
}

function bindCheckoutForm() {
  const form = document.getElementById('checkout-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fullName = document.getElementById('ship-name').value.trim();
    const phone = document.getElementById('ship-phone').value.trim();
    const street = document.getElementById('ship-street').value.trim();
    const city = document.getElementById('ship-city').value.trim();
    const state = document.getElementById('ship-state').value.trim();
    const postalCode = document.getElementById('ship-zip').value.trim();
    const submitBtn = document.getElementById('place-order-btn');

    if (!fullName || !phone || !street || !city || !state || !postalCode) {
      showToast('Please fill out all required shipping fields.', 'warning');
      return;
    }

    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Securing Your Order...';

    try {
      const res = await api.orders.create({
        shippingAddress: {
          fullName,
          phone,
          street,
          city,
          state,
          postalCode,
          country: 'India'
        },
        paymentMethod: 'cash_on_delivery'
      });

      showToast('Order placed successfully!', 'success');
      await updateCartBadge();

      const order = res.data.order;
      setTimeout(() => {
        window.location.href = `/order-details.html?id=${order._id}&confirmed=true`;
      }, 700);
    } catch (err) {
      showToast(err.message, 'error');
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
}

/**
 * ShopEasy Product Details Page Controller
 */

let currentProduct = null;
let selectedQuantity = 1;

document.addEventListener('DOMContentLoaded', () => {
  const productId = getQueryParam('id');
  if (!productId) {
    renderNotFound('No product selected. Please choose a product from our catalog.');
    return;
  }
  loadProductDetails(productId);
});

async function loadProductDetails(productId) {
  const container = document.getElementById('product-details-container');
  if (!container) return;

  try {
    const res = await api.products.getById(productId);
    currentProduct = res.data.product;
    renderDetails(currentProduct);
  } catch (err) {
    renderNotFound(err.message || 'Product could not be found or has been deactivated.');
  }
}

function renderDetails(product) {
  const container = document.getElementById('product-details-container');
  const isOutOfStock = product.stockQuantity <= 0;
  selectedQuantity = 1;

  document.title = `${product.name} — ShopEasy`;

  const fallbackSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="500" viewBox="0 0 600 500"><rect width="600" height="500" fill="%23f1f5f9"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="20" fill="%2394a3b8">Image Unavailable</text></svg>`;

  container.innerHTML = `
    <div style="display: flex; gap: 8px; margin-bottom: 24px; font-size: 0.9rem; color: var(--text-muted);">
      <a href="/index.html">Home</a> <span>/</span>
      <a href="/index.html?category=${encodeURIComponent(product.category)}">${escapeHtml(product.category)}</a> <span>/</span>
      <span style="color: var(--text-main); font-weight: 500;">${escapeHtml(product.name)}</span>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 48px; background: white; padding: 36px; border-radius: var(--radius-lg); border: 1px solid var(--border-light); box-shadow: var(--shadow-sm);" id="details-card">
      <!-- Product Image -->
      <div style="border-radius: var(--radius-md); overflow: hidden; background: var(--bg-hover); max-height: 480px; display: flex; align-items: center; justify-content: center;">
        <img 
          src="${escapeHtml(product.imageUrl)}" 
          alt="${escapeHtml(product.name)}" 
          style="width: 100%; height: 100%; object-fit: cover;"
          onerror="this.onerror=null; this.src='${fallbackSvg}'"
        />
      </div>

      <!-- Product Info -->
      <div style="display: flex; flex-direction: column;">
        <span style="font-size: 0.85rem; font-weight: 700; color: var(--primary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
          ${escapeHtml(product.category)}
        </span>
        <h1 style="font-size: 2rem; font-weight: 800; color: var(--text-main); line-height: 1.25; margin-bottom: 16px;">
          ${escapeHtml(product.name)}
        </h1>
        
        <div style="font-size: 1.85rem; font-weight: 800; color: var(--text-main); margin-bottom: 20px;">
          ${formatCurrency(product.price)}
          <span style="font-size: 0.85rem; font-weight: 400; color: var(--text-muted); margin-left: 8px;">(Inclusive of all taxes)</span>
        </div>

        <div style="margin-bottom: 24px;">
          <span class="stock-tag ${isOutOfStock ? 'out-stock' : product.stockQuantity <= 5 ? 'low-stock' : 'in-stock'}" style="font-size: 0.85rem; padding: 4px 10px;">
            ${isOutOfStock ? 'Currently Out of Stock' : `In Stock: ${product.stockQuantity} units available`}
          </span>
        </div>

        <div style="border-top: 1px solid var(--border-light); border-bottom: 1px solid var(--border-light); padding: 20px 0; margin-bottom: 24px;">
          <h4 style="font-size: 0.95rem; font-weight: 600; margin-bottom: 8px;">About This Product</h4>
          <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.6;">
            ${escapeHtml(product.description)}
          </p>
        </div>

        <!-- Quantity & Add to Cart Action -->
        <div style="display: flex; flex-direction: column; gap: 16px; margin-top: auto;">
          <div style="display: flex; align-items: center; gap: 16px;">
            <label style="font-size: 0.95rem; font-weight: 600;">Quantity:</label>
            <div class="qty-controls" style="border: 1px solid var(--border-light); border-radius: var(--radius-md);">
              <button class="qty-btn" onclick="adjustDetailsQty(-1)" ${isOutOfStock ? 'disabled' : ''}>-</button>
              <input type="number" id="details-qty-input" class="qty-input" value="1" min="1" max="${product.stockQuantity}" readonly />
              <button class="qty-btn" onclick="adjustDetailsQty(1)" ${isOutOfStock ? 'disabled' : ''}>+</button>
            </div>
          </div>

          <div style="display: flex; gap: 16px;">
            <button 
              id="details-add-cart-btn" 
              class="btn btn-primary btn-lg" 
              style="flex: 1;" 
              onclick="submitDetailsAddToCart()"
              ${isOutOfStock ? 'disabled' : ''}
            >
              ${isOutOfStock ? 'Item Out of Stock' : 'Add to Shopping Cart'}
            </button>
            <a href="/cart.html" class="btn btn-secondary btn-lg">View Cart</a>
          </div>
        </div>

        <!-- Delivery & Assurance Perks -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 28px; padding-top: 20px; border-top: 1px solid var(--border-light); font-size: 0.85rem; color: var(--text-muted);">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span>🚚</span> Free shipping on orders over ₹2,000
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span>🛡️</span> Genuine Product Assurance
          </div>
        </div>
      </div>
    </div>
  `;
}

function adjustDetailsQty(change) {
  if (!currentProduct) return;
  const input = document.getElementById('details-qty-input');
  if (!input) return;

  let newQty = selectedQuantity + change;
  if (newQty < 1) newQty = 1;
  if (newQty > currentProduct.stockQuantity) {
    showToast(`Maximum available stock is ${currentProduct.stockQuantity}`, 'warning');
    newQty = currentProduct.stockQuantity;
  }

  selectedQuantity = newQty;
  input.value = newQty;
}

async function submitDetailsAddToCart() {
  if (!currentUser) {
    showToast('Please log in to add items to your cart.', 'info');
    setTimeout(() => {
      window.location.href = `/login.html?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
    }, 1200);
    return;
  }

  const btn = document.getElementById('details-add-cart-btn');
  const originalText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = 'Adding to Cart...';

  try {
    const res = await api.cart.addItem(currentProduct._id, selectedQuantity);
    showToast(`Added ${selectedQuantity}x "${currentProduct.name}" to cart!`, 'success');
    await updateCartBadge();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalText;
  }
}

function renderNotFound(message) {
  const container = document.getElementById('product-details-container');
  if (!container) return;
  container.innerHTML = `
    <div class="empty-state" style="padding: 80px 20px;">
      <div class="empty-icon">📦</div>
      <h2 class="empty-title">Product Not Found</h2>
      <p class="empty-text">${escapeHtml(message)}</p>
      <a href="/index.html" class="btn btn-primary">Return to Catalog</a>
    </div>
  `;
}

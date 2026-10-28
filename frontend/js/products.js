/**
 * ShopEasy Homepage Product Catalog & Filtering Logic
 */

let currentCategory = 'all';
let currentSearch = '';
let currentSort = 'newest';

document.addEventListener('DOMContentLoaded', () => {
  // Read query params if arriving from search
  const urlSearch = getQueryParam('search');
  if (urlSearch) {
    currentSearch = urlSearch;
    const searchInput = document.getElementById('global-search-input');
    if (searchInput) searchInput.value = urlSearch;
  }

  const urlCategory = getQueryParam('category');
  if (urlCategory) {
    currentCategory = urlCategory;
  }

  initCategories();
  initSorting();
  loadProducts();
});

/**
 * Fetch available categories and render interactive chips
 */
async function initCategories() {
  const container = document.getElementById('category-chips');
  if (!container) return;

  try {
    const res = await api.products.getCategories();
    const categories = ['All', ...res.data.categories];

    container.innerHTML = categories
      .map(
        (cat) => `
        <button 
          class="category-chip ${cat.toLowerCase() === currentCategory.toLowerCase() ? 'active' : ''}" 
          onclick="handleCategoryChange('${escapeHtml(cat)}')"
        >
          ${escapeHtml(cat)}
        </button>
      `
      )
      .join('');
  } catch (err) {
    console.error('Failed to load categories:', err);
  }
}

function initSorting() {
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      loadProducts();
    });
  }
}

function handleCategoryChange(category) {
  currentCategory = category.toLowerCase() === 'all' ? 'all' : category;

  // Update active chip classes
  const chips = document.querySelectorAll('.category-chip');
  chips.forEach((chip) => {
    if (chip.textContent.trim().toLowerCase() === category.toLowerCase()) {
      chip.classList.add('active');
    } else {
      chip.classList.remove('active');
    }
  });

  loadProducts();
}

function handleSearchFilter(query) {
  currentSearch = query;
  loadProducts();
}

/**
 * Fetch products from backend Express API and render cards
 */
async function loadProducts() {
  const grid = document.getElementById('product-grid');
  if (!grid) return;

  grid.innerHTML = `
    <div class="spinner-container" style="grid-column: 1 / -1;">
      <div class="spinner"></div>
      <p>Loading fresh products from database...</p>
    </div>
  `;

  try {
    const params = {
      sort: currentSort,
      limit: 24
    };

    if (currentCategory && currentCategory !== 'all') {
      params.category = currentCategory;
    }
    if (currentSearch) {
      params.search = currentSearch;
    }

    const res = await api.products.getAll(params);
    const products = res.data.products;

    if (!products || products.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-icon">🔍</div>
          <h3 class="empty-title">No products found</h3>
          <p class="empty-text">We couldn't find any products matching your filters. Try adjusting your search or category.</p>
          <button class="btn btn-outline" onclick="resetFilters()">View All Products</button>
        </div>
      `;
      return;
    }

    grid.innerHTML = products.map((prod) => renderProductCard(prod)).join('');
  } catch (err) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1; border-color: var(--danger);">
        <div class="empty-icon">⚠️</div>
        <h3 class="empty-title">Unable to load products</h3>
        <p class="empty-text">${escapeHtml(err.message)}</p>
        <button class="btn btn-primary" onclick="loadProducts()">Try Again</button>
      </div>
    `;
  }
}

/**
 * Generate HTML string for single product card
 */
function renderProductCard(product) {
  const isOutOfStock = product.stockQuantity <= 0;
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 5;

  let stockBadge = `<span class="stock-tag in-stock">In Stock (${product.stockQuantity})</span>`;
  if (isOutOfStock) {
    stockBadge = `<span class="stock-tag out-stock">Out of Stock</span>`;
  } else if (isLowStock) {
    stockBadge = `<span class="stock-tag low-stock">Only ${product.stockQuantity} left</span>`;
  }

  const fallbackSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="225" viewBox="0 0 300 225"><rect width="300" height="225" fill="%23f1f5f9"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%2394a3b8">Product Image</text></svg>`;

  return `
    <article class="product-card" id="product-${product._id}">
      <div class="product-image-wrap">
        <a href="/product.html?id=${product._id}">
          <img 
            src="${escapeHtml(product.imageUrl)}" 
            alt="${escapeHtml(product.name)}" 
            loading="lazy"
            onerror="this.onerror=null; this.src='${fallbackSvg}'"
          />
        </a>
        <span class="product-badge">${escapeHtml(product.category)}</span>
      </div>
      <div class="product-content">
        <div style="margin-bottom: 6px;">
          ${stockBadge}
        </div>
        <h3 class="product-title">
          <a href="/product.html?id=${product._id}">${escapeHtml(product.name)}</a>
        </h3>
        <p class="product-desc">${escapeHtml(product.description)}</p>
        
        <div class="product-footer">
          <div>
            <span class="product-price">${formatCurrency(product.price)}</span>
          </div>
          <button 
            class="btn btn-primary btn-sm" 
            onclick="handleAddToCart('${product._id}', this)"
            ${isOutOfStock ? 'disabled' : ''}
          >
            ${isOutOfStock ? 'Sold Out' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </article>
  `;
}

/**
 * Handle Add-to-Cart from homepage card
 */
async function handleAddToCart(productId, btnElement) {
  if (!currentUser) {
    showToast('Please log in to add items to your shopping cart.', 'info');
    setTimeout(() => {
      window.location.href = `/login.html?redirect=${encodeURIComponent(window.location.pathname)}`;
    }, 1200);
    return;
  }

  const originalContent = btnElement.innerHTML;
  btnElement.disabled = true;
  btnElement.innerHTML = `<span>⏳</span> Adding...`;

  try {
    const res = await api.cart.addItem(productId, 1);
    showToast(res.message || 'Item added to cart!', 'success');
    await updateCartBadge();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btnElement.disabled = false;
    btnElement.innerHTML = originalContent;
  }
}

function resetFilters() {
  currentCategory = 'all';
  currentSearch = '';
  currentSort = 'newest';
  const searchInput = document.getElementById('global-search-input');
  if (searchInput) searchInput.value = '';
  initCategories();
  loadProducts();
}

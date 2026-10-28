/**
 * ShopEasy Administrator Dashboard Controller
 */

let activeTab = 'products';

document.addEventListener('DOMContentLoaded', async () => {
  await verifyAdminAccess();
});

async function verifyAdminAccess() {
  const container = document.getElementById('admin-container');
  if (!container) return;

  try {
    const res = await api.auth.getMe();
    const user = res.data.user;

    if (user.role !== 'admin') {
      renderForbidden();
      return;
    }

    initAdminDashboard();
  } catch (err) {
    window.location.href = '/login.html?redirect=/admin.html';
  }
}

function renderForbidden() {
  const container = document.getElementById('admin-container');
  container.innerHTML = `
    <div class="empty-state" style="padding: 80px 20px;">
      <div class="empty-icon">🛡️</div>
      <h2 class="empty-title">Access Restricted</h2>
      <p class="empty-text">This section requires verified Administrator privileges. Your account does not have sufficient authorization.</p>
      <a href="/index.html" class="btn btn-primary">Return to ShopEasy</a>
    </div>
  `;
}

function initAdminDashboard() {
  loadAdminProducts();
  bindCreateProductForm();
}

function switchAdminTab(tab) {
  activeTab = tab;
  document.getElementById('tab-btn-products').classList.toggle('active', tab === 'products');
  document.getElementById('tab-btn-orders').classList.toggle('active', tab === 'orders');
  document.getElementById('admin-section-products').style.display = tab === 'products' ? 'block' : 'none';
  document.getElementById('admin-section-orders').style.display = tab === 'orders' ? 'block' : 'none';

  if (tab === 'orders') {
    loadAdminOrders();
  } else {
    loadAdminProducts();
  }
}

/**
 * Products Section
 */
async function loadAdminProducts() {
  const tableBody = document.getElementById('admin-products-tbody');
  if (!tableBody) return;

  tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:24px;">Loading products...</td></tr>`;

  try {
    const res = await api.products.getAll({ limit: 50 });
    const products = res.data.products;

    if (!products || products.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:24px;">No products found. Add your first product below!</td></tr>`;
      return;
    }

    tableBody.innerHTML = products
      .map(
        (p) => `
        <tr style="border-bottom: 1px solid var(--border-light);">
          <td style="padding: 12px 16px;">
            <strong>${escapeHtml(p.name)}</strong>
          </td>
          <td style="padding: 12px 16px;">${escapeHtml(p.category)}</td>
          <td style="padding: 12px 16px;">${formatCurrency(p.price)}</td>
          <td style="padding: 12px 16px;">
            <input 
              type="number" 
              min="0" 
              value="${p.stockQuantity}" 
              style="width: 70px; padding: 4px 8px; border: 1px solid var(--border-light); border-radius: var(--radius-sm);" 
              onchange="handleUpdateStock('${p._id}', this.value)"
            />
          </td>
          <td style="padding: 12px 16px;">
            <span class="stock-tag ${p.isActive ? 'in-stock' : 'out-stock'}">
              ${p.isActive ? 'Active' : 'Inactive'}
            </span>
          </td>
          <td style="padding: 12px 16px; text-align: right;">
            <button class="btn btn-danger btn-sm" onclick="handleDeactivateProduct('${p._id}')" ${!p.isActive ? 'disabled' : ''}>
              ${p.isActive ? 'Deactivate' : 'Deactivated'}
            </button>
          </td>
        </tr>
      `
      )
      .join('');
  } catch (err) {
    tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--danger);padding:24px;">${escapeHtml(err.message)}</td></tr>`;
  }
}

async function handleUpdateStock(productId, newStock) {
  try {
    await api.admin.updateProduct(productId, { stockQuantity: parseInt(newStock, 10) });
    showToast('Stock quantity updated!', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function handleDeactivateProduct(productId) {
  if (!confirm('Are you sure you want to deactivate this product?')) return;

  try {
    await api.admin.deleteProduct(productId);
    showToast('Product deactivated', 'info');
    loadAdminProducts();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function bindCreateProductForm() {
  const form = document.getElementById('admin-create-product-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('new-prod-name').value.trim();
    const category = document.getElementById('new-prod-category').value.trim();
    const priceRupees = parseFloat(document.getElementById('new-prod-price').value);
    const stockQuantity = parseInt(document.getElementById('new-prod-stock').value, 10);
    const imageUrl = document.getElementById('new-prod-image').value.trim();
    const description = document.getElementById('new-prod-desc').value.trim();
    const submitBtn = document.getElementById('new-prod-submit-btn');

    if (!name || !category || isNaN(priceRupees) || isNaN(stockQuantity) || !imageUrl || !description) {
      showToast('Please fill out all product details.', 'warning');
      return;
    }

    const priceInPaise = Math.round(priceRupees * 100);

    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Publishing Product...';

    try {
      await api.admin.createProduct({
        name,
        category,
        price: priceInPaise,
        stockQuantity,
        imageUrl,
        description
      });

      showToast(`Product "${name}" published successfully!`, 'success');
      form.reset();
      loadAdminProducts();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Add Product to Catalog';
    }
  });
}

/**
 * Orders Section
 */
async function loadAdminOrders() {
  const tableBody = document.getElementById('admin-orders-tbody');
  if (!tableBody) return;

  tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:24px;">Loading orders...</td></tr>`;

  try {
    const res = await api.admin.getOrders();
    const orders = res.data.orders;

    if (!orders || orders.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:24px;">No customer orders found yet.</td></tr>`;
      return;
    }

    tableBody.innerHTML = orders
      .map(
        (o) => `
        <tr style="border-bottom: 1px solid var(--border-light);">
          <td style="padding: 12px 16px;">
            <a href="/order-details.html?id=${o._id}" style="color:var(--primary);font-weight:700;">${escapeHtml(o.orderNumber)}</a>
          </td>
          <td style="padding: 12px 16px;">
            <strong>${escapeHtml(o.shippingAddress.fullName)}</strong><br />
            <small style="color:var(--text-muted);">${escapeHtml(o.shippingAddress.phone)}</small>
          </td>
          <td style="padding: 12px 16px;">${formatDate(o.createdAt)}</td>
          <td style="padding: 12px 16px; font-weight: 700;">${formatCurrency(o.total)}</td>
          <td style="padding: 12px 16px;">
            <select 
              style="padding: 6px 10px; border: 1px solid var(--border-light); border-radius: var(--radius-sm); font-size: 0.85rem;"
              onchange="handleUpdateOrderStatus('${o._id}', this.value)"
            >
              <option value="placed" ${o.orderStatus === 'placed' ? 'selected' : ''}>Placed</option>
              <option value="processing" ${o.orderStatus === 'processing' ? 'selected' : ''}>Processing</option>
              <option value="shipped" ${o.orderStatus === 'shipped' ? 'selected' : ''}>Shipped</option>
              <option value="delivered" ${o.orderStatus === 'delivered' ? 'selected' : ''}>Delivered</option>
              <option value="cancelled" ${o.orderStatus === 'cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
          </td>
          <td style="padding: 12px 16px; text-align: right;">
            <a href="/order-details.html?id=${o._id}" class="btn btn-secondary btn-sm">Inspect</a>
          </td>
        </tr>
      `
      )
      .join('');
  } catch (err) {
    tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--danger);padding:24px;">${escapeHtml(err.message)}</td></tr>`;
  }
}

async function handleUpdateOrderStatus(orderId, newStatus) {
  try {
    await api.admin.updateOrderStatus(orderId, newStatus);
    showToast(`Order status updated to "${newStatus}"`, 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

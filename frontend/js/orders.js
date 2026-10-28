/**
 * ShopEasy Order History Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  await loadOrders();
});

async function loadOrders() {
  const container = document.getElementById('orders-list-container');
  if (!container) return;

  container.innerHTML = `
    <div class="spinner-container">
      <div class="spinner"></div>
      <p>Retrieving your order history...</p>
    </div>
  `;

  try {
    const res = await api.orders.getMyOrders();
    const orders = res.data.orders;

    if (!orders || orders.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📦</div>
          <h2 class="empty-title">No orders placed yet</h2>
          <p class="empty-text">You haven't placed any orders with ShopEasy yet. Browse our catalog and enjoy seamless shopping!</p>
          <a href="/index.html" class="btn btn-primary">Start Shopping</a>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 20px;">
        ${orders.map((order) => renderOrderRow(order)).join('')}
      </div>
    `;
  } catch (err) {
    if (err.status === 401) {
      window.location.href = '/login.html?redirect=/orders.html';
    } else {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">⚠️</div>
          <h2 class="empty-title">Unable to retrieve orders</h2>
          <p class="empty-text">${escapeHtml(err.message)}</p>
          <button class="btn btn-primary" onclick="loadOrders()">Try Again</button>
        </div>
      `;
    }
  }
}

function renderOrderRow(order) {
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  let statusBadgeClass = 'in-stock';
  if (order.orderStatus === 'processing') statusBadgeClass = 'low-stock';
  if (order.orderStatus === 'cancelled') statusBadgeClass = 'out-stock';

  return `
    <div style="background: white; border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 24px; box-shadow: var(--shadow-sm); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px;">
      <div>
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 6px;">
          <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-main);">${escapeHtml(order.orderNumber)}</h3>
          <span class="stock-tag ${statusBadgeClass}" style="text-transform: uppercase;">${escapeHtml(order.orderStatus)}</span>
        </div>
        <div style="font-size: 0.85rem; color: var(--text-muted); display: flex; gap: 16px; flex-wrap: wrap;">
          <span>📅 Placed on: ${formatDate(order.createdAt)}</span>
          <span>🛍️ ${itemCount} Item${itemCount > 1 ? 's' : ''}</span>
          <span>💳 ${order.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' : 'Demonstration Checkout'}</span>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 24px;">
        <div style="text-align: right;">
          <div style="font-size: 0.8rem; color: var(--text-muted);">Total Amount</div>
          <div style="font-size: 1.35rem; font-weight: 800; color: var(--primary);">${formatCurrency(order.total)}</div>
        </div>
        <a href="/order-details.html?id=${order._id}" class="btn btn-secondary btn-sm">
          View Receipt &rarr;
        </a>
      </div>
    </div>
  `;
}

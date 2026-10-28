/**
 * ShopEasy Order Details / Receipt Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  const orderId = getQueryParam('id');
  const isConfirmed = getQueryParam('confirmed') === 'true';

  if (!orderId) {
    window.location.href = '/orders.html';
    return;
  }

  await loadOrderReceipt(orderId, isConfirmed);
});

async function loadOrderReceipt(orderId, isConfirmed) {
  const container = document.getElementById('order-receipt-container');
  if (!container) return;

  container.innerHTML = `
    <div class="spinner-container">
      <div class="spinner"></div>
      <p>Loading order details...</p>
    </div>
  `;

  try {
    const res = await api.orders.getById(orderId);
    const order = res.data.order;
    renderReceipt(order, isConfirmed);
  } catch (err) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⚠️</div>
        <h2 class="empty-title">Could not load order</h2>
        <p class="empty-text">${escapeHtml(err.message)}</p>
        <a href="/orders.html" class="btn btn-primary">Back to My Orders</a>
      </div>
    `;
  }
}

function renderReceipt(order, isConfirmed) {
  const container = document.getElementById('order-receipt-container');
  const fallbackSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"><rect width="60" height="60" fill="%23f1f5f9"/></svg>`;

  container.innerHTML = `
    ${
      isConfirmed
        ? `
      <div style="background: var(--success-bg); border: 1px solid #bbf7d0; border-radius: var(--radius-md); padding: 24px; margin-bottom: 30px; text-align: center;">
        <div style="font-size: 2.5rem; margin-bottom: 8px;">🎉</div>
        <h2 style="font-size: 1.6rem; font-weight: 800; color: #15803d; margin-bottom: 6px;">Thank You! Your Order has been Placed!</h2>
        <p style="color: #166534; font-size: 0.95rem;">Order confirmation has been recorded. Your package will be prepared for dispatch shortly.</p>
      </div>
    `
        : ''
    }

    <div style="background: white; border: 1px solid var(--border-light); border-radius: var(--radius-lg); padding: 36px; box-shadow: var(--shadow-sm);" id="printable-receipt">
      <!-- Receipt Header -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 24px; border-bottom: 1px solid var(--border-light); margin-bottom: 28px; flex-wrap: wrap; gap: 16px;">
        <div>
          <span style="font-size: 0.85rem; font-weight: 700; color: var(--primary); text-transform: uppercase;">Official Order Receipt</span>
          <h1 style="font-size: 1.8rem; font-weight: 800; margin-top: 4px; color: var(--text-main);">${escapeHtml(order.orderNumber)}</h1>
          <div style="color: var(--text-muted); font-size: 0.9rem; margin-top: 4px;">Placed on: ${formatDate(order.createdAt)}</div>
        </div>
        <div style="text-align: right;">
          <span class="stock-tag in-stock" style="font-size: 0.9rem; padding: 6px 14px; text-transform: uppercase;">Status: ${escapeHtml(order.orderStatus)}</span>
        </div>
      </div>

      <!-- Shipping and Payment Overview -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 32px; background: var(--bg-page); padding: 20px; border-radius: var(--radius-md); border: 1px solid var(--border-light);">
        <div>
          <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 8px; color: var(--text-main);">📍 Shipping Address</h4>
          <p style="font-size: 0.9rem; color: var(--text-muted); line-height: 1.6;">
            <strong>${escapeHtml(order.shippingAddress.fullName)}</strong><br />
            ${escapeHtml(order.shippingAddress.street)}<br />
            ${escapeHtml(order.shippingAddress.city)}, ${escapeHtml(order.shippingAddress.state)} — ${escapeHtml(order.shippingAddress.postalCode)}<br />
            Phone: ${escapeHtml(order.shippingAddress.phone)}
          </p>
        </div>
        <div>
          <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 8px; color: var(--text-main);">💳 Payment Information</h4>
          <p style="font-size: 0.9rem; color: var(--text-muted); line-height: 1.6;">
            Method: <strong>${order.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery (Demonstration)' : 'Demonstration Card'}</strong><br />
            Payment Status: <span style="text-transform: capitalize;">${escapeHtml(order.paymentStatus)}</span><br />
            Currency: INR (₹)
          </p>
        </div>
      </div>

      <!-- Itemized Table -->
      <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 16px;">Purchased Items</h3>
      <div style="border: 1px solid var(--border-light); border-radius: var(--radius-md); overflow: hidden; margin-bottom: 28px;">
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem;">
          <thead style="background: var(--bg-page); border-bottom: 1px solid var(--border-light); font-weight: 600; color: var(--text-muted);">
            <tr>
              <th style="padding: 12px 16px;">Item</th>
              <th style="padding: 12px 16px; text-align: right;">Unit Price</th>
              <th style="padding: 12px 16px; text-align: center;">Qty</th>
              <th style="padding: 12px 16px; text-align: right;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${order.items
              .map(
                (item) => `
              <tr style="border-bottom: 1px solid var(--border-light);">
                <td style="padding: 16px; display: flex; align-items: center; gap: 12px;">
                  <img src="${escapeHtml(item.imageUrl || '')}" alt="${escapeHtml(item.name)}" style="width: 48px; height: 48px; object-fit: cover; border-radius: var(--radius-sm);" onerror="this.src='${fallbackSvg}'" />
                  <span style="font-weight: 600;">${escapeHtml(item.name)}</span>
                </td>
                <td style="padding: 16px; text-align: right;">${formatCurrency(item.price)}</td>
                <td style="padding: 16px; text-align: center; font-weight: 600;">${item.quantity}</td>
                <td style="padding: 16px; text-align: right; font-weight: 700;">${formatCurrency(item.subtotal)}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>

      <!-- Financial Totals Breakdown -->
      <div style="display: flex; justify-content: flex-end; margin-bottom: 32px;">
        <div style="width: 100%; max-width: 340px;">
          <div class="summary-row">
            <span>Subtotal</span>
            <span>${formatCurrency(order.subtotal)}</span>
          </div>
          <div class="summary-row">
            <span>Shipping Fee</span>
            <span>${order.shippingFee === 0 ? '<span style="color:var(--success);font-weight:700;">FREE</span>' : formatCurrency(order.shippingFee)}</span>
          </div>
          <div class="summary-row total-row" style="margin-top: 10px;">
            <span>Grand Total</span>
            <span style="color: var(--primary);">${formatCurrency(order.total)}</span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-light); padding-top: 24px; flex-wrap: wrap; gap: 12px;">
        <a href="/orders.html" class="btn btn-secondary">&larr; Back to Order History</a>
        <button class="btn btn-outline" onclick="window.print()">🖨️ Print Receipt</button>
      </div>
    </div>
  `;
}

/**
 * ShopEasy User Profile Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  await loadProfile();
});

async function loadProfile() {
  const container = document.getElementById('profile-container');
  if (!container) return;

  try {
    const res = await api.auth.getMe();
    const user = res.data.user;
    renderProfile(user);
  } catch (err) {
    window.location.href = '/login.html?redirect=/profile.html';
  }
}

function renderProfile(user) {
  const container = document.getElementById('profile-container');
  const addr = user.shippingAddress || {};

  container.innerHTML = `
    <div style="background: white; border: 1px solid var(--border-light); border-radius: var(--radius-lg); padding: 36px; box-shadow: var(--shadow-sm); max-width: 680px; margin: 0 auto;">
      <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 28px; padding-bottom: 24px; border-bottom: 1px solid var(--border-light);">
        <div style="width: 72px; height: 72px; background: var(--primary-light); color: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 800;">
          ${escapeHtml(user.name.charAt(0).toUpperCase())}
        </div>
        <div>
          <h2 style="font-size: 1.5rem; font-weight: 700; color: var(--text-main);">${escapeHtml(user.name)}</h2>
          <div style="color: var(--text-muted); font-size: 0.95rem;">${escapeHtml(user.email)}</div>
          <span class="stock-tag in-stock" style="margin-top: 6px; text-transform: uppercase;">Role: ${escapeHtml(user.role)}</span>
        </div>
      </div>

      <div style="margin-bottom: 28px;">
        <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 14px;">Contact & Default Address</h3>
        <div style="background: var(--bg-page); padding: 18px; border-radius: var(--radius-md); border: 1px solid var(--border-light); line-height: 1.6; font-size: 0.95rem; color: var(--text-muted);">
          <p><strong>Phone:</strong> ${escapeHtml(user.phone || 'Not provided')}</p>
          <p><strong>Street:</strong> ${escapeHtml(addr.street || 'Not provided')}</p>
          <p><strong>City / State:</strong> ${escapeHtml(addr.city ? `${addr.city}, ${addr.state}` : 'Not provided')}</p>
          <p><strong>Postal Code:</strong> ${escapeHtml(addr.postalCode || 'Not provided')}</p>
          <p><strong>Country:</strong> ${escapeHtml(addr.country || 'India')}</p>
        </div>
      </div>

      <div style="display: flex; gap: 16px; flex-wrap: wrap;">
        <a href="/orders.html" class="btn btn-primary">📦 View My Orders</a>
        ${user.role === 'admin' ? '<a href="/admin.html" class="btn btn-outline">🛡️ Admin Dashboard</a>' : ''}
        <button class="btn btn-secondary" onclick="handleLogout()">Log Out</button>
      </div>
    </div>
  `;
}

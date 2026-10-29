/**
 * ShopEasy Global Application Controller
 * Manages user session state, navbar interactions, and dynamic cart badges across all pages.
 */

let currentUser = null;

document.addEventListener('DOMContentLoaded', async () => {
  initNavbar();
  await checkAuthState();
  await updateCartBadge();
});

/**
 * Initialize navbar event listeners (mobile toggle, user dropdown, search)
 */
function initNavbar() {
  // Mobile nav toggle
  const mobileToggle = document.querySelector('.mobile-nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('mobile-open');
    });
  }

  // Global search input handling
  const searchInput = document.getElementById('global-search-input');
  const searchClearBtn = document.getElementById('nav-search-clear');

  const updateClearBtn = () => {
    if (!searchClearBtn) return;
    if (searchInput && searchInput.value.trim().length > 0) {
      searchClearBtn.style.display = 'block';
    } else {
      searchClearBtn.style.display = 'none';
    }
  };

  if (searchInput) {
    updateClearBtn();

    searchInput.addEventListener('input', () => {
      updateClearBtn();
    });

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '') {
          // If already on homepage, trigger filtering without reload if handler exists
          if (typeof handleSearchFilter === 'function') {
            handleSearchFilter(query);
            return;
          }
        }
        window.location.href = `/index.html?search=${encodeURIComponent(query)}`;
      }
    });
  }

  if (searchClearBtn && searchInput) {
    searchClearBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchClearBtn.style.display = 'none';
      searchInput.focus();
      if (typeof handleSearchFilter === 'function') {
        handleSearchFilter('');
      }
    });
  }

  // Close dropdowns on outside click
  document.addEventListener('click', (e) => {
    const userMenu = document.querySelector('.nav-user-menu');
    const dropdown = document.querySelector('.user-dropdown');
    if (userMenu && dropdown && !userMenu.contains(e.target)) {
      dropdown.classList.remove('show');
    }

    const catDropdown = document.getElementById('nav-categories-dropdown');
    const catBtn = document.getElementById('nav-categories-btn');
    if (catDropdown && catBtn && !catDropdown.contains(e.target) && !catBtn.contains(e.target)) {
      catDropdown.classList.remove('show');
    }
  });
}

/**
 * Toggle category navigation menu dropdown in header
 */
function toggleNavCategoryMenu(e) {
  e.stopPropagation();
  const dropdown = document.getElementById('nav-categories-dropdown');
  if (dropdown) {
    dropdown.classList.toggle('show');
  }
}

/**
 * Handle category click from header dropdown
 */
function handleNavbarCategorySelect(e, category) {
  const dropdown = document.getElementById('nav-categories-dropdown');
  if (dropdown) dropdown.classList.remove('show');

  const isHomepage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '';
  if (isHomepage && typeof handleCategoryChange === 'function') {
    e.preventDefault();
    handleCategoryChange(category);
  }
}

/**
 * Query current session to display appropriate auth options in header
 */
async function checkAuthState() {
  const userMenuContainer = document.getElementById('nav-user-container');
  if (!userMenuContainer) return;

  try {
    const res = await api.auth.getMe();
    currentUser = res.data.user;

    const isAdmin = currentUser.role === 'admin';

    userMenuContainer.innerHTML = `
      <div class="nav-user-menu">
        <button class="nav-user-btn" id="user-menu-btn" onclick="toggleUserDropdown(event)">
          <span>👤</span>
          <span>${escapeHtml(currentUser.name.split(' ')[0])}</span>
          <span>▾</span>
        </button>
        <div class="user-dropdown" id="user-dropdown-menu">
          <a href="/profile.html"><span>⚙️</span> My Profile</a>
          <a href="/orders.html"><span>📦</span> My Orders</a>
          ${isAdmin ? '<a href="/admin.html"><span>🛡️</span> Admin Dashboard</a>' : ''}
          <hr />
          <button onclick="handleLogout()"><span>🚪</span> Log Out</button>
        </div>
      </div>
    `;
  } catch (err) {
    // User is not authenticated
    currentUser = null;
    userMenuContainer.innerHTML = `
      <a href="/login.html" class="btn btn-outline btn-sm">Log In</a>
      <a href="/register.html" class="btn btn-primary btn-sm">Register</a>
    `;
  }
}

function toggleUserDropdown(e) {
  e.stopPropagation();
  const dropdown = document.getElementById('user-dropdown-menu');
  if (dropdown) {
    dropdown.classList.toggle('show');
  }
}

async function handleLogout() {
  try {
    await api.auth.logout();
    showToast('Logged out successfully', 'success');
    setTimeout(() => {
      window.location.href = '/login.html';
    }, 500);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

/**
 * Fetches user's cart and updates the navbar badge count
 */
async function updateCartBadge() {
  const badge = document.getElementById('nav-cart-count');
  if (!badge) return;

  try {
    const res = await api.cart.get();
    const count = res.data.cart.totalItems || 0;
    badge.textContent = count;
    badge.style.display = count > 0 ? 'inline-block' : 'none';
  } catch (err) {
    badge.textContent = '0';
    badge.style.display = 'none';
  }
}

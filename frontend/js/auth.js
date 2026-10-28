/**
 * ShopEasy Authentication Controller (Login & Registration)
 */

document.addEventListener('DOMContentLoaded', () => {
  initLoginForm();
  initRegisterForm();
});

/**
 * Handle Login Form Submission
 */
function initLoginForm() {
  const loginForm = document.getElementById('login-form');
  if (!loginForm) return;

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const alertBox = document.getElementById('login-alert');
    const submitBtn = document.getElementById('login-submit-btn');

    hideAlert(alertBox);

    if (!email || !password) {
      showAlert(alertBox, 'Please enter both your email and password.', 'danger');
      return;
    }

    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Signing In...';

    try {
      const res = await api.auth.login({ email, password });
      showAlert(alertBox, res.message || 'Login successful! Redirecting...', 'success');
      showToast('Welcome back to ShopEasy!', 'success');

      const redirectUrl = getQueryParam('redirect') || '/index.html';
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 800);
    } catch (err) {
      showAlert(alertBox, err.message, 'danger');
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
}

/**
 * Handle Registration Form Submission
 */
function initRegisterForm() {
  const registerForm = document.getElementById('register-form');
  if (!registerForm) return;

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;
    const phone = document.getElementById('reg-phone')?.value.trim();
    const alertBox = document.getElementById('reg-alert');
    const submitBtn = document.getElementById('reg-submit-btn');

    hideAlert(alertBox);

    // Client-side validations
    if (!name) {
      showAlert(alertBox, 'Full name is required.', 'danger');
      return;
    }
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      showAlert(alertBox, 'Please provide a valid email address.', 'danger');
      return;
    }
    if (!password || password.length < 6) {
      showAlert(alertBox, 'Password must be at least 6 characters long.', 'danger');
      return;
    }
    if (password !== confirmPassword) {
      showAlert(alertBox, 'Passwords do not match. Please verify.', 'danger');
      return;
    }

    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Creating Account...';

    try {
      const res = await api.auth.register({
        name,
        email,
        password,
        confirmPassword,
        phone
      });

      showAlert(alertBox, res.message || 'Account created successfully! Redirecting...', 'success');
      showToast('Registration successful! Welcome to ShopEasy.', 'success');

      const redirectUrl = getQueryParam('redirect') || '/index.html';
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 900);
    } catch (err) {
      showAlert(alertBox, err.message, 'danger');
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
}

function showAlert(element, message, type = 'danger') {
  if (!element) return;
  element.className = `alert-box alert-${type} visible`;
  element.textContent = message;
}

function hideAlert(element) {
  if (!element) return;
  element.className = 'alert-box';
  element.textContent = '';
}

/**
 * Demo Credentials Filler for easy internship evaluation
 */
function fillDemoCredentials(role) {
  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');
  if (!emailInput || !passwordInput) return;

  if (role === 'admin') {
    emailInput.value = 'admin@shopeasy.com';
    passwordInput.value = 'AdminPass123';
  } else {
    emailInput.value = 'customer@shopeasy.com';
    passwordInput.value = 'Password123';
  }
}

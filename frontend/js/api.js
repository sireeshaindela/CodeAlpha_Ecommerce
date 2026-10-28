/**
 * ShopEasy Unified Frontend API Helper Client
 * Encapsulates fetch() requests with proper session credentials, JSON parsing, and error normalization.
 */

const API_BASE = '/api';

class ApiClient {
  /**
   * Core request dispatcher
   */
  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    };

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      },
      // Essential for cross-page session cookie persistence
      credentials: 'include'
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMessage = data.message || `Request failed with status ${response.status}`;
        const error = new Error(errorMessage);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (err) {
      if (!err.status) {
        // Network or offline failure
        err.message = 'Unable to communicate with the server. Please check your internet connection or server status.';
      }
      throw err;
    }
  }

  get(endpoint, params = {}) {
    const query = new URLSearchParams(params).toString();
    const finalUrl = query ? `${endpoint}?${query}` : endpoint;
    return this.request(finalUrl, { method: 'GET' });
  }

  post(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  patch(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body)
    });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Domain API Modules
  auth = {
    register: (userData) => this.post('/auth/register', userData),
    login: (credentials) => this.post('/auth/login', credentials),
    logout: () => this.post('/auth/logout'),
    getMe: () => this.get('/auth/me')
  };

  products = {
    getAll: (params) => this.get('/products', params),
    getById: (id) => this.get(`/products/${id}`),
    getCategories: () => this.get('/products/categories')
  };

  cart = {
    get: () => this.get('/cart'),
    addItem: (productId, quantity = 1) => this.post('/cart/items', { productId, quantity }),
    updateQty: (productId, quantity) => this.patch(`/cart/items/${productId}`, { quantity }),
    removeItem: (productId) => this.delete(`/cart/items/${productId}`),
    clear: () => this.delete('/cart')
  };

  orders = {
    create: (orderData) => this.post('/orders', orderData),
    getMyOrders: () => this.get('/orders/my-orders'),
    getById: (id) => this.get(`/orders/${id}`)
  };

  admin = {
    createProduct: (productData) => this.post('/admin/products', productData),
    updateProduct: (id, updates) => this.patch(`/admin/products/${id}`, updates),
    deleteProduct: (id) => this.delete(`/admin/products/${id}`),
    getOrders: (params) => this.get('/admin/orders', params),
    updateOrderStatus: (id, status) => this.patch(`/admin/orders/${id}/status`, { status })
  };
}

const api = new ApiClient();

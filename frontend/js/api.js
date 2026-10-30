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
    getAll: async (params = {}) => {
      try {
        return await this.get('/products', params);
      } catch (err) {
        return fallbackGetProducts(params);
      }
    },
    getById: async (id) => {
      try {
        return await this.get(`/products/${id}`);
      } catch (err) {
        return fallbackGetProductById(id);
      }
    },
    getCategories: async () => {
      try {
        return await this.get('/products/categories');
      } catch (err) {
        return {
          success: true,
          data: {
            categories: ['Accessories', 'Electronics', 'Fashion', 'Home']
          }
        };
      }
    }
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

// Client-side fallback catalog for static deployments (e.g. Netlify) when backend API is unavailable
const FALLBACK_PRODUCTS = [
  {
    _id: '654321000000000000000001',
    name: 'Wireless Noise-Cancelling Headphones',
    description: 'Immersive sound experience with active noise cancellation, 40-hour battery life, and ultra-soft memory foam earcups.',
    price: 349900,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    stockQuantity: 25,
    featured: true,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    _id: '654321000000000000000002',
    name: 'Smart Fitness Tracker Watch',
    description: 'Track your heart rate, sleep quality, daily steps, and workout metrics with full AMOLED display and water resistance up to 50m.',
    price: 249900,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
    stockQuantity: 40,
    featured: true,
    isActive: true,
    createdAt: '2026-01-02T00:00:00.000Z'
  },
  {
    _id: '654321000000000000000003',
    name: 'Ergonomic Wireless Optical Mouse',
    description: 'Silent click switches, 2.4GHz wireless and Bluetooth 5.0 dual-mode connectivity with adjustable DPI settings up to 4000.',
    price: 89900,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop&q=80',
    stockQuantity: 50,
    featured: false,
    isActive: true,
    createdAt: '2026-01-03T00:00:00.000Z'
  },
  {
    _id: '654321000000000000000004',
    name: 'Mechanical RGB Gaming Keyboard',
    description: 'Tenkeyless tactile switches, customizable per-key RGB backlighting, durable aluminum frame, and detachable USB-C braided cable.',
    price: 289900,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80',
    stockQuantity: 20,
    featured: true,
    isActive: true,
    createdAt: '2026-01-04T00:00:00.000Z'
  },
  {
    _id: '654321000000000000000005',
    name: 'Portable Bluetooth Speaker',
    description: 'Rich 360-degree stereo sound with deep bass, IPX7 waterproof casing, and 15-hour continuous playback for outdoor adventures.',
    price: 179900,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&auto=format&fit=crop&q=80',
    stockQuantity: 30,
    featured: false,
    isActive: true,
    createdAt: '2026-01-05T00:00:00.000Z'
  },
  {
    _id: '654321000000000000000006',
    name: 'Adjustable Aluminum Phone & Tablet Stand',
    description: 'Heavy-duty foldable desk mount with dual hinges, anti-slip silicone pads, and cable cutout for hands-free video calls.',
    price: 59900,
    category: 'Accessories',
    imageUrl: 'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=600&auto=format&fit=crop&q=80',
    stockQuantity: 65,
    featured: false,
    isActive: true,
    createdAt: '2026-01-06T00:00:00.000Z'
  },
  {
    _id: '654321000000000000000007',
    name: 'Waterproof Laptop Travel Backpack',
    description: 'Padded compartment accommodating laptops up to 15.6 inches, integrated USB charging port, anti-theft back pocket, and breathable mesh back.',
    price: 199900,
    category: 'Accessories',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
    stockQuantity: 35,
    featured: true,
    isActive: true,
    createdAt: '2026-01-07T00:00:00.000Z'
  },
  {
    _id: '654321000000000000000008',
    name: 'Minimalist Matte Phone Case',
    description: 'Shock-absorbent bumper case with raised camera lip, scratch-resistant matte finish, and precise cutouts for buttons and ports.',
    price: 39900,
    category: 'Accessories',
    imageUrl: 'https://images.unsplash.com/photo-1601593346740-925612772716?w=600&auto=format&fit=crop&q=80',
    stockQuantity: 80,
    featured: false,
    isActive: true,
    createdAt: '2026-01-08T00:00:00.000Z'
  },
  {
    _id: '654321000000000000000009',
    name: '7-in-1 Aluminum USB-C Hub',
    description: 'Multiport adapter featuring 4K HDMI, 100W Power Delivery, SD/TF card reader slots, and 3 USB 3.0 super-speed ports.',
    price: 149900,
    category: 'Accessories',
    imageUrl: 'https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=600&auto=format&fit=crop&q=80',
    stockQuantity: 45,
    featured: false,
    isActive: true,
    createdAt: '2026-01-09T00:00:00.000Z'
  },
  {
    _id: '654321000000000000000010',
    name: 'Dimmable LED Desk Lamp with USB Port',
    description: 'Eye-caring architectural desk lamp with 5 color temperatures, 7 brightness levels, flexible gooseneck, and built-in USB charging port.',
    price: 129900,
    category: 'Home',
    imageUrl: 'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?w=600&auto=format&fit=crop&q=80',
    stockQuantity: 28,
    featured: true,
    isActive: true,
    createdAt: '2026-01-10T00:00:00.000Z'
  },
  {
    _id: '654321000000000000000011',
    name: 'Insulated Stainless Steel Water Bottle (750ml)',
    description: 'Double-wall vacuum insulation keeps cold drinks iced for 24 hours and hot coffee steaming for 12 hours. BPA-free leakproof lid.',
    price: 74900,
    category: 'Home',
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80',
    stockQuantity: 55,
    featured: false,
    isActive: true,
    createdAt: '2026-01-11T00:00:00.000Z'
  },
  {
    _id: '654321000000000000000012',
    name: 'Aroma Diffuser & Cool Mist Humidifier',
    description: 'Ultrasonic whisper-quiet essential oil diffuser with 7 ambient mood lights, auto-off protection, and 300ml water tank capacity.',
    price: 119900,
    category: 'Home',
    imageUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&auto=format&fit=crop&q=80',
    stockQuantity: 22,
    featured: false,
    isActive: true,
    createdAt: '2026-01-12T00:00:00.000Z'
  },
  {
    _id: '654321000000000000000013',
    name: 'Classic Oxford Cotton Button-Down Shirt',
    description: 'Tailored fit 100% breathable combed cotton with button-down collar and chest pocket. Comfortable all-day formal and casual wear.',
    price: 149900,
    category: 'Fashion',
    imageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&auto=format&fit=crop&q=80',
    stockQuantity: 30,
    featured: true,
    isActive: true,
    createdAt: '2026-01-13T00:00:00.000Z'
  },
  {
    _id: '654321000000000000000014',
    name: 'Canvas Weekender Duffel Bag',
    description: 'Rugged vintage canvas travel holdall with genuine leather trim, dedicated shoe compartment, and padded shoulder strap.',
    price: 219900,
    category: 'Fashion',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
    stockQuantity: 18,
    featured: false,
    isActive: true,
    createdAt: '2026-01-14T00:00:00.000Z'
  }
];

function fallbackGetProducts(params = {}) {
  let list = [...FALLBACK_PRODUCTS];
  const cat = String(params.category || '').trim().toLowerCase();
  if (cat && cat !== 'all') {
    list = list.filter((p) => {
      const pCat = String(p.category || '').toLowerCase();
      if (cat === 'accessories' || cat === 'accessory') return pCat === 'accessories' || pCat === 'accessory';
      if (cat === 'electronics' || cat === 'electronic') return pCat === 'electronics' || pCat === 'electronic';
      return pCat === cat;
    });
  }
  const search = String(params.search || '').trim().toLowerCase();
  if (search) {
    list = list.filter(
      (p) => p.name.toLowerCase().includes(search) || p.description.toLowerCase().includes(search)
    );
  }
  if (params.sort === 'price_asc') {
    list.sort((a, b) => a.price - b.price);
  } else if (params.sort === 'price_desc') {
    list.sort((a, b) => b.price - a.price);
  } else if (params.sort === 'name_asc') {
    list.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    // Default newest
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  return {
    success: true,
    data: {
      products: list,
      total: list.length,
      categories: ['Accessories', 'Electronics', 'Fashion', 'Home']
    }
  };
}

function fallbackGetProductById(id) {
  const product = FALLBACK_PRODUCTS.find((p) => p._id === id) || FALLBACK_PRODUCTS[0];
  if (!product) {
    throw new Error('Product not found');
  }
  return {
    success: true,
    data: { product }
  };
}

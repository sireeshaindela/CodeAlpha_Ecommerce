# ShopEasy — Full Stack E-Commerce Store

[![Node.js](https://img.shields.io/badge/Node.js-v20.18-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-v4.21-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%20v8-brightgreen.svg)](https://www.mongodb.com/)
[![CodeAlpha](https://img.shields.io/badge/CodeAlpha-Task%201-orange.svg)](https://codealpha.tech/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)
[![Tests: 17 Passed](https://img.shields.io/badge/Tests-17%20Passed-success.svg)]()

> Developed for the **CodeAlpha Full Stack Development Internship — Task 1: Simple E-commerce Store**.

---

## 1. Project Overview

**ShopEasy** is a complete, production-grade full-stack online shopping web application built with vanilla frontend technologies (HTML5, CSS3, ES6+ JavaScript) and a robust Node.js, Express, and MongoDB backend.

The application delivers an intuitive shopping experience with zero client-side mockups: all catalog browsing, search queries, cart persistence, user authentication, and checkout orders interact directly with real MongoDB documents through REST APIs.

---

## 2. Key Features

### 🛍️ Customer Experience
- **Responsive Storefront:** Clean, modern UI styled with custom CSS properties, responsive grids, and subtle elevation animations.
- **Dynamic Catalog:** Real-time product feed from MongoDB with category chips (`Electronics`, `Accessories`, `Home`, `Fashion`).
- **Live Search & Sorting:** Instant search across product titles/descriptions and sorting by price (low-to-high, high-to-low) and newest arrivals.
- **Dedicated Product Details Page:** Rich specification view with live stock availability, quantity selection, and add-to-cart confirmation.
- **Persistent Shopping Cart:** Stored securely in MongoDB for authenticated accounts. Includes item increment/decrement, remove actions, and empty cart controls.
- **Free Delivery Calculator:** Real-time visual progress bar tracking eligibility for free delivery on orders over ₹2,000.
- **Safe Demonstration Checkout:** Cash-on-Delivery flow with complete server-side price recalculation, atomic inventory deduction, and instant receipt generation.
- **Order Tracking & History:** Customer order dashboard with human-readable order numbers (`SE-YYYYMMDD-XXXX`), status badges, and printable receipts.
- **User Authentication:** Email normalization, password validation, `bcryptjs` hashing, and secure `HttpOnly` session cookies.

### 🛡️ Administration & Security
- **Protected Admin Dashboard (`/admin.html`):** Role-guarded control center allowing administrators to publish new products, adjust inventory counts on the fly, and update order fulfillment statuses.
- **Atomic Stock Management:** Prevents overselling using atomic conditional database updates (`$gte`).
- **Financial Precision:** All monetary amounts are stored as **integer paise** (e.g. ₹1,499.00 = `149900` paise) to eliminate JavaScript floating-point rounding errors.
- **Security Protections:** Rate-limiting on authentication routes (`express-rate-limit`), Helmet Content Security Policy headers, and centralized error sanitization.

---

## 3. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Semantic HTML5, Modern CSS3 (Variables, Flexbox, Grid), Vanilla JavaScript (ES6+), Fetch API |
| **Backend** | Node.js (v20.x+), Express.js (v4.21.x) |
| **Database** | MongoDB, Mongoose ODM (v8.x) |
| **Session & Auth** | `express-session`, `connect-mongo`, `bcryptjs` |
| **Security** | `helmet`, `cors`, `express-rate-limit` |
| **Automated Testing** | `jest`, `supertest`, `mongodb-memory-server` |

---

## 4. Project Directory Structure

```
CodeAlpha_SimpleEcommerceStore/
├── frontend/
│   ├── index.html              # Modern storefront & hero showcase
│   ├── product.html            # Dedicated product detail view
│   ├── cart.html               # Shopping cart & subtotal summary
│   ├── checkout.html           # Shipping address & order confirmation
│   ├── login.html              # Customer & admin login page
│   ├── register.html           # Customer account registration
│   ├── orders.html             # Customer order history listing
│   ├── order-details.html      # Detailed itemized printable receipt
│   ├── profile.html            # User account details & saved address
│   ├── admin.html              # Protected administrator control panel
│   ├── 404.html                # Friendly not-found fallback
│   ├── css/
│   │   ├── style.css           # Design system, typography & product cards
│   │   ├── auth.css            # Form controls, hints & error alerts
│   │   ├── cart.css            # Cart table, quantity controls & progress bar
│   │   ├── checkout.css        # Multi-column checkout layout
│   │   └── responsive.css      # Breakpoints for mobile, tablet, desktop
│   ├── js/
│   │   ├── api.js              # Unified Fetch API wrapper with credentials
│   │   ├── app.js              # Global navbar state & cart badge counter
│   │   ├── products.js         # Homepage catalog, filters, search & sorting
│   │   ├── product-details.js  # Product page loader & quantity controls
│   │   ├── cart.js             # Cart page state & price calculations
│   │   ├── checkout.js         # Shipping form handler & order placement
│   │   ├── orders.js           # Order history table & receipt links
│   │   ├── order-details.js    # Single order receipt renderer
│   │   ├── auth.js             # Form validation & session login
│   │   ├── profile.js          # User profile view
│   │   ├── admin.js            # Admin inventory & status updater
│   │   └── utils.js            # Currency formatter (paise to ₹) & toasts
│   └── assets/
│       └── images/placeholder.svg # Local fallback vector image
│
├── backend/
│   ├── server.js               # Startup listener & graceful shutdown
│   ├── app.js                  # Express setup, middleware & static files
│   ├── config/
│   │   └── database.js         # MongoDB connection with zero-config fallback
│   ├── models/
│   │   ├── User.js             # User account schema with bcrypt hooks
│   │   ├── Product.js          # Product catalog schema with text indexes
│   │   ├── Cart.js             # Persistent shopping cart schema
│   │   └── Order.js            # Purchase-time snapshotted order schema
│   ├── controllers/
│   │   ├── authController.js   # Register, login, logout, me
│   │   ├── productController.js# Catalog query, search, categories
│   │   ├── cartController.js   # Add, update, delete, clear cart
│   │   ├── orderController.js  # Checkout, my-orders, receipt
│   │   └── adminController.js  # Product management, order status
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── adminRoutes.js
│   │   └── healthRoutes.js     # Health probe (/api/health)
│   ├── middleware/
│   │   ├── requireAuth.js      # Session guard
│   │   ├── requireAdmin.js     # Role verification guard
│   │   ├── validateRequest.js  # Input payload validation
│   │   └── errorHandler.js     # Centralized JSON error handler
│   ├── services/
│   │   └── orderService.js     # Order pricing & atomic stock updates
│   ├── scripts/
│   │   ├── seedProducts.js     # Catalog seed script (14 sample products)
│   │   └── createAdmin.js      # CLI administrator bootstrap tool
│   └── tests/
│       ├── setup.js            # Test database lifecycle
│       ├── auth.test.js        # Auth integration tests
│       ├── products.test.js    # Catalog & search tests
│       └── orders.test.js      # Cart, checkout & security tests
│
├── docs/
│   ├── PROJECT_EXPLANATION.md  # Beginner-friendly architecture guide
│   ├── API_DOCUMENTATION.md    # Complete REST API specifications
│   └── DATABASE_DESIGN.md      # Schemas, relationships & ER diagram
│
├── .env.example                # Sample environment variables
├── .gitignore                  # Git exclude rules
├── package.json                # Project manifest and scripts
└── README.md                   # Project documentation
```

---

## 5. Prerequisites

Before running the application, make sure you have:
- **Node.js**: v18.x or v20.x+ (Recommended: Node.js LTS)
- **npm**: v9.x or v10.x+
- **MongoDB**: Optional! The application includes an intelligent fallback that runs an embedded in-memory MongoDB engine (`mongodb-memory-server`) automatically if local MongoDB is not running. For permanent local storage, you can use MongoDB Community Server or MongoDB Atlas.

---

## 6. Installation & Quick Start

### Step 1: Clone or Navigate to the Repository
```bash
cd CodeAlpha_SimpleEcommerceStore
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Copy the example environment configuration:
```bash
cp .env.example .env
```
*(On Windows PowerShell, use: `Copy-Item .env.example .env`)*

Default configuration (`.env`):
```env
PORT=3000
NODE_ENV=development
APP_BASE_URL=http://localhost:3000
MONGODB_URI=mongodb://127.0.0.1:27017/shopeasy
SESSION_SECRET=shopeasy_development_super_secure_secret_key_2026
SESSION_COOKIE_SECURE=false
FREE_SHIPPING_THRESHOLD_PAISE=200000
STANDARD_SHIPPING_FEE_PAISE=9900
```

### Step 4: Start the Application
Run in development mode:
```bash
npm start
```
*Or with hot reload:*
```bash
npm run dev
```

The server will automatically:
1. Connect to MongoDB (or boot the embedded engine if local MongoDB is not active).
2. Auto-seed 14 rich sample products and demo customer & admin accounts if the database is empty.
3. Start listening at: **`http://localhost:3000`**

---

## 7. Demo Accounts for Evaluation

For rapid demonstration and internship grading, the application includes pre-configured accounts:

| Role | Email | Password | Access Capabilities |
|---|---|---|---|
| **Customer** | `customer@shopeasy.com` | `Password123` | Browse catalog, manage cart, place orders, view order history |
| **Administrator** | `admin@shopeasy.com` | `AdminPass123` | Full customer capabilities + Admin Dashboard (`/admin.html`), publish products, adjust live stock, update order statuses |

*(Convenient one-click "Fill Demo Credentials" buttons are available on the login page).*

---

## 8. Automated Testing

ShopEasy includes a full automated test suite using **Jest** and **Supertest**. The suite exercises all critical user workflows against an isolated test database.

Run the test suite:
```bash
npm test
```

### Test Suite Coverage:
- **Authentication (`auth.test.js`):**
  - Registration with validation and session creation
  - Duplicate email rejection (HTTP 409)
  - Mismatched password rejection (HTTP 400)
  - Successful login & invalid password rejection (HTTP 401)
  - Current user profile endpoint (`GET /api/auth/me`)
  - Session termination (`POST /api/auth/logout`)
- **Product Catalog (`products.test.js`):**
  - Full product listing & pagination
  - Category filtering (`?category=Electronics`)
  - Keyword search across names and descriptions
  - Sorting (price ascending/descending)
  - Product details by ID & friendly 404 for missing IDs
- **Cart & Orders (`orders.test.js`):**
  - Adding products and updating quantities
  - Verification of free shipping threshold logic (>= ₹2,000)
  - Stock limit enforcement (rejecting quantities exceeding inventory)
  - Checkout execution, atomic inventory deduction, and cart clearing
  - Order history retrieval
  - Security authorization check: verifying users cannot access another user's order

---

## 9. API Summary

Refer to [`docs/API_DOCUMENTATION.md`](docs/API_DOCUMENTATION.md) for full request/response schemas.

- **System:** `GET /api/health`
- **Auth:** `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- **Products:** `GET /api/products`, `GET /api/products/categories`, `GET /api/products/:id`
- **Cart:** `GET /api/cart`, `POST /api/cart/items`, `PATCH /api/cart/items/:productId`, `DELETE /api/cart/items/:productId`, `DELETE /api/cart`
- **Orders:** `POST /api/orders`, `GET /api/orders/my-orders`, `GET /api/orders/:id`
- **Admin:** `POST /api/admin/products`, `PATCH /api/admin/products/:id`, `DELETE /api/admin/products/:id`, `GET /api/admin/orders`, `PATCH /api/admin/orders/:id/status`

---

## 10. Security Considerations

1. **Password Security:** Passwords are never stored in plain text. They are hashed using `bcryptjs` with 10 salt rounds. Password fields are omitted by default in Mongoose queries (`select: false`).
2. **Session Security:** Sessions are stored server-side in MongoDB (`connect-mongo`) with `HttpOnly` and `SameSite: Lax` cookie flags to mitigate XSS attacks and session hijacking.
3. **Price Tampering Prevention:** The server never trusts prices sent from the client. During cart viewing and checkout, authoritative prices are fetched from the database and recalculated on the server.
4. **Brute Force Protection:** Login requests are rate-limited (`express-rate-limit`) to 10 attempts per 15 minutes.
5. **No Payment Card Liability:** In accordance with internship guidelines, real credit card details are never collected or stored. A safe Cash-on-Delivery flow is implemented.

---

## 11. Known Limitations & Future Roadmap

### Current Scope
- Demonstration payment: Uses Cash-on-Delivery rather than an online payment gateway (e.g. Razorpay or Stripe) to adhere to internship safety guidelines.
- Shipping options: Standard delivery policy with free threshold; additional express delivery tiers can be added.

### Future Roadmap
- Integration with Razorpay / Stripe sandbox webhook workflows.
- Customer product review and star rating system.
- Customer email dispatch for order confirmations (using Nodemailer).
- Product image upload direct to cloud storage (e.g. Cloudinary or AWS S3).

---

## 12. Internship Submission Details

- **Internship Organization:** CodeAlpha
- **Domain:** Full Stack Web Development
- **Task:** Task 1 — Simple E-commerce Store
- **Repository Name:** `CodeAlpha_SimpleEcommerceStore`
- **Author:** CodeAlpha Full Stack Development Intern

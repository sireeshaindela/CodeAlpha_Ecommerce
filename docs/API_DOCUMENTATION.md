# ShopEasy — REST API Documentation

This document describes all REST API endpoints implemented in ShopEasy. All endpoints return predictable JSON payloads adhering to standard HTTP status codes.

---

## 1. Response Standards

### Standard Success Response
```json
{
  "success": true,
  "message": "Optional descriptive status message",
  "data": { ... }
}
```

### Standard Error Response
```json
{
  "success": false,
  "message": "Human-readable explanation of error",
  "errorDetails": "Stack trace (included only in development mode)"
}
```

---

## 2. API Endpoints Summary

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/health` | System health & MongoDB status | Public |
| `POST` | `/api/auth/register` | Register new customer account | Public |
| `POST` | `/api/auth/login` | Authenticate & create session cookie | Public (Rate-limited) |
| `POST` | `/api/auth/logout` | Terminate session & clear cookie | Public |
| `GET` | `/api/auth/me` | Retrieve current user profile | Session |
| `GET` | `/api/products` | Browse catalog (filter, sort, search) | Public |
| `GET` | `/api/products/categories` | List active categories | Public |
| `GET` | `/api/products/:id` | Get single product details | Public |
| `GET` | `/api/cart` | Retrieve user's shopping cart | Customer / Admin |
| `POST` | `/api/cart/items` | Add item to cart | Customer / Admin |
| `PATCH` | `/api/cart/items/:productId` | Update item quantity in cart | Customer / Admin |
| `DELETE` | `/api/cart/items/:productId` | Remove single item from cart | Customer / Admin |
| `DELETE` | `/api/cart` | Empty shopping cart | Customer / Admin |
| `POST` | `/api/orders` | Place order from cart items | Customer / Admin |
| `GET` | `/api/orders/my-orders` | List current user's order history | Customer / Admin |
| `GET` | `/api/orders/:id` | Get itemized order receipt | Order Owner / Admin |
| `POST` | `/api/admin/products` | Create new product | Admin |
| `PATCH` | `/api/admin/products/:id` | Update product details / stock | Admin |
| `DELETE` | `/api/admin/products/:id` | Deactivate product | Admin |
| `GET` | `/api/admin/orders` | View all customer orders | Admin |
| `PATCH` | `/api/admin/orders/:id/status`| Update order fulfillment status | Admin |

---

## 3. Detailed Endpoint Specifications

### Health Check

#### `GET /api/health`
Checks server uptime and database connectivity.
- **Auth:** None
- **Response `200 OK`:**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2026-10-28T16:55:05.046Z",
  "uptime": 240,
  "database": "connected"
}
```

---

### Authentication

#### `POST /api/auth/register`
Creates a customer account and establishes a session.
- **Auth:** None
- **Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "Password123",
  "confirmPassword": "Password123",
  "phone": "+91 98765 43210"
}
```
- **Response `201 Created`:**
```json
{
  "success": true,
  "message": "Registration successful! Welcome to ShopEasy.",
  "data": {
    "user": {
      "_id": "671fd10a56e792b001a1c1d1",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "customer",
      "phone": "+91 98765 43210",
      "createdAt": "2026-10-28T16:45:00.000Z"
    }
  }
}
```
- **Common Errors:**
  - `400 Bad Request`: Validation failure (missing required field, password mismatch, short password).
  - `409 Conflict`: Email already exists.

#### `POST /api/auth/login`
Authenticates credentials and issues an `HttpOnly` cookie.
- **Auth:** None (Rate-limited to 10 attempts per 15 minutes)
- **Request Body:**
```json
{
  "email": "jane@example.com",
  "password": "Password123"
}
```
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Login successful! Welcome back.",
  "data": {
    "user": {
      "_id": "671fd10a56e792b001a1c1d1",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "customer"
    }
  }
}
```
- **Headers:** `Set-Cookie: connect.sid=...; Path=/; HttpOnly; SameSite=Lax`

#### `POST /api/auth/logout`
Destroys the server session and clears session cookie.
- **Auth:** None
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "You have been successfully logged out."
}
```

#### `GET /api/auth/me`
Retrieves the profile of the currently logged-in user.
- **Auth:** Session cookie required
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "671fd10a56e792b001a1c1d1",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "customer"
    }
  }
}
```
- **Error `401 Unauthorized`:** Not logged in.

---

### Products

#### `GET /api/products`
Retrieves paginated, filtered, and sorted products.
- **Query Parameters:**
  - `search` (string): Keyword search in name and description.
  - `category` (string): Exact category name (e.g. `Electronics`).
  - `sort` (string): `price_asc`, `price_desc`, `name_asc`, `newest` (default).
  - `page` (number): Page number (default: `1`).
  - `limit` (number): Items per page (default: `12`, max: `50`).
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "_id": "671fc21b10a2f4c001a88b12",
        "name": "Wireless Noise-Cancelling Headphones",
        "description": "Immersive sound experience with active noise cancellation...",
        "price": 349900,
        "priceInRupees": "3499.00",
        "category": "Electronics",
        "imageUrl": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
        "stockQuantity": 25,
        "featured": true,
        "isActive": true
      }
    ],
    "total": 14,
    "page": 1,
    "totalPages": 2,
    "limit": 12,
    "categories": ["Accessories", "Electronics", "Fashion", "Home"]
  }
}
```

#### `GET /api/products/:id`
Retrieves full details for a single product.
- **Response `200 OK`:** Returns product object.
- **Error `404 Not Found`:** If ID does not exist or product is inactive.

---

### Shopping Cart

#### `GET /api/cart`
Returns the user's persisted shopping cart with server-recalculated monetary totals.
- **Auth:** Session required
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "cart": {
      "items": [
        {
          "product": {
            "_id": "671fc21b10a2f4c001a88b12",
            "name": "Wireless Noise-Cancelling Headphones",
            "price": 349900,
            "imageUrl": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
            "stockQuantity": 25,
            "category": "Electronics"
          },
          "quantity": 1,
          "subtotal": 349900
        }
      ],
      "totalItems": 1,
      "subtotal": 349900,
      "shippingFee": 0,
      "total": 349900,
      "freeShippingThreshold": 200000,
      "isFreeShippingEligible": true
    }
  }
}
```

#### `POST /api/cart/items`
Adds a product to the user's cart or increments quantity if already present.
- **Request Body:**
```json
{
  "productId": "671fc21b10a2f4c001a88b12",
  "quantity": 1
}
```
- **Common Errors:**
  - `400 Bad Request`: Requested quantity exceeds available live stock.
  - `404 Not Found`: Invalid or deactivated product.

#### `PATCH /api/cart/items/:productId`
Updates item quantity. Setting quantity to `0` removes the item.
- **Request Body:** `{ "quantity": 3 }`

#### `DELETE /api/cart/items/:productId`
Removes a specific product from the cart.

#### `DELETE /api/cart`
Clears all items in the user's cart.

---

### Orders & Checkout

#### `POST /api/orders`
Converts current cart into a confirmed order with atomic inventory deduction.
- **Auth:** Session required
- **Request Body:**
```json
{
  "shippingAddress": {
    "fullName": "Jane Doe",
    "street": "123 MG Road, Apt 4B",
    "city": "Bengaluru",
    "state": "Karnataka",
    "postalCode": "560001",
    "country": "India",
    "phone": "+91 98765 43210"
  },
  "paymentMethod": "cash_on_delivery"
}
```
- **Response `201 Created`:**
```json
{
  "success": true,
  "message": "Order placed successfully! Thank you for shopping with ShopEasy.",
  "data": {
    "order": {
      "_id": "671fd89a12c49b001a44e5f6",
      "orderNumber": "SE-20261028-5421",
      "items": [ ... ],
      "subtotal": 349900,
      "shippingFee": 0,
      "total": 349900,
      "paymentMethod": "cash_on_delivery",
      "paymentStatus": "pending",
      "orderStatus": "placed",
      "createdAt": "2026-10-28T16:50:00.000Z"
    }
  }
}
```
- **Common Errors:**
  - `400 Bad Request`: Empty cart, missing shipping fields, or insufficient stock.

#### `GET /api/orders/my-orders`
Returns array of orders placed by the currently logged-in user.

#### `GET /api/orders/:id`
Returns itemized receipt for a specific order.
- **Ownership Verification:** Only the customer who placed the order or an Administrator can view it. Returns `403 Forbidden` if accessed by another user.

---

### Administration (Role: `admin`)

#### `POST /api/admin/products`
Adds a new product to the catalog.
- **Request Body:**
```json
{
  "name": "Mechanical Keyboard Pro",
  "description": "Tactile switches with aluminum frame",
  "category": "Electronics",
  "price": 289900,
  "stockQuantity": 20,
  "imageUrl": "https://images.unsplash.com/photo-1587829741301-dc798b83add3",
  "featured": true
}
```

#### `PATCH /api/admin/products/:id`
Updates product specifications, price, or stock levels.

#### `DELETE /api/admin/products/:id`
Deactivates a product (soft delete) so it disappears from the store without breaking past order histories.

#### `GET /api/admin/orders`
Retrieves all customer orders across the platform. Supports `?status=` filtering.

#### `PATCH /api/admin/orders/:id/status`
Updates fulfillment status (`placed`, `processing`, `shipped`, `delivered`, `cancelled`).

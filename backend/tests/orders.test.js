require('./setup');
const request = require('supertest');
const app = require('../app');
const Product = require('../models/Product');
const User = require('../models/User');

describe('Cart and Order Workflows', () => {
  let agent;
  let otherAgent;
  let testProduct;

  beforeEach(async () => {
    agent = request.agent(app);
    otherAgent = request.agent(app);

    // Register User 1
    await agent.post('/api/auth/register').send({
      name: 'Bob Customer',
      email: 'bob@example.com',
      password: 'Password123',
      confirmPassword: 'Password123'
    });

    // Register User 2
    await otherAgent.post('/api/auth/register').send({
      name: 'Charlie Customer',
      email: 'charlie@example.com',
      password: 'Password123',
      confirmPassword: 'Password123'
    });

    // Create a product with 10 units in stock
    testProduct = await Product.create({
      name: 'Smart Watch Pro',
      description: 'Fitness tracker with GPS and OLED screen.',
      price: 150000, // ₹1,500.00 in paise
      category: 'Electronics',
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
      stockQuantity: 10,
      isActive: true
    });
  });

  test('Cart: Add item, update quantity, and verify shipping policy calculation', async () => {
    // Add 1 item (Subtotal = ₹1,500, which is < ₹2,000 threshold -> ₹99 shipping applied)
    const addRes = await agent.post('/api/cart/items').send({
      productId: testProduct._id,
      quantity: 1
    });

    expect(addRes.status).toBe(200);
    expect(addRes.body.data.cart.items.length).toBe(1);
    expect(addRes.body.data.cart.subtotal).toBe(150000);
    expect(addRes.body.data.cart.shippingFee).toBe(9900); // Standard ₹99
    expect(addRes.body.data.cart.total).toBe(159900);

    // Update quantity to 2 (Subtotal = 2 * ₹1,500 = ₹3,000 >= ₹2,000 -> Free shipping!)
    const updateRes = await agent.patch(`/api/cart/items/${testProduct._id}`).send({
      quantity: 2
    });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.cart.subtotal).toBe(300000);
    expect(updateRes.body.data.cart.shippingFee).toBe(0); // Free shipping!
    expect(updateRes.body.data.cart.total).toBe(300000);
  });

  test('Cart: Rejects adding more than available stock', async () => {
    const res = await agent.post('/api/cart/items').send({
      productId: testProduct._id,
      quantity: 15 // Only 10 available
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('Orders: Checkout creates order, decrements stock, and clears cart', async () => {
    // 1. Add 2 items to cart
    await agent.post('/api/cart/items').send({
      productId: testProduct._id,
      quantity: 2
    });

    // 2. Place Order
    const orderRes = await agent.post('/api/orders').send({
      shippingAddress: {
        fullName: 'Bob Customer',
        street: '456 Tech Boulevard',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400001',
        country: 'India',
        phone: '+91 9988776655'
      },
      paymentMethod: 'cash_on_delivery'
    });

    expect(orderRes.status).toBe(201);
    expect(orderRes.body.success).toBe(true);
    const order = orderRes.body.data.order;
    expect(order.orderNumber).toMatch(/^SE-/);
    expect(order.items[0].quantity).toBe(2);
    expect(order.items[0].price).toBe(150000);

    // 3. Verify stock decremented from 10 to 8
    const updatedProd = await Product.findById(testProduct._id);
    expect(updatedProd.stockQuantity).toBe(8);

    // 4. Verify cart is now empty
    const cartRes = await agent.get('/api/cart');
    expect(cartRes.body.data.cart.items.length).toBe(0);
    expect(cartRes.body.data.cart.totalItems).toBe(0);

    // 5. Verify user can view their order
    const myOrdersRes = await agent.get('/api/orders/my-orders');
    expect(myOrdersRes.status).toBe(200);
    expect(myOrdersRes.body.data.orders.length).toBe(1);

    // 6. Security check: User 2 CANNOT access User 1's order
    const unauthorizedRes = await otherAgent.get(`/api/orders/${order._id}`);
    expect(unauthorizedRes.status).toBe(403);
    expect(unauthorizedRes.body.success).toBe(false);
  });

  test('Orders: Rejects checkout when cart is empty', async () => {
    const res = await agent.post('/api/orders').send({
      shippingAddress: {
        fullName: 'Bob Customer',
        street: '123 Test St',
        city: 'Test City',
        state: 'State',
        postalCode: '123456',
        phone: '1234567890'
      }
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

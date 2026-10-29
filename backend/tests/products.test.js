require('./setup');
const request = require('supertest');
const app = require('../app');
const Product = require('../models/Product');

describe('Product Endpoints', () => {
  let sampleProduct1;
  let sampleProduct2;

  beforeEach(async () => {
    sampleProduct1 = await Product.create({
      name: 'Wireless Bluetooth Headphones',
      description: 'Noise cancelling over-ear headphones with 30-hour battery life.',
      price: 299900, // ₹2,999.00
      category: 'Electronics',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
      stockQuantity: 15,
      featured: true,
      isActive: true
    });

    sampleProduct2 = await Product.create({
      name: 'Ceramic Coffee Mug',
      description: 'Handcrafted minimalist ceramic mug for hot brew.',
      price: 49900, // ₹499.00
      category: 'Home',
      imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd',
      stockQuantity: 25,
      featured: false,
      isActive: true
    });

    await Product.create({
      name: 'Adjustable Aluminum Phone Stand',
      description: 'Heavy duty foldable phone stand.',
      price: 59900,
      category: 'Accessories',
      imageUrl: 'https://images.unsplash.com/photo-1586105251261-72a756497a11',
      stockQuantity: 30,
      featured: false,
      isActive: true
    });
  });

  test('GET /api/products - Returns list of active products', async () => {
    const res = await request(app).get('/api/products');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.products.length).toBe(3);
    expect(res.body.data.total).toBe(3);
  });

  test('GET /api/products - Filters by category Electronics and Accessories', async () => {
    // 1. Electronics
    const resElec = await request(app).get('/api/products?category=Electronics');
    expect(resElec.status).toBe(200);
    expect(resElec.body.data.products.length).toBe(1);
    expect(resElec.body.data.products[0].name).toBe('Wireless Bluetooth Headphones');

    // 2. Accessories (case-insensitive)
    const resAcc = await request(app).get('/api/products?category=accessories');
    expect(resAcc.status).toBe(200);
    expect(resAcc.body.data.products.length).toBe(1);
    expect(resAcc.body.data.products[0].name).toBe('Adjustable Aluminum Phone Stand');

    // 3. All category returns all 3 products
    const resAll = await request(app).get('/api/products?category=All');
    expect(resAll.status).toBe(200);
    expect(resAll.body.data.products.length).toBe(3);

    // 4. Non-existent category returns empty array gracefully
    const resEmpty = await request(app).get('/api/products?category=Automotive');
    expect(resEmpty.status).toBe(200);
    expect(resEmpty.body.data.products.length).toBe(0);
  });

  test('GET /api/products - Searches by product name keyword', async () => {
    const res = await request(app).get('/api/products?search=Coffee');

    expect(res.status).toBe(200);
    expect(res.body.data.products.length).toBe(1);
    expect(res.body.data.products[0].name).toBe('Ceramic Coffee Mug');
  });

  test('GET /api/products - Sorts by price ascending', async () => {
    const res = await request(app).get('/api/products?sort=price_asc');

    expect(res.status).toBe(200);
    expect(res.body.data.products[0].price).toBe(49900); // Mug: 49900 < 59900 < 299900
    expect(res.body.data.products[1].price).toBe(59900); // Stand
    expect(res.body.data.products[2].price).toBe(299900); // Headphones
  });

  test('GET /api/products/:id - Returns product details for valid ID', async () => {
    const res = await request(app).get(`/api/products/${sampleProduct1._id}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.product.name).toBe(sampleProduct1.name);
  });

  test('GET /api/products/:id - Returns 404 for nonexistent valid ObjectId', async () => {
    const fakeId = '507f1f77bcf86cd799439011';
    const res = await request(app).get(`/api/products/${fakeId}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

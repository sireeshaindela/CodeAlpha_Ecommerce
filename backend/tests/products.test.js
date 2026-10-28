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
  });

  test('GET /api/products - Returns list of active products', async () => {
    const res = await request(app).get('/api/products');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.products.length).toBe(2);
    expect(res.body.data.total).toBe(2);
  });

  test('GET /api/products - Filters by category', async () => {
    const res = await request(app).get('/api/products?category=Electronics');

    expect(res.status).toBe(200);
    expect(res.body.data.products.length).toBe(1);
    expect(res.body.data.products[0].name).toBe('Wireless Bluetooth Headphones');
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
    expect(res.body.data.products[0].price).toBe(49900); // 49900 < 299900
    expect(res.body.data.products[1].price).toBe(299900);
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

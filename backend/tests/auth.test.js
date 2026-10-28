require('./setup');
const request = require('supertest');
const app = require('../app');
const User = require('../models/User');

describe('Authentication Endpoints', () => {
  const testUser = {
    name: 'Alice Johnson',
    email: 'alice@example.com',
    password: 'Password123',
    confirmPassword: 'Password123'
  };

  test('POST /api/auth/register - Successfully registers user and creates session', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
    expect(res.body.data.user.password).toBeUndefined(); // Never expose password hash

    // Check cookie session header
    expect(res.headers['set-cookie']).toBeDefined();

    // Verify in database
    const dbUser = await User.findOne({ email: testUser.email.toLowerCase() });
    expect(dbUser).not.toBeNull();
    expect(dbUser.password).not.toBe(testUser.password); // Hashed
  });

  test('POST /api/auth/register - Rejects duplicate email', async () => {
    await request(app).post('/api/auth/register').send(testUser);

    const duplicateRes = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(duplicateRes.status).toBe(409);
    expect(duplicateRes.body.success).toBe(false);
  });

  test('POST /api/auth/register - Rejects mismatched passwords', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...testUser, confirmPassword: 'DifferentPassword' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/auth/login - Successfully logs in registered user', async () => {
    await request(app).post('/api/auth/register').send(testUser);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.name).toBe(testUser.name);
  });

  test('POST /api/auth/login - Rejects invalid password', async () => {
    await request(app).post('/api/auth/register').send(testUser);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'WrongPassword'
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/auth/me - Retrieves authenticated user profile', async () => {
    const agent = request.agent(app); // Maintains session cookies

    await agent.post('/api/auth/register').send(testUser);

    const meRes = await agent.get('/api/auth/me');
    expect(meRes.status).toBe(200);
    expect(meRes.body.success).toBe(true);
    expect(meRes.body.data.user.email).toBe(testUser.email.toLowerCase());
  });

  test('POST /api/auth/logout - Clears session', async () => {
    const agent = request.agent(app);

    await agent.post('/api/auth/register').send(testUser);
    const logoutRes = await agent.post('/api/auth/logout');
    expect(logoutRes.status).toBe(200);

    const meAfterLogout = await agent.get('/api/auth/me');
    expect(meAfterLogout.status).toBe(401);
  });
});

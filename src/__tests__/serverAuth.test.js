const request = require('supertest');
const srv = require('../../server');
const app = srv.app;

describe('Admin endpoints authorization', () => {
  test('DELETE /users/:id should return 401 without token', async () => {
    const res = await request(app).delete('/users/1');
    expect([401,403]).toContain(res.status);
  });

  test('PUT /users/:id/type should return 401 without token', async () => {
    const res = await request(app).put('/users/1/type').send({ user_type: 'cliente' });
    expect([401,403]).toContain(res.status);
  });

  test('PUT /users/:id/approve should return 401 without token', async () => {
    const res = await request(app).put('/users/1/approve').send({ is_approved: true });
    expect([401,403]).toContain(res.status);
  });

  test('GET /api/smtp-config should return 401 without token', async () => {
    const res = await request(app).get('/api/smtp-config');
    expect([401,403]).toContain(res.status);
  });
});

afterAll(async () => {
  if (srv.pool && typeof srv.pool.end === 'function') {
    await srv.pool.end();
  }
});

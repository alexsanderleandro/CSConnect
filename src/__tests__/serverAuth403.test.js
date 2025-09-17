const jwt = require('jsonwebtoken');
const request = require('supertest');

// Create a real JWT signed with the same SECRET fallback used by server.js
const SECRET = process.env.JWT_SECRET || 'csconnect_secret_key';

describe('Admin endpoints with valid token but non-admin user => 403', () => {
  const token = jwt.sign({ email: 'naoadmin@empresa.com' }, SECRET, { expiresIn: '1h' });

  test('DELETE /users/:id should return 403 for non-admin', async () => {
    let srv;
    jest.isolateModules(() => {
      srv = require('../../server');
      // mock pool.query on the isolated server instance
      srv.pool.query = jest.fn(async (text, params) => {
        if (params && params[0] === 'naoadmin@empresa.com') return { rows: [{ user_type: 'cliente', email: 'naoadmin@empresa.com' }] };
        return { rows: [] };
      });
    });
    const res = await request(srv.app).delete('/users/1').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
    if (srv.pool && typeof srv.pool.end === 'function') await srv.pool.end();
  });

  test('PUT /users/:id/type should return 403 for non-admin', async () => {
    let srv;
    jest.isolateModules(() => {
      srv = require('../../server');
      srv.pool.query = jest.fn(async (text, params) => {
        if (params && params[0] === 'naoadmin@empresa.com') return { rows: [{ user_type: 'cliente', email: 'naoadmin@empresa.com' }] };
        return { rows: [] };
      });
    });
    const res = await request(srv.app).put('/users/1/type').send({ user_type: 'cliente' }).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
    if (srv.pool && typeof srv.pool.end === 'function') await srv.pool.end();
  });

  test('PUT /users/:id/approve should return 403 for non-admin', async () => {
    let srv;
    jest.isolateModules(() => {
      srv = require('../../server');
      srv.pool.query = jest.fn(async (text, params) => {
        if (params && params[0] === 'naoadmin@empresa.com') return { rows: [{ user_type: 'cliente', email: 'naoadmin@empresa.com' }] };
        return { rows: [] };
      });
    });
    const res = await request(srv.app).put('/users/1/approve').send({ is_approved: true }).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
    if (srv.pool && typeof srv.pool.end === 'function') await srv.pool.end();
  });

  test('GET /api/smtp-config should return 403 for non-admin', async () => {
    let srv;
    jest.isolateModules(() => {
      srv = require('../../server');
      srv.pool.query = jest.fn(async (text, params) => {
        if (params && params[0] === 'naoadmin@empresa.com') return { rows: [{ user_type: 'cliente', email: 'naoadmin@empresa.com' }] };
        return { rows: [] };
      });
    });
    const res = await request(srv.app).get('/api/smtp-config').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
    if (srv.pool && typeof srv.pool.end === 'function') await srv.pool.end();
  });
});

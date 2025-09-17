const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    ['/register', '/login', '/approve', '/profile', '/users', '/online', '/departamentos', '/api/recuperar-senha', '/api/check-type-user'],
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
    })
  );
};

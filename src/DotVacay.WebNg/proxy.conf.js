const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5111',
      changeOrigin: true,
      secure: false,
      logLevel: 'debug'
    })
  );
}; 

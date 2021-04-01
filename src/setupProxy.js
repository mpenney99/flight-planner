
const { createProxyMiddleware } = require('http-proxy-middleware');
const createProxy = require('../lib/proxy');

const config = require('./config.json');

module.exports = createProxy(createProxyMiddleware, config);

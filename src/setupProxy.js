
const { createProxyMiddleware } = require('http-proxy-middleware');

const config = require('./config.json');

module.exports = function (app) {
    config.environments.forEach(({ id, api }) => {
        app.use(
            `/api/tracking/${id}`,
            createProxyMiddleware({
                logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'error',
                changeOrigin: true,
                target: api,
                pathRewrite: { [`^/api/tracking/${id}`]: '/api/tracking' }
            })
        );
    })
};

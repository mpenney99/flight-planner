module.exports = (createProxyMiddleware, config) => (app) => {
    config.environments.forEach(({ id, api }) => {
        app.use(
            `/api/tracking/${id}`,
            createProxyMiddleware({
                // logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'error',
                logLevel: 'debug',
                changeOrigin: true,
                target: api,
                pathRewrite: { [`^/api/tracking/${id}`]: '/api/tracking' },
                onProxyRes: (proxyRes, req, res) => {
                    // log original request and proxied request info
                    const exchange = `[${req.method}] [${proxyRes.statusCode}] ${req.path} -> ${proxyRes.req.protocol}//${proxyRes.req.host}${proxyRes.req.path}`;
                    console.log(exchange); // [GET] [200] / -> http://www.example.com
                }
            })
        );
    });
};

const express = require('express')
const setupProxy = require('../lib/proxy');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express()
const port = process.env.FP_SERVER_PORT || 3001;
const config = require('../src/config.json');

app.use(express.static(process.env.FP_SERVER_DIR || '../build'));
setupProxy(createProxyMiddleware, config)(app);

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
})

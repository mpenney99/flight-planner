const express = require('express');
const fetch = require('node-fetch');
const app = express();
const port = process.env.FP_SERVER_PORT || 3001;
const config = require('../src/config.json');

app.use(express.static(process.env.FP_SERVER_DIR || '../build'));

app.use(express.json());

app.post('/api/tracking/:id', (req, res) => {
    const id = req.params.id;
    const env = config.environments.find((env) => env.id === id);
    if (!env) {
        return res.status(400).send('unknown environment id');
    }

    fetch(`${env.api}/api/tracking`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
        },
        body: JSON.stringify(req.body)
    }).then((response) => {
        res.sendStatus(response.status);
    });
});

app.listen(port, () => {
    console.log(`Application started ...`);
});

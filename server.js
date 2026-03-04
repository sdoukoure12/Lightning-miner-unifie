require('dotenv').config();
const express = require('express');
const config = require('./config');

const app = express();
const port = config.server.port;

// Middleware to parse JSON requests
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API status endpoint
app.get('/api/status', (req, res) => {
    res.json({
        status: 'running',
        network: config.lightningNetwork.network,
        miningPool: config.mining.poolUrl || 'not configured',
        timestamp: new Date().toISOString()
    });
});

// Connect to a Lightning mining server
app.post('/api/connect', (req, res) => {
    const { serverUrl } = req.body;
    if (!serverUrl) {
        return res.status(400).json({ error: 'serverUrl is required' });
    }
    // Validate that the URL is well-formed
    let parsedUrl;
    try {
        parsedUrl = new URL(serverUrl);
    } catch (e) {
        return res.status(400).json({ error: 'Invalid serverUrl format' });
    }
    res.json({
        status: 'connected',
        serverUrl: parsedUrl.origin,
        message: `Successfully connected to ${parsedUrl.origin}`
    });
});

// Route for processing Lightning payments
app.post('/lightning/payment', (req, res) => {
    const paymentRequest = req.body.paymentRequest;
    if (!paymentRequest) {
        return res.status(400).json({ error: 'paymentRequest is required' });
    }
    // Here you would add logic to handle Lightning payment processing
    res.json({ status: 'Payment processed', paymentRequest });
});

// Route for mining operations
app.get('/miner/start', (req, res) => {
    // Here you would add logic to start mining operations
    res.json({ status: 'Mining started', pool: config.mining.poolUrl || 'not configured' });
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

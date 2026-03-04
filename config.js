// Configuration settings for BTCPay Server, Database, and Lightning Network
// Values are read from environment variables (set via .env file)

function parsePort(value, defaultPort) {
    const parsed = parseInt(value, 10);
    if (value !== undefined && value !== '' && (isNaN(parsed) || parsed < 1 || parsed > 65535)) {
        throw new Error(`Invalid port value: "${value}". Must be a number between 1 and 65535.`);
    }
    return isNaN(parsed) ? defaultPort : parsed;
}

const config = {
    server: {
        host: process.env.HOST || 'localhost',
        port: parsePort(process.env.PORT, 8080),
        nodeEnv: process.env.NODE_ENV || 'development'
    },
    btcpay: {
        server: process.env.BTCPAY_URL || '',
        apiKey: process.env.BTCPAY_API_KEY || '',
        storeId: process.env.BTCPAY_STORE_ID || '',
        token: process.env.BTCPAY_TOKEN || ''
    },
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: parsePort(process.env.DB_PORT, 5432),
        user: process.env.DB_USER || '',
        password: process.env.DB_PASS || '',
        name: process.env.DB_NAME || ''
    },
    lightningNetwork: {
        network: process.env.BITCOIN_NETWORK || 'testnet',
        nodeUrl: process.env.LIGHTNING_NODE_URL || 'http://localhost:8080',
        nodeToken: process.env.LIGHTNING_NODE_TOKEN || '',
        lnd: {
            host: process.env.LND_HOST || 'localhost:10009',
            macaroon: process.env.LND_MACAROON || '',
            cert: process.env.LND_CERT || ''
        }
    },
    mining: {
        poolUrl: process.env.MINING_POOL_URL || '',
        walletAddress: process.env.WALLET_ADDRESS || ''
    },
    security: {
        jwtSecret: process.env.JWT_SECRET || '',
        apiKey: process.env.API_KEY || ''
    }
};

module.exports = config;
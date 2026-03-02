// Configuration settings for BTCPay Server, Database, and Lightning Network

const config = {
    btcpay: {
        server: 'YOUR_BTCPAY_SERVER_URL',
        apiKey: 'YOUR_BTCPAY_API_KEY',
        token: 'YOUR_BTCPAY_TOKEN'
    },
    database: {
        host: 'YOUR_DATABASE_HOST',
        user: 'YOUR_DATABASE_USER',
        password: 'YOUR_DATABASE_PASSWORD',
        name: 'YOUR_DATABASE_NAME'
    },
    lightningNetwork: {
        network: 'YOUR_NETWORK_TYPE', // Mainnet or Testnet
        lnd: {
            host: 'YOUR_LND_HOST',
            macaroon: 'YOUR_LND_MACAROON',
            cert: 'YOUR_LND_CERT'
        }
    }
};

module.exports = config;
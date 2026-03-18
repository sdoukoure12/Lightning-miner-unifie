// Configuration settings for BTCPay Server, Database, and Lightning Network
const fs = require('fs');
const path = require('path');

/**
 * Validate a Lightning Network BOLT11 invoice or Bitcoin on-chain address.
 * Performs a basic format check (prefix and character set).  For production
 * use, consider a dedicated library such as `bolt11` or `bitcoinjs-lib` that
 * also verifies checksums.
 * @param {string} address - The address string to validate.
 * @returns {boolean} True if the address has a recognised format.
 */
function isValidAddress(address) {
    if (typeof address !== 'string' || address.trim() === '') return false;
    // BOLT11 invoices: lnbc (mainnet), lntb (testnet), lnbcrt (regtest)
    if (/^ln(bc|tb|bcrt)[0-9a-z]+$/i.test(address)) return true;
    // Bitcoin on-chain: P2PKH (1…), P2SH (3…), bech32 (bc1…), bech32m (bc1p…)
    if (/^(1|3|bc1)[a-zA-HJ-NP-Z0-9]{25,90}$/.test(address)) return true;
    return false;
}

/**
 * Load wallet configurations from a JSON file.
 * @param {string} filePath - Absolute or relative path to the wallets JSON file.
 * @returns {Array<Object>} Array of wallet configuration objects (may be empty).
 */
function loadWalletsFromFile(filePath) {
    try {
        const resolved = path.resolve(filePath);
        const raw = fs.readFileSync(resolved, 'utf8');
        const data = JSON.parse(raw);
        if (!Array.isArray(data)) {
            console.warn(`[config] wallets file does not contain an array – skipping: ${resolved}`);
            return [];
        }
        return data;
    } catch (err) {
        if (err.code !== 'ENOENT') {
            console.warn(`[config] could not load wallets file (${filePath}): ${err.message}`);
        }
        return [];
    }
}

/**
 * Load wallet configurations from environment variables.
 * Supports WALLET_1 … WALLET_N where each value is a JSON object string, e.g.
 *   WALLET_1={"name":"My wallet","address":"lnbc...","type":"lightning","pool":"braiins","worker":"rig1","threshold":0.0005}
 * @returns {Array<Object>} Array of wallet configuration objects (may be empty).
 */
function loadWalletsFromEnv() {
    const wallets = [];
    let i = 1;
    while (process.env[`WALLET_${i}`]) {
        try {
            const wallet = JSON.parse(process.env[`WALLET_${i}`]);
            wallets.push(wallet);
        } catch (err) {
            console.warn(`[config] could not parse WALLET_${i} env var: ${err.message}`);
        }
        i++;
    }
    return wallets;
}

/**
 * Resolve the wallet list, preferring:
 *   1. Environment variables (WALLET_1, WALLET_2, …)
 *   2. A JSON file at WALLETS_CONFIG_FILE env var or the default `wallets.json`
 * @returns {Array<Object>} Validated wallet configuration objects.
 */
function resolveWallets() {
    let wallets = loadWalletsFromEnv();

    if (wallets.length === 0) {
        const configFile = process.env.WALLETS_CONFIG_FILE || path.join(__dirname, 'wallets.json');
        wallets = loadWalletsFromFile(configFile);
    }

    // Validate each wallet entry
    return wallets.filter(w => {
        if (!w || typeof w !== 'object') return false;
        if (!isValidAddress(w.address)) {
            console.warn(`[config] skipping wallet with invalid address: ${w.address}`);
            return false;
        }
        return true;
    });
}

const config = {
    btcpay: {
        server: process.env.BTCPAY_SERVER || '',
        apiKey: process.env.BTCPAY_API_KEY || '',
        token: process.env.BTCPAY_TOKEN || ''
    },
    database: {
        host: process.env.DB_HOST || '',
        user: process.env.DB_USER || '',
        password: process.env.DB_PASS || '',
        name: process.env.DB_NAME || ''
    },
    lightningNetwork: {
        network: process.env.LN_NETWORK || 'mainnet',
        lnd: {
            host: process.env.LND_HOST || '',
            macaroon: process.env.LND_MACAROON || '',
            cert: process.env.LND_CERT || ''
        }
    },
    /** Path searched for wallets.json when no env vars supply wallets. */
    walletsConfigFile: process.env.WALLETS_CONFIG_FILE || path.join(__dirname, 'wallets.json')
};

module.exports = config;
module.exports.isValidAddress = isValidAddress;
module.exports.resolveWallets = resolveWallets;
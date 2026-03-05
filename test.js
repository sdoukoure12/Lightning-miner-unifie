// test.js – basic unit tests for config helpers and LightningMinerUnified
// Uses Node.js built-in assert module (no extra dependencies required).

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const os = require('os');

// ── helpers ──────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function test(description, fn) {
    try {
        fn();
        console.log(`  ✅ ${description}`);
        passed++;
    } catch (err) {
        console.error(`  ❌ ${description}`);
        console.error(`     ${err.message}`);
        failed++;
    }
}

// ── isValidAddress ────────────────────────────────────────────────────────────

console.log('\n🔍 isValidAddress');
const { isValidAddress } = require('./config');

test('accepts mainnet BOLT11 invoice (lnbc…)', () => {
    assert.strictEqual(isValidAddress('lnbc1p5e8qvdpp5abc123'), true);
});

test('accepts testnet BOLT11 invoice (lntb…)', () => {
    assert.strictEqual(isValidAddress('lntb500u1pabc123'), true);
});

test('accepts bech32 on-chain address (bc1…)', () => {
    assert.strictEqual(isValidAddress('bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq'), true);
});

test('accepts legacy P2PKH address (1…)', () => {
    assert.strictEqual(isValidAddress('1A1zP1eP5QGefi2DMPTfTL5SLmv7Divf'), true);
});

test('rejects empty string', () => {
    assert.strictEqual(isValidAddress(''), false);
});

test('rejects null', () => {
    assert.strictEqual(isValidAddress(null), false);
});

test('rejects arbitrary string', () => {
    assert.strictEqual(isValidAddress('not-an-address'), false);
});

// ── resolveWallets ────────────────────────────────────────────────────────────

console.log('\n🔍 resolveWallets – env var source');
const { resolveWallets } = require('./config');

test('loads wallets from WALLET_1 env var', () => {
    process.env.WALLET_1 = JSON.stringify({
        name: 'Test Lightning',
        address: 'lnbc1ptest123abc',
        type: 'lightning',
        pool: 'braiins',
        worker: 'rig1',
        threshold: 0.0005
    });

    const wallets = resolveWallets();
    assert.ok(wallets.length >= 1, 'should have at least one wallet');
    assert.strictEqual(wallets[0].name, 'Test Lightning');

    delete process.env.WALLET_1;
});

test('skips wallet with invalid address', () => {
    process.env.WALLET_1 = JSON.stringify({
        name: 'Bad wallet',
        address: 'not-valid',
        type: 'lightning',
        pool: 'braiins',
        worker: 'rig1'
    });

    const wallets = resolveWallets();
    assert.strictEqual(wallets.length, 0, 'invalid wallet should be filtered out');

    delete process.env.WALLET_1;
});

test('loads wallets from a JSON file when env vars absent', () => {
    const tmpFile = path.join(os.tmpdir(), `wallets-test-${Date.now()}.json`);
    fs.writeFileSync(tmpFile, JSON.stringify([
        { name: 'File wallet', address: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq', type: 'onchain', pool: 'mara', worker: 'rig1', threshold: 0.005 }
    ]));

    process.env.WALLETS_CONFIG_FILE = tmpFile;
    const wallets = resolveWallets();
    assert.strictEqual(wallets.length, 1);
    assert.strictEqual(wallets[0].name, 'File wallet');

    delete process.env.WALLETS_CONFIG_FILE;
    fs.unlinkSync(tmpFile);
});

test('returns empty array when config file is missing', () => {
    process.env.WALLETS_CONFIG_FILE = path.join(os.tmpdir(), 'nonexistent-wallets-12345.json');
    const wallets = resolveWallets();
    assert.deepStrictEqual(wallets, []);
    delete process.env.WALLETS_CONFIG_FILE;
});

// ── LightningMinerUnified ─────────────────────────────────────────────────────

console.log('\n🔍 LightningMinerUnified');
const LightningMinerUnified = require('./lightning-miner-unifie');

test('constructs with empty wallets when no config provided', () => {
    // Ensure no env wallets and no wallets.json at default location
    delete process.env.WALLET_1;
    delete process.env.WALLETS_CONFIG_FILE;

    const miner = new LightningMinerUnified();
    assert.ok(Array.isArray(miner.wallets));
});

test('addWallet accepts a valid Lightning address', () => {
    const miner = new LightningMinerUnified();
    const result = miner.addWallet({
        name: 'Dynamic wallet',
        address: 'lnbc1ptest999abc',
        type: 'lightning',
        pool: 'braiins',
        worker: 'rig99',
        threshold: 0.001
    });
    assert.strictEqual(result, true);
    assert.ok(miner.wallets.some(w => w.name === 'Dynamic wallet'));
});

test('addWallet rejects an invalid address', () => {
    const miner = new LightningMinerUnified();
    const before = miner.wallets.length;
    const result = miner.addWallet({ name: 'Bad', address: 'invalid!', type: 'lightning', pool: 'braiins', worker: 'rig0' });
    assert.strictEqual(result, false);
    assert.strictEqual(miner.wallets.length, before);
});

test('addWallet initializes btc to 0', () => {
    const miner = new LightningMinerUnified();
    miner.addWallet({ name: 'W', address: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq', type: 'onchain', pool: 'mara', worker: 'rig1' });
    const w = miner.wallets.find(x => x.name === 'W');
    assert.strictEqual(w.btc, 0);
});

test('removeWallet removes by address', () => {
    const miner = new LightningMinerUnified();
    const addr = 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq';
    miner.addWallet({ name: 'ToRemove', address: addr, type: 'onchain', pool: 'mara', worker: 'rig1' });
    const removed = miner.removeWallet(addr);
    assert.strictEqual(removed, true);
    assert.ok(!miner.wallets.some(w => w.address === addr));
});

test('removeWallet returns false for unknown address', () => {
    const miner = new LightningMinerUnified();
    const result = miner.removeWallet('bc1qunknownaddress00000000000000000000000000');
    assert.strictEqual(result, false);
});

// ── summary ───────────────────────────────────────────────────────────────────

console.log(`\n${'─'.repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);

if (failed > 0) {
    process.exit(1);
}

# Copilot Instructions for Lightning-miner-unifie (Lightning Miner Unified)

## Project Overview

This is a Node.js application that simulates and manages Bitcoin Lightning Network mining operations. It supports 6 wallet addresses (5 Lightning + 1 on-chain) and 8 Bitcoin mining pools (Braiins, ViaBTC, F2Pool, Binance, Luxor, MARA, Poolin, Antpool).

## Repository Structure

- `lightning-miner-unifie.js` — Main miner application with interactive CLI menu, wallet management, pool selection, and simulated mining
- `server.js` — Express HTTP server exposing REST endpoints for Lightning payments and miner control
- `btcpay-server.js` — BTCPay Server integration logic
- `lightning-pay-server-list.js` — List of Lightning payment servers
- `config.js` — Configuration template for BTCPay Server, database, and Lightning Network (LND) credentials
- `netdata.json` — Netdata monitoring configuration
- `.env.example` — Example environment variables
- `INSTALL.md` — Installation guide
- `.github/workflows/node.js.yml` — CI workflow running on Node.js 18.x, 20.x, and 22.x

## Setup & Running

```bash
# Install dependencies
npm install

# Start the miner CLI
node lightning-miner-unifie.js

# Start the HTTP server
node server.js
```

## Testing

There are currently no automated tests. The CI workflow runs `npm test`, which exits with an error by design until tests are added. When adding tests, use a Node.js-compatible test framework (e.g., Jest or Node's built-in `node:test`) and update the `"test"` script in `package.json`.

## Code Style & Conventions

- **Language**: JavaScript (Node.js), CommonJS modules (`require`/`module.exports`)
- **Dependencies**: Keep dependencies minimal; currently only `axios` and `express` are used
- **Secrets**: Never hardcode real credentials, wallet addresses, API keys, or macaroons in source files. Use environment variables (see `.env.example`) or the `config.js` template
- **Comments**: The existing codebase uses inline comments in French (the project author's language). New contributions may use English for broader accessibility; both are acceptable
- **Error handling**: Always validate user input and handle async errors with try/catch or `.catch()`

## Key Architecture Notes

- `LightningMinerV2` class (in `lightning-miner-unifie.js`) manages all wallets, pools, and mining simulation state
- Pool selection is per-wallet; each wallet independently tracks its BTC balance and payment threshold
- The HTTP server (`server.js`) is separate from the CLI miner and can run independently
- Config values (BTCPay server, database, LND) are loaded from `config.js`; replace placeholder values with environment variables before deploying

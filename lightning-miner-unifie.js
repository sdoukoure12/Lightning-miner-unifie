// lightning-miner-unifie.js
const axios = require('axios');
const fs = require('fs');
const readline = require('readline');
const { exec } = require('child_process');
const { resolveWallets, isValidAddress } = require('./config');

/**
 * LightningMinerUnified – manages multiple Bitcoin/Lightning wallets across
 * various mining pools.  Wallet configuration is loaded at start-up from
 * environment variables or a `wallets.json` file; no addresses are hard-coded
 * in source.
 */
class LightningMinerUnified {
    constructor() {
        // Load wallets from configuration (env vars or wallets.json)
        this.wallets = this._initWallets();

        // === 8 POOLS AVEC LEURS CARACTÉRISTIQUES ===
        this.pools = {
            braiins: {
                name: 'Braiins Pool',
                url: 'stratum+tcp://btc.braiins.com:3333',
                api: 'https://pool.braiins.com',
                lightning: true,
                onchain: true,
                threshold: 0.0005,
                fee: '2%',
                multiplier: 1.2,
                description: '✅ Paiements Lightning instantanés (0 frais)'
            },
            viabtc: {
                name: 'ViaBTC',
                url: 'stratum+tcp://btc.viabtc.com:25',
                api: 'https://api.viabtc.com',
                lightning: true,
                onchain: true,
                threshold: 0.001,
                fee: '2%',
                multiplier: 1.1,
                description: '✅ Support Lightning via Boltz'
            },
            f2pool: {
                name: 'F2Pool',
                url: 'stratum+tcp://btc.f2pool.com:3333',
                api: 'https://api.f2pool.com',
                lightning: true,
                onchain: true,
                threshold: 0.005,
                fee: '2.5%',
                multiplier: 0.9,
                description: '✅ Lightning en testnet'
            },
            binance: {
                name: 'Binance Pool',
                url: 'stratum+tcp://sha256.pool.binance.com:3333',
                api: 'https://pool.binance.com',
                lightning: true,
                onchain: true,
                threshold: 0.001,
                fee: '2.5%',
                multiplier: 1.15,
                description: '✅ Intégration Lightning native'
            },
            luxor: {
                name: 'Luxor Mining',
                url: 'stratum+tcp://stratum.luxor.tech:3333',
                api: 'https://api.luxor.tech',
                lightning: true,
                onchain: true,
                threshold: 0.001,
                fee: '2%',
                multiplier: 1.05,
                description: '✅ Paiements Lightning via Poolin'
            },
            mara: {
                name: 'Mara Pool',
                url: 'stratum+tcp://pool.marapool.com:3333',
                api: 'https://api.marapool.com',
                lightning: true,
                onchain: true,
                threshold: 0.005,
                fee: '1.5%',
                multiplier: 0.95,
                description: '✅ Support Lightning en beta'
            },
            poolin: {
                name: 'Poolin',
                url: 'stratum+tcp://btc.poolin.com:3333',
                api: 'https://api.poolin.com',
                lightning: true,
                onchain: true,
                threshold: 0.001,
                fee: '2%',
                multiplier: 1.0,
                description: '✅ Paiements Lightning disponibles'
            },
            antpool: {
                name: 'Antpool',
                url: 'stratum+tcp://btc.antpool.com:25',
                api: 'https://api.antpool.com',
                lightning: true,
                onchain: true,
                threshold: 0.005,
                fee: '2%',
                multiplier: 0.85,
                description: '✅ Lightning en développement'
            }
        };

        this.stats = {
            totalBTC: 0,
            startTime: new Date(),
            shares: 0,
            lastBackup: null
        };

        this.miningProcess = null;
        this.configFile = process.env.CONFIG_FILE || '/sdcard/lightning-miner-config.json';
    }

    /**
     * Initialise the wallet list from environment variables or wallets.json.
     * Each entry is normalised to include `btc: 0` if not already present.
     * @returns {Array<Object>} Array of wallet objects.
     */
    _initWallets() {
        const loaded = resolveWallets();
        if (loaded.length === 0) {
            console.warn('[LightningMinerUnified] No wallets loaded. ' +
                'Create wallets.json or set WALLET_1 … WALLET_N environment variables.');
        }
        return loaded.map(w => Object.assign({ btc: 0 }, w));
    }

    /**
     * Add a wallet at runtime.
     * @param {Object} wallet - Wallet configuration object (must include `address`).
     * @returns {boolean} True if the wallet was added, false if validation failed.
     */
    addWallet(wallet) {
        if (!wallet || !isValidAddress(wallet.address)) {
            console.error('[LightningMinerUnified] addWallet: invalid address.');
            return false;
        }
        this.wallets.push(Object.assign({ btc: 0 }, wallet));
        return true;
    }

    /**
     * Remove a wallet at runtime by address.
     * @param {string} address - The wallet address to remove.
     * @returns {boolean} True if a wallet was removed.
     */
    removeWallet(address) {
        const before = this.wallets.length;
        this.wallets = this.wallets.filter(w => w.address !== address);
        return this.wallets.length < before;
    }

    // Affichage du menu principal
    showMenu() {
        console.clear();
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const count = this.wallets.length;
        console.log(`\n=== ⚡ LIGHTNING MINER UNIFIÉ - ${count} ADRESSE(S) ⚡ ===`);
        console.log('1. 📋 Voir toutes mes adresses');
        console.log('2. 🔄 Changer de pool pour une adresse');
        console.log('3. 📊 Voir les statistiques en temps réel');
        console.log('4. ⚡ Démarrer le minage (simulation)');
        console.log('5. 💰 Configurer les seuils de paiement');
        console.log('6. 🌐 Voir les pools disponibles');
        console.log('7. 💾 Sauvegarder configuration');
        console.log('8. 📤 Exporter vers GitHub');
        console.log('9. 🚪 Quitter');
        console.log('============================================\n');

        rl.question('Votre choix: ', (choice) => {
            switch(choice) {
                case '1': this.showAllAddresses(); break;
                case '2': this.changePool(); break;
                case '3': this.showStats(); break;
                case '4': this.startMining(); rl.close(); return;
                case '5': this.configureThresholds(); break;
                case '6': this.showPools(); break;
                case '7': this.backupConfig(); break;
                case '8': this.exportToGithub(); break;
                case '9': console.log('👋 Au revoir!'); process.exit(0);
                default: console.log('❌ Choix invalide');
            }
            rl.close();
            setTimeout(() => this.showMenu(), 1000);
        });
    }

    // Afficher toutes les adresses avec leurs soldes
    showAllAddresses() {
        const count = this.wallets.length;
        console.log(`\n📋 VOS ${count} ADRESSE(S) CONFIGURÉE(S)`);
        console.log('==============================================');

        if (count === 0) {
            console.log('⚠️  Aucune adresse configurée. Créez wallets.json ou définissez WALLET_1 … WALLET_N.');
            return;
        }

        let total = 0;
        this.wallets.forEach((wallet, index) => {
            const typeIcon = wallet.type === 'lightning' ? '⚡' : '🔗';
            console.log(`\n${typeIcon} ${wallet.name}:`);
            console.log(`   📍 ${wallet.address.substring(0, 50)}...`);
            console.log(`   🔧 Worker: ${wallet.worker}`);
            const pool = this.pools[wallet.pool];
            console.log(`   🌐 Pool: ${pool ? pool.name : wallet.pool}`);
            console.log(`   💰 BTC: ${wallet.btc.toFixed(8)} (${Math.floor(wallet.btc*100000000)} sats)`);
            if (wallet.type === 'lightning') {
                console.log(`   ⚡ Paiement Lightning possible à partir de 1 satoshi`);
            } else {
                console.log(`   🔗 Paiement on-chain à partir de ${wallet.threshold} BTC`);
            }
            total += wallet.btc;
        });
        
        console.log(`\n💰 TOTAL GLOBAL: ${total.toFixed(8)} BTC`);
        console.log(`⚡ SATOSHIS TOTAUX: ${Math.floor(total*100000000)} sats`);
    }

    // Afficher la liste des pools
    showPools() {
        console.log('\n🌐 POOLS DISPONIBLES');
        console.log('====================');
        Object.keys(this.pools).forEach(key => {
            const p = this.pools[key];
            console.log(`\n${p.name}:`);
            console.log(`   📡 URL: ${p.url}`);
            console.log(`   🎯 Seuil par défaut: ${p.threshold} BTC`);
            console.log(`   💸 Frais: ${p.fee}`);
            console.log(`   ⚡ Lightning: ${p.lightning ? 'Oui' : 'Non'}`);
            console.log(`   🔗 On-chain: ${p.onchain ? 'Oui' : 'Non'}`);
            console.log(`   📝 ${p.description}`);
        });
    }

    // Changer le pool d'une adresse
    changePool() {
        console.log('\n🔄 CHANGEMENT DE POOL');
        this.showAllAddresses();
        
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        rl.question(`\nChoisir une adresse (1-${this.wallets.length}): `, (addrIdx) => {
            const idx = parseInt(addrIdx) - 1;
            if (idx < 0 || idx >= this.wallets.length) {
                console.log('❌ Adresse invalide');
                rl.close();
                return;
            }

            console.log('\nPools disponibles:');
            const poolKeys = Object.keys(this.pools);
            poolKeys.forEach((key, i) => {
                console.log(`${i+1}. ${this.pools[key].name}`);
            });

            rl.question('\nChoisir un pool: ', (poolIdx) => {
                const pidx = parseInt(poolIdx) - 1;
                if (pidx < 0 || pidx >= poolKeys.length) {
                    console.log('❌ Pool invalide');
                } else {
                    const newPool = poolKeys[pidx];
                    this.wallets[idx].pool = newPool;
                    console.log(`✅ Adresse ${addrIdx} maintenant sur ${this.pools[newPool].name}`);
                }
                rl.close();
            });
        });
    }

    // Démarrer la simulation de minage
    startMining() {
        console.clear();
        const count = this.wallets.length;
        console.log('\n=== ⚡ MINAGE SIMULÉ DÉMARRÉ ⚡ ===');
        console.log(`✅ ${count} adresse(s) active(s)`);
        console.log('✅ Pools configurés individuellement');
        console.log('✅ Paiements automatiques aux seuils');
        console.log('📊 Mise à jour toutes les 5 secondes\n');

        this.miningProcess = setInterval(() => {
            // Simuler des gains pour chaque adresse
            this.wallets.forEach(wallet => {
                const pool = this.pools[wallet.pool];
                const multiplier = pool ? pool.multiplier : 1.0;
                const gain = 0.000000015 * multiplier * Math.random();
                wallet.btc += gain;
                this.stats.shares++;
            });

            this.stats.totalBTC = this.wallets.reduce((sum, w) => sum + w.btc, 0);
            this.displayMiningStats();

            // Sauvegarde automatique toutes les 5 minutes
            if (Math.floor(Date.now() / 1000) % 300 === 0) {
                this.autoBackup();
            }
        }, 5000);
    }

    // Afficher les stats pendant le minage
    displayMiningStats() {
        console.clear();
        console.log(`=== ⚡ MINAGE EN COURS - ${this.wallets.length} ADRESSE(S) ⚡ ===`);
        console.log(`📅 ${new Date().toLocaleString()}`);
        
        let total = 0;
        this.wallets.forEach((wallet, index) => {
            const sats = Math.floor(wallet.btc * 100000000);
            const pool = this.pools[wallet.pool];
            const seuil = pool ? pool.threshold : (wallet.threshold || 0);
            const poolName = pool ? pool.name : wallet.pool;
            const depasse = wallet.btc >= seuil ? '🎯 SEUIL ATTEINT!' : '';
            console.log(`\n${index+1}. ${wallet.name} (${poolName}):`);
            console.log(`   💰 ${wallet.btc.toFixed(8)} BTC (${sats} sats) ${depasse}`);
            total += wallet.btc;
        });
        
        console.log('\n' + '='.repeat(60));
        console.log(`💰 TOTAL: ${total.toFixed(8)} BTC`);
        console.log(`⚡ SATOSHIS: ${Math.floor(total*100000000)} sats`);
        console.log(`✅ SHARES: ${this.stats.shares}`);
        console.log('='.repeat(60));
        console.log('⏱️  Mise à jour: 5s • Ctrl+C pour arrêter');
    }

    // Statistiques générales
    showStats() {
        const now = new Date();
        const runtime = Math.floor((now - this.stats.startTime) / 1000);
        const hours = Math.floor(runtime / 3600);
        const minutes = Math.floor((runtime % 3600) / 60);
        
        console.log('\n📊 STATISTIQUES');
        console.log('================');
        console.log(`⏱️  Temps écoulé: ${hours}h ${minutes}m`);
        console.log(`✅ Shares: ${this.stats.shares}`);
        
        let total = this.wallets.reduce((sum, w) => sum + w.btc, 0);
        console.log(`💰 BTC total: ${total.toFixed(8)}`);
        console.log(`⚡ Satoshis: ${Math.floor(total*100000000)}`);
        
        if (runtime > 0) {
            const btcPerHour = (total * 3600 / runtime).toFixed(8);
            console.log(`📈 Moyenne: ${btcPerHour} BTC/heure`);
        }
    }

    // Configuration des seuils
    configureThresholds() {
        console.log('\n💰 SEUILS DE PAIEMENT PAR DÉFAUT');
        console.log('=================================');
        this.wallets.forEach((wallet, i) => {
            const pool = this.pools[wallet.pool];
            if (pool) {
                console.log(`${i+1}. ${wallet.name} → ${pool.threshold} BTC (pool ${pool.name})`);
            } else {
                console.log(`${i+1}. ${wallet.name} → ${wallet.threshold || 'N/A'} BTC (pool inconnu: ${wallet.pool})`);
            }
        });
        console.log('\n⚡ Pour les adresses Lightning, tu peux retirer à partir de 1 satoshi sur Braiins.');
        console.log('🔗 Pour les adresses on-chain, les seuils sont ceux du pool choisi.\n');
    }

    // Sauvegarde locale
    backupConfig() {
        const backup = {
            timestamp: new Date().toISOString(),
            wallets: this.wallets.map(w => ({
                name: w.name,
                address: w.address,
                type: w.type,
                pool: w.pool,
                worker: w.worker,
                btc: w.btc
            })),
            pools: this.pools,
            stats: this.stats
        };
        
        fs.writeFileSync(this.configFile, JSON.stringify(backup, null, 2));
        console.log(`\n✅ Configuration sauvegardée dans ${this.configFile}`);
    }

    // Sauvegarde automatique
    autoBackup() {
        const backup = {
            timestamp: new Date().toISOString(),
            wallets: this.wallets.map(w => ({
                address: w.address,
                pool: w.pool,
                btc: w.btc
            }))
        };
        fs.writeFileSync('/sdcard/lightning-autobackup.json', JSON.stringify(backup, null, 2));
        console.log('\n💾 Sauvegarde auto effectuée');
    }

    // Export GitHub
    exportToGithub() {
        console.log('\n📤 EXPORT VERS GITHUB');
        console.log('=====================');
        console.log('Pour pousser ce script sur GitHub, exécute :\n');
        console.log('cd ~/lightning-miner');
        console.log('git init');
        console.log('git add lightning-miner-unifie.js');
        console.log('git commit -m "Ajout du script unifié"');
        console.log('git branch -M main');
        console.log('git remote add origin https://github.com/sdoukoure12/lightning-miner.git');
        console.log('git push -u origin main\n');
        console.log('(Utilise ton token GitHub comme mot de passe)\n');
    }

    // Arrêt propre
    stopMining() {
        if (this.miningProcess) {
            clearInterval(this.miningProcess);
            console.log('\n⛔ Minage arrêté');
            this.backupConfig();
        }
    }
}

module.exports = LightningMinerUnified;

// Only run the interactive menu when executed directly (not when required as a module)
if (require.main === module) {
    const miner = new LightningMinerUnified();

    process.on('SIGINT', () => {
        miner.stopMining();
        process.exit();
    });

    miner.showMenu();
}
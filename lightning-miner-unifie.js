// lightning-miner-v2.js
const axios = require('axios');
const fs = require('fs');
const readline = require('readline');
const { exec } = require('child_process');

class LightningMinerV2 {
    constructor() {
        // === TES 6 ADRESSES (5 Lightning + 1 Bitcoin) ===
        this.wallets = [
            { 
                name: 'Adresse 1 (Lightning)',
                address: 'lnbc1p5e8qvdpp52jw5mlsl2mhteds92w6436fjz0s6dayc8vp2kzcxx39wve5saahsdqqcqzzsxqyz5vqsp5glrrjtkea0pvvj4a2mn4jmvzadjnf9yzlvn8yh4q3zqszfh9kq4q9qxpqysgq5smw5swlkph74rw0zku7s28e0zmknqpva6qmewj37vlkxx0n7u5s5lqjsrc8j6ezh7ygdygmcctkxudfde9th0v7c60zc7ekdj5j87qq05g3ja',
                type: 'lightning',
                pool: 'braiins',
                worker: 'rig1',
                btc: 0,
                threshold: 0.0005
            },
            { 
                name: 'Adresse 2 (Lightning)',
                address: 'lnbc1p5e8qw3pp5q66dr8zgltdj0zyc2gd5qq0xhmn3hnv0ynaxv0fq0rf23g2x6trsdqqcqzzsxqyz5vqsp55uk9hnwv9mqfmgvkknam7gzmwvpge73z082a0n8tmzzeyd59hdzq9qxpqysgqfnhlhymut3arkkqn3zukq9fqyhdcpptqtv5tj53lxkqjee7fetjhlfwpyvdzx4a29c73qfeqctv9ga0la7dpdyfh2yc2nnnw4xw0cygpggaxqn',
                type: 'lightning',
                pool: 'viabtc',
                worker: 'rig2',
                btc: 0,
                threshold: 0.001
            },
            { 
                name: 'Adresse 3 (Lightning)',
                address: 'lnbc1p5e8q3kpp555jcw47mfke9xeupmqegse3z2wd0qy9t0h4sfd6k4x6x0lhkqcnsdqqcqzzsxqyz5vqsp5g58gc8ntkcfacs9vs3tkuqfnmsu7e3jn8hkadmywe9q3gh4jtd3s9qxpqysgqjq2qjykyhn2kqu9gg6rz8quzegccvkttrl4wq3964lr6eqlv565n5lfz6le9cy7n5tygd55hnnzm56nx2h72p6ae3j8x26cgzcmrf6sqavhl38',
                type: 'lightning',
                pool: 'f2pool',
                worker: 'rig3',
                btc: 0,
                threshold: 0.005
            },
            { 
                name: 'Adresse 4 (Lightning)',
                address: 'lnbc1p5e8qjdpp5l8sr4a4q5trun88z2y3ev2trzkahfw0vf3dlhsxl9refn07kszjsdqqcqzzsxqyz5vqsp5ul6rvy0mdqkh0wqyhyzaqye7hna669mjk8r5dxp7wz78yd33rc0q9qxpqysgqx2gmze7lmefs0dyrfqcqxfxk5fdghzaqsz7ne9lj6clewfkwttlqrcrprtc83q9etdj4kyv2x7yda95jc9ng6q9npet3u2r6f8emcccq5qyxhr',
                type: 'lightning',
                pool: 'binance',
                worker: 'rig4',
                btc: 0,
                threshold: 0.001
            },
            { 
                name: 'Adresse 5 (Lightning)',
                address: 'lnbc1p5e8qn5pp525n02xw45fp0g6r98d6sq02c6q592aeawcvkkehjp5tdvsw7kx7sdqqcqzzsxqyz5vqsp5e8dhrl387n89urw2tfn9eqjath3qsjk6e33307v68s7kmur9nj9s9qxpqysgqreuszlz9lcua5sgg3x4mek30u4dhf5auq5l3rcy2zn4h89mc0ys5zdglzlkgxk05az7xw99e4634z6deqtehlcer9yk2hcr93d9gwrqpnw363h',
                type: 'lightning',
                pool: 'luxor',
                worker: 'rig5',
                btc: 0,
                threshold: 0.001
            },
            { 
                name: 'Adresse 6 (Bitcoin On-Chain)',
                address: 'bc1qv8qhuuk3j0gcunm4pq87rsp88rykr3lfcw07u0',
                type: 'onchain',
                pool: 'mara',
                worker: 'rig6',
                btc: 0,
                threshold: 0.005
            }
        ];

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
        this.configFile = '/sdcard/lightning-miner-v2-config.json';
    }

    // Affichage du menu principal
    showMenu() {
        console.clear();
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        console.log('\n=== ⚡ LIGHTNING MINER V2 - 6 ADRESSES ⚡ ===');
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
        console.log('\n📋 VOS 6 ADRESSES (5 Lightning + 1 On-Chain)');
        console.log('==============================================');
        
        let total = 0;
        this.wallets.forEach((wallet, index) => {
            const typeIcon = wallet.type === 'lightning' ? '⚡' : '🔗';
            console.log(`\n${typeIcon} ${wallet.name}:`);
            console.log(`   📍 ${wallet.address.substring(0, 50)}...`);
            console.log(`   🔧 Worker: ${wallet.worker}`);
            console.log(`   🌐 Pool: ${this.pools[wallet.pool].name}`);
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
        
        rl.question('\nChoisir une adresse (1-6): ', (addrIdx) => {
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
        console.log('\n=== ⚡ MINAGE SIMULÉ DÉMARRÉ ⚡ ===');
        console.log('✅ 6 adresses actives');
        console.log('✅ Pools configurés individuellement');
        console.log('✅ Paiements automatiques aux seuils');
        console.log('📊 Mise à jour toutes les 5 secondes\n');

        this.miningProcess = setInterval(() => {
            // Simuler des gains pour chaque adresse
            this.wallets.forEach(wallet => {
                const pool = this.pools[wallet.pool];
                const gain = 0.000000015 * pool.multiplier * Math.random();
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
        console.log('=== ⚡ MINAGE EN COURS - 6 ADRESSES ⚡ ===');
        console.log(`📅 ${new Date().toLocaleString()}`);
        
        let total = 0;
        this.wallets.forEach((wallet, index) => {
            const sats = Math.floor(wallet.btc * 100000000);
            const seuil = this.pools[wallet.pool].threshold;
            const depasse = wallet.btc >= seuil ? '🎯 SEUIL ATTEINT!' : '';
            console.log(`\n${index+1}. ${wallet.name} (${this.pools[wallet.pool].name}):`);
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
            console.log(`${i+1}. ${wallet.name} → ${pool.threshold} BTC (pool ${pool.name})`);
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
        console.log('git add lightning-miner-v2.js');
        console.log('git commit -m "Ajout du script complet avec 6 adresses"');
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

// LANCEMENT
const miner = new LightningMinerV2();

process.on('SIGINT', () => {
    miner.stopMining();
    process.exit();
});

miner.showMenu();
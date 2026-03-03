# Guide d'Installation Complet

Guide détaillé pour installer et configurer Lightning-miner-unifie sur votre système.

## Table des matières

1. [Prérequis](#prérequis)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Vérification](#vérification)
5. [Dépannage](#dépannage)

## Prérequis

### Système d'exploitation
- Linux (Ubuntu 20.04+ recommandé)
- macOS 10.14+
- Windows 10+ (avec WSL2)

### Logiciels requis

#### Node.js et npm

```bash
# Vérifier les versions installées
node --version  # >= 14.0.0
npm --version   # >= 6.0.0

# Installer Node.js (si nécessaire)
# Sur Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Sur macOS (avec Homebrew)
brew install node

# Sur Windows
# Télécharger depuis https://nodejs.org/
```

#### Git
```bash
# Vérifier l'installation
git --version

# Installer Git
# Ubuntu/Debian
sudo apt-get install git

# macOS
brew install git

# Windows
# Télécharger depuis https://git-scm.com/
```

### Accès Internet
- Connexion stable requise
- Accès à GitHub
- Accès à Lightning Network

## Installation

### Étape 1 : Cloner le dépôt

```bash
git clone git@github.com:sdoukoure12/Lightning-miner-unifie.git
cd Lightning-miner-unifie
```

**Alternative HTTPS** (si SSH n'est pas configuré):
```bash
git clone https://github.com/sdoukoure12/Lightning-miner-unifie.git
cd Lightning-miner-unifie
```

### Étape 2 : Installer les dépendances

```bash
npm install
```

Cela va :
- Télécharger et installer toutes les dépendances
- Créer le dossier `node_modules/`
- Générer `package-lock.json`

**Troubleshooting**:
```bash
# Si des erreurs apparaissent
npm cache clean --force
rm -rf node_modules
npm install

# Ou avec npm ci (recommandé en production)
npm ci
```

### Étape 3 : Configuration de l'environnement

```bash
# Copier le fichier example
cp .env.example .env

# Éditer le fichier .env
nano .env
# ou
vim .env
# ou
code .env  # VS Code
```

**Paramètres essentiels à configurer**:

```env
PORT=3000
NODE_ENV=development

# Bitcoin Configuration
BITCOIN_NETWORK=testnet  # Utiliser testnet d'abord

# BTC Pay (si vous l'utilisez)
BTCPAY_URL=https://your-btcpay-instance.com
BTCPAY_API_KEY=your_api_key

# Sécurité
JWT_SECRET=changez_ceci_par_une_cle_securisee
```

### Étape 4 : Initialisation

```bash
# Créer les dossiers nécessaires
mkdir -p logs
mkdir -p data

# Vérifier l'installation
npm run lint
```

## Configuration

### Configuration Basique

Le fichier `config.js` contient les paramètres globaux :

```javascript
// config.js
module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  bitcoinNetwork: process.env.BITCOIN_NETWORK || 'testnet',
  // ... autres configs
};
```

### Configuration BTC Pay Server

Si vous utilisez BTC Pay :

```env
BTCPAY_URL=https://votre-btcpay.com
BTCPAY_API_KEY=votre_clé_api
BTCPAY_MERCHANT_ID=votre_merchant_id
```

### Configuration Lightning Network

```env
LIGHTNING_NODE_URL=http://localhost:8080
LIGHTNING_NODE_TOKEN=votre_token_node
```

### Configuration Base de Données (Optionnel)

Pour les déploiements en production avec persistance :

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lightning_miner
DB_USER=admin
DB_PASSWORD=votre_mot_de_passe_secure
```

## Vérification

### Test d'installation

```bash
# Vérifier que tout fonctionne
npm run lint

# Lancer les tests
npm test

# Démarrer l'application
npm start
```

L'application devrait être accessible sur :
```
http://localhost:3000
```

### Vérifications à effectuer

```bash
# 1. Vérifier les dépendances
npm list

# 2. Vérifier la configuration
npm run lint

# 3. Vérifier les vulnérabilités
npm audit

# 4. Logs d'application
tail -f logs/app.log
```

### Endpoints de test

```bash
# Tester la disponibilité du serveur
curl http://localhost:3000/health

# Tester avec curl
curl -X GET http://localhost:3000/api/status

# Avec HTTPie
http GET localhost:3000/api/status
```

## Dépannage

### Erreur: "Port already in use"

```bash
# Changer le port
PORT=3001 npm start

# Ou libérer le port
sudo lsof -i :3000
sudo kill -9 <PID>
```

### Erreur: "Cannot find module"

```bash
# Réinstaller les dépendances
rm -rf node_modules
npm install
```

### Erreur: "EACCES: permission denied"

```bash
# Corriger les permissions
sudo chown -R $USER:$USER .
sudo chmod -R u+w .
```

### Erreur de connexion Bitcoin/Lightning

- Vérifier la variable `BITCOIN_NETWORK` (testnet vs mainnet)
- Vérifier que le node est accessible
- Vérifier les clés/tokens dans `.env`
- Consulter les logs: `tail -f logs/app.log`

### Erreur npm install sur M1/M2 Mac

```bash
# Utiliser le flag compatible
npm install --arch=arm64 --platform=darwin
```

## Commandes utiles

```bash
# Démarrage
npm start              # Production
npm run dev           # Développement avec hot reload

# Tests et qualité
npm test              # Exécuter les tests
npm run lint          # Vérifier le style
npm run lint:fix      # Corriger les problèmes de style

# Audit
npm audit             # Vérifier les vulnérabilités
npm audit fix         # Corriger les vulnérabilités

# Logs
npm run logs          # Afficher les logs
```

## Prochaines étapes

1. ✅ Configuration complète du `.env`
2. ✅ Test en mode développement
3. ✅ Création d'une branche pour vos changements
4. ✅ Lecture de [CONTRIBUTING.md](CONTRIBUTING.md)
5. ✅ Déploiement en production (voir section déploiement)

## Besoin d'aide ?

- 📧 Email: sdoukoure12@gmail.com
- 🐛 Issues: https://github.com/sdoukoure12/Lightning-miner-unifie/issues
- 📖 Documentation: https://github.com/sdoukoure12/Lightning-miner-unifie#readme

---

**Guide mis à jour**: Mars 2026
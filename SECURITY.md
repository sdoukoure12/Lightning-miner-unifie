# Politique de Sécurité

## Developer Setup Guide

### Quick start

```bash
# 1. Copy the environment variable template
cp .env.example .env

# 2. Edit .env with your real values – this file is git-ignored and must never be committed
nano .env   # or your preferred editor

# 3. Install dependencies
npm install

# 4. Start the development server
npm start
```

### Security checklist before first run

- [ ] `.env` file created from `.env.example` (never committed)
- [ ] `JWT_SECRET` replaced with a strong random string (`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- [ ] All placeholder values (`your_*`) replaced with real credentials
- [ ] `wallets.json` created from `wallets.example.json` (never committed)

---

## Sécurité et Responsabilité

Nous prenons la sécurité très au sérieux. Ce document décrit comment signaler les vulnérabilités de sécurité et les bonnes pratiques à suivre.

## Signaler une vulnérabilité

Si vous découvrez une faille de sécurité, **NE LA PUBLIEZ PAS** sur GitHub Issues. Veuillez plutôt :

1. **Envoyer un email privé** à : **sdoukoure12@gmail.com**
2. Inclure dans l'email :
   - Description de la vulnérabilité
   - Étapes pour la reproduire
   - Impact potentiel
   - Suggestions de correction (si possible)

3. **Attendez une réponse** dans les 48 heures

## Process de réponse aux vulnérabilités

1. ✅ Accusé de réception du rapport
2. 🔍 Investigation et vérification
3. 🔧 Développement du correctif
4. 🧪 Tests approfondis
5. 📢 Publication du correctif
6. 📋 Divulgation coordonnée

## Bonnes Pratiques de Sécurité

### Pour les utilisateurs

#### 1. Gestion des clés
```javascript
// ❌ NE JAMAIS faire cela
const privateKey = "your_private_key_here";

// ✅ Utiliser les variables d'environnement
const privateKey = process.env.PRIVATE_KEY;
```

#### 2. Configuration
- Ne commitez JAMAIS vos fichiers `.env`
- Utilisez `.env.example` comme template
- Changez tous les mots de passe par défaut
- Utilisez HTTPS en production

#### 3. Mises à jour
- Mettez à jour régulièrement vos dépendances
- Vérifiez les CVE (Common Vulnerabilities)
- Testez les mises à jour avant production

#### 4. Authentification
```javascript
// ✅ Utiliser des tokens JWT sécurisés
const token = jwt.sign(payload, process.env.JWT_SECRET, {
  expiresIn: '24h',
  algorithm: 'HS256'
});
```

#### 5. Transactions Bitcoin
- Validez toujours les adresses
- Vérifiez les montants
- Testez en testnet d'abord
- Maintenez des backups sécurisés

### Pour les contributeurs

#### Code Review
- Vérifiez les injections SQL/NoSQL
- Cherchez les fuites de clés/tokens
- Validez les entrées utilisateur
- Utilisez les dépendances de confiance

#### Tests de Sécurité
```bash
# Vérifier les dépendances
npm audit
npm audit fix

# Linting
npm run lint

# Tests
npm test
```

#### Règles
- Pas de secrets en dur dans le code
- Validation stricte des inputs
- Gestion d'erreurs sécurisée
- Logs sécurisés (sans données sensibles)

## Dépendances Sécurisées

### Dépendances actuelles vérifiées
- express: ^4.18.2 ✅
- axios: ^1.6.0 ✅
- dotenv: ^16.3.1 ✅
- body-parser: ^1.20.2 ✅

### Vérifier les vulnérabilités
```bash
npm audit
npm audit --audit-level=moderate
```

## Checklist Sécurité Avant Production

- [ ] Fichier `.env` avec variables sécurisées
- [ ] HTTPS activé
- [ ] JWT_SECRET changé
- [ ] Database authentifiée
- [ ] Rate limiting activé
- [ ] CORS correctement configuré
- [ ] Input validation active
- [ ] Logs sans données sensibles
- [ ] Backups en place
- [ ] Monitoring actif

## Divulgation Responsable

Nous suivons les principes de divulgation responsable :

1. **Notification privée** des failles
2. **Temps raisonnable** pour corriger (30 jours max)
3. **Publication coordonnée** des correctifs
4. **Crédit publique** au chercheur (si souhaité)

## Ressources de Sécurité

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Bitcoin Security](https://bitcoin.org/en/developer-guide)
- [Lightning Network Security](https://github.com/lightningnetwork/lnd)

## Questions ?

Pour toute question sur la sécurité :
- 📧 Email: sdoukoure12@gmail.com
- 🔗 Issues: https://github.com/sdoukoure12/Lightning-miner-unifie/security/advisories

---

**Dernière mise à jour**: Mars 2026
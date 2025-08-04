# Kamlease - Site Web Officiel

Site web moderne pour Kamlease, spécialisé dans la location de véhicules avec système de prise de rendez-vous intégré.

## 🚀 Fonctionnalités

- **Design moderne et responsive** avec animations fluides
- **Système de prise de rendez-vous** intégré avec Microsoft Graph
- **Formulaire de contact** avec envoi d'emails automatique
- **Optimisations SEO** avancées
- **Performance optimisée** avec lazy loading et compression
- **Sécurité renforcée** avec protection CSRF et sanitisation des entrées
- **Monitoring et analytics** intégrés

## 🛠 Technologies

- **Frontend** : React 18, TypeScript, Tailwind CSS
- **Build** : Vite
- **Animations** : Framer Motion
- **Intégrations** : Microsoft Graph API
- **Déploiement** : Cloudflare Pages

## 📦 Installation

```bash
# Cloner le repository
git clone https://github.com/votre-username/kamlease-website.git
cd kamlease-website

# Installer les dépendances
npm install

# Lancer en développement
npm run dev
```

## 🔧 Configuration

### Variables d'environnement

Créez un fichier `.env.local` pour le développement :

```env
# Microsoft Graph API (optionnel en développement)
VITE_MICROSOFT_TENANT_ID=localhost-development-mode
VITE_MICROSOFT_CLIENT_ID=localhost-development-mode
VITE_MICROSOFT_CLIENT_SECRET=localhost-development-mode
VITE_MICROSOFT_SCOPE=https://graph.microsoft.com/.default

# Configuration métier
VITE_BUSINESS_TIMEZONE=Europe/Paris
VITE_BUSINESS_START_TIME=14:00
VITE_BUSINESS_END_TIME=16:30
VITE_APPOINTMENT_DURATION=30
VITE_CALENDAR_EMAIL=contact@kamlease.com
```

### Configuration Microsoft Graph

Pour activer les vrais emails et rendez-vous en production, consultez [MICROSOFT_GRAPH_SETUP.md](./MICROSOFT_GRAPH_SETUP.md).

## 🚀 Déploiement

Le site est automatiquement déployé sur Cloudflare Pages à chaque push sur la branche `main`.

- **URL de production** : https://www.kamlease.com
- **Build command** : `npm ci && npm run build`
- **Output directory** : `dist`

## 📝 Scripts

```bash
npm run dev          # Développement
npm run build        # Build de production
npm run preview      # Prévisualiser le build
npm run test         # Lancer les tests
npm run lint         # Vérifier le code
```

## 🔒 Sécurité

- Protection CSRF sur tous les formulaires
- Sanitisation des entrées utilisateur
- Rate limiting sur les API calls
- Chiffrement des données sensibles
- Headers de sécurité configurés

## 📊 Monitoring

- Logs structurés avec niveaux de priorité
- Monitoring des performances
- Tracking des erreurs
- Analytics utilisateur (anonymisées)

## 📞 Contact

Pour toute question technique, contactez l'équipe de développement.

---

© 2025 Kamlease. Tous droits réservés.
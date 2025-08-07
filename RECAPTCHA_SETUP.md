# Configuration Google reCAPTCHA v3

Ce document explique comment configurer Google reCAPTCHA v3 pour protéger le formulaire de contact contre le spam.

## Pourquoi reCAPTCHA v3 ?

- **Invisible** : Pas d'interaction utilisateur requise
- **Score-based** : Analyse comportementale pour détecter les bots
- **Meilleure UX** : Pas de "cliquez sur les feux de circulation"
- **Protection avancée** : Détection sophistiquée des bots

## Étapes de configuration

### 1. Créer un site reCAPTCHA

1. Allez sur [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
2. Cliquez sur **"+"** pour créer un nouveau site
3. Remplissez les informations :
   - **Label** : `Kamlease Website`
   - **Type reCAPTCHA** : Sélectionnez **reCAPTCHA v3**
   - **Domaines** : 
     - `kamlease.com`
     - `www.kamlease.com`
     - `localhost` (pour le développement)
   - **Propriétaires** : Ajoutez votre email
4. Acceptez les conditions d'utilisation
5. Cliquez sur **"Envoyer"**

### 2. Récupérer les clés

Après création, vous obtiendrez :

- **Clé du site (Site Key)** : Utilisée côté client (publique)
- **Clé secrète (Secret Key)** : Utilisée côté serveur (privée)

### 3. Configurer les variables d'environnement

#### Développement local (.env.local)
```env
# reCAPTCHA Configuration
VITE_RECAPTCHA_SITE_KEY=6LcXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
RECAPTCHA_SECRET_KEY=6LcXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

#### Production (Cloudflare Pages)
1. Allez dans votre dashboard Cloudflare Pages
2. Sélectionnez votre projet `kamlease-website`
3. Allez dans **Settings** > **Environment variables**
4. Ajoutez les variables :
   - `VITE_RECAPTCHA_SITE_KEY` : Votre clé de site
   - `RECAPTCHA_SECRET_KEY` : Votre clé secrète

### 4. Test de la configuration

#### Clés de test (développement)
Google fournit des clés de test qui fonctionnent toujours :

```env
# Clés de test - TOUJOURS VALIDES
VITE_RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
RECAPTCHA_SECRET_KEY=6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe
```

## Comment ça fonctionne

### 1. Côté client (React)
```typescript
// Le composant Captcha charge automatiquement reCAPTCHA
<Captcha
  siteKey={RECAPTCHA_SITE_KEY}
  onVerify={handleCaptchaVerify}
  action="contact" // ou "appointment"
/>
```

### 2. Vérification serveur
```javascript
// Cloudflare Function vérifie le token
const result = await verifyCaptchaToken(
  token,
  secretKey,
  expectedAction,
  minScore // 0.5 par défaut
)
```

### 3. Score d'évaluation
- **0.0 - 0.1** : Très probablement un bot
- **0.1 - 0.5** : Suspect, peut être un bot
- **0.5 - 0.9** : Probablement humain
- **0.9 - 1.0** : Très probablement humain

## Sécurité et bonnes pratiques

### 1. Protection des clés
- ✅ **Site Key** : Peut être publique (dans le code client)
- ❌ **Secret Key** : JAMAIS dans le code client, seulement serveur

### 2. Validation côté serveur
- Toujours vérifier le token côté serveur
- Ne jamais faire confiance uniquement au client
- Vérifier l'action et le score

### 3. Gestion des erreurs
```javascript
// Gestion gracieuse des erreurs
if (!captchaResult.success) {
  // Log l'erreur mais permettre la soumission en mode dégradé
  console.warn('CAPTCHA failed, but allowing submission')
  // Ou bloquer complètement selon vos besoins
}
```

### 4. Monitoring
- Surveillez les scores dans Google reCAPTCHA Admin
- Ajustez le score minimum selon vos besoins
- Analysez les tentatives de spam

## Dépannage

### Erreur "Invalid site key"
- Vérifiez que la clé de site est correcte
- Vérifiez que le domaine est autorisé dans la console reCAPTCHA

### Erreur "Invalid secret key"
- Vérifiez que la clé secrète est correcte
- Vérifiez qu'elle est bien configurée côté serveur

### Score trop bas
- Ajustez le score minimum (0.3 au lieu de 0.5)
- Vérifiez que l'action correspond
- Testez avec différents navigateurs

### CAPTCHA ne se charge pas
- Vérifiez la connexion internet
- Vérifiez que les scripts Google ne sont pas bloqués
- Testez en navigation privée

## Monitoring et analytics

### Console reCAPTCHA
- Visitez [reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
- Consultez les statistiques de votre site
- Analysez les scores et les tentatives

### Logs Cloudflare
- Surveillez les logs des fonctions Cloudflare
- Vérifiez les tentatives de vérification CAPTCHA
- Analysez les patterns de spam

## Configuration avancée

### Actions personnalisées
```javascript
// Différentes actions pour différents formulaires
const actions = {
  contact: 'contact_form',
  appointment: 'appointment_booking',
  newsletter: 'newsletter_signup'
}
```

### Scores adaptatifs
```javascript
// Scores différents selon le contexte
const minScores = {
  contact: 0.5,      // Standard
  appointment: 0.7,  // Plus strict
  newsletter: 0.3    // Plus permissif
}
```

### Fallback en cas d'échec
```javascript
// Mode dégradé si reCAPTCHA échoue
if (!captchaAvailable) {
  // Utiliser d'autres méthodes anti-spam
  // Rate limiting, honeypot, etc.
}
```

## Support

- [Documentation officielle reCAPTCHA](https://developers.google.com/recaptcha/docs/v3)
- [FAQ reCAPTCHA](https://developers.google.com/recaptcha/docs/faq)
- [Console d'administration](https://www.google.com/recaptcha/admin)
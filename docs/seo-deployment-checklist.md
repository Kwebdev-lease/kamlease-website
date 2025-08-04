# Checklist de Déploiement SEO - Kamlease

## Vue d'ensemble

Ce document fournit une checklist complète pour déployer les optimisations SEO et vérifier leur bon fonctionnement en production.

## Pré-déploiement

### 1. Vérifications Techniques

- [x] **Build réussi** - `npm run build` s'exécute sans erreur
- [x] **Sitemap généré** - Le fichier `public/sitemap.xml` est créé automatiquement
- [x] **Tests SEO passés** - Les tests d'intégration SEO sont validés
- [x] **Robots.txt configuré** - Le fichier `public/robots.txt` est optimisé
- [x] **Service Worker configuré** - Le SW gère la mise en cache SEO

### 2. Composants SEO Intégrés

- [x] **SEOHead** - Intégré dans toutes les pages principales
- [x] **StructuredData** - Données structurées ajoutées aux pages
- [x] **Breadcrumbs** - Navigation hiérarchique implémentée
- [x] **ContextualLinks** - Liens internes optimisés
- [x] **SectionAnchors** - Ancres de navigation ajoutées
- [x] **SEOImage** - Composant d'images optimisées

### 3. Configuration Multilingue

- [x] **Hreflang** - Balises hreflang configurées
- [x] **URLs localisées** - Structure d'URLs multilingue
- [x] **Contenu traduit** - Meta tags et contenu adaptés
- [x] **Sitemap multilingue** - Sitemap avec support des langues

### 4. Performance et Monitoring

- [x] **Core Web Vitals** - Optimisations de performance
- [x] **Lazy Loading** - Images et composants chargés à la demande
- [x] **Code Splitting** - Optimisation du bundle JavaScript
- [x] **Monitoring configuré** - Système de surveillance SEO

## Déploiement

### 1. Commandes de Déploiement

```bash
# 1. Installer les dépendances
npm ci

# 2. Exécuter les tests SEO
npm run test:run src/test/seo-integration-final.test.tsx

# 3. Build de production
npm run build

# 4. Vérifier la génération du sitemap
ls -la public/sitemap.xml

# 5. Vérifier la taille des bundles
ls -la dist/assets/

# 6. Déployer (exemple avec serveur statique)
# cp -r dist/* /var/www/html/
```

### 2. Variables d'Environnement

```bash
# Production
NODE_ENV=production
VITE_SITE_URL=https://kamlease.com
VITE_GA_ID=G-XXXXXXXXXX
VITE_GSC_ID=XXXXXXXXXX

# Monitoring
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
EMAIL_WEBHOOK_URL=https://api.emailservice.com/...
```

### 3. Configuration Serveur

#### Nginx Configuration

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name kamlease.com www.kamlease.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name kamlease.com www.kamlease.com;

    # SSL Configuration
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;

    # Root directory
    root /var/www/kamlease;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SEO files
    location = /robots.txt {
        expires 1d;
        add_header Cache-Control "public";
    }

    location = /sitemap.xml {
        expires 1d;
        add_header Cache-Control "public";
    }

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Redirect www to non-www
    if ($host = www.kamlease.com) {
        return 301 https://kamlease.com$request_uri;
    }
}
```

#### Apache Configuration (.htaccess)

```apache
# Force HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Redirect www to non-www
RewriteCond %{HTTP_HOST} ^www\.kamlease\.com [NC]
RewriteRule ^(.*)$ https://kamlease.com/$1 [L,R=301]

# Gzip compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType font/woff "access plus 1 year"
    ExpiresByType font/woff2 "access plus 1 year"
</IfModule>

# SPA routing
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>

# Security headers
<IfModule mod_headers.c>
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set X-Content-Type-Options "nosniff"
    Header always set Referrer-Policy "no-referrer-when-downgrade"
</IfModule>
```

## Post-déploiement

### 1. Vérifications Automatisées

#### Script de Vérification SEO

```bash
#!/bin/bash
# scripts/verify-seo-deployment.sh

echo "🔍 Vérification du déploiement SEO..."

SITE_URL="https://kamlease.com"
ERRORS=0

# Fonction pour vérifier une URL
check_url() {
    local url=$1
    local expected_status=${2:-200}
    
    echo "Vérification de $url..."
    status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$status" -eq "$expected_status" ]; then
        echo "✅ $url - Status: $status"
    else
        echo "❌ $url - Status: $status (attendu: $expected_status)"
        ((ERRORS++))
    fi
}

# Fonction pour vérifier la présence d'un élément
check_element() {
    local url=$1
    local element=$2
    local description=$3
    
    echo "Vérification de $description sur $url..."
    content=$(curl -s "$url")
    
    if echo "$content" | grep -q "$element"; then
        echo "✅ $description trouvé"
    else
        echo "❌ $description manquant"
        ((ERRORS++))
    fi
}

# 1. Vérifier l'accessibilité des pages principales
echo "📄 Vérification des pages principales..."
check_url "$SITE_URL"
check_url "$SITE_URL/en"
check_url "$SITE_URL/mentions-legales"
check_url "$SITE_URL/en/legal-notice"
check_url "$SITE_URL/politique-confidentialite"
check_url "$SITE_URL/en/privacy-policy"

# 2. Vérifier les fichiers SEO
echo "🗺️ Vérification des fichiers SEO..."
check_url "$SITE_URL/sitemap.xml"
check_url "$SITE_URL/robots.txt"

# 3. Vérifier les meta tags
echo "🏷️ Vérification des meta tags..."
check_element "$SITE_URL" '<title>.*Kamlease.*</title>' "Title tag"
check_element "$SITE_URL" '<meta name="description"' "Meta description"
check_element "$SITE_URL" '<meta property="og:title"' "Open Graph title"
check_element "$SITE_URL" '<meta name="twitter:card"' "Twitter Card"

# 4. Vérifier les données structurées
echo "📊 Vérification des données structurées..."
check_element "$SITE_URL" 'application/ld\+json' "Données structurées JSON-LD"
check_element "$SITE_URL" '"@type":"Organization"' "Schema Organization"

# 5. Vérifier les balises hreflang
echo "🌍 Vérification du multilingue..."
check_element "$SITE_URL" 'hreflang="fr"' "Hreflang français"
check_element "$SITE_URL" 'hreflang="en"' "Hreflang anglais"
check_element "$SITE_URL" 'hreflang="x-default"' "Hreflang default"

# 6. Vérifier la performance
echo "⚡ Vérification de la performance..."
load_time=$(curl -s -o /dev/null -w "%{time_total}" "$SITE_URL")
if (( $(echo "$load_time < 3.0" | bc -l) )); then
    echo "✅ Temps de chargement: ${load_time}s"
else
    echo "⚠️ Temps de chargement lent: ${load_time}s"
fi

# 7. Vérifier le SSL
echo "🔒 Vérification SSL..."
ssl_info=$(curl -s -I "$SITE_URL" | grep -i "strict-transport-security")
if [ -n "$ssl_info" ]; then
    echo "✅ HSTS configuré"
else
    echo "⚠️ HSTS non configuré"
fi

# Résumé
echo ""
echo "📋 Résumé de la vérification:"
if [ $ERRORS -eq 0 ]; then
    echo "✅ Toutes les vérifications sont passées!"
    exit 0
else
    echo "❌ $ERRORS erreur(s) détectée(s)"
    exit 1
fi
```

### 2. Tests de Performance

#### Lighthouse CI

```bash
# Installation
npm install -g @lhci/cli

# Configuration dans lighthouserc.js (déjà configuré)
# Exécution
lhci autorun --upload.target=temporary-public-storage
```

#### Core Web Vitals

```javascript
// scripts/check-core-web-vitals.js
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

const vitals = {}

getCLS((metric) => {
  vitals.cls = metric.value
  console.log('CLS:', metric.value, metric.rating)
})

getFID((metric) => {
  vitals.fid = metric.value
  console.log('FID:', metric.value, metric.rating)
})

getLCP((metric) => {
  vitals.lcp = metric.value
  console.log('LCP:', metric.value, metric.rating)
})

// Vérifier les seuils
setTimeout(() => {
  const issues = []
  
  if (vitals.cls > 0.1) issues.push(`CLS trop élevé: ${vitals.cls}`)
  if (vitals.fid > 100) issues.push(`FID trop élevé: ${vitals.fid}ms`)
  if (vitals.lcp > 2500) issues.push(`LCP trop élevé: ${vitals.lcp}ms`)
  
  if (issues.length > 0) {
    console.error('❌ Problèmes de performance détectés:')
    issues.forEach(issue => console.error('  -', issue))
  } else {
    console.log('✅ Core Web Vitals dans les seuils recommandés')
  }
}, 5000)
```

### 3. Configuration des Outils Externes

#### Google Search Console

1. **Ajouter la propriété**
   - URL: `https://kamlease.com`
   - Méthode de vérification: Balise HTML ou fichier

2. **Soumettre le sitemap**
   - URL du sitemap: `https://kamlease.com/sitemap.xml`

3. **Configurer les alertes**
   - Erreurs d'exploration
   - Problèmes de sécurité
   - Améliorations mobiles

#### Google Analytics 4

1. **Créer une propriété GA4**
   - Nom: Kamlease
   - URL: https://kamlease.com
   - Secteur: Industrie

2. **Configurer les événements**
   - Conversions de contact
   - Engagement des pages
   - Téléchargements

3. **Objectifs personnalisés**
   - Trafic organique
   - Durée de session
   - Pages par session

#### Autres Outils

1. **Bing Webmaster Tools**
   - Ajouter le site
   - Soumettre le sitemap
   - Configurer les alertes

2. **Schema.org Validator**
   - Tester les données structurées
   - Valider les schémas

3. **PageSpeed Insights**
   - Tester les performances
   - Suivre les Core Web Vitals

### 4. Monitoring Continu

#### Cron Jobs

```bash
# Éditer la crontab
crontab -e

# Ajouter les tâches de monitoring
# Vérification quotidienne à 8h00
0 8 * * * /path/to/scripts/verify-seo-deployment.sh

# Test Lighthouse hebdomadaire le lundi à 9h00
0 9 * * 1 /usr/local/bin/lhci autorun

# Vérification du sitemap quotidienne à 10h00
0 10 * * * curl -s https://kamlease.com/sitemap.xml > /dev/null || echo "Sitemap inaccessible" | mail -s "Alerte SEO" admin@kamlease.com
```

#### Alertes Slack/Discord

```javascript
// scripts/seo-alerts.js
const webhookUrl = process.env.SLACK_WEBHOOK_URL

async function sendAlert(message) {
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `🚨 Alerte SEO Kamlease: ${message}`,
        channel: '#seo-monitoring'
      })
    })
  } catch (error) {
    console.error('Erreur envoi alerte:', error)
  }
}

// Utilisation
sendAlert('Déploiement SEO terminé avec succès')
```

## Checklist de Validation Finale

### ✅ Technique

- [ ] Site accessible en HTTPS
- [ ] Redirections HTTP → HTTPS fonctionnelles
- [ ] Redirections www → non-www configurées
- [ ] Sitemap.xml accessible et valide
- [ ] Robots.txt configuré correctement
- [ ] Certificat SSL valide et HSTS activé

### ✅ SEO On-Page

- [ ] Toutes les pages ont des titres uniques
- [ ] Meta descriptions présentes et optimisées
- [ ] Balises H1-H6 hiérarchisées correctement
- [ ] Images avec attributs alt descriptifs
- [ ] URLs canoniques configurées
- [ ] Données structurées validées

### ✅ Multilingue

- [ ] Balises hreflang présentes
- [ ] URLs localisées fonctionnelles
- [ ] Contenu traduit et adapté
- [ ] Sitemap multilingue généré

### ✅ Performance

- [ ] Core Web Vitals dans les seuils verts
- [ ] Score Lighthouse SEO > 90
- [ ] Temps de chargement < 3 secondes
- [ ] Images optimisées et lazy loading actif

### ✅ Monitoring

- [ ] Google Search Console configuré
- [ ] Google Analytics 4 installé
- [ ] Alertes automatiques configurées
- [ ] Tests automatisés en place

### ✅ Accessibilité

- [ ] Score Lighthouse Accessibilité > 90
- [ ] Navigation au clavier fonctionnelle
- [ ] Contrastes de couleurs conformes
- [ ] Attributs ARIA présents

## Maintenance Post-Déploiement

### Quotidien
- Vérifier les alertes de monitoring
- Contrôler les erreurs dans Search Console
- Surveiller les Core Web Vitals

### Hebdomadaire
- Analyser le trafic organique
- Vérifier les positions des mots-clés
- Contrôler les nouvelles erreurs d'indexation

### Mensuel
- Audit SEO complet
- Analyse de la concurrence
- Optimisation du contenu
- Mise à jour des mots-clés

## Contacts d'Urgence

**Équipe Technique:**
- Développeur principal: [email]
- Responsable SEO: [email]
- Administrateur serveur: [email]

**Outils de Support:**
- Slack: #seo-monitoring
- Email: seo-alerts@kamlease.com
- Téléphone d'urgence: [numéro]

---

**Date de création:** $(date)
**Version:** 1.0
**Prochaine révision:** $(date -d "+1 month")
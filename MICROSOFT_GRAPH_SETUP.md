# Configuration Microsoft Graph

Ce document explique comment configurer Microsoft Graph pour activer l'envoi d'emails et la création de rendez-vous dans le calendrier.

## Prérequis

1. Un compte Microsoft 365 ou Azure AD
2. Accès au portail Azure (https://portal.azure.com)

## Étapes de configuration

### 1. Créer une application Azure AD

1. Connectez-vous au [portail Azure](https://portal.azure.com)
2. Allez dans **Azure Active Directory** > **App registrations**
3. Cliquez sur **New registration**
4. Remplissez les informations :
   - **Name** : `Kamlease Website`
   - **Supported account types** : `Accounts in this organizational directory only`
   - **Redirect URI** : Laissez vide pour l'instant
5. Cliquez sur **Register**

### 2. Configurer les permissions

1. Dans votre application, allez dans **API permissions**
2. Cliquez sur **Add a permission**
3. Sélectionnez **Microsoft Graph**
4. Choisissez **Application permissions**
5. Ajoutez les permissions suivantes :
   - `Mail.Send` (pour envoyer des emails)
   - `Calendars.ReadWrite` (pour créer des rendez-vous)
6. Cliquez sur **Grant admin consent** pour approuver les permissions

### 3. Créer un secret client

1. Allez dans **Certificates & secrets**
2. Cliquez sur **New client secret**
3. Ajoutez une description : `Website API Secret`
4. Choisissez une durée d'expiration
5. Cliquez sur **Add**
6. **IMPORTANT** : Copiez immédiatement la valeur du secret, elle ne sera plus visible après

### 4. Récupérer les informations nécessaires

Notez les informations suivantes de votre application :

- **Application (client) ID** : Visible sur la page Overview
- **Directory (tenant) ID** : Visible sur la page Overview
- **Client secret** : La valeur copiée à l'étape précédente

### 5. Configurer les variables d'environnement

Créez un fichier `.env.local` à la racine du projet avec :

```env
# Microsoft Graph API Configuration
VITE_MICROSOFT_TENANT_ID=votre-tenant-id
VITE_MICROSOFT_CLIENT_ID=votre-client-id
VITE_MICROSOFT_CLIENT_SECRET=votre-client-secret
VITE_MICROSOFT_SCOPE=https://graph.microsoft.com/.default

# Configuration du calendrier
VITE_CALENDAR_EMAIL=contact@kamlease.com

# Autres configurations
VITE_BUSINESS_TIMEZONE=Europe/Paris
VITE_BUSINESS_START_TIME=14:00
VITE_BUSINESS_END_TIME=16:30
VITE_APPOINTMENT_DURATION=30
```

## Test de la configuration

1. Redémarrez l'application de développement
2. Essayez d'envoyer un message via le formulaire de contact
3. Vérifiez que l'email arrive bien à `contact@kamlease.com`
4. Essayez de créer un rendez-vous et vérifiez qu'il apparaît dans le calendrier

## Dépannage

### Erreur "Graph API configuration not initialized"

- Vérifiez que toutes les variables d'environnement sont définies
- Redémarrez l'application après avoir modifié `.env.local`

### Erreur d'authentification

- Vérifiez que le tenant ID et client ID sont corrects
- Assurez-vous que le secret client n'a pas expiré
- Vérifiez que les permissions ont été accordées par un administrateur

### Emails non reçus

- Vérifiez que l'adresse `VITE_CALENDAR_EMAIL` est correcte
- Assurez-vous que la permission `Mail.Send` est accordée
- Vérifiez les dossiers spam/indésirables

### Rendez-vous non créés

- Vérifiez que la permission `Calendars.ReadWrite` est accordée
- Assurez-vous que l'adresse email du calendrier existe dans votre organisation

## Mode développement (Localhost)

⚠️ **IMPORTANT** : Microsoft Graph **NE FONCTIONNE PAS** depuis localhost à cause des restrictions CORS.

En mode développement (localhost), l'application :

- Détecte automatiquement localhost et active le mode simulation
- Affiche un message d'information sur le formulaire
- Simule l'envoi d'emails (contenu visible dans la console)
- Simule la création de rendez-vous
- Permet de tester toutes les fonctionnalités sans vraie intégration

### Pourquoi localhost ne fonctionne pas ?

1. **CORS** : Microsoft bloque les requêtes depuis localhost
2. **Sécurité OAuth2** : Les tokens ne peuvent pas être obtenus depuis un environnement non-sécurisé
3. **Configuration Azure** : Les apps Azure AD n'autorisent pas localhost par défaut

### Solutions pour tester en développement

1. **Utiliser la simulation** (recommandé) : L'app détecte localhost automatiquement
2. **Déployer sur un domaine de test** : Utilisez Vercel, Netlify, ou un autre service
3. **Utiliser un tunnel HTTPS** : ngrok ou similar pour exposer localhost via HTTPS

## Sécurité

⚠️ **Important** :

- Ne jamais commiter le fichier `.env.local` dans Git
- Utilisez des secrets différents pour développement et production
- Renouvelez régulièrement les secrets clients
- Limitez les permissions au strict nécessaire
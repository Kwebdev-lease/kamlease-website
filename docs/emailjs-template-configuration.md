# Configuration des Templates EmailJS - Kamlease

## Vue d'ensemble

Ce document décrit la configuration complète des templates EmailJS pour le formulaire de contact amélioré de Kamlease. Le système utilise deux templates principaux : un pour la réception des messages et un pour les auto-réponses.

## Prérequis

1. **Compte EmailJS** : Créer un compte sur [emailjs.com](https://www.emailjs.com/)
2. **Service EmailJS** : Configurer un service email (Gmail, Outlook, etc.)
3. **Variables d'environnement** : Configurer les clés API dans le projet

## Configuration des Variables d'Environnement

### Fichier `.env.local`

```env
# Configuration EmailJS
VITE_EMAILJS_SERVICE_ID=service_kamlease
VITE_EMAILJS_TEMPLATE_RECEPTION_ID=template_reception
VITE_EMAILJS_TEMPLATE_AUTORESPONSE_ID=template_autoresponse
VITE_EMAILJS_USER_ID=your_emailjs_user_id
VITE_EMAILJS_ACCESS_TOKEN=your_emailjs_access_token
```

### Description des Variables

- `VITE_EMAILJS_SERVICE_ID` : Identifiant du service EmailJS configuré
- `VITE_EMAILJS_TEMPLATE_RECEPTION_ID` : ID du template de réception des messages
- `VITE_EMAILJS_TEMPLATE_AUTORESPONSE_ID` : ID du template d'auto-réponse
- `VITE_EMAILJS_USER_ID` : Clé publique EmailJS (User ID)
- `VITE_EMAILJS_ACCESS_TOKEN` : Clé privée EmailJS (optionnelle, pour sécurité renforcée)

## Template 1 : Réception des Messages

### Nom du Template
`Kamlease - Réception Message Contact`

### ID Recommandé
`template_reception`

### Variables Requises

| Variable | Type | Description | Exemple |
|----------|------|-------------|---------|
| `{{from_name}}` | String | Nom complet du contact | "Jean Dupont" |
| `{{from_email}}` | String | Email du contact | "jean.dupont@example.com" |
| `{{phone}}` | String | Numéro de téléphone | "+33 1 23 45 67 89" |
| `{{company}}` | String | Société (optionnel) | "ACME Corp" |
| `{{message}}` | String | Message du contact | "Je souhaite..." |
| `{{date}}` | String | Date d'envoi | "15/01/2025 14:30" |
| `{{appointment_date}}` | String | Date RDV (optionnel) | "20/01/2025" |
| `{{appointment_time}}` | String | Heure RDV (optionnel) | "14:00" |

### Configuration EmailJS

1. **Créer le template** dans l'interface EmailJS
2. **Copier le contenu HTML** depuis `templates/emailjs-reception-template.html`
3. **Configurer les paramètres** :
   - **To Email** : `contact@kamlease.com`
   - **From Name** : `Formulaire Contact Kamlease`
   - **From Email** : `noreply@kamlease.com`
   - **Reply To** : `{{from_email}}`
   - **Subject** : `Nouveau message de {{from_name}} - Kamlease`

### Variables Conditionnelles

Le template utilise la syntaxe Mustache pour les champs optionnels :

```html
<!-- Affichage conditionnel de la société -->
{{#company}}
<div class="info-row">
    <span class="emoji">🏢</span>
    <span class="label">Société :</span>
    <span class="value">{{company}}</span>
</div>
{{/company}}

<!-- Affichage conditionnel du rendez-vous -->
{{#appointment_date}}
<div class="appointment-section">
    <!-- Contenu du rendez-vous -->
</div>
{{/appointment_date}}
```

## Template 2 : Auto-Réponse

### Nom du Template
`Kamlease - Auto-Réponse Contact`

### ID Recommandé
`template_autoresponse`

### Variables Requises

| Variable | Type | Description | Exemple |
|----------|------|-------------|---------|
| `{{from_name}}` | String | Nom du contact | "Jean Dupont" |
| `{{from_email}}` | String | Email du contact | "jean.dupont@example.com" |
| `{{language}}` | String | Code langue | "fr" ou "en" |
| `{{is_french}}` | Boolean | Si langue française | true/false |
| `{{is_english}}` | Boolean | Si langue anglaise | true/false |
| `{{appointment_date}}` | String | Date RDV (optionnel) | "20/01/2025" |
| `{{appointment_time}}` | String | Heure RDV (optionnel) | "14:00" |

### Configuration EmailJS

1. **Créer le template** dans l'interface EmailJS
2. **Copier le contenu HTML** depuis `templates/emailjs-autoresponse-template.html`
3. **Configurer les paramètres** :
   - **To Email** : `{{from_email}}`
   - **From Name** : `Kamlease`
   - **From Email** : `contact@kamlease.com`
   - **Reply To** : `contact@kamlease.com`
   - **Subject** : 
     - Français : `Confirmation de réception - Kamlease`
     - Anglais : `Message Received - Kamlease`

### Gestion Multilingue

Le template utilise des conditions pour afficher le contenu selon la langue :

```html
<!-- Contenu en français -->
{{#is_french}}
Nous avons bien reçu votre message...
{{/is_french}}

<!-- Contenu en anglais -->
{{#is_english}}
We have successfully received your message...
{{/is_english}}
```

## Configuration du Service EmailJS

### Étapes de Configuration

1. **Connexion à EmailJS**
   - Aller sur [emailjs.com](https://www.emailjs.com/)
   - Se connecter ou créer un compte

2. **Créer un Service Email**
   - Aller dans "Email Services"
   - Cliquer "Add New Service"
   - Choisir le fournisseur (Gmail, Outlook, etc.)
   - Suivre les instructions de configuration
   - Noter l'ID du service (ex: `service_kamlease`)

3. **Créer les Templates**
   - Aller dans "Email Templates"
   - Cliquer "Create New Template"
   - Copier le contenu HTML des templates
   - Configurer les paramètres (To, From, Subject)
   - Tester le template
   - Noter les IDs des templates

4. **Obtenir les Clés API**
   - Aller dans "Account" > "General"
   - Copier le "User ID" (clé publique)
   - Optionnel : Créer un "Access Token" (clé privée)

## Test de Configuration

### Script de Test

Un script de test est disponible pour valider la configuration :

```bash
npm run test:emailjs
```

### Tests Manuels

1. **Test Template Réception**
   - Envoyer un message simple
   - Vérifier la réception avec tous les champs
   - Tester avec/sans société
   - Tester avec/sans rendez-vous

2. **Test Template Auto-Réponse**
   - Vérifier la réception de l'auto-réponse
   - Tester en français et anglais
   - Vérifier le contenu selon le type (message/RDV)

## Dépannage

### Erreurs Communes

1. **Template Not Found (404)**
   - Vérifier l'ID du template dans les variables d'environnement
   - S'assurer que le template est publié sur EmailJS

2. **Invalid Service (400)**
   - Vérifier l'ID du service
   - S'assurer que le service est actif

3. **Rate Limited (429)**
   - Attendre avant de renvoyer
   - Considérer un upgrade du plan EmailJS

4. **Variables Non Remplacées**
   - Vérifier la syntaxe des variables `{{variable}}`
   - S'assurer que toutes les variables sont envoyées

### Logs de Debug

Activer les logs détaillés dans le service EmailJS :

```typescript
// Dans emailjs-service.ts
const DEBUG_MODE = process.env.NODE_ENV === 'development';

if (DEBUG_MODE) {
  console.log('EmailJS Template Params:', templateParams);
}
```

## Sécurité

### Bonnes Pratiques

1. **Variables d'Environnement**
   - Ne jamais commiter les clés API
   - Utiliser des variables d'environnement différentes par environnement

2. **Validation des Données**
   - Valider tous les champs avant envoi
   - Sanitiser le contenu des messages

3. **Rate Limiting**
   - Implémenter une limitation côté client
   - Surveiller l'usage EmailJS

## Maintenance

### Surveillance

1. **Monitoring des Envois**
   - Surveiller les logs EmailJS
   - Mettre en place des alertes en cas d'échec

2. **Mise à Jour des Templates**
   - Versionner les templates
   - Tester avant déploiement

3. **Sauvegarde**
   - Sauvegarder le contenu des templates
   - Documenter les modifications

## Support

### Ressources

- [Documentation EmailJS](https://www.emailjs.com/docs/)
- [API Reference](https://www.emailjs.com/docs/api/send/)
- [Template Variables](https://www.emailjs.com/docs/user_guide/template_variables/)

### Contact

Pour toute question sur cette configuration :
- Email : dev@kamlease.com
- Documentation interne : `/docs/`
# Guide de Test Manuel - Formulaire avec CAPTCHA

Ce guide te permet de tester manuellement toutes les fonctionnalités du formulaire de contact avec protection CAPTCHA.

## 🎯 Objectifs du test

- ✅ Vérifier que reCAPTCHA fonctionne correctement
- ✅ Tester l'envoi de messages simples
- ✅ Tester la prise de rendez-vous Teams
- ✅ Vérifier les emails de confirmation
- ✅ Tester la vérification des créneaux disponibles

## 📋 Pré-requis

### Variables configurées dans Cloudflare Pages :
- `VITE_RECAPTCHA_SITE_KEY` : Ta clé publique reCAPTCHA
- `RECAPTCHA_SECRET_KEY` : Ta clé secrète reCAPTCHA
- `VITE_MICROSOFT_TENANT_ID` : Ton tenant Microsoft
- `VITE_MICROSOFT_CLIENT_ID` : Ton client ID Microsoft
- `VITE_MICROSOFT_CLIENT_SECRET` : Ton secret Microsoft
- `VITE_CALENDAR_EMAIL` : contact@kamlease.com

## 🧪 Test 1 : Message Simple

### Étapes :
1. **Va sur** https://kamlease.com
2. **Scroll vers** la section Contact
3. **Sélectionne** "Envoyer un message"
4. **Remplis le formulaire** :
   - Prénom : Hugo
   - Nom : Test
   - Société : Kamlease Test
   - Email : ton-email@example.com
   - Téléphone : +33123456789
   - Message : "Test du formulaire avec CAPTCHA activé"

### Vérifications :
- [ ] Le CAPTCHA s'affiche : "Protection anti-spam active"
- [ ] Après quelques secondes : "Vérifié par reCAPTCHA"
- [ ] Le bouton "Envoyer le message" s'active
- [ ] Clic sur "Envoyer" → Message de confirmation apparaît sous le bouton
- [ ] Email reçu à contact@kamlease.com
- [ ] Email de confirmation reçu à ton adresse

### Résultat attendu :
```
✅ Message envoyé avec succès !
Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.
```

## 🧪 Test 2 : Prise de Rendez-vous

### Étapes :
1. **Refresh la page** (pour reset le CAPTCHA)
2. **Sélectionne** "Prendre rendez-vous"
3. **Choisis une date** (demain ou après-demain)
4. **Sélectionne un créneau** (ex: 14:30)
5. **Remplis le formulaire** :
   - Prénom : Hugo
   - Nom : RendezVous
   - Société : Test RDV
   - Email : ton-email@example.com
   - Téléphone : +33987654321
   - Message : "Test de prise de rendez-vous Teams"

### Vérifications :
- [ ] Calendrier s'affiche avec créneaux disponibles
- [ ] Sélection de date fonctionne
- [ ] Créneaux horaires s'affichent (14:00, 14:30, 15:00, etc.)
- [ ] CAPTCHA se vérifie automatiquement
- [ ] Bouton "Programmer le rendez-vous" s'active
- [ ] Clic → Message de confirmation avec détails Teams
- [ ] Email reçu avec lien Teams
- [ ] Événement ajouté au calendrier Outlook

### Résultat attendu :
```
✅ Rendez-vous confirmé !
🎥 Votre rendez-vous Teams
📅 Date : [date sélectionnée]
🕐 Heure : [heure] (heure française)
💻 Format : Réunion Microsoft Teams en ligne
Le lien de connexion Teams vous sera envoyé par email une fois le rendez-vous confirmé.
```

## 🧪 Test 3 : Vérification CAPTCHA

### Test avec DevTools :
1. **Ouvre DevTools** (F12)
2. **Va dans Console**
3. **Regarde les logs** pendant l'utilisation du formulaire

### Logs attendus :
```
✅ reCAPTCHA v3 loaded successfully
🔍 Executing reCAPTCHA with action: contact
✅ reCAPTCHA token received: 03AGdBq26...
✅ CAPTCHA verified with token: 03AGdBq26...
```

### Test d'erreur CAPTCHA :
1. **Désactive JavaScript** temporairement
2. **Essaie de soumettre** → Erreur attendue
3. **Réactive JavaScript** → Doit fonctionner

## 🧪 Test 4 : Vérification des APIs

### Test API Availability :
1. **Ouvre DevTools** → Network
2. **Sélectionne une date** dans le calendrier
3. **Cherche la requête** `/api/check-availability`
4. **Vérifie la réponse** :

```json
{
  "success": true,
  "availableSlots": [...],
  "calendarIntegration": "active"
}
```

### Test API CAPTCHA :
1. **Regarde Network** pendant la soumission
2. **Cherche** `/api/verify-captcha`
3. **Vérifie la réponse** :

```json
{
  "success": true,
  "score": 0.9,
  "action": "contact"
}
```

## 🧪 Test 5 : Emails de Confirmation

### Email pour message simple :
- **Sujet** : "Confirmation de réception - Message de contact"
- **Contenu** : Confirmation de réception
- **Pas de mention** de rendez-vous

### Email pour rendez-vous :
- **Sujet** : "Confirmation de réception - Demande de rendez-vous"
- **Contenu** : Détails du rendez-vous Teams
- **Mention** : "Réunion Microsoft Teams en ligne"
- **Lien Teams** : Sera envoyé après confirmation

## 🐛 Dépannage

### CAPTCHA ne fonctionne pas :
- [ ] Vérifier les clés dans Cloudflare Pages
- [ ] Vérifier que le domaine est autorisé dans Google reCAPTCHA
- [ ] Regarder les erreurs dans la console

### Créneaux ne s'affichent pas :
- [ ] Vérifier Microsoft Graph credentials
- [ ] Regarder les logs Cloudflare Functions
- [ ] Tester `/api/check-availability` directement

### Emails non reçus :
- [ ] Vérifier les dossiers spam
- [ ] Vérifier Microsoft Graph permissions
- [ ] Regarder les logs de `/api/send-email`

## 📊 Checklist Final

### Fonctionnalités de base :
- [ ] Formulaire s'affiche correctement
- [ ] Validation des champs fonctionne
- [ ] CAPTCHA se charge et se vérifie
- [ ] Messages d'erreur s'affichent

### Envoi de messages :
- [ ] Message simple envoyé avec succès
- [ ] Email de notification reçu
- [ ] Email de confirmation reçu

### Prise de rendez-vous :
- [ ] Calendrier s'affiche avec créneaux
- [ ] Sélection de date/heure fonctionne
- [ ] Rendez-vous créé avec succès
- [ ] Email avec détails Teams reçu
- [ ] Événement ajouté au calendrier

### Protection anti-spam :
- [ ] CAPTCHA fonctionne en mode invisible
- [ ] Score de confiance élevé
- [ ] Vérification serveur réussie
- [ ] Pas de soumissions sans CAPTCHA

## 🎉 Résultat Final

Si tous les tests passent :
- ✅ **Système complet fonctionnel**
- ✅ **Protection anti-spam active**
- ✅ **Intégration Teams opérationnelle**
- ✅ **Emails automatiques configurés**

**Le formulaire est prêt pour la production !** 🚀
# Rapports de Validation EmailJS

Ce dossier contient les rapports de validation de la configuration EmailJS générés automatiquement par le script de validation.

## Structure des Rapports

Chaque rapport de validation contient :

- **Timestamp** : Date et heure de la validation
- **Statistiques** : Nombre de tests réussis/échoués
- **Résultats détaillés** : Pour chaque test effectué
- **Résumé** : État de chaque composant (configuration, connexion, templates, bilingue)
- **Recommandations** : En cas d'échec

## Types de Tests

### 1. Variables d'Environnement
- Vérification de la présence de toutes les variables requises
- Validation du format des IDs

### 2. Connexion EmailJS
- Test de connexion avec l'API EmailJS
- Validation de l'User ID

### 3. Envoi de Messages
- Test d'envoi de message de contact simple
- Test d'envoi de demande de rendez-vous
- Test avec champs optionnels

### 4. Auto-Réponses Bilingues
- Test des templates français et anglais
- Validation des variables conditionnelles

## Utilisation

### Lancer la Validation

```bash
# Via npm
npm run test:emailjs

# Via pnpm
pnpm test:emailjs

# Directement avec tsx
tsx scripts/validate-emailjs-config.ts
```

### Interpréter les Résultats

- ✅ **SUCCÈS** : Tous les tests sont passés, la configuration est opérationnelle
- ❌ **ÉCHEC** : Un ou plusieurs tests ont échoué, voir les recommandations

### Exemple de Rapport

```json
{
  "timestamp": "2025-01-15T14:30:00.000Z",
  "totalTests": 6,
  "successfulTests": 6,
  "failedTests": 0,
  "success": true,
  "results": [
    {
      "test": "Variables d'environnement",
      "success": true,
      "message": "Toutes les variables requises sont présentes"
    }
  ],
  "summary": {
    "configurationValid": true,
    "connectionWorking": true,
    "templatesWorking": true,
    "bilingualWorking": true
  }
}
```

## Dépannage

### Erreurs Communes

1. **Variables manquantes** : Vérifiez votre fichier `.env.local`
2. **Template Not Found** : Vérifiez les IDs des templates sur EmailJS
3. **Connection Failed** : Vérifiez votre User ID EmailJS
4. **Rate Limited** : Attendez avant de relancer les tests

### Support

Pour toute question sur la validation :
- Consultez `docs/emailjs-template-configuration.md`
- Vérifiez les logs détaillés dans la console
- Contactez l'équipe de développement

## Historique

Les rapports sont automatiquement horodatés et sauvegardés pour permettre le suivi des validations dans le temps.
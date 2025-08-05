# Implementation Plan

- [x] 1. Étendre les traductions pour les nouveaux champs
  - Ajouter les clés de traduction pour les champs email et téléphone en français et anglais
  - Inclure les messages de validation et placeholders
  - Tester le changement de langue pour les nouveaux éléments
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 2. Mettre à jour l'interface et la validation du formulaire
- [x] 2.1 Étendre l'interface ContactFormData avec les nouveaux champs
  - Ajouter les propriétés email et telephone à l'interface
  - Mettre à jour AppointmentFormData pour hériter des nouveaux champs
  - Créer les types TypeScript pour la validation
  - _Requirements: 1.1, 1.2_

- [x] 2.2 Ajouter les règles de validation pour email et téléphone
  - Implémenter la validation regex pour le format email
  - Implémenter la validation regex pour le format téléphone français/international
  - Ajouter les règles au système de validation existant
  - Créer les tests unitaires pour les nouvelles validations
  - _Requirements: 1.3, 1.4, 1.5_

- [x] 2.3 Intégrer les nouveaux champs dans l'état du formulaire
  - Étendre l'état formData avec email et telephone
  - Mettre à jour les fonctions handleInputChange et handleInputBlur
  - Assurer la cohérence avec le système de sécurité existant
  - _Requirements: 1.1, 1.2_

- [x] 3. Ajouter les champs UI au formulaire de contact
- [x] 3.1 Créer les champs email et téléphone dans l'interface
  - Ajouter le champ email avec EnhancedInput entre société et message
  - Ajouter le champ téléphone avec EnhancedInput entre société et message
  - Implémenter les placeholders traduits et les labels
  - Assurer la cohérence visuelle avec les champs existants
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3, 2.4_

- [x] 3.2 Implémenter la validation en temps réel pour les nouveaux champs
  - Ajouter la validation onBlur pour le champ email
  - Ajouter la validation onBlur pour le champ téléphone
  - Afficher les messages d'erreur avec AnimatePresence
  - Intégrer avec le système de validation existant
  - _Requirements: 1.3, 1.4, 1.5, 2.5_

- [x] 4. Refactoriser le service EmailJS
- [x] 4.1 Créer la configuration EmailJS
  - Définir l'interface EmailJSConfig avec les paramètres requis
  - Créer les variables d'environnement pour la configuration
  - Implémenter la gestion sécurisée des clés API
  - _Requirements: 3.1, 4.1, 4.2_

- [x] 4.2 Implémenter le service EmailJS amélioré
  - Créer la classe EmailJSService avec les méthodes d'envoi
  - Implémenter sendContactMessage pour les messages simples
  - Implémenter sendAppointmentRequest pour les rendez-vous
  - Ajouter la gestion d'erreurs spécifique à EmailJS
  - _Requirements: 3.1, 3.2, 3.3, 3.5, 3.6_

- [x] 4.3 Mettre à jour le formatage des paramètres template
  - Créer l'interface EmailTemplateParams avec tous les champs
  - Implémenter formatEmailContent pour inclure email et téléphone
  - Configurer reply_to avec l'email fourni par l'utilisateur
  - Assurer la compatibilité avec les rendez-vous existants
  - _Requirements: 3.2, 3.3, 4.3, 4.4_

- [x] 5. Intégrer EmailJS dans le composant Contact
- [x] 5.1 Remplacer les appels Microsoft Graph par EmailJS
  - Modifier handleSubmit pour utiliser le nouveau service EmailJS
  - Mettre à jour la gestion des messages de succès et d'erreur
  - Conserver la logique de loading et de feedback existante
  - Tester les deux modes : message simple et rendez-vous
  - _Requirements: 3.1, 3.5, 3.6_

- [x] 5.2 Mettre à jour la gestion des erreurs
  - Implémenter la gestion des codes d'erreur EmailJS spécifiques
  - Traduire les messages d'erreur selon la langue sélectionnée
  - Maintenir la cohérence avec le système d'erreurs existant
  - _Requirements: 3.5, 3.6_

- [x] 6. Créer et configurer les templates EmailJS
- [x] 6.1 Créer le template HTML pour la réception des messages
  - Créer le template de réception avec le format demandé incluant tous les champs
  - Template avec emojis : 👤 {{from_name}}, 📧 {{from_email}}, 📞 {{phone}}, 🏢 {{company}}, 📅 {{time}}
  - Ajouter la gestion conditionnelle pour les champs optionnels (société, rendez-vous)
  - Inclure le message d'avertissement et les informations de contact Kamlease
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 6.2 Créer le template HTML pour l'auto-réponse
  - Créer le template d'auto-réponse bilingue (français/anglais)
  - Inclure les messages de remerciement et les prochaines étapes
  - Ajouter les informations de contact et délais de réponse
  - Personnaliser selon le type de demande (message simple vs rendez-vous)
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 6.3 Documenter la configuration des templates EmailJS
  - Créer la documentation pour configurer les templates sur EmailJS.com
  - Lister toutes les variables requises pour chaque template
  - Documenter la configuration des variables d'environnement
  - Fournir les instructions de configuration complètes
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 6.4 Valider la configuration EmailJS
  - Créer un script de test pour valider la configuration EmailJS
  - Tester l'envoi d'emails avec tous les champs
  - Vérifier que les emails sont reçus avec le bon contenu et formatage
  - Valider le fonctionnement des auto-réponses bilingues
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 7. Créer les tests pour les nouvelles fonctionnalités
- [x] 7.1 Tests unitaires pour la validation des nouveaux champs
  - Tester la validation email avec formats valides et invalides
  - Tester la validation téléphone avec formats français et internationaux
  - Tester les messages d'erreur traduits
  - Tester l'intégration avec le système de validation existant
  - _Requirements: 1.3, 1.4, 1.5, 2.5_

- [x] 7.2 Tests d'intégration pour le service EmailJS
  - Tester l'envoi d'emails avec les nouveaux champs
  - Tester la gestion des erreurs EmailJS
  - Tester la compatibilité avec les rendez-vous
  - Créer des mocks pour les tests automatisés
  - _Requirements: 3.1, 3.2, 3.3, 3.5, 3.6_

- [x] 8. Tests end-to-end et validation finale
- [x] 8.1 Tester le formulaire complet avec les nouveaux champs
  - Tester la soumission de messages avec email et téléphone
  - Tester la soumission de rendez-vous avec les nouveaux champs
  - Valider le changement de langue pour tous les éléments
  - Tester la validation en temps réel et les messages d'erreur
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 8.2 Validation de la réception des emails
  - Vérifier que les emails sont reçus avec tous les champs
  - Valider le format et la lisibilité du contenu
  - Tester la fonctionnalité reply_to avec l'email fourni
  - Confirmer que les rendez-vous incluent les informations complètes
  - _Requirements: 3.2, 3.3, 3.4, 4.3, 4.4_
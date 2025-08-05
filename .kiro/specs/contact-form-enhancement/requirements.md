# Requirements Document

## Introduction

Cette fonctionnalité vise à améliorer le formulaire de contact existant en ajoutant des champs obligatoires pour le numéro de téléphone et l'adresse email, avec support multilingue (français/anglais), et migration complète vers EmailJS pour remplacer Microsoft Azure qui ne fonctionne pas correctement.

## Requirements

### Requirement 1

**User Story:** En tant qu'utilisateur visitant le site, je veux pouvoir fournir mon numéro de téléphone et mon adresse email dans le formulaire de contact, afin que l'entreprise puisse me recontacter facilement.

#### Acceptance Criteria

1. WHEN l'utilisateur accède au formulaire de contact THEN le système SHALL afficher un champ "Numéro de téléphone" obligatoire
2. WHEN l'utilisateur accède au formulaire de contact THEN le système SHALL afficher un champ "Adresse email" obligatoire
3. WHEN l'utilisateur saisit un numéro de téléphone THEN le système SHALL valider le format du numéro
4. WHEN l'utilisateur saisit une adresse email THEN le système SHALL valider le format de l'email
5. WHEN l'utilisateur soumet le formulaire sans remplir les champs obligatoires THEN le système SHALL afficher des messages d'erreur appropriés

### Requirement 2

**User Story:** En tant qu'utilisateur multilingue, je veux que les nouveaux champs du formulaire soient traduits en anglais et français, afin de pouvoir utiliser le formulaire dans ma langue préférée.

#### Acceptance Criteria

1. WHEN l'utilisateur change la langue vers l'anglais THEN le système SHALL afficher "Phone Number" pour le champ téléphone
2. WHEN l'utilisateur change la langue vers le français THEN le système SHALL afficher "Numéro de téléphone" pour le champ téléphone
3. WHEN l'utilisateur change la langue vers l'anglais THEN le système SHALL afficher "Email Address" pour le champ email
4. WHEN l'utilisateur change la langue vers le français THEN le système SHALL afficher "Adresse email" pour le champ email
5. WHEN l'utilisateur change la langue THEN le système SHALL traduire tous les messages de validation des nouveaux champs

### Requirement 3

**User Story:** En tant qu'administrateur du site, je veux que les emails soient envoyés via EmailJS au lieu de Microsoft Azure, afin d'avoir un système d'envoi d'emails fiable et fonctionnel.

#### Acceptance Criteria

1. WHEN un utilisateur soumet le formulaire THEN le système SHALL envoyer l'email via EmailJS
2. WHEN l'email est envoyé THEN le système SHALL inclure le numéro de téléphone dans le contenu de l'email
3. WHEN l'email est envoyé THEN le système SHALL inclure l'adresse email dans le contenu de l'email
4. WHEN l'email est envoyé THEN le système SHALL utiliser l'adresse email fournie comme "Reply To"
5. WHEN l'envoi d'email échoue THEN le système SHALL afficher un message d'erreur approprié à l'utilisateur
6. WHEN l'envoi d'email réussit THEN le système SHALL afficher un message de confirmation à l'utilisateur

### Requirement 4

**User Story:** En tant qu'administrateur, je veux que le template EmailJS soit correctement configuré avec les nouveaux champs, afin de recevoir toutes les informations nécessaires dans les emails.

#### Acceptance Criteria

1. WHEN le template EmailJS est configuré THEN il SHALL inclure une variable pour le numéro de téléphone
2. WHEN le template EmailJS est configuré THEN il SHALL inclure une variable pour l'adresse email
3. WHEN le template EmailJS est configuré THEN il SHALL maintenir les variables existantes (nom, message, date/heure)
4. WHEN un email est reçu THEN il SHALL contenir toutes les informations du formulaire dans un format lisible
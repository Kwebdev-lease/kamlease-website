# Design Document

## Overview

Cette conception détaille l'amélioration du formulaire de contact existant pour ajouter les champs téléphone et email, avec support multilingue complet et migration vers EmailJS. Le système actuel utilise déjà un formulaire sophistiqué avec validation, sécurité et support multilingue - nous devons étendre ces fonctionnalités existantes.

## Architecture

### Structure Actuelle
- **Composant principal**: `src/components/Contact.tsx` (1023 lignes)
- **Service d'envoi**: `functions/api/send-email-emailjs.ts` (basique)
- **Traductions**: `src/lib/translations.ts` (système complet fr/en)
- **Validation**: Hook `useFormValidation` avec règles personnalisées
- **Sécurité**: Middleware de sécurité avec sanitisation et CSRF

### Modifications Architecturales
1. **Extension du formulaire**: Ajout de 2 nouveaux champs avec validation
2. **Mise à jour des traductions**: Extension du système existant
3. **Amélioration EmailJS**: Remplacement complet du service Microsoft Graph
4. **Validation étendue**: Nouvelles règles pour email et téléphone

## Components and Interfaces

### 1. Formulaire de Contact (Contact.tsx)

#### État du Formulaire (Extension)
```typescript
// État actuel
const [formData, setFormData] = useState({
  nom: '',
  prenom: '',
  societe: '',
  message: ''
})

// Nouvel état étendu
const [formData, setFormData] = useState({
  nom: '',
  prenom: '',
  societe: '',
  email: '',      // NOUVEAU
  telephone: '',  // NOUVEAU
  message: ''
})
```

#### Règles de Validation (Extension)
```typescript
const validationRules: ValidationRules = {
  prenom: { required: true, minLength: 2, maxLength: 50 },
  nom: { required: true, minLength: 2, maxLength: 50 },
  societe: { maxLength: 100 },
  email: {          // NOUVEAU
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    maxLength: 100
  },
  telephone: {      // NOUVEAU
    required: true,
    pattern: /^(?:\+33|0)[1-9](?:[0-9]{8})$/,
    maxLength: 20
  },
  message: { required: true, minLength: 10, maxLength: 1000 }
}
```

#### Nouveaux Champs UI
- **Champ Email**: Input avec validation email en temps réel
- **Champ Téléphone**: Input avec validation format français/international
- **Positionnement**: Entre les champs nom/société et le message
- **Style**: Cohérent avec les champs existants (EnhancedInput)

### 2. Service EmailJS (Refonte Complète)

#### Configuration EmailJS
```typescript
interface EmailJSConfig {
  serviceId: string      // 'service_kamlease'
  templateId: string     // 'template_contact'
  userId: string         // Clé publique EmailJS
  accessToken?: string   // Clé privée (optionnelle)
}
```

#### Template EmailJS (Variables)
```typescript
interface EmailTemplateParams {
  from_name: string      // `${prenom} ${nom}`
  from_email: string     // email (nouveau)
  phone: string          // telephone (nouveau)
  company: string        // societe
  message: string        // message
  to_email: string       // 'contact@kamlease.com'
  reply_to: string       // email (nouveau)
  date: string           // Date d'envoi
  appointment_date?: string    // Si rendez-vous
  appointment_time?: string    // Si rendez-vous
}
```

#### Service Amélioré
```typescript
class EmailJSService {
  private config: EmailJSConfig
  
  async sendContactMessage(formData: ContactFormData): Promise<EmailResult>
  async sendAppointmentRequest(appointmentData: AppointmentFormData): Promise<EmailResult>
  private validateEmailJSResponse(response: Response): EmailResult
  private formatEmailContent(data: FormData): EmailTemplateParams
}
```

### 3. Système de Traductions (Extension)

#### Nouvelles Clés de Traduction
```typescript
// Ajouts dans translations.fr
contact: {
  form: {
    email: 'Adresse email',
    phone: 'Numéro de téléphone',
    emailPlaceholder: 'votre.email@exemple.com',
    phonePlaceholder: '+33 1 23 45 67 89',
    validation: {
      emailRequired: 'L\'adresse email est obligatoire',
      emailInvalid: 'Format d\'email invalide',
      phoneRequired: 'Le numéro de téléphone est obligatoire',
      phoneInvalid: 'Format de téléphone invalide (ex: +33 1 23 45 67 89)'
    }
  }
}

// Ajouts dans translations.en
contact: {
  form: {
    email: 'Email Address',
    phone: 'Phone Number',
    emailPlaceholder: 'your.email@example.com',
    phonePlaceholder: '+33 1 23 45 67 89',
    validation: {
      emailRequired: 'Email address is required',
      emailInvalid: 'Invalid email format',
      phoneRequired: 'Phone number is required',
      phoneInvalid: 'Invalid phone format (ex: +33 1 23 45 67 89)'
    }
  }
}
```

## Data Models

### FormData Interface (Étendue)
```typescript
interface ContactFormData {
  nom: string
  prenom: string
  societe: string
  email: string      // NOUVEAU
  telephone: string  // NOUVEAU
  message: string
}

interface AppointmentFormData extends ContactFormData {
  appointmentDate: Date
  appointmentTime: string
}
```

### EmailJS Response
```typescript
interface EmailJSResponse {
  status: number
  text: string
}

interface EmailResult {
  success: boolean
  message: string
  type: 'message' | 'appointment' | 'email_fallback'
  error?: string
  emailId?: string
}
```

## Error Handling

### Validation d'Email
- **Format**: Regex standard pour validation email
- **Domaines**: Vérification basique des domaines courants
- **Messages**: Traductions spécifiques par langue

### Validation de Téléphone
- **Format français**: `^(?:\+33|0)[1-9](?:[0-9]{8})$`
- **Format international**: Support des préfixes +33
- **Sanitisation**: Suppression des espaces et caractères spéciaux

### Gestion des Erreurs EmailJS
```typescript
enum EmailJSErrorCodes {
  INVALID_SERVICE = 400,
  INVALID_TEMPLATE = 404,
  RATE_LIMITED = 429,
  SERVER_ERROR = 500
}

const handleEmailJSError = (error: EmailJSResponse): string => {
  switch (error.status) {
    case 400: return t('contact.form.errors.invalidConfiguration')
    case 404: return t('contact.form.errors.templateNotFound')
    case 429: return t('contact.form.errors.rateLimited')
    default: return t('contact.form.errors.sendFailed')
  }
}
```

## Testing Strategy

### Tests Unitaires
1. **Validation des nouveaux champs**
   - Format email valide/invalide
   - Format téléphone français/international
   - Messages d'erreur traduits

2. **Service EmailJS**
   - Configuration correcte
   - Gestion des erreurs
   - Format des paramètres template

3. **Traductions**
   - Présence de toutes les clés
   - Cohérence français/anglais
   - Substitution de paramètres

### Tests d'Intégration
1. **Formulaire complet**
   - Soumission avec nouveaux champs
   - Validation en temps réel
   - Changement de langue

2. **EmailJS End-to-End**
   - Envoi réel d'emails de test
   - Vérification du contenu reçu
   - Gestion des échecs

### Configuration EmailJS Requise

#### Template EmailJS
Le template doit contenir ces variables :
- `{{from_name}}` - Nom complet
- `{{from_email}}` - Email (nouveau)
- `{{phone}}` - Téléphone (nouveau)  
- `{{company}}` - Société
- `{{message}}` - Message
- `{{reply_to}}` - Email pour réponse

#### Variables d'Environnement
```env
VITE_EMAILJS_SERVICE_ID=service_kamlease
VITE_EMAILJS_TEMPLATE_ID=template_contact
VITE_EMAILJS_USER_ID=your_user_id
VITE_EMAILJS_ACCESS_TOKEN=your_access_token
```

## Migration Strategy

### Phase 1: Ajout des Champs
1. Extension de l'interface FormData
2. Ajout des champs UI dans Contact.tsx
3. Extension des règles de validation
4. Mise à jour des traductions

### Phase 2: Service EmailJS
1. Refonte complète du service d'envoi
2. Configuration des variables d'environnement
3. Tests avec le template EmailJS
4. Remplacement des appels Microsoft Graph

### Phase 3: Tests et Déploiement
1. Tests unitaires et d'intégration
2. Validation du template EmailJS
3. Tests en production
4. Documentation utilisateur
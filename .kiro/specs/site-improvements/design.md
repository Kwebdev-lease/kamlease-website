# Document de Design

## Overview

Ce document présente la conception technique pour résoudre les problèmes identifiés sur le site Kamlease. L'analyse du code existant révèle plusieurs problèmes spécifiques qui affectent l'expérience utilisateur : incohérences dans l'application du mode sombre, traductions manquantes, utilisation de logos PNG au lieu de SVG, et problèmes potentiels de responsivité.

## Architecture

### Structure Actuelle
Le site utilise une architecture React moderne avec :
- **React 18** avec TypeScript
- **Tailwind CSS** pour le styling avec système de thèmes
- **Context API** pour la gestion des thèmes et langues
- **Shadcn/ui** pour les composants UI
- **Vite** comme bundler

### Problèmes Identifiés

#### 1. Système de Thèmes
- **Problème** : Le ThemeProvider force le mode sombre par défaut même quand aucun thème n'est stocké
- **Impact** : Comportement incohérent et flash de contenu mal stylé
- **Localisation** : `src/components/ThemeProvider.tsx` ligne 45-47

#### 2. Gestion des Logos
- **Problème** : Utilisation de logos PNG avec logique de sélection basique
- **Impact** : Qualité d'image dégradée sur écrans haute résolution
- **Localisation** : `src/components/Header.tsx` et `src/components/Footer.tsx`

#### 3. Traductions Incomplètes
- **Problème** : Certains textes ne sont pas traduits (ex: "Mentions légales", "Politique de confidentialité")
- **Impact** : Expérience utilisateur incohérente pour les utilisateurs anglophones
- **Localisation** : `src/components/Footer.tsx` et autres composants

#### 4. Variables CSS Dupliquées
- **Problème** : Définitions CSS variables dupliquées dans `src/index.css`
- **Impact** : Confusion et maintenance difficile

## Components and Interfaces

### 1. Amélioration du ThemeProvider

```typescript
interface ThemeProviderState {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'dark' | 'light' // Nouveau : thème résolu
}
```

**Changements requis :**
- Supprimer la logique de forçage du mode sombre
- Améliorer la détection du thème système
- Ajouter une propriété `resolvedTheme` pour connaître le thème effectif

### 2. Système de Logos Dynamiques

```typescript
interface LogoConfig {
  light: string // Logo pour fond clair
  dark: string  // Logo pour fond sombre
  format: 'svg' | 'png'
}

const LOGO_CONFIG: LogoConfig = {
  light: '/assets/logos/logo-color.svg',
  dark: '/assets/logos/Logo White for black background.svg',
  format: 'svg'
}
```

**Composant Logo réutilisable :**
```typescript
interface LogoProps {
  className?: string
  alt?: string
}

function Logo({ className, alt = "Kamlease" }: LogoProps)
```

### 3. Extension des Traductions

**Nouvelles clés de traduction à ajouter :**
```typescript
footer: {
  legalNotice: 'Mentions légales' | 'Legal Notice'
  privacyPolicy: 'Politique de confidentialité' | 'Privacy Policy'
  // Autres traductions manquantes
}
```

### 4. Hook de Responsivité

```typescript
interface BreakpointConfig {
  sm: boolean
  md: boolean
  lg: boolean
  xl: boolean
}

function useBreakpoint(): BreakpointConfig
```

## Data Models

### Configuration des Thèmes

```typescript
type Theme = 'dark' | 'light' | 'system'

interface ThemeConfig {
  defaultTheme: Theme
  storageKey: string
  enableSystem: boolean
}
```

### Configuration des Assets

```typescript
interface AssetConfig {
  logos: {
    light: string
    dark: string
  }
  images: {
    [key: string]: {
      light?: string
      dark?: string
      default: string
    }
  }
}
```

## Error Handling

### 1. Gestion des Erreurs de Thème
- **Fallback** : Si le thème stocké est invalide, utiliser le thème système
- **Validation** : Vérifier la validité des valeurs de thème avant application
- **Recovery** : Mécanisme de récupération en cas d'erreur de localStorage

### 2. Gestion des Assets Manquants
- **Fallback** : Images de remplacement si les logos SVG ne se chargent pas
- **Lazy Loading** : Chargement différé des images non critiques
- **Error Boundaries** : Composants d'erreur pour les échecs de chargement

### 3. Gestion des Traductions
- **Fallback** : Affichage de la clé si la traduction est manquante
- **Logging** : Enregistrement des clés de traduction manquantes
- **Validation** : Vérification de l'intégrité des fichiers de traduction

## Testing Strategy

### 1. Tests Unitaires
- **ThemeProvider** : Tests de changement de thème et persistance
- **LanguageProvider** : Tests de changement de langue et traductions
- **Logo Component** : Tests de sélection de logo selon le thème
- **Responsive Hooks** : Tests de détection de breakpoints

### 2. Tests d'Intégration
- **Theme Switching** : Tests de cohérence visuelle lors du changement de thème
- **Language Switching** : Tests de traduction complète de l'interface
- **Logo Display** : Tests d'affichage correct des logos SVG

### 3. Tests Visuels
- **Responsive Design** : Tests sur différentes tailles d'écran
- **Theme Consistency** : Vérification de l'application cohérente des thèmes
- **Asset Loading** : Tests de chargement des logos SVG

### 4. Tests de Performance
- **Bundle Size** : Vérification que les améliorations n'augmentent pas significativement la taille
- **Loading Speed** : Tests de vitesse de chargement des assets
- **Memory Usage** : Vérification de l'absence de fuites mémoire

## Implementation Approach

### Phase 1 : Corrections Critiques
1. **Nettoyage CSS** : Supprimer les variables CSS dupliquées
2. **Fix ThemeProvider** : Corriger la logique de thème par défaut
3. **Migration SVG** : Remplacer tous les logos PNG par SVG

### Phase 2 : Améliorations UX
1. **Traductions complètes** : Ajouter toutes les traductions manquantes
2. **Composant Logo** : Créer un composant Logo réutilisable
3. **Tests responsivité** : Vérifier et corriger les problèmes mobile

### Phase 3 : Optimisations
1. **Performance** : Optimiser le chargement des assets
2. **Accessibilité** : Améliorer l'accessibilité des composants
3. **Tests** : Ajouter une couverture de tests complète

## Technical Considerations

### Compatibilité Navigateurs
- **SVG Support** : Tous les navigateurs modernes supportent SVG
- **CSS Variables** : Support natif dans tous les navigateurs cibles
- **LocalStorage** : Gestion des erreurs pour les navigateurs restrictifs

### Performance
- **SVG vs PNG** : Les SVG sont généralement plus légers et plus nets
- **CSS Optimization** : Réduction de la duplication améliore les performances
- **Bundle Splitting** : Considérer le code splitting pour les traductions

### Maintenance
- **Type Safety** : Utilisation de TypeScript pour éviter les erreurs
- **Consistent Naming** : Convention de nommage cohérente pour les assets
- **Documentation** : Documentation claire des configurations et APIs
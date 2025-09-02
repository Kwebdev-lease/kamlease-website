# Guide de Debug Vidéo Mobile

## Problème actuel
- Vidéo reste en chargement infini sur certains iPhones
- Cadre visible mais pas d'image poster
- Icône de chargement qui tourne indéfiniment

## Solutions implémentées

### 1. Debug à distance
Le système enregistre maintenant toutes les informations de debug dans le localStorage du navigateur mobile.

**Pour consulter les logs depuis un ordinateur :**
1. Va sur le site depuis ton ordinateur
2. Ouvre la console développeur (F12)
3. Tape : `RemoteDebugger.getInstance().dumpToConsole()`
4. Tu verras tous les logs de debug du mobile

### 2. Timeout de sécurité
- La vidéo arrête de charger après 15 secondes
- Bascule automatiquement vers le mode erreur
- Affiche les options de fallback

### 3. Lecteurs alternatifs
En cas d'erreur, 3 options sont proposées :
1. **Lecteur natif standard** - avec contrôles HTML5
2. **Lecteur optimisé iOS** - configuration spéciale Safari
3. **Téléchargement direct** - lien pour télécharger la vidéo

### 4. Informations de debug visibles
Sur mobile, un petit panneau en bas à droite affiche :
- Les étapes de chargement en temps réel
- Le type d'appareil détecté
- Les erreurs éventuelles

## Comment tester

### Sur ton iPhone qui ne fonctionne pas :
1. Va sur le site
2. Navigue vers la section Processus
3. Regarde le panneau de debug en bas à droite
4. Note les messages qui s'affichent
5. Après 15 secondes, la vidéo devrait basculer en mode erreur
6. Essaie les 3 lecteurs alternatifs proposés

### Depuis ton ordinateur :
1. Ouvre la console développeur
2. Tape : `RemoteDebugger.getInstance().dumpToConsole()`
3. Tu verras tous les logs du mobile
4. Partage-moi ces informations pour diagnostiquer

## Causes possibles du problème

### 1. Format vidéo incompatible
- Certains codecs ne sont pas supportés sur iOS
- Solution : Les lecteurs alternatifs utilisent différentes configurations

### 2. Problème de réseau
- Vidéo trop lourde pour la connexion mobile
- Solution : Timeout et fallback vers téléchargement

### 3. Politique de lecture automatique
- iOS bloque certaines tentatives de lecture
- Solution : Lecteur optimisé iOS avec configuration spéciale

### 4. Problème de CORS ou sécurité
- Restrictions de sécurité sur le domaine
- Solution : Ajout de `crossOrigin="anonymous"`

## Prochaines étapes

1. **Teste sur ton iPhone** et note les messages de debug
2. **Consulte les logs** depuis ton ordinateur
3. **Essaie les lecteurs alternatifs** en cas d'erreur
4. **Partage-moi les informations** pour un diagnostic précis

## Commandes utiles (console navigateur)

```javascript
// Voir tous les logs de debug mobile
RemoteDebugger.getInstance().dumpToConsole()

// Exporter les logs en fichier
RemoteDebugger.getInstance().exportLog()

// Tester la vidéo
VideoDiagnostics.getInstance().logDiagnostics('/images/gallery/ProcessusVideo.mp4')

// Voir les capacités vidéo
VideoDiagnostics.getInstance().getVideoCapabilities()
```

## Contact
Si le problème persiste, partage-moi :
1. Les logs de debug de la console
2. Le modèle exact de ton iPhone
3. La version d'iOS
4. Si les lecteurs alternatifs fonctionnent
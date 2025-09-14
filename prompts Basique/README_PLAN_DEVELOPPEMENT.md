# GLOUP - Plan de Développement Complet

## Vue d'ensemble

Ce dossier contient les prompts détaillés pour développer l'application GLOUP, un réseau social bienveillant construit avec React Native + Expo + Supabase.

## Architecture du Projet

```
GLOUP/
├── apps/mobile/           # Application Expo React Native
├── packages/ui/           # Composants UI réutilisables
├── packages/theme/        # Système de thème et tokens
├── packages/api/          # SDK client Supabase
├── supabase/              # Base de données et migrations
├── e2e/                   # Tests end-to-end
├── .github/workflows/      # CI/CD
└── docs/                  # Documentation
```

## Stack Technique

- **Frontend**: React Native + Expo (SDK 50+)
- **Navigation**: Expo Router
- **State Management**: React Query
- **UI**: NativeWind + Design System personnalisé
- **Backend**: Supabase (PostgreSQL + Auth + Realtime + Storage)
- **Animations**: Reanimated 3
- **Performance**: FlashList
- **Testing**: Jest + Maestro
- **CI/CD**: GitHub Actions + EAS

## Palette de Design "Bleu Nuit"

### Thème Sombre (par défaut)
- `bg`: #0F1B2E
- `surface`: #13233C
- `line`: rgba(255,255,255,0.08)
- `text`: #F8FAFC
- `text-muted`: #B6C3D7
- `accent`: #3A8DFF
- `accent-pressed`: #3077E0
- `accent-alt`: #60A5FA

### Thème Clair
- `bg`: #F5F8FF
- `surface`: #FFFFFF
- `line`: rgba(15,27,46,0.10)
- `text`: #0F1B2E
- `text-muted`: #4B5B74
- `accent`: #1E5BFF
- `accent-pressed`: #184ACC
- `accent-alt`: #3B82F6

## Plan de Développement par Phase

### Phase 1: Initialisation du Projet
**Fichier**: `01_initialisation_projet.md`

- Création de la structure monorepo
- Initialisation Expo avec TypeScript
- Installation des dépendances
- Configuration de Tailwind/NativeWind
- Mise en place de ESLint/Prettier
- Configuration de Git et hooks

### Phase 2: Thème et UI Kit
**Fichier**: `02_theme_ui_kit.md`

- Création du système de tokens
- Implémentation des thèmes clair/sombre
- Développement des composants de base:
  - Button
  - Card
  - ReactionChip
  - Avatar
  - TabBar

### Phase 3: Base de Données Supabase
**Fichier**: `03_base_de_donnees_supabase.md`

- Schéma de base de données complet
- Tables principales:
  - profiles
  - posts
  - follows
  - reactions
  - advice
  - messages
  - conversations
- Politiques RLS
- Triggers et fonctions RPC
- Données de seed

### Phase 4: Authentification et Onboarding
**Fichier**: `04_authentification_onboarding.md`

- Magic link authentication
- Écrans d'authentification
- Flux d'onboarding
- Context d'authentification
- Gestion des sessions

### Phase 5: Navigation et Onglets Principaux
**Fichier**: `05_navigation_onglets.md`

- Structure de navigation principale
- 4 onglets: Feed, Conseils, Messages, Profil
- TabBar personnalisé
- États de navigation

### Phase 6: Feed et Posts
**Fichier**: `06_feed_posts.md`

- Système de posts CRUD
- Composant PostCard
- Réactions et système de points
- Gestion des médias
- Performance avec FlashList

### Phase 7: Système de Conseils et Récompenses
**Fichier**: `07_systeme_conseils.md`

- Création de conseils
- Récompenses +200 points
- Classement des meilleurs conseils
- Filtres et catégories
- Templates pour les conseils

### Phase 8: Messages et Groupes
**Fichier**: `08_messages_groupes.md`

- Conversations privées
- Groupes thématiques
- Chat en temps réel
- Médias et pièces jointes
- Permissions de groupe

### Phase 9: Profil et Personnalisation
**Fichier**: `09_profil_personnalisation.md`

- Écran de profil complet
- Édition de profil
- Badges et achievements
- Options de personnalisation
- Gestion des followers

### Phase 10: Fonctionnalités Avancées
**Fichier**: `10_fonctionnalites_avancees.md`

- Système de recherche
- Notifications push
- Paramètres de l'application
- Modération basique
- Analytics et métriques

## Fonctionnalités Clés

### 1. Système de Points Unique
- **Réactions**: 10-20 points par réaction
- **Couronne**: 20-40 points (multiplicateur x2)
- **Conseils récompensés**: +200 points
- **Badges**: Points de prestige
- **Mentor**: Statut spécial avec seuil de points

### 2. Design Inspiré de X
- Timeline similaire à X
- Barres d'actions sur les posts
- Micro-interactions fluides
- Performance optimisée
- Accessibilité au premier plan

### 3. Gamification
- Badges et achievements
- Niveaux de Mentor
- Personnalisation avec les points
- Classements et trending
- Récompenses sociales

### 4. Bienveillance par Design
- Pas de "likes" binaires
- Réactions expressives et positives
- Modération proactive
- Signalements simplifiés
- Charte de bienveillance

## Structure des Données

### Posts
```typescript
interface Post {
  id: string;
  author_id: string;
  text: string;
  media: MediaItem[];
  visibility: 'public' | 'followers' | 'private';
  created_at: string;
  reaction_count: number;
  advice_count: number;
}
```

### Conseils
```typescript
interface Advice {
  id: string;
  post_id: string;
  advisor_id: string;
  body: string;
  created_at: string;
  is_rewarded: boolean;
  reward_points?: number;
}
```

### Utilisateurs
```typescript
interface User {
  id: string;
  username: string;
  display_name: string;
  bio?: string;
  avatar_url?: string;
  total_points: number;
  is_mentor: boolean;
  badges: Badge[];
}
```

## Roadmap

### Alpha (Semaine 6-8)
- [x] Authentification fonctionnelle
- [x] Feed basique
- [x] Système de réactions
- [x] Profil utilisateur
- [x] Navigation principale

### Beta (Semaine 10-12)
- [x] Conseils complets
- [x] Récompenses +200 points
- [x] Messages privés
- [x] Groupes basiques
- [x] Notifications

### V1.0 (Semaine 14+)
- [x] Personnalisation complète
- [x] Recherche avancée
- [x] Modération
- [x] Analytics
- [x] Performance optimisée

## Métriques de Succès

### Engagement
- Rétention J30 > 60%
- ≥ 5 réactions moyennes par post
- Ratio conseils récompensés > 40%

### Performance
- 60fps sur 1000+ posts
- Temps de chargement < 2s
- Taux de crash < 1%

### Communauté
- Taux de signalements résolus < 24h
- < 2% comptes frauduleux
- Taux de mentorat > 10%

## Bonnes Pratiques

### Code
- TypeScript strict avec tous les types
- Tests unitaires et intégration
- Code review pour chaque PR
- Documentation du code

### Design
- Composants réutilisables
- Tokens de design centralisés
- Tests d'accessibilité
- Support mode clair/sombre

### Performance
- FlashList pour longues listes
- Lazy loading des images
- Optimisation des requêtes
- Monitoring des performances

### Sécurité
- RLS sur toutes les tables
- Validation des entrées
- Protection contre les injections
- Audit de sécurité régulier

## Déploiement

### Développement
- Branches features isolées
- PR avec description détaillée
- Tests automatiques
- Review par les LLM

### Production
- Déploiement continu avec EAS
- Monitoring avec Sentry
- Analytics avec PostHog
- Rollback automatique

## Outils Utilisés

### Développement
- VS Code
- Expo Go
- Supabase CLI
- Git

### Testing
- Jest pour les tests unitaires
- Maestro pour les tests E2E
- Detox pour les tests d'intégration
- BrowserStack pour les tests multi-appareils

### Monitoring
- Sentry pour les erreurs
- PostHog pour l'analytique
- Supabase logs
- Expo metrics

## Contribuer

1. Forker le repository
2. Créer une branche feature
3. Développer avec les prompts fournis
4. Tester et documenter
5. Soumettre une PR

## License

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.

---

**Projet GLOUP** - Réseau social bienveillant piloté par LLM
*Construisons ensemble une communauté positive et inspirante !* 🌟
# GLOUP - Réseau Social Bienveillant

GLOUP est un réseau social mobile axé sur la bienveillance et la transformation personnelle, développé avec React Native + Expo + Supabase.

## 🌟 Fonctionnalités Clés

- **4 Onglets Principaux** : Feed, Conseils, Messages & Groupes, Profil
- **Système de Points Unique** : 
  - Réactions : 10-20 points
  - Couronne : 20 points (×2)
  - Récompense Conseil : +200 points
- **Design "Bleu Nuit"** avec thèmes clair/sombre
- **Bienveillance par Design** : pas de "likes" binaires, réactions expressives

## 🏗️ Architecture

```
GLOUP/
├── apps/mobile/           # Application Expo React Native
├── packages/ui/           # Composants UI réutilisables
├── packages/theme/        # Système de thème et tokens
├── packages/api/          # SDK client Supabase
├── supabase/              # Base de données et migrations
├── e2e/                   # Tests end-to-end
└── .github/workflows/     # CI/CD
```

## 🚀 Stack Technique

- **Frontend** : React Native + Expo (SDK 50+)
- **Navigation** : Expo Router
- **State Management** : React Query
- **UI** : NativeWind + Design System personnalisé
- **Backend** : Supabase (PostgreSQL + Auth + Realtime + Storage)
- **Animations** : Reanimated 3
- **Performance** : FlashList
- **Testing** : Jest + Maestro

## 📱 Installation

1. **Prérequis**
   ```bash
   npm install -g @expo/cli
   ```

2. **Installation des dépendances**
   ```bash
   cd apps/mobile
   npm install
   ```

3. **Configuration**
   ```bash
   cp .env.example .env
   # Remplir les variables d'environnement
   ```

4. **Démarrage**
   ```bash
   npm run dev
   ```

## 🎨 Design System

### Palette "Bleu Nuit"

**Thème Sombre (par défaut)**
- `bg`: #0F1B2E
- `surface`: #13233C
- `accent`: #3A8DFF
- `text`: #F8FAFC

**Thème Clair**
- `bg`: #F5F8FF
- `surface`: #FFFFFF
- `accent`: #1E5BFF
- `text`: #0F1B2E

## 🧪 Tests

```bash
# Tests unitaires
npm run test

# Linting
npm run lint

# Type checking
npm run typecheck
```

## 📋 Scripts Disponibles

- `npm run dev` - Démarrer le serveur de développement
- `npm run lint` - Linter le code
- `npm run typecheck` - Vérification des types TypeScript
- `npm run format` - Formater le code avec Prettier
- `npm run test` - Lancer les tests

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feat/amazing-feature`)
3. Commit les changements (`git commit -m 'feat: add amazing feature'`)
4. Push vers la branche (`git push origin feat/amazing-feature`)
5. Ouvrir une Pull Request

## 📄 License

Ce projet est sous licence MIT.

---

**GLOUP** - Construisons ensemble une communauté positive et inspirante ! 🌟
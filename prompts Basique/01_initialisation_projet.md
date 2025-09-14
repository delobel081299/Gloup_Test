# GLOUP - Phase 1: Initialisation du Projet

## Contexte
Ce prompt guide l'initialisation complète du projet GLOUP avec React Native + Expo + Supabase.

## Rôle
Tu es un architecte logiciel expert en React Native, Expo et Supabase. Tu dois créer la structure de projet complète et l'initialiser avec toutes les dépendances nécessaires.

## Objectifs
1. Créer la structure de projet monorepo
2. Initialiser Expo avec TypeScript
3. Configurer les dépendances clés
4. Mettre en place la configuration de base
5. Préparer l'environnement pour le développement

## Stack Technique
- React Native + Expo (SDK 50+)
- TypeScript
- Supabase (Auth, DB, Realtime, Storage, Edge Functions)
- NativeWind/Tamagui (UI)
- Expo Router (navigation)
- React Query (state management)
- FlashList (performance listes)
- Reanimated 3 (animations)
- Sentry/Analytics

## Structure du Projet
```
/apps/mobile           # Expo RN app
/packages/ui           # DS & composants
/packages/theme        # tokens & thèmes
/packages/api          # SDK client (Supabase + RPC typed)
/supabase              # migrations SQL, policies, seed, edge functions
/e2e                   # Maestro/Detox scripts
.github/workflows     # CI/CD
docs                  # ADR, RFC, UX specs
```

## Instructions Détaillées

### 1. Créer la structure de base
```bash
# Créer les dossiers principaux
mkdir -p apps/mobile packages/ui packages/theme packages/api supabase e2e .github/workflows docs
```

### 2. Initialiser l'application Expo
```bash
cd apps/mobile
npx create-expo-app@latest . --template blank-typescript
```

### 3. Installer les dépendances principales
```bash
# Dépendences de base
npm install @supabase/supabase-js @tanstack/react-query @tanstack/react-query-devtools
npm install expo-router react-native-screens react-native-safe-area-context
npm install react-native-gesture-handler react-native-reanimated
npm install @shopify/flash-list react-native-svg
npm install nativewind
npm install expo-status-bar expo-constants expo-font expo-splash-screen
npm install expo-haptics expo-linear-gradient expo-av
npm install expo-image-picker expo-document-picker
npm install @sentry/react-native @sentry/tracing
npm install posthog-react-native

# Dépendences de développement
npm install -D tailwindcss eslint prettier typescript @types/react
npm install -D @typescript-eslint/eslint-plugin @typescript-eslint/parser
npm install -D husky lint-staged
```

### 4. Configurer Tailwind/NativeWind
Créer `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "../packages/ui/**/*.{js,jsx,ts,tsx}",
    "../packages/theme/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0F1B2E",
        surface: "#13233C",
        line: "rgba(255,255,255,0.08)",
        text: "#F8FAFC",
        textmuted: "#B6C3D7",
        accent: "#3A8DFF",
        accentPressed: "#3077E0",
        accentAlt: "#60A5FA",
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
        info: "#3A8DFF"
      },
      borderRadius: { xs: "6px", sm: "8px", md: "12px", lg: "16px" },
      spacing: { 1: "4px", 2: "8px", 3: "12px", 4: "16px" }
    }
  },
  plugins: []
};
```

### 5. Configurer ESLint et Prettier
Créer `.eslintrc.js`:
```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    '@react-native',
  ],
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
  },
};
```

Créer `.prettierrc`:
```json
{
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "semi": false
}
```

### 6. Créer le fichier app.config.ts
```typescript
import { ExpoConfig } from '@expo/config-types';

export default (): ExpoConfig => ({
  name: 'GLOUP',
  slug: 'gloup',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#0F1B2E'
  },
  updates: {
    fallbackToCacheTimeout: 0,
    url: 'https://u.expo.dev/YOUR_EAS_PROJECT_ID'
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.gloup.app'
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#0F1B2E'
    },
    package: 'com.gloup.app'
  },
  web: {
    favicon: './assets/favicon.png'
  },
  plugins: [
    'expo-router',
    'expo-av',
    'expo-image-picker',
    'expo-haptics',
    'expo-linear-gradient'
  ],
  extra: {
    eas: {
      projectId: 'YOUR_EAS_PROJECT_ID'
    }
  }
});
```

### 7. Créer la structure de base de l'application
- Créer `src/` avec les dossiers:
  - `components/` - Composants réutilisables
  - `screens/` - Écrans principaux
  - `navigation/` - Configuration de navigation
  - `hooks/` - Hooks personnalisés
  - `utils/` - Utilitaires
  - `constants/` - Constantes
  - `types/` - Définitions de type
  - `services/` - Services (Supabase, etc.)

### 8. Configurer Git et les hooks
```bash
git init
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
```

### 9. Créer les fichiers de configuration
- `.gitignore` avec les exclusions RN/Expo
- `package.json` dans chaque package
- `tsconfig.json` pour le TypeScript strict

## Livrables Attendus
1. Structure de projet complète
2. Application Expo initialisée avec TypeScript
3. Toutes les dépendances installées
4. Configuration Tailwind/NativeWind
5. Configuration ESLint/Prettier
6. Fichier app.config.ts complet
7. Structure de dossiers src/ créée
8. Configuration Git et hooks

## Contraintes
- Utiliser TypeScript strict
- Suivre les conventions de nommage
- Respecter la structure monorepo
- Configurer les thèmes clair/sombre
- Mettre en place les bonnes pratiques dès le départ

## Validation
- `npm run dev` fonctionne
- `npx expo start` démarre correctement
- ESLint et Prettier fonctionnent
- Structure de dossiers respectée
- TypeScript compile sans erreurs
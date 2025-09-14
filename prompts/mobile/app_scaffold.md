# Prompt — Squelette App Expo (GLOUP)

RÔLE: Ingénieur RN/Expo
OBJECTIF: Initialiser l’app `apps/mobile` avec Expo + TypeScript + tooling + libs.

CONTRAINTES
- Expo Router, React Query, NativeWind, Reanimated, Gesture Handler, FlashList.
- ESLint/Prettier/TS strict; Husky + lint-staged.
- EAS config (dev/preview/prod), `.env.example`, `app.config.ts` (lire secrets EAS).

SORTIES
- Patch complet créant l’app et configs: `apps/mobile/...`
- `package.json` scripts: `dev`, `lint`, `typecheck`, `test`.

INSTRUCTIONS AU LLM
1) Créer l’app Expo TS dans `apps/mobile` (sans init réseau ou installation réelle; fournir fichiers finaux).
2) Ajouter Expo Router + `app/(tabs)/{feed,advice,messages,profile}.tsx` + `app/_layout.tsx`.
3) Installer config NativeWind (tailwind.config.js) + `global.css` si nécessaire.
4) Ajouter React Query provider, ThemeProvider (utilisera `packages/theme`).
5) Configurer Reanimated + Gesture Handler (babel preset).
6) Ajouter Sentry init (placeholder DSN via env) et PostHog/Amplitude (hooks d’événements).
7) Mettre en place ESLint/Prettier/TS strict; Husky + lint-staged.

CHECKLIST (DoD)
- Lint/Typecheck OK; `expo start` documenté; onglets affichent du contenu placeholder.


# Guide d’Implémentation et d’Utilisation des Prompts LLM — GLOUP

Ce guide explique précisément comment dérouler chaque étape du plan, comment utiliser et naviguer dans les fichiers du dossier `prompts/`, et comment piloter le développement complet de GLOUP via des LLM.

## 1) Structure Du Projet & Rappels Clés
- Monorepo cible:
  - `apps/mobile` — App Expo React Native (TypeScript)
  - `packages/ui` — Design System & composants
  - `packages/theme` — Tokens & thèmes (dark/light)
  - `packages/api` — SDK client (Supabase + RPC typé)
  - `supabase` — Migrations SQL, RLS, triggers, RPC, seed, edge functions
  - `e2e` — Tests E2E (Maestro/Detox)
  - `.github/workflows` — CI/CD
- Stack: React Native + Expo + TS, Supabase (Auth/DB/Realtime/Storage/RPC), EAS (Build/Submit/Updates).
- Navigation: 4 onglets — Feed, Conseils, Messages & Groupes, Profil.
- Barème points (figé): Couronne 20, autres réactions 10; Récompense d’un conseil +200.

## 2) Comment Utiliser Les Prompts (LLM Ops)
- Étapes générales pour chaque lot/feature:
  1) Choisir le prompt adapté dans `prompts/` (voir table de navigation ci‑dessous).
  2) Préparer le contexte minimal: extraits docs/SQL/TS pertinents, objectifs, contraintes, DoD.
  3) Remplacer les variables `{}` dans le prompt (ex: `{feature}`, `{branch}`, `{pr_number}`).
  4) Demander au LLM un patch complet (création/modification de fichiers avec chemins exacts) + explications brèves + tests.
  5) Appliquer le patch localement, lancer lint/typecheck/tests si disponible, et vérifier la DoD.
  6) Ouvrir une PR (Conventional Commits), faire relire via `prompts/roles/reviewer.md`, corriger, puis fusionner.

- Modèle de “bundle de prompt” (à copier-coller):
  1) RFC: `prompts/roles/architect.md`
  2) Implémentation: `prompts/roles/codegen.md` + prompt feature (ex: `prompts/mobile/features/feed_and_reactions.md`)
  3) Tests: `prompts/roles/tester.md` + `prompts/testing/*`
  4) Revue: `prompts/roles/reviewer.md`
  5) Docs: `prompts/roles/doc.md`

## 3) Navigation Dans Le Dossier prompts/
- Plan global: `prompts/plan_overall.md` — Séquence complète des phases et prompts associés.
- Lignes directrices & index: `prompts/README.md`, `prompts/contributing.md`.
- Rôles LLM:
  - Architecte: `prompts/roles/architect.md`
  - Codegen: `prompts/roles/codegen.md`
  - Reviewer: `prompts/roles/reviewer.md`
  - Tester/QA: `prompts/roles/tester.md`
  - Doc: `prompts/roles/doc.md`
- Supabase:
  - Schéma/RLS/Triggers/RPC/Seed: `prompts/supabase/schema_prompt.md`
  - Edge/Server (optionnel): `prompts/supabase/edge_functions_prompt.md`
- Mobile (setup):
  - Squelette Expo: `prompts/mobile/app_scaffold.md`
  - Navigation Tabs: `prompts/mobile/navigation.md`
  - Thèmes & tokens: `prompts/mobile/theme_tokens.md`
  - DS composants: `prompts/mobile/ui_components.md`
- Mobile (features):
  - Auth & Onboarding: `prompts/mobile/features/auth_onboarding.md`
  - Composer & Médias: `prompts/mobile/features/post_composer.md`
  - Feed & Réactions: `prompts/mobile/features/feed_and_reactions.md`
  - Conseils & Récompense: `prompts/mobile/features/advice_and_reward.md`
  - Messages & Groupes: `prompts/mobile/features/messages_and_groups.md`
  - Notifications v1: `prompts/mobile/features/notifications_v1.md`
  - Profil & Personnalisation: `prompts/mobile/features/profile_and_personalization.md`
  - Modération & Signalements: `prompts/mobile/features/moderation_reporting.md`
- Tests & CI/CD:
  - Unit/Intégration: `prompts/testing/unit_integration.md`
  - E2E Maestro: `prompts/testing/e2e_maestro.md`
  - CI/CD GH Actions + EAS: `prompts/ci_cd/github_actions.md`
- Observabilité & Sécurité & Perfs:
  - Sentry + Analytics: `prompts/observability_sentry_analytics.md`
  - Validation RLS/Sécurité: `prompts/security_rls_validation.md`
  - Performances checklist: `prompts/performance_checklist.md`

## 4) Déroulé Exact Par Phase (quoi utiliser, quoi fournir, quoi valider)

### Phase 1 — Bootstrap monorepo & CI/CD
- Objectif: Arborescence, tooling, workflows CI.
- Prompts à utiliser:
  - `prompts/mobile/app_scaffold.md` (squelette Expo + tooling)
  - `prompts/ci_cd/github_actions.md` (workflows CI/EAS)
  - Rôle Codegen: `prompts/roles/codegen.md`
- Entrées à fournir au LLM:
  - Structure cible (section 1 de ce guide) et exigences ESLint/Prettier/TS strict.
  - Scripts souhaités (`dev`, `lint`, `typecheck`, `test`).
- Sorties attendues:
  - Patch créant `apps/mobile`, `packages/*`, `.github/workflows/*`, configs EAS, Tailwind/NativeWind, Babel.
- Validation (DoD):
  - Démarrage Expo documenté; lint/typecheck OK; workflows présents (sans secrets).

### Phase 2 — Supabase: Schéma, RLS, Triggers, RPC, Seed
- Objectif: Migrations SQL initiales + seed `reaction_types` + RPC clés.
- Prompts à utiliser:
  - `prompts/supabase/schema_prompt.md`
  - Rôle Architecte (si arbitrages): `prompts/roles/architect.md`
- Entrées à fournir:
  - Barème points (20/10/+200), visibilité (`public|community|verified`), tables listées.
- Sorties attendues:
  - Fichiers `supabase/migrations/*`, `supabase/seed/seed.sql`, policies RLS, triggers, RPC `reward_advice`, `feed_for_user`.
- Validation (DoD):
  - `supabase db reset` (ou équivalent) passable; RLS ON partout; RPC testées; seed OK.

### Phase 3 — App Expo: Navigation, Thèmes/Tokens, DS de base
- Objectif: TabBar (4), thèmes dark/light, composants Button/Card/ReactionChip/Tabs.
- Prompts à utiliser:
  - `prompts/mobile/navigation.md`, `prompts/mobile/theme_tokens.md`, `prompts/mobile/ui_components.md`
  - Rôle Codegen: `prompts/roles/codegen.md`
- Entrées à fournir:
  - Tokens “Bleu nuit” depuis docs; règles A11y (44pt, contrastes AA/AAA).
- Sorties attendues:
  - Écrans d’onglets, provider de thème, DS composants + tests RTL.
- Validation (DoD):
  - App démarre; thèmes switchables; composants affichés; tests passent.

### Phase 4 — E1: Auth & Onboarding
- Objectif: Magic link, profil minimal, intérêts/consentements.
- Prompts à utiliser:
  - `prompts/mobile/features/auth_onboarding.md`
  - Tester: `prompts/testing/unit_integration.md`, `prompts/testing/e2e_maestro.md`
- Entrées à fournir:
  - Politiques `profiles` (RLS update self-only), règles username.
- Sorties attendues:
  - Écrans Auth/Onboarding, hooks `useAuth`, `useProfile`, validations Zod, tests.
- Validation (DoD):
  - e2e du flow complet OK; analytics `auth_*` enregistrés.

### Phase 5 — E2: Composer & Médias
- Objectif: Composer depuis Profil, upload Storage, alt-text obligatoire.
- Prompts à utiliser:
  - `prompts/mobile/features/post_composer.md`
- Entrées à fournir:
  - Limites taille/ratio; buckets; chemin de stockage.
- Sorties attendues:
  - Écran compose, services upload, validations, tests.
- Validation (DoD):
  - Post avec image+alt-text rendu; erreurs gérées; tests passent.

### Phase 6 — E3: Feed & Réactions (points)
- Objectif: `Pour toi / Suivis`, FlashList, réactions attribuant points.
- Prompts à utiliser:
  - `prompts/mobile/features/feed_and_reactions.md`
- Entrées à fournir:
  - Détails RPC `feed_for_user`; règle unicité réactions.
- Sorties attendues:
  - `useFeed`, `PostCard`, `ReactionBar`, mutations insert réactions.
- Validation (DoD):
  - Scroll fluide; pas de doublon de réaction; points auteur augmentent (trigger).

### Phase 7 — E4: Conseils & Récompense (+200)
- Objectif: Page Conseils, CRUD advice, RPC reward.
- Prompts à utiliser:
  - `prompts/mobile/features/advice_and_reward.md`
- Entrées à fournir:
  - Règles d’accès: seul auteur du post peut récompenser; anti double récompense.
- Sorties attendues:
  - `AdviceCard`, liste triée, `useRewardAdvice` (RPC), tests.
- Validation (DoD):
  - e2e de reward OK; +200 appliqués au conseiller.

### Phase 8 — E5: Messages & Groupes v1
- Objectif: Inbox, Conversation, membres/roles, réactions inline.
- Prompts à utiliser:
  - `prompts/mobile/features/messages_and_groups.md`
- Entrées à fournir:
  - RLS conversation/members/messages; schéma conv/group.
- Sorties attendues:
  - Écrans Inbox/Conversation, hooks realtime/poll, sendMessage, tests.
- Validation (DoD):
  - DM de bout en bout OK; non-lus corrects; RLS validée.

### Phase 9 — E6: Notifications v1
- Objectif: Liste/badge non-lus, mark-as-read.
- Prompts à utiliser:
  - `prompts/mobile/features/notifications_v1.md`
- Entrées à fournir:
  - Modèle `notifications` + triggers éventuels.
- Sorties attendues:
  - `useNotifications`, badge sur tabs, tests unit.
- Validation (DoD):
  - Marquage lu/non-lu; pas de fuite d’info inter‑users.

### Phase 10 — E7: Profil & Personnalisation via points
- Objectif: Header profil, onglets, gating par `user_points.total`.
- Prompts à utiliser:
  - `prompts/mobile/features/profile_and_personalization.md`
- Entrées à fournir:
  - Paliers de déverrouillage (fond d’écran/cadre photo, MVP).
- Sorties attendues:
  - Écrans + hooks points, affichage badges/statuts.
- Validation (DoD):
  - Gating correct selon points; tests UI.

### Phase 11 — Modération & Reports v1
- Objectif: Signalement simple + charte.
- Prompts à utiliser:
  - `prompts/mobile/features/moderation_reporting.md`
- Entrées à fournir:
  - Liste de raisons standard; affichage charte.
- Sorties attendues:
  - Bottom sheet Report, mutation insert report, tests e2e signalement.
- Validation (DoD):
  - Report persiste; UX cohérente; a11y OK.

### Phase 12 — Observabilité & Analytics
- Objectif: Sentry + analytics funnels (auth, réaction, reward, etc.).
- Prompts à utiliser:
  - `prompts/observability_sentry_analytics.md`
- Entrées à fournir:
  - DSN, choix PostHog/Amplitude, politique opt‑in.
- Sorties attendues:
  - Init Sentry, util analytics, hooks d’événements.
- Validation (DoD):
  - Erreurs et events visibles.

### Phase 13 — Durcissements perfs/sécurité & Release
- Objectif: Profilage listes/animations, audit RLS, checklists release.
- Prompts à utiliser:
  - `prompts/performance_checklist.md`, `prompts/security_rls_validation.md`, `prompts/roles/reviewer.md`
- Sorties attendues:
  - Correctifs ciblés; release notes.
- Validation (DoD):
  - Jank <1%; RLS testées; build preview OK.

## 5) Ce Qu’il Faut Donner Au LLM (Contexte)
- Toujours inclure:
  - Objectif clair + contraintes + DoD de la phase.
  - Extraits de fichiers impactés (ou chemins) et structure attendue.
  - Barème points et règles d’accès critiques (RLS, reward auth, unicité réactions).
  - Tokens/UI (si UI), schéma SQL/RPC (si backend), événements analytics (si concernés).

## 6) Ce Qu’il Faut Obtenir Du LLM (Sorties)
- Un patch complet (créations/modifications/suppressions) avec chemins relatifs corrects.
- Explications brèves: quoi, pourquoi, limitations.
- Tests (unit/int/e2e) quand applicables; docs mises à jour.

## 7) Contrôles Qualité Avant Merge (DoD)
- Lint/Typecheck: OK
- Tests: unit/int/E2E selon portée
- A11y: contrastes, focus, touch targets ≥44
- Perfs: FlashList configurée, images optimisées
- Sécurité: RLS ON + policies vérifiées, validations Zod
- CI: workflows verts; EAS Preview si configuré

## 8) Conventions & Branches
- Branches: `feat/*`, `fix/*`, `chore/*`; PR obligatoire
- Commits: Conventional Commits
- ADR: décisions majeures dans `docs/adr/*`

## 9) Aide Mémoire — Fichiers → Usage
- Plan exécutable: `prompts/plan_overall.md`
- Démarrage app/CI: `prompts/mobile/app_scaffold.md`, `prompts/ci_cd/github_actions.md`
- Backend Supabase: `prompts/supabase/schema_prompt.md`
- UI/Thèmes/DS: `prompts/mobile/{navigation,theme_tokens,ui_components}.md`
- Features: `prompts/mobile/features/*.md`
- Qualité & Sécurité: `prompts/testing/*`, `prompts/observability_sentry_analytics.md`, `prompts/security_rls_validation.md`, `prompts/performance_checklist.md`
- Rôles: `prompts/roles/*.md`

Astuce: partez du plan global (Phase 1 → 13), et pour chaque phase, combinez le prompt “rôle” approprié avec le prompt “technique/feature” correspondant, en joignant le contexte nécessaire et la DoD.

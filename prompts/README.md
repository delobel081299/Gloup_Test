# Prompts GLOUP — Plan et guides LLM

Ce dossier contient un plan ultra détaillé et des prompts prêts à l’emploi pour faire coder l’application GLOUP par des LLM, conformément aux docs du projet.

## Structure du projet (monorepo)
- `apps/mobile` — App Expo React Native (TypeScript)
- `packages/ui` — Design System & composants
- `packages/theme` — Tokens & thèmes (dark/light)
- `packages/api` — SDK client (Supabase + RPC typé)
- `supabase` — SQL (migrations, RLS, triggers, RPC), seeds, edge functions
- `e2e` — Tests E2E (Maestro/Detox)
- `.github/workflows` — CI/CD
- `docs` — ADR, RFC, specs UX

## Comment utiliser ces prompts
1) Choisir le prompt adapté (par rôle ou par feature).
2) Remplacer les variables entre `{}` si présent (ex: `{feature}`, `{branch}`).
3) Donner au LLM le contexte nécessaire (extraits de code, schémas, fichiers impactés).
4) Exiger un patch complet (chemins + fichiers) et une courte explication.
5) Vérifier la DoD (Definition of Done) listée dans chaque prompt avant merge.

## Lignes directrices (LLM Ops)
- TS strict, pas de TODO, pas de code mort. Conventions: Conventional Commits, SemVer, Keep a Changelog.
- Accessibilité (AA/AAA), perfs FlashList, mémoire média, erreurs gérées.
- RLS Supabase partout; validation Zod côté client/serveur; rate-limit côté edge/RPC si pertinent.
- Tests: unit (Jest/RTL), intégration (msw/Supabase mock), e2e (Maestro/Detox).
- CI: Lint/Typecheck/Tests + EAS Preview (QR) sur PR + migrations testées.

## Index des prompts
- `plan_overall.md` — Plan complet étape par étape (backlog → livraisons).
- `roles/architect.md` — Prompt Architecte (conception & RFC).
- `roles/codegen.md` — Prompt Codegen (implémentation + tests).
- `roles/reviewer.md` — Prompt Reviewer (perf/sécu/UX).
- `roles/tester.md` — Prompt QA (tests unit/int/e2e).
- `roles/doc.md` — Prompt Doc (README/ADR/guides).
- `supabase/schema_prompt.md` — Schéma SQL, RLS, triggers, RPC, seeds.
- `supabase/edge_functions_prompt.md` — Edge functions (si besoin), validation, auth.
- `mobile/app_scaffold.md` — Squelette Expo + tooling + libs.
- `mobile/navigation.md` — Expo Router + TabBar (4 onglets).
- `mobile/theme_tokens.md` — Tokens, thèmes, provider.
- `mobile/ui_components.md` — DS: Button, Card, ReactionChip, Tabs…
- `mobile/features/*.md` — Prompts par feature (Auth, Feed, Composer, Réactions, Conseils, Messages, Notifs, Profil, Modération…).
- `testing/unit_integration.md` — Jest/RTL + msw.
- `testing/e2e_maestro.md` — Scénarios e2e (auth → feed → réaction → conseil → récompense).
- `ci_cd/github_actions.md` — Pipelines CI/CD + EAS Preview.
- `observability_sentry_analytics.md` — Sentry + analytics (PostHog/Amplitude).
- `security_rls_validation.md` — Validation RLS + politiques + checks.
- `performance_checklist.md` — Performances listes/médias/gestes.
- `contributing.md` — Conventions PR/commit, branches, ADR.


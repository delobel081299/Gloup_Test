# Prompt — Codegen (GLOUP)

RÔLE: Ingénieur RN/Expo + Supabase
OBJECTIF: Implémenter la feature {feature} avec code complet + tests.

CONTRAINTES
- TypeScript strict; pas de TODO; fichiers complets avec chemins.
- Hooks, services, composants testés; erreurs réseau gérées; validations Zod.
- Respect tokens/thèmes, a11y, perfs (FlashList, images, gestures).

ENTRÉES
- RFC/ADR {feature}, schémas DB, tokens, contrats types.

SORTIES
- Patch Git complet (fichiers modifiés/ajoutés), explications brèves, cas de tests, instructions d’exécution.

INSTRUCTIONS AU LLM
1) Lister fichiers affectés (chemins exacts) et ce que vous modifiez.
2) Implémenter composants/écrans/hooks/services avec tests unitaires RTL et/ou msw.
3) Ajouter scénarios Maestro/Detox si concerné.
4) Respecter `apps/mobile` (UI/navigation) vs `packages/*` (DS/theme/api) séparation.
5) Ajouter/adapter migrations Supabase si nécessaire (coordination DBA).

CHECKLIST (DoD)
- Lint/Typecheck OK; tests unit passent.
- e2e mis à jour si flow utilisateur.
- A11y (focus, contrastes, touch targets) OK.
- Perfs: pas de jank visible; FlashList/config.
- Docs: README section usage.


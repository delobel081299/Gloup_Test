# Prompt — Tests unitaires & intégration (Jest/RTL + msw)

RÔLE: QA Engineer
OBJECTIF: Ajouter tests unit/int sur les nouveaux modules.

INSTRUCTIONS AU LLM
1) Configurer Jest + @testing-library/react-native si absent (`apps/mobile`).
2) Écrire tests pour:
   - Composants DS (Button, Card, ReactionChip): rendu, a11y, interactions.
   - Hooks (useFeed, useCreatePost, useRewardAdvice): états success/error/loading; msw pour simuler Supabase/RPC.
3) Couvrir edge cases (réseau off, validations Zod, collisions unique).
4) Ajouter un script `test` + `test:watch`; intégrer à CI.

CHECKLIST (DoD)
- Couverture ciblée >80% sur les modules ajoutés; snapshots pertinents; exécution locale documentée.


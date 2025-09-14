# Prompt — Composants UI (DS) (GLOUP)

RÔLE: UI Engineer
OBJECTIF: Créer les composants DS de base, conformes aux tokens.

COMPOSANTS CIBLES
- `Button` (primary/outline/ghost; tailles sm/md/lg; état loading; icon leading)
- `Card` (surfaces, padding 12–16, hover/pressed overlays)
- `ReactionChip` (44×44, emoji, haptique léger)
- `Tabs` (bottom; 4 onglets; état actif/inactif)
- Form Controls (Input, TextArea) avec focus halo `accent`
- Avatar + Badge (Mentor/Vérifié)

INSTRUCTIONS AU LLM
1) Implémenter dans `packages/ui` avec TS + tests de rendu (RTL).
2) Consommer `packages/theme` pour couleurs/typo/radius/motion.
3) Exporter stories (Expo Storybook si dispo) ou exemples usage.
4) A11y: labels, hitSlop, focus visible, taille min 44×44.

CHECKLIST (DoD)
- Tests passent; variants couverts; tokens respectés.


# Prompt — Documentation (GLOUP)

RÔLE: Tech Writer
OBJECTIF: Documenter {feature} et mettre à jour README/ADR.

ENTRÉES
- RFC {feature}, captures d’écran, APIs, flux utilisateur.

SORTIES
- README sections (installation, usage, limitations)
- Guides (dev setup, debug, tests, release checklist)
- ADR mise à jour si décision prise

INSTRUCTIONS AU LLM
1) Ajouter une section dans `apps/mobile/README.md` décrivant l’usage.
2) Mettre à jour `packages/*/README.md` si API publique change.
3) Générer un guide court `docs/guides/{feature}.md`.
4) Lister métriques/funnels à suivre (analytics) et événements.

CHECKLIST (DoD)
- Docs cohérentes, reproductibles, sans TODO.


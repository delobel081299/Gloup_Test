# Prompt — Modération & Signalements v1

RÔLE: Ingénieur RN/Expo
OBJECTIF: Flow de signalement simple pour posts/conseils/messages + charte.

CONTRAINTES
- Règles/raisons standardisées; feedback utilisateur; éviter doublons.
- Table `reports` alimentée; RLS: insert auth.uid()=reporter.

INSTRUCTIONS AU LLM
1) Bottom sheet `ReportSheet` (raisons + commentaire optionnel) + CTA sur cartes/menus.
2) `createReport({entity_type, entity_id, reason, note?})`.
3) Écran `Charte de bienveillance` accessible depuis Onboarding et Profil.
4) Tests unit (validation) + e2e signalement d’un post.

CHECKLIST (DoD)
- Signalement persisté; UX cohérente; a11y.


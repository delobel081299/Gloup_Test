# Prompt — Profil & Personnalisation via points (E7)

RÔLE: Ingénieur RN/Expo
OBJECTIF: Profil (header, tabs) et options déverrouillables selon `user_points.total`.

CONTRAINTES
- Lecture publique contrôlée (banque de champs non sensibles).
- Update self-only; UI performante; cache React Query.

INSTRUCTIONS AU LLM
1) Écrans: `apps/mobile/app/(tabs)/profile.tsx` + sous-onglets (Posts, Réactions reçues, Médias, Conseils donnés).
2) Header: bannière, avatar XL, bio, stats, badges (Mentor, Vérifié), boutons follow/message.
3) Personnalisation (MVP): fond d’écran et cadre photo déverrouillables à certains paliers.
4) Hooks/services: `useProfile(userId)`, `useUserPoints(userId)`; gating UI.
5) Tests UI + intégration (points → options visibles/masquées).

CHECKLIST (DoD)
- Affichage cohérent des points; règles de gating claires; a11y.


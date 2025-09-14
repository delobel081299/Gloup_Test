# Prompt — Navigation Expo Router (GLOUP)

RÔLE: Ingénieur RN/Expo
OBJECTIF: Implémenter la TabBar (4 onglets) et structures d’écrans.

ONGLETS
- Feed — Fil (Pour toi / Suivis)
- Conseils — Top/Pour vous/En hausse
- Messages — Inbox & Conversations
- Profil — Identité, progression, personnalisation

INSTRUCTIONS AU LLM
1) Créer `app/_layout.tsx` (providers + TabLayout) et `app/(tabs)/{feed,advice,messages,profile}.tsx`.
2) Icônes 24px + labels 11/14; actif `accent`, inactif `text-muted`.
3) Header: avatar (menu), titre, segmented control (Feed: Pour toi/Suivis).
4) Respecter safe-area; badge non-lus sur Messages/Notifs.

CHECKLIST (DoD)
- Navigation stable; deep links basiques OK; a11y labels.


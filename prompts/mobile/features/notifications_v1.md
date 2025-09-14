# Prompt — Notifications v1 (E6)

RÔLE: Ingénieur RN/Expo
OBJECTIF: Notifications d’activité (réactions, conseils, rewards) + badge non-lus.

CONTRAINTES
- Source: table `notifications` (ou synthèse côté client via triggers); RLS par user_id.
- Temps réel (optionnel) via Realtime; sinon polling interval raisonnable.

INSTRUCTIONS AU LLM
1) Service `useNotifications()` (list, markAsRead).
2) Badge sur tab Messages/Profil si notifications non-lues.
3) Écran liste de notifs (si décidé) ou intégration simple badge + toasts.
4) Tests unit/services; e2e badge.

CHECKLIST (DoD)
- Mark as read change l’état; pas de fuite d’info inter-utilisateurs.


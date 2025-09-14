# Prompt — Messages & Groupes v1 (E5)

RÔLE: Ingénieur RN/Expo + Supabase Realtime
OBJECTIF: DMs & Groupes simples: Inbox, Conversation, membres/roles, réactions inline.

CONTRAINTES
- RLS stricte: lecture/écriture réservée aux membres.
- Realtime: canal par `conv_id` (ou polling fallback).
- Pagination messages; pièces jointes simples (optionnel MVP).

INSTRUCTIONS AU LLM
1) `apps/mobile/app/(tabs)/messages.tsx` (Inbox) + `app/conversation/[id].tsx`.
2) Services:
   - `useConversations()` (liste + non-lus), `useMessages(convId)` (subscribe + paginate)
   - `sendMessage(convId, {body, media?})`
   - `addMember/removeMember` (role admin)
3) UI: bulles, réactions inline, input composer; a11y roles.
4) Tests: intégration + e2e (DM simple).

CHECKLIST (DoD)
- Abonnement temps réel ou polling fiable; non-lus corrects; RLS validée en tests.


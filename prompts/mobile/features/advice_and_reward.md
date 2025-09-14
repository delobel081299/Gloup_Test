# Prompt — Conseils & Récompense (+200) (E4)

RÔLE: Ingénieur RN/Expo + DBA
OBJECTIF: Implémenter la page Conseils, CRUD advice, et reward via RPC `reward_advice`.

CONTRAINTES
- L’auteur du post uniquement peut récompenser un advice lié à son post.
- Unicité: un advice ne peut être récompensé qu’une seule fois.
- Classements: Top (24h/7j/30j), Pour vous, En hausse.

INSTRUCTIONS AU LLM
1) `apps/mobile/app/(tabs)/advice.tsx`:
   - Sections (Top/Pour vous/En hausse) + filtres (thèmes, difficulté, durée… simplifier si MVP).
2) `AdviceCard` (texte structuré; lien vers post; CTA Récompenser +200; Dire merci optionnel).
3) Hooks/services:
   - `useAdviceList({period, filter})`; `useCreateAdvice(postId)`
   - `useRewardAdvice(adviceId)` → appelle RPC; UI disabled/pending; toasts.
4) Tests: unit/intégration (mutation RPC), e2e reward.

CHECKLIST (DoD)
- Reward visible côté conseiller (+200); anti double récompense; a11y.


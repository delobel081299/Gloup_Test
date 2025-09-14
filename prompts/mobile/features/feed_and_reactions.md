# Prompt — Feed (Pour toi/Suivis) & Réactions (E3)

RÔLE: Ingénieur RN/Expo + Supabase
OBJECTIF: Implémenter le Feed performant et la réaction aux posts (points).

CONTRAINTES
- FlashList (estimatedItemSize, recycle), pagination (cursor/keyset), keyExtractor stable.
- Réactions: unique par (post, reactor, type); appui → haptique; déclenche mutation.
- Compteurs et états temps réel (optionnel via Realtime) sinon refetch.

INSTRUCTIONS AU LLM
1) `apps/mobile/app/(tabs)/feed.tsx`:
   - Segmented `Pour toi / Suivis`; sticky header; skeletons.
   - Hook `useFeed({mode})` (RPC `feed_for_user`), cache React Query.
2) `PostCard` (packages/ui ou apps): avatar, nom, handle, texte, médias, vues, barre actions.
3) Réactions:
   - `ReactionBar` + `ReactionChip` (6 emojis); mutation insert `post_reactions`.
   - Gérer collision unique; feedback UI; compteur local + server sync.
4) Tests unit/intégration: rendering, pagination, réaction.
5) E2E: publier → apparaître dans feed → réagir → vérifier points (server side).

CHECKLIST (DoD)
- Scrolling fluide; pas de jank; réactions sans doublon; points incrémentés côté auteur.


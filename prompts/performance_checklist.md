# Checklist — Performances & UX Perçue

- Listes: FlashList (estimatedItemSize), windowing agressif, keyExtractor stable.
- Images/Vidéos: thumbnails, lazy, cache, pause off-screen, tailles maîtrisées.
- Network: React Query (staleTime/cacheTime), background refetch, pagination keyset.
- Motion: Reanimated pour interactions; 150–250ms; respecter “réduire les animations”.
- Mémoire: libérer médias/détacher abonnements à l’unmount.
- Profilage: Flipper/Perf Monitor; jank < 1%.


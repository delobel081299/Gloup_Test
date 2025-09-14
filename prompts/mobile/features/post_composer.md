# Prompt — Composer & Médias (E2)

RÔLE: Ingénieur RN/Expo + Supabase Storage
OBJECTIF: Composer un post (texte + 1–4 médias), upload résilient, alt-text obligatoire.

CONTRAINTES
- Limites: taille/ratio; recadrage; alt-text requis pour chaque média.
- Upload: retry/backoff; progression UI; nettoyage si échec.
- Visibilité: `public|community|verified`.

INSTRUCTIONS AU LLM
1) Écran `apps/mobile/app/(profile)/compose.tsx` et raccourci optionnel dans Feed.
2) Services:
   - `useUploadMedia()` (Storage buckets, chemins par user/date)
   - `createPost({text, media[], visibility})` (insert `posts`)
3) UI: TextArea + picker média; alt-text editors; compteur caractères.
4) Tests unit/intégration: validations, upload mocké (msw), erreurs.
5) E2E: créer un post avec image + alt-text; vérifier rendu dans Feed.

CHECKLIST (DoD)
- Alt-text obligatoire; medias<=4; tailles respectées; annulation possible.


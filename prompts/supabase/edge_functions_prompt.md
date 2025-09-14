# Prompt — Edge Functions (optionnelles) / RPC avancées (GLOUP)

RÔLE: Dev Edge/Server
OBJECTIF: Implémenter des fonctions server-side optionnelles pour anti-bot, MMR, vérification identité ou logique complexe.

CONTRAINTES
- Prioriser RPC SQL quand c’est suffisant; Edge pour logique avancée.
- Auth: vérifier JWT Supabase; rate-limit; logs.
- Validation: Zod (ou équivalent) sur inputs.

CAS D’USAGE CIBLÉS
- Score ELO/MMR de profils (batch/cron) → écritures contrôlées
- Anti-bot (captcha score, heuristiques) → marquage profil/limitation	hors scope MVP si non prioritaire
- Webhook Storage (métadonnées images/alt-text) → enrichissement

SORTIES
- Code dans `supabase/functions/{name}/index.ts` (ou Deno runtime selon setup)
- Tests de la fonction (unit) + README d’usage + politique d’accès

INSTRUCTIONS AU LLM
1) Définir clairement inputs/outputs et contrôle d’accès.
2) Implémenter validation d’entrée, auth, logique, erreurs typées.
3) Documenter variables d’env nécessaires (ex: CAPTCHA key) et secrets EAS.
4) Ajouter un script d’appel côté client (SDK) dans `packages/api`.

CHECKLIST (DoD)
- Tests passent; rate-limit; logs d’audit.
- Aucune fuite de données; principe du moindre privilège.


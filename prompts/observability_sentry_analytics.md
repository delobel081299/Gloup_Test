# Prompt — Observabilité & Analytics (Sentry + PostHog/Amplitude)

RÔLE: Ingénieur RN/Expo
OBJECTIF: Intégrer Sentry (erreurs/traces) et analytics (funnels clés).

INSTRUCTIONS AU LLM
1) Initialiser Sentry dans `apps/mobile` (JS + performance); DSN via env/EAS secrets.
2) Créer un util `analytics.ts` avec méthodes `track(event, props)`; événements:
   - `auth_signin_request`, `auth_signin_success`, `onboarding_completed`
   - `post_created`, `reaction_added`, `advice_created`, `advice_rewarded`
   - `message_sent`, `profile_updated`
3) Ajouter hooks d’événements dans les features correspondantes.
4) Documenter opt-in/opt-out; RGPD basique; anonymisation si nécessaire.

CHECKLIST (DoD)
- Erreurs capturées; quelques traces visibles; events envoyés lors des flows.


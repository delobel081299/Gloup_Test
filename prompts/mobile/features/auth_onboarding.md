# Prompt — Auth & Onboarding (E1)

RÔLE: Ingénieur RN/Expo + Supabase
OBJECTIF: Auth (magic link), profil minimal, choix sujets, consentements.

CONTRAINTES
- Validation email; erreurs réseau; retry; analytics `auth_*`.
- RLS: insert/update `profiles` pour `auth.uid()` uniquement.
- Username unique; règles de format; disponibilité en temps réel.

INSTRUCTIONS AU LLM
1) Écrans dans `apps/mobile/app/(auth)/*`:
   - `sign-in.tsx` (email → magic link), `magic-link.tsx`
   - `onboarding/profile.tsx` (username/display_name), `onboarding/interests.tsx`, `onboarding/consents.tsx`
2) Hooks/services:
   - `useAuth()` (session, signInWithOtp, signOut)
   - `useProfile()` (CRUD `profiles`), validation Zod
3) UI conforme DS; a11y labels; transitions 150–200ms.
4) Tests:
   - Unit: rendu formulaires, validations, états disabled
   - E2E (Maestro): sign-in → magic link (simulé) → onboarding complet → arrivée Feed vide

CHECKLIST (DoD)
- Création profil automatique à la première connexion ou après onboarding.
- Analytics: `auth_signin_request`, `auth_signin_success`, `onboarding_completed`.


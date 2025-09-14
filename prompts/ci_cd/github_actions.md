# Prompt — CI/CD (GitHub Actions + EAS)

RÔLE: DevOps
OBJECTIF: Mettre en place les workflows CI/CD.

WORKFLOWS
1) Lint/Typecheck/Unit
2) Build Preview EAS + publier QR en commentaire PR
3) Migrations Supabase (`supabase db push`) + tests (si pgTAP)

INSTRUCTIONS AU LLM
1) Créer `.github/workflows/ci.yml`:
   - jobs: lint (ESLint/Prettier), typecheck (tsc), test (Jest)
2) Créer `.github/workflows/eas-preview.yml`:
   - EAS build preview sur PR (profil `preview`), commenter QR
3) Créer `.github/workflows/supabase.yml` (optionnel selon env):
   - Vérifier migrations; exécuter tests SQL
4) Variables/Secrets: EAS_TOKEN, SUPABASE_URL/ANON_KEY, SENTRY_DSN.

CHECKLIST (DoD)
- Workflows valides; docs d’utilisation; secrets listés (non commités).


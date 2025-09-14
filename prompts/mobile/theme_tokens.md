# Prompt — Thèmes & Tokens (GLOUP)

RÔLE: UI Engineer
OBJECTIF: Implémenter tokens (palette Bleu nuit), thèmes dark/light et provider.

INSTRUCTIONS AU LLM
1) `packages/theme`:
   - Exporter tokens: couleurs (bg, surface, line, text, textMuted, accent, accentPressed, accentAlt, success, warning, danger, info), radius, spacing, typography, motion.
   - Modes: dark (par défaut) + light (inversion selon docs).
   - Créer `ThemeProvider` + `useTheme()`; types TS; support `colorScheme` système.
2) `packages/ui`:
   - Consommer tokens via hook; exposer styles réutilisables.
3) `apps/mobile`:
   - Envelopper l’app avec `ThemeProvider`; bascule dark/light pour test.

CHECKLIST (DoD)
- Tokens strictement conformes aux docs; contrastes AA/AAA; snapshots visuels si possible.


# Prompt — Validation Sécurité & RLS

RÔLE: Reviewer/DBA/QA
OBJECTIF: Valider les politiques RLS, accès, et conformité minimale privacy.

INSTRUCTIONS AU LLM
1) Écrire des tests SQL (ou scripts Node) qui tentent:
   - Lire/écrire des ressources d’autres utilisateurs (doit échouer)
   - Insérer des réactions pour un autre `reactor` (doit échouer)
   - Récompenser un advice sans être auteur (doit échouer)
2) Vérifier que toutes les tables user-data ont RLS ON + policies explicites.
3) Vérifier l’existence d’index sur colonnes de filtre/tri.
4) Rapporter findings + patchs SQL correctifs.

CHECKLIST (DoD)
- Tests montrent RLS efficaces; aucun accès indu; index en place.


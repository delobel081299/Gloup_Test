# Prompt — Tests E2E (Maestro)

RÔLE: QA Engineer
OBJECTIF: Scénarios E2E couvrant les parcours critiques.

SCÉNARIOS CIBLES
1) Auth & Onboarding: sign-in email → magic link → profil → intérêts → consentements → Feed vide
2) Composer & Feed: créer post avec image + alt-text → apparaît dans Feed
3) Réactions & Points: réagir au post → vérifier compteur/feedback
4) Conseils & Reward: ajouter un conseil depuis un autre compte → auteur reward +200
5) DM: envoyer/recevoir message → non-lus → lecture

INSTRUCTIONS AU LLM
1) Créer `e2e/maestro/*.yaml` pour chaque scénario.
2) Utiliser ids/accessibility labels stables; data seeding si nécessaire.
3) Ajouter scripts npm pour lancer Maestro (local/CI), doc dans README.

CHECKLIST (DoD)
- Scénarios passent en local; fumée sur CI si infra dispo.


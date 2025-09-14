# Plan de Développement — GLOUP (piloté par LLM)

Objectif: Développer l’app mobile GLOUP (React Native + Expo + TS) avec Supabase (Auth/DB/Realtime/Storage/Edge) et EAS, en suivant un plan industrialisé, des prompts standardisés et une DoD vérifiable.

## Principes
- 4 onglets: Feed, Conseils, Messages & Groupes, Profil.
- Réactions → points (Couronne = 20, autres = 10). Récompense conseil = +200.
- Sécurité: RLS partout, validation stricte, modération proactive.
- Qualité: tests unit/int/e2e, perfs listes/médias, accessibilité.

## Phases et livrables
1) Bootstrap mono-repo et CI/CD
2) Supabase: schéma, RLS, triggers, RPC, seed (reaction_types)
3) App Expo: tooling, navigation (tabs), thème/tokens, DS composants
4) E1 — Auth & Onboarding
5) E2 — Composer & Médias
6) E3 — Feed (Pour toi/Suivis) + Réactions (points)
7) E4 — Conseils (+200)
8) E5 — Messages & Groupes v1
9) E6 — Notifications v1
10) E7 — Profil & Personnalisation via points
11) Modération & Reports v1
12) Observabilité (Sentry) & analytics (funnels)
13) Durcissements perfs/sécurité + préparation release

Chaque étape ci-dessous inclut un prompt LLM prêt à l’emploi.

---

## 1) Bootstrap monorepo & CI/CD
Résultat: squelette repos + workflows.

Prompt (Architecte + Codegen)
```
RÔLE: Architecte → Codegen.
OBJECTIF: Créer la structure monorepo GLOUP.
CONTRAINTES: TS strict, pas de TODO, chemins exacts, README par package.
SORTIES: Patch complet (fichiers), instructions d’installation.

TÂCHES:
1) Arborescence:
  - apps/mobile (Expo TS)
  - packages/ui, packages/theme, packages/api
  - supabase (migrations, seed, policies, RPC)
  - e2e (Maestro/Detox)
  - .github/workflows (CI)
2) Tooling mobile: ESLint + Prettier + TS strict, Husky + lint-staged.
3) Expo + Expo Router + React Query + NativeWind + Reanimated + Gesture Handler + FlashList.
4) EAS config (dev/preview/prod); app.config.ts + .env.example.
5) README racine + CHANGELOG.

DoD:
- `pnpm i` (ou npm/yarn) sans erreur; `expo start` OK.
- Lint/Typecheck OK; workflows CI présents (sans secrets).
```

---

## 2) Supabase — Schéma, RLS, triggers, RPC, seed
Résultat: migrations SQL + seed `reaction_types` (Couronne=20; autres=10).

Prompt (DBA Supabase)
```
RÔLE: DBA Supabase.
OBJECTIF: Implémenter schéma, RLS, index, triggers & RPC.
CONTRAINTES: SQL idempotent (migrations), commentaires, sécurité par défaut (RLS ON).
SORTIES: Fichiers dans `supabase/migrations/*` + `supabase/seed/seed.sql`.

Tables (simplifiées, champs clés):
- profiles(id uuid pk, username text unique, display_name text, bio text, avatar_url text, banner_url text, created_at timestamptz)
- follows(follower uuid fk, followee uuid fk, created_at, pk(follower,followee))
- posts(id uuid pk, author uuid fk, text text, media jsonb, created_at, visibility text check in('public','community','verified'))
- reaction_types(key text pk, label text, emoji text, base_points int)
- post_reactions(id uuid pk, post uuid fk, reactor uuid fk, type text fk→reaction_types, created_at)
- advice(id uuid pk, post uuid fk, advisor uuid fk, body text, created_at)
- advice_rewards(id uuid pk, advice uuid fk, by_author uuid fk, points int default 200, created_at)
- conversations(id uuid pk, type text check in('dm','group'), created_at)
- conversation_members(conv_id uuid, user_id uuid, role text check in('admin','member'), joined_at, pk(conv_id,user_id))
- messages(id uuid pk, conv_id uuid fk, sender uuid fk, body text, media jsonb, created_at)
- notifications(id uuid pk, user_id uuid fk, type text, payload jsonb, read_at timestamptz, created_at)
- reports(id uuid pk, reporter uuid fk, entity_type text, entity_id uuid, reason text, created_at, status text)
- user_points(user_id uuid pk, total int, updated_at)

Index: posts(author, created_at), post_reactions(post, type), follows(follower), follows(followee), messages(conv_id, created_at), advice(post), advice_rewards(advice).

RLS (exemples):
- posts: lecture si visibility='public' ou membre du cercle autorisé; écriture owner-only; update/delete owner.
- profiles: lecture publique contrôlée (subset), update self; username unique.
- follows: insert si follower=auth.uid(); delete self.
- messages/conversations: accès aux membres; write si membre.

Triggers:
- after insert on post_reactions: incrémente user_points.total du post.author selon reaction_types.base_points.

RPC (SQL):
- `reward_advice(advice_id uuid)` — auth = auteur du post; +200 points au `advisor` de l’advice; empêche double récompense; journale si besoin.
- `feed_for_user(user_id uuid, mode text)` — renvoie posts selon `mode in ('foryou','following')` + scoring simple (fraîcheur + points).

Seed `reaction_types`:
- ('crown','Couronne','👑',20), ('style','Style','✨',10), ('fitness','Fitness','💪',10), ('confidence','Confiance','💼',10), ('care','Soins','🧼',10), ('wellbeing','Bien-être','😊',10)

Tests: requêtes de lecture/écriture avec `auth.uid()`; validation RLS; vérification des index via EXPLAIN sur feed.

DoD:
- `supabase db reset` OK; RLS actives; RPC appelables; seed fait.
```

---

## 3) App Expo — Tooling, navigation, thème/tokens, DS
Résultat: app démarrable, TabBar (4), thèmes dark/light, composants de base.

Prompt (UI Engineer + Codegen)
```
RÔLE: UI Engineer.
OBJECTIF: Initialiser Expo + Expo Router, thèmes, DS minimal.
CONTRAINTES: NativeWind, tokens centralisés, A11y, FlashList dispo.
SORTIES: Patch complet dans `apps/mobile`, `packages/theme`, `packages/ui`.

TÂCHES:
1) Expo Router + TabLayout: Feed, Conseils, Messages, Profil.
2) `packages/theme`: tokens (couleurs, typo, radius, spacing, motion) dark/light + provider `ThemeProvider` + `useTheme()`.
3) `packages/ui`: Button(variants: primary/outline/ghost), Card, ReactionChip, Tabs.
4) NativeWind config (tailwind.config.js) avec couleurs tokens.
5) A11y: focus visible, contrastes, touch target ≥ 44.

DoD:
- Démarrage `expo start` OK; écrans et compos affichés; switch dark/light.
```

---

## 4) E1 — Auth & Onboarding
Résultat: Sign in/up (magic link), profil minimal, choix sujets/consentements.

Prompt (Codegen)
```
RÔLE: Ingénieur RN/Expo + Supabase.
OBJECTIF: Implémenter Auth + Onboarding.
CONTRAINTES: Flows complets, erreurs réseau, validation Zod.
SORTIES: Écrans, hooks, services, tests RTL & Maestro.

TÂCHES:
- Écrans: SignIn (email), MagicLink, Onboarding (profil: username unique, display_name, consentements, hashtags intérêts).
- Service Supabase Auth; stockage SecureStore si utile.
- RLS: profil crée/update pour `auth.uid()`.
- Tests: happy path + erreurs (email invalide, réseau off).

DoD: e2e de bout en bout passe; analytics `auth_*` envoyés.
```

---

## 5) E2 — Composer & Médias
Résultat: Composer depuis Profil; upload images/vidéos (Storage); alt-text obligatoire.

Prompt (Codegen)
```
RÔLE: Ingénieur RN/Expo + Supabase Storage.
OBJECTIF: Composer avec médias + contraintes.
CONTRAINTES: limites taille/ratio, retry upload, alt-text requis, modale recadrage.
SORTIES: UI Composer, service upload, validations.

DoD: tests unit + e2e; modération pré-envoi (placeholder: règle simple anti-insultes côté client).
```

---

## 6) E3 — Feed + Réactions (points)
Résultat: Feed (Pour toi/Suivis), PostCard, barre d’actions, réactions qui incrémentent les points.

Prompt (Codegen)
```
RÔLE: Ingénieur RN/Expo + Supabase.
OBJECTIF: Implémenter Feed performant + réactions.
CONTRAINTES: FlashList, pagination, keyExtractor stable; réaction unique par user/post/type.
SORTIES: Écrans Feed, hooks data (React Query), mutation réactions.

DoD: `reward` non applicable ici; vérifier trigger points; e2e: publier → réagir → points augmentent.
```

---

## 7) E4 — Conseils (+200)
Résultat: Vue Conseils (Top/Pour vous/En hausse), advice CRUD, reward conseil.

Prompt (Codegen + DBA)
```
RÔLE: Ingénieur + DBA.
OBJECTIF: Conseils et récompense (+200) via RPC `reward_advice`.
CONTRAINTES: auteur du post uniquement; anti-double récompense; logs.
SORTIES: UI AdviceCard, liste triée, mutation RPC reward, tests.

DoD: e2e: créer post → un autre donne conseil → auteur récompense → +200.
```

---

## 8) E5 — Messages & Groupes v1
Résultat: Inbox, Conversation (DM/group), réactions inline, membres/roles.

Prompt (Codegen)
```
RÔLE: Ingénieur RN/Expo + Supabase Realtime.
OBJECTIF: DMs/Groupes basiques (texte + pièces jointes simples).
CONTRAINTES: Accès RLS membres-only; realtime sur conv_id; pagination.
SORTIES: Écrans Inbox/Conversation, composer message, gestion membres.

DoD: tests intégration (msw) + e2e happy path DM.
```

---

## 9) E6 — Notifications v1
Résultat: Abonnements events (réactions, conseils, rewards), badge non-lus sur tabs.

Prompt (Codegen)
```
RÔLE: Ingénieur RN/Expo.
OBJECTIF: Liste notifs + badge; marquer comme lu.
CONTRAINTES: canaux Realtime (si utilisé), fallback polling; a11y.
SORTIES: Écran Notifs (ou badge sur onglets existants), services.

DoD: tests unit services; e2e badge augmente puis disparaît après lecture.
```

---

## 10) E7 — Profil & Personnalisation via points
Résultat: Profil header (bannière, avatar), tabs (Posts, Réactions reçues, Médias, Conseils donnés), items de personnalisation conditionnés par points.

Prompt (Codegen)
```
RÔLE: Ingénieur RN/Expo.
OBJECTIF: Profil + gating par points (user_points.total).
CONTRAINTES: lecture publique contrôlée; update self-only; UI responsive.
SORTIES: Écrans + hooks; affichage badges/statut Mentor (placeholder).

DoD: tests UI; e2e consultation/édition profil.
```

---

## 11) Modération & Reports v1
Résultat: Bottom sheet report; table `reports` alimentée; règles affichées.

Prompt (Codegen)
```
RÔLE: Ingénieur RN/Expo.
OBJECTIF: Signalement simple de posts/conseils/messages.
CONTRAINTES: raisons standardisées; double envoi évité; feedback utilisateur.
SORTIES: UI + mutation insert report; écran charte.

DoD: tests unit; e2e signalement d’un post.
```

---

## 12) Observabilité & Analytics
Résultat: Sentry (erreurs/traces) + PostHog/Amplitude (funnels auth, réaction, récompense).

Prompt (Codegen)
```
RÔLE: Ingénieur RN/Expo.
OBJECTIF: Intégrer Sentry + analytics avec events clés.
CONTRAINTES: respect privacy; opt-in si requis; DSN/env via EAS secrets.
SORTIES: init Sentry, hooks track, events nommés.

DoD: erreurs test visibles; funnels remontent.
```

---

## 13) Durcissements perfs/sécurité & release
Résultat: Profiling listes/animations; audit RLS; checklists release.

Prompt (Reviewer + Tester)
```
RÔLE: Reviewer/QA.
OBJECTIF: Chasser jank/mémoire, valider RLS, finaliser checklists.
CONTRAINTES: pas de régressions; mesures avant/après.
SORTIES: issues concrètes + patchs; release notes.

DoD: jank < 1%; RLS validées; build preview OK.
```


# Prompt — Supabase Schéma/RLS/Triggers/RPC/Seed (GLOUP)

RÔLE: DBA Supabase
OBJECTIF: Créer/mettre à jour tables, index, RLS, triggers et RPC pour GLOUP.

CONTRAINTES
- RLS ON partout; sécurité par défaut; politiques explicites.
- Migrations idempotentes; commentaires; tests SQL si possible.
- Barème points figé: Couronne 20; autres 10; reward conseil +200.

SORTIES
- `supabase/migrations/NNNN_init.sql` (ou lot en cours)
- `supabase/seed/seed.sql`
- Optionnel: tests pgTAP si disponibles

SPÉCS
Tables clés:
- profiles(id uuid pk default auth.uid(), username text unique not null, display_name text, bio text, avatar_url text, banner_url text, created_at timestamptz default now())
- follows(follower uuid not null, followee uuid not null, created_at timestamptz default now(), primary key(follower, followee))
- posts(id uuid pk default gen_random_uuid(), author uuid not null, text text not null, media jsonb, created_at timestamptz default now(), visibility text not null check (visibility in ('public','community','verified')))
- reaction_types(key text pk, label text not null, emoji text not null, base_points int not null)
- post_reactions(id uuid pk default gen_random_uuid(), post uuid not null, reactor uuid not null, type text not null references reaction_types(key), created_at timestamptz default now(), unique(post, reactor, type))
- advice(id uuid pk default gen_random_uuid(), post uuid not null, advisor uuid not null, body text not null, created_at timestamptz default now())
- advice_rewards(id uuid pk default gen_random_uuid(), advice uuid not null unique, by_author uuid not null, points int not null default 200, created_at timestamptz default now())
- conversations(id uuid pk default gen_random_uuid(), type text not null check (type in ('dm','group')), created_at timestamptz default now())
- conversation_members(conv_id uuid not null, user_id uuid not null, role text not null check (role in ('admin','member')), joined_at timestamptz default now(), primary key(conv_id,user_id))
- messages(id uuid pk default gen_random_uuid(), conv_id uuid not null, sender uuid not null, body text, media jsonb, created_at timestamptz default now())
- notifications(id uuid pk default gen_random_uuid(), user_id uuid not null, type text not null, payload jsonb, read_at timestamptz, created_at timestamptz default now())
- reports(id uuid pk default gen_random_uuid(), reporter uuid not null, entity_type text not null, entity_id uuid not null, reason text not null, created_at timestamptz default now(), status text)
- user_points(user_id uuid pk, total int not null default 0, updated_at timestamptz default now())

FK & comportements de suppression: `on delete cascade` là où pertinent (posts→reactions/advice; conversations→messages/members).

Index recommandés:
- posts(author, created_at desc), posts(visibility)
- post_reactions(post, type), post_reactions(reactor)
- follows(follower), follows(followee)
- messages(conv_id, created_at desc)
- advice(post), advice_rewards(advice)

RLS (exemples — écrire policies précises):
- profiles:
  - select: true (colonnes non sensibles), ou contrôlée si besoin
  - update: auth.uid() = id
- follows:
  - insert: auth.uid() = follower
  - delete/select: auth.uid() in (follower, followee) pour lecture contrôlée
- posts:
  - insert: auth.uid() = author
  - update/delete: auth.uid() = author
  - select: visibility='public' OR (visibility='community' AND ... logique groupe/cercle) OR (visibility='verified' AND user vérifié)
- post_reactions:
  - insert: auth.uid() = reactor
  - delete: auth.uid() = reactor
  - select: conforme à visibilité du post
- advice:
  - insert: auth.uid() = advisor
  - select: conforme à visibilité du post
- advice_rewards:
  - insert: auth.uid() est l’auteur du post lié à l’advice; unicité par advice; points=200
- conversations/members/messages:
  - accès lecture/écriture limité aux membres de `conversation_members`

Triggers:
- `after insert on post_reactions` → incrémenter `user_points.total` du `posts.author` via `reaction_types.base_points`; upsert si user_points manquant.

RPC (SQL securisées):
- `reward_advice(advice_id uuid)`:
  - Vérifier: advice existe; trouver post.author; `auth.uid()` == post.author
  - Empêcher double récompense (advice unique dans advice_rewards)
  - Insérer advice_reward(points=200, by_author=auth.uid())
  - Incrémenter `user_points.total` de `advice.advisor` de 200
  - Retourner succès + totaux mis à jour
- `feed_for_user(user_id uuid, mode text)`:
  - `mode in ('foryou','following')`
  - ForYou: posts publics ordonnés par score (fraîcheur + somme points réactions)
  - Following: posts des followee de user_id
  - LIMIT/OFFSET ou keyset pagination

Seed `reaction_types`:
```
insert into reaction_types(key,label,emoji,base_points) values
 ('crown','Couronne','👑',20),
 ('style','Style','✨',10),
 ('fitness','Fitness','💪',10),
 ('confidence','Confiance','💼',10),
 ('care','Soins','🧼',10),
 ('wellbeing','Bien-être','😊',10);
```

TESTS SQL suggérés:
- Politiques RLS sur insert/select/update/delete pour chaque table sensible.
- Trigger points: insert réaction → points auteur augmentent de base_points.
- RPC reward: double appel interdit; +200 appliqué; droits respectés.

DoD:
- `supabase db reset` sans erreur; policies valides; RPC testées.


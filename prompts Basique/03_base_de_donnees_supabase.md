# GLOUP - Phase 3: Base de Données Supabase

## Contexte
Ce prompt guide la création complète de la base de données Supabase pour GLOUP, incluant les tables, politiques RLS, triggers et fonctions RPC.

## Rôle
Tu es un expert en base de données et Supabase. Tu dois créer le schéma complet, les politiques de sécurité et les fonctions nécessaires.

## Objectifs
1. Créer les tables principales
2. Implémenter les politiques RLS
3. Créer les triggers et fonctions
4. Mettre en place les fonctions RPC
5. Créer les données de seed

## Structure des Tables

### Tables Principales
```sql
-- Profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  banner_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Follows table
CREATE TABLE follows (
  follower_id UUID REFERENCES auth.users ON DELETE CASCADE,
  followee_id UUID REFERENCES auth.users ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, followee_id)
);

-- Posts table
CREATE TABLE posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  author_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  text TEXT,
  media JSONB DEFAULT '[]',
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'followers', 'private')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reaction types
CREATE TABLE reaction_types (
  key TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  emoji TEXT NOT NULL,
  base_points INTEGER NOT NULL DEFAULT 10
);

-- Post reactions
CREATE TABLE post_reactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES posts ON DELETE CASCADE NOT NULL,
  reactor_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  type TEXT REFERENCES reaction_types(key) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, reactor_id)
);

-- Advice
CREATE TABLE advice (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES posts ON DELETE CASCADE NOT NULL,
  advisor_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Advice rewards
CREATE TABLE advice_rewards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  advice_id UUID REFERENCES advice ON DELETE CASCADE NOT NULL,
  by_author_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  points INTEGER DEFAULT 200,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(advice_id, by_author_id)
);

-- Messages
CREATE TABLE messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id UUID NOT NULL,
  sender_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  body TEXT,
  media JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversations
CREATE TABLE conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type TEXT DEFAULT 'dm' CHECK (type IN ('dm', 'group')),
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversation members
CREATE TABLE conversation_members (
  conversation_id UUID REFERENCES conversations ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (conversation_id, user_id)
);

-- Notifications
CREATE TABLE notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  payload JSONB DEFAULT '{}',
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reports
CREATE TABLE reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  reporter_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User points
CREATE TABLE user_points (
  user_id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  total INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Indexes
```sql
-- Performance indexes
CREATE INDEX idx_posts_author_created ON posts(author_id, created_at DESC);
CREATE INDEX idx_posts_created ON posts(created_at DESC);
CREATE INDEX idx_post_reactions_post_type ON post_reactions(post_id, type);
CREATE INDEX idx_post_reactions_reactor ON post_reactions(reactor_id);
CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_followee ON follows(followee_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX idx_conversation_members_user ON conversation_members(user_id);
```

### Politiques RLS
```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE advice ENABLE ROW LEVEL SECURITY;
ALTER TABLE advice_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Follows policies
CREATE POLICY "Users can view follows" ON follows
  FOR SELECT USING (true);

CREATE POLICY "Users can follow others" ON follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow" ON follows
  FOR DELETE USING (auth.uid() = follower_id);

-- Posts policies
CREATE POLICY "Users can view public posts" ON posts
  FOR SELECT USING (visibility = 'public');

CREATE POLICY "Users can view posts from followed users" ON posts
  FOR SELECT USING (
    visibility IN ('public', 'followers') AND
    EXISTS (
      SELECT 1 FROM follows
      WHERE follows.follower_id = auth.uid()
      AND follows.followee_id = posts.author_id
    )
  );

CREATE POLICY "Users can view own posts" ON posts
  FOR SELECT USING (auth.uid() = author_id);

CREATE POLICY "Users can create posts" ON posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own posts" ON posts
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own posts" ON posts
  FOR DELETE USING (auth.uid() = author_id);

-- Post reactions policies
CREATE POLICY "Users can view reactions" ON post_reactions
  FOR SELECT USING (true);

CREATE POLICY "Users can react to posts" ON post_reactions
  FOR INSERT WITH CHECK (auth.uid() = reactor_id);

CREATE POLICY "Users can remove own reactions" ON post_reactions
  FOR DELETE USING (auth.uid() = reactor_id);

-- Advice policies
CREATE POLICY "Users can view advice" ON advice
  FOR SELECT USING (true);

CREATE POLICY "Users can create advice" ON advice
  FOR INSERT WITH CHECK (auth.uid() = advisor_id);

CREATE POLICY "Users can update own advice" ON advice
  FOR UPDATE USING (auth.uid() = advisor_id);

-- Advice rewards policies
CREATE POLICY "Users can view rewards" ON advice_rewards
  FOR SELECT USING (true);

CREATE POLICY "Post authors can reward advice" ON advice_rewards
  FOR INSERT WITH CHECK (
    auth.uid() = by_author_id AND
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = (
        SELECT advice.post_id FROM advice
        WHERE advice.id = advice_rewards.advice_id
      )
      AND posts.author_id = auth.uid()
    )
  );

-- Messages policies
CREATE POLICY "Users can view messages in conversations they are part of" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversation_members
      WHERE conversation_members.conversation_id = messages.conversation_id
      AND conversation_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages in conversations they are part of" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM conversation_members
      WHERE conversation_members.conversation_id = messages.conversation_id
      AND conversation_members.user_id = auth.uid()
    )
  );

-- Conversations policies
CREATE POLICY "Users can view conversations they are part of" ON conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversation_members
      WHERE conversation_members.conversation_id = conversations.id
      AND conversation_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create conversations" ON conversations
  FOR INSERT WITH CHECK (true);

-- Conversation members policies
CREATE POLICY "Users can view conversation members" ON conversation_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversation_members cm2
      WHERE cm2.conversation_id = conversation_members.conversation_id
      AND cm2.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can be added to conversations" ON conversation_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Reports policies
CREATE POLICY "Users can create reports" ON reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view own reports" ON reports
  FOR SELECT USING (auth.uid() = reporter_id);

-- User points policies
CREATE POLICY "Users can view all user points" ON user_points
  FOR SELECT USING (true);

CREATE POLICY "Users can update own points" ON user_points
  FOR UPDATE USING (auth.uid() = user_id);
```

### Triggers
```sql
-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_advice_updated_at
  BEFORE UPDATE ON advice
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_user_points_updated_at
  BEFORE UPDATE ON user_points
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Handle user points on reactions
CREATE OR REPLACE FUNCTION handle_reaction_points()
RETURNS TRIGGER AS $$
DECLARE
  points_value INTEGER;
BEGIN
  -- Get points value for this reaction type
  SELECT base_points INTO points_value
  FROM reaction_types
  WHERE key = NEW.type;

  -- Double points for crown reaction
  IF NEW.type = 'crown' THEN
    points_value := points_value * 2;
  END IF;

  -- Update user points
  INSERT INTO user_points (user_id, total, updated_at)
  VALUES (
    (SELECT author_id FROM posts WHERE id = NEW.post_id),
    points_value,
    NOW()
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    total = user_points.total + points_value,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_post_reaction_points
  AFTER INSERT ON post_reactions
  FOR EACH ROW
  EXECUTE FUNCTION handle_reaction_points();

-- Create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, display_name)
  VALUES (
    NEW.id,
    'user_' || substring(NEW.id::text, 1, 8),
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'New User')
  );

  INSERT INTO user_points (user_id, total, updated_at)
  VALUES (NEW.id, 0, NOW());

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

### Fonctions RPC
```sql
-- Feed for user
CREATE OR REPLACE FUNCTION feed_for_user(
  p_user_id UUID,
  p_mode TEXT DEFAULT 'for_you'
)
RETURNS TABLE (
  id UUID,
  author_id UUID,
  author_username TEXT,
  author_display_name TEXT,
  author_avatar_url TEXT,
  text TEXT,
  media JSONB,
  created_at TIMESTAMPTZ,
  reaction_count INTEGER,
  advice_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH user_data AS (
    SELECT
      p.id,
      p.username,
      p.display_name,
      p.avatar_url,
      po.text,
      po.media,
      po.created_at,
      COALESCE(reaction_counts.count, 0) as reaction_count,
      COALESCE(advice_counts.count, 0) as advice_count,
      CASE
        WHEN p_mode = 'following' THEN
          EXISTS (SELECT 1 FROM follows f WHERE f.follower_id = p_user_id AND f.followee_id = p.id)
        ELSE true
      END as follows_filter
    FROM profiles p
    LEFT JOIN posts po ON p.id = po.author_id
    LEFT JOIN (
      SELECT post_id, COUNT(*) as count
      FROM post_reactions
      GROUP BY post_id
    ) reaction_counts ON po.id = reaction_counts.post_id
    LEFT JOIN (
      SELECT post_id, COUNT(*) as count
      FROM advice
      GROUP BY post_id
    ) advice_counts ON po.id = advice_counts.post_id
    WHERE po.visibility = 'public'
    AND (p_mode = 'for_you' OR follows_filter = true)
    ORDER BY po.created_at DESC
    LIMIT 50
  )
  SELECT
    id,
    author_id,
    username as author_username,
    display_name as author_display_name,
    avatar_url as author_avatar_url,
    text,
    media,
    created_at,
    reaction_count,
    advice_count
  FROM user_data;
END;
$$;

-- Reward advice
CREATE OR REPLACE FUNCTION reward_advice(
  p_advice_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_advice advice%ROWTYPE;
  v_post_author_id UUID;
  v_result JSONB;
BEGIN
  -- Get advice details
  SELECT * INTO v_advice FROM advice WHERE id = p_advice_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Advice not found');
  END IF;

  -- Check if current user is the post author
  SELECT author_id INTO v_post_author_id
  FROM posts
  WHERE id = v_advice.post_id;

  IF v_post_author_id != auth.uid() THEN
    RETURN jsonb_build_object('error', 'Only post author can reward advice');
  END IF;

  -- Check if already rewarded
  IF EXISTS (
    SELECT 1 FROM advice_rewards
    WHERE advice_id = p_advice_id AND by_author_id = auth.uid()
  ) THEN
    RETURN jsonb_build_object('error', 'Advice already rewarded');
  END IF;

  -- Create reward
  INSERT INTO advice_rewards (advice_id, by_author_id, points, created_at)
  VALUES (p_advice_id, auth.uid(), 200, NOW());

  -- Update advisor points
  INSERT INTO user_points (user_id, total, updated_at)
  VALUES (v_advice.advisor_id, 200, NOW())
  ON CONFLICT (user_id)
  DO UPDATE SET
    total = user_points.total + 200,
    updated_at = NOW();

  -- Return success
  RETURN jsonb_build_object(
    'success', true,
    'advice_id', p_advice_id,
    'advisor_id', v_advice.advisor_id,
    'points', 200
  );
END;
$$;

-- Get user stats
CREATE OR REPLACE FUNCTION get_user_stats(
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_stats JSONB;
BEGIN
  SELECT jsonb_build_object(
    'posts', COALESCE(post_count.count, 0),
    'followers', COALESCE(follower_count.count, 0),
    'following', COALESCE(following_count.count, 0),
    'reactions_received', COALESCE(reaction_count.count, 0),
    'advice_given', COALESCE(advice_given_count.count, 0),
    'advice_rewards_received', COALESCE(reward_count.count, 0),
    'total_points', COALESCE(points.total, 0)
  ) INTO v_stats
  FROM user_points points
  LEFT JOIN (
    SELECT author_id, COUNT(*) as count
    FROM posts
    WHERE author_id = p_user_id
    GROUP BY author_id
  ) post_count ON true
  LEFT JOIN (
    SELECT followee_id, COUNT(*) as count
    FROM follows
    WHERE followee_id = p_user_id
    GROUP BY followee_id
  ) follower_count ON true
  LEFT JOIN (
    SELECT follower_id, COUNT(*) as count
    FROM follows
    WHERE follower_id = p_user_id
    GROUP BY follower_id
  ) following_count ON true
  LEFT JOIN (
    SELECT posts.author_id, COUNT(*) as count
    FROM post_reactions
    JOIN posts ON posts.id = post_reactions.post_id
    WHERE posts.author_id = p_user_id
    GROUP BY posts.author_id
  ) reaction_count ON true
  LEFT JOIN (
    SELECT advisor_id, COUNT(*) as count
    FROM advice
    WHERE advisor_id = p_user_id
    GROUP BY advisor_id
  ) advice_given_count ON true
  LEFT JOIN (
    SELECT advisor_id, COUNT(*) as count
    FROM advice_rewards
    JOIN advice ON advice.id = advice_rewards.advice_id
    WHERE advice.advisor_id = p_user_id
    GROUP BY advisor_id
  ) reward_count ON true
  WHERE points.user_id = p_user_id;

  RETURN COALESCE(v_stats, jsonb_build_object(
    'posts', 0,
    'followers', 0,
    'following', 0,
    'reactions_received', 0,
    'advice_given', 0,
    'advice_rewards_received', 0,
    'total_points', 0
  ));
END;
$$;
```

### Données de Seed
```sql
-- Insert reaction types
INSERT INTO reaction_types (key, label, emoji, base_points) VALUES
('crown', 'Couronne', '👑', 20),
('style', 'Style', '👗', 10),
('fitness', 'Fitness', '💪', 10),
('confidence', 'Confiance', '😎', 10),
('care', 'Soins', '🧼', 10),
('wellbeing', 'Bien-être', '😊', 10)
ON CONFLICT (key) DO NOTHING;
```

## Livrables Attendus
1. Migration SQL complète
2. Tables avec relations correctes
3. Politiques RLS sécurisées
4. Triggers fonctionnels
5. Fonctions RPC utiles
6. Indexes de performance
7. Données de seed

## Contraintes
- Utiliser UUID comme clés primaires
- Activer RLS sur toutes les tables
- Utiliser auth.uid() pour l'authentification
- Créer des indexes pour la performance
- Gérer les cascades de suppression

## Validation
- Toutes les tables sont créées
- Les politiques RLS fonctionnent
- Les triggers se déclenchent correctement
- Les fonctions RPC retournent les données attendues
- Les performances sont bonnes
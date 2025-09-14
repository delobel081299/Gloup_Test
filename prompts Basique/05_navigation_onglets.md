# GLOUP - Phase 5: Navigation et Onglets Principaux

## Contexte
Ce prompt guide la création de la structure de navigation principale avec les 4 onglets de l'application GLOUP : Feed, Conseils, Messages & Groupes, et Profil.

## Rôle
Tu es un expert en navigation mobile et expérience utilisateur. Tu dois créer une navigation fluide et intuitive avec une barre d'onglets cohérente.

## Objectifs
1. Créer la structure de navigation principale
2. Implémenter les 4 onglets principaux
3. Développer le TabBar personnalisé
4. Gérer les états de navigation
5. Créer les écrans de base pour chaque onglet

## Structure des Onglets
1. **Feed** - Fil d'actualité avec posts
2. **Conseils** - Meilleures recommandations et retours
3. **Messages & Groupes** - Conversations et discussions de groupe
4. **Profil** - Profil utilisateur et paramètres

## Instructions Détaillées

### 1. Créer la structure des écrans principaux
Dans `app/(tabs)/_layout.tsx`:
```typescript
import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';
import { TabBar } from '../../../packages/ui';
import { useTheme } from '../../../packages/theme';
import {
  Home,
  Lightbulb,
  MessageSquare,
  User
} from 'lucide-react-native';

export default function TabLayout() {
  const { tokens } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBar: ({ state, navigation }) => (
          <TabBar
            items={[
              {
                id: 'feed',
                label: 'Feed',
                icon: <Home size={24} color={state.routes[state.index].name === 'feed' ? tokens.color.accent : tokens.color.textMuted} />,
                badge: 0, // Sera mis à jour dynamiquement
              },
              {
                id: 'advice',
                label: 'Conseils',
                icon: <Lightbulb size={24} color={state.routes[state.index].name === 'advice' ? tokens.color.accent : tokens.color.textMuted} />,
                badge: 3, // Exemple de badge
              },
              {
                id: 'messages',
                label: 'Messages',
                icon: <MessageSquare size={24} color={state.routes[state.index].name === 'messages' ? tokens.color.accent : tokens.color.textMuted} />,
                badge: 12, // Exemple de badge non lus
              },
              {
                id: 'profile',
                label: 'Profil',
                icon: <User size={24} color={state.routes[state.index].name === 'profile' ? tokens.color.accent : tokens.color.textMuted} />,
              },
            ]}
            activeId={state.routes[state.index].name}
            onTabChange={(id) => navigation.navigate(id)}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="feed"
        options={{
          title: 'Feed',
          tabBarLabel: 'Feed',
        }}
      />
      <Tabs.Screen
        name="advice"
        options={{
          title: 'Conseils',
          tabBarLabel: 'Conseils',
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarLabel: 'Messages',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarLabel: 'Profil',
        }}
      />
    </Tabs>
  );
}
```

### 2. Créer l'écran Feed
Dans `app/(tabs)/feed.tsx`:
```typescript
import React, { useState } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useQuery } from '@tanstack/react-query';
import { PostCard } from '../../../components/PostCard';
import { SegmentedSwitch } from '../../../components/SegmentedSwitch';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import { EmptyState } from '../../../components/EmptyState';
import { supabase } from '../../../services/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../packages/theme';

interface Post {
  id: string;
  author_id: string;
  author_username: string;
  author_display_name: string;
  author_avatar_url: string;
  text: string;
  media: Array<{
    type: 'image' | 'video';
    url: string;
    alt_text?: string;
  }>;
  created_at: string;
  reaction_count: number;
  advice_count: number;
  current_user_reaction?: string;
}

export default function FeedScreen() {
  const { tokens } = useTheme();
  const { user } = useAuth();
  const [feedMode, setFeedMode] = useState<'for_you' | 'following'>('for_you');
  const [refreshing, setRefreshing] = useState(false);

  const { data: posts, isLoading, refetch } = useQuery({
    queryKey: ['feed', feedMode],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('feed_for_user', {
          p_user_id: user?.id,
          p_mode: feedMode,
        });

      if (error) throw error;
      return data as Post[];
    },
    enabled: !!user,
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleReaction = async (postId: string, reactionType: string) => {
    if (!user) return;

    // Toggle reaction
    const { error } = await supabase
      .from('post_reactions')
      .upsert({
        post_id: postId,
        reactor_id: user.id,
        type: reactionType,
      });

    if (error) {
      console.error('Error reacting to post:', error);
      return;
    }

    // Refetch to update UI
    refetch();
  };

  const renderPost = ({ item }: { item: Post }) => (
    <PostCard
      post={item}
      onReaction={handleReaction}
      onComment={() => console.log('Comment on post:', item.id)}
      onSave={() => console.log('Save post:', item.id)}
      onShare={() => console.log('Share post:', item.id)}
    />
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: tokens.color.bg }}>
      {/* Header avec mode switch */}
      <View style={{
        backgroundColor: tokens.color.surface,
        borderBottomWidth: 1,
        borderBottomColor: tokens.color.line,
        paddingVertical: tokens.spacing[3],
        paddingHorizontal: tokens.spacing[4],
      }}>
        <SegmentedSwitch
          options={[
            { label: 'Pour toi', value: 'for_you' },
            { label: 'Suivis', value: 'following' },
          ]}
          selected={feedMode}
          onSelect={setFeedMode}
        />
      </View>

      {/* Liste des posts */}
      {posts && posts.length > 0 ? (
        <FlashList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          estimatedItemSize={300}
          contentContainerStyle={{ padding: tokens.spacing[2] }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={tokens.color.accent}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <ScrollView
          contentContainerStyle={{ flex: 1, justifyContent: 'center' }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={tokens.color.accent}
            />
          }
        >
          <EmptyState
            title="Aucun post pour le moment"
            description="Soyez le premier à partager quelque chose !"
            actionLabel="Commencer"
            onAction={() => console.log('Navigate to create post')}
          />
        </ScrollView>
      )}
    </View>
  );
}
```

### 3. Créer l'écran Conseils
Dans `app/(tabs)/advice.tsx`:
```typescript
import React, { useState } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useQuery } from '@tanstack/react-query';
import { AdviceCard } from '../../../components/AdviceCard';
import { SegmentedSwitch } from '../../../components/SegmentedSwitch';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import { supabase } from '../../../services/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../packages/theme';

interface Advice {
  id: string;
  post_id: string;
  advisor_id: string;
  advisor_username: string;
  advisor_display_name: string;
  advisor_avatar_url: string;
  body: string;
  created_at: string;
  is_rewarded: boolean;
  post_author_id: string;
}

export default function AdviceScreen() {
  const { tokens } = useTheme();
  const { user } = useAuth();
  const [adviceMode, setAdviceMode] = useState<'top' | 'for_you' | 'trending'>('top');
  const [refreshing, setRefreshing] = useState(false);

  const { data: adviceList, isLoading, refetch } = useQuery({
    queryKey: ['advice', adviceMode],
    queryFn: async () => {
      let query = supabase
        .from('advice')
        .select(`
          *,
          advisor:advisor_id (
            username,
            display_name,
            avatar_url
          ),
          post:post_id (
            author_id,
            text
          ),
          advice_rewards (*)
        `)
        .order('created_at', { ascending: false });

      // Add filters based on mode
      if (adviceMode === 'top') {
        query = query.limit(50); // Top advice of all time
      } else if (adviceMode === 'trending') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        query = query.gte('created_at', oneWeekAgo.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Advice[];
    },
    enabled: !!user,
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleReward = async (adviceId: string) => {
    if (!user) return;

    const { data, error } = await supabase
      .rpc('reward_advice', {
        p_advice_id: adviceId,
      });

    if (error) {
      console.error('Error rewarding advice:', error);
      return;
    }

    // Show success message
    console.log('Advice rewarded:', data);
    refetch();
  };

  const renderAdvice = ({ item }: { item: Advice }) => (
    <AdviceCard
      advice={item}
      onReward={handleReward}
      isPostAuthor={item.post_author_id === user?.id}
    />
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: tokens.color.bg }}>
      {/* Header avec mode switch */}
      <View style={{
        backgroundColor: tokens.color.surface,
        borderBottomWidth: 1,
        borderBottomColor: tokens.color.line,
        paddingVertical: tokens.spacing[3],
        paddingHorizontal: tokens.spacing[4],
      }}>
        <SegmentedSwitch
          options={[
            { label: 'Top', value: 'top' },
            { label: 'Pour vous', value: 'for_you' },
            { label: 'En hausse', value: 'trending' },
          ]}
          selected={adviceMode}
          onSelect={setAdviceMode}
        />
      </View>

      {/* Liste des conseils */}
      {adviceList && adviceList.length > 0 ? (
        <FlashList
          data={adviceList}
          renderItem={renderAdvice}
          keyExtractor={(item) => item.id}
          estimatedItemSize={250}
          contentContainerStyle={{ padding: tokens.spacing[2] }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={tokens.color.accent}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <ScrollView
          contentContainerStyle={{ flex: 1, justifyContent: 'center' }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={tokens.color.accent}
            />
          }
        >
          <View style={{ alignItems: 'center', padding: tokens.spacing[4] }}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.title,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.color.text,
                textAlign: 'center',
                marginBottom: tokens.spacing[2],
              }}
            >
              Aucun conseil pour le moment
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.body,
                color: tokens.color.textMuted,
                textAlign: 'center',
                lineHeight: tokens.typography.lineHeight.body,
              }}
            >
              Les conseils apparaîtront ici lorsque les utilisateurs commenceront à en partager
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}
```

### 4. Créer l'écran Messages
Dans `app/(tabs)/messages.tsx`:
```typescript
import React from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { ConversationItem } from '../../../components/ConversationItem';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import { supabase } from '../../../services/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../packages/theme';
import { router } from 'expo-router';

interface Conversation {
  id: string;
  type: 'dm' | 'group';
  name?: string;
  avatar_url?: string;
  last_message: {
    body: string;
    created_at: string;
    sender_id: string;
  };
  unread_count: number;
  members: Array<{
    user_id: string;
    username: string;
    display_name: string;
    avatar_url: string;
  }>;
}

export default function MessagesScreen() {
  const { tokens } = useTheme();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = React.useState(false);

  const { data: conversations, isLoading, refetch } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conversation_members')
        .select(`
          conversation_id,
          role,
          conversations (
            id,
            type,
            name,
            avatar_url,
            created_at,
            messages (
              id,
              body,
              created_at,
              sender_id
            )
          )
        `)
        .eq('user_id', user?.id)
        .order('conversations.created_at', { ascending: false });

      if (error) throw error;
      return data as any;
    },
    enabled: !!user,
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleConversationPress = (conversationId: string) => {
    router.push(`/messages/${conversationId}`);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: tokens.color.bg }}>
      {/* Header */}
      <View style={{
        backgroundColor: tokens.color.surface,
        borderBottomWidth: 1,
        borderBottomColor: tokens.color.line,
        paddingVertical: tokens.spacing[4],
        paddingHorizontal: tokens.spacing[4],
      }}>
        <Text
          style={{
            fontSize: tokens.typography.fontSize.title,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: tokens.color.text,
          }}
        >
          Messages
        </Text>
      </View>

      {/* Liste des conversations */}
      <ScrollView
        contentContainerStyle={{ flex: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={tokens.color.accent}
          />
        }
      >
        {conversations && conversations.length > 0 ? (
          conversations.map((conversation) => (
            <ConversationItem
              key={conversation.conversation_id}
              conversation={conversation}
              onPress={() => handleConversationPress(conversation.conversation_id)}
            />
          ))
        ) : (
          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: tokens.spacing[4],
          }}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.title,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.color.text,
                textAlign: 'center',
                marginBottom: tokens.spacing[2],
              }}
            >
              Aucune conversation
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.body,
                color: tokens.color.textMuted,
                textAlign: 'center',
                lineHeight: tokens.typography.lineHeight.body,
              }}
            >
              Commencez une conversation avec d'autres utilisateurs
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
```

### 5. Créer l'écran Profil
Dans `app/(tabs)/profile.tsx`:
```typescript
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Avatar } from '../../../packages/ui';
import { ProfileHeader } from '../../../components/ProfileHeader';
import { ProfileStats } from '../../../components/ProfileStats';
import { ProfileTabs } from '../../../components/ProfileTabs';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import { supabase } from '../../../services/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../packages/theme';
import { router } from 'expo-router';
import { Settings, Edit } from 'lucide-react-native';

export default function ProfileScreen() {
  const { tokens } = useTheme();
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'posts' | 'reactions' | 'media' | 'advice'>('posts');

  const { data: profileData, isLoading, refetch } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_user_stats', {
          p_user_id: user?.id,
        });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: userPoints } = useQuery({
    queryKey: ['userPoints', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_points')
        .select('total')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user,
  });

  const handleSignOut = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Se déconnecter', onPress: signOut },
      ]
    );
  };

  const handleEditProfile = () => {
    router.push('/profile/edit');
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <ScrollView style={{ backgroundColor: tokens.color.bg }}>
      {/* Header */}
      <View style={{
        backgroundColor: tokens.color.surface,
        borderBottomWidth: 1,
        borderBottomColor: tokens.color.line,
      }}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: tokens.spacing[4],
        }}>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.title,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.color.text,
            }}
          >
            Profil
          </Text>
          <View style={{ flexDirection: 'row', gap: tokens.spacing[2] }}>
            <TouchableOpacity onPress={handleEditProfile}>
              <Edit size={24} color={tokens.color.accent} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSignOut}>
              <Settings size={24} color={tokens.color.accent} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Profile Content */}
      <View style={{ padding: tokens.spacing[4] }}>
        {/* Avatar and basic info */}
        <View style={{ alignItems: 'center', marginBottom: tokens.spacing[4] }}>
          <Avatar
            uri={user?.avatar_url}
            size="xl"
            fallback={user?.display_name}
          />
          <Text
            style={{
              fontSize: tokens.typography.fontSize.title,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.color.text,
              marginTop: tokens.spacing[2],
            }}
          >
            {user?.display_name}
          </Text>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.body,
              color: tokens.color.textMuted,
              marginTop: tokens.spacing[1],
            }}
          >
            @{user?.username}
          </Text>
          {user?.bio && (
            <Text
              style={{
                fontSize: tokens.typography.fontSize.body,
                color: tokens.color.text,
                marginTop: tokens.spacing[2],
                textAlign: 'center',
                lineHeight: tokens.typography.lineHeight.body,
              }}
            >
              {user.bio}
            </Text>
          )}
        </View>

        {/* Stats */}
        {profileData && (
          <ProfileStats
            posts={profileData.posts || 0}
            followers={profileData.followers || 0}
            following={profileData.following || 0}
            points={userPoints?.total || 0}
          />
        )}

        {/* Tabs */}
        <ProfileTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Tab content (placeholder for now) */}
        <View style={{ marginTop: tokens.spacing[4], alignItems: 'center' }}>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.body,
              color: tokens.color.textMuted,
              textAlign: 'center',
            }}
          >
            Contenu de l'onglet "{activeTab}" à implémenter
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
```

### 6. Créer les composants partagés
Créer `src/components/SegmentedSwitch.tsx`:
```typescript
import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useTheme } from '../../../packages/theme';

interface SegmentedSwitchOption {
  label: string;
  value: string;
}

interface SegmentedSwitchProps {
  options: SegmentedSwitchOption[];
  selected: string;
  onSelect: (value: string) => void;
}

export function SegmentedSwitch({ options, selected, onSelect }: SegmentedSwitchProps) {
  const { tokens } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: tokens.color.bg,
        borderRadius: tokens.radius.md,
        padding: 4,
      }}
    >
      {options.map((option) => (
        <TouchableOpacity
          key={option.value}
          style={{
            flex: 1,
            paddingVertical: tokens.spacing[2],
            paddingHorizontal: tokens.spacing[3],
            borderRadius: tokens.radius.sm,
            backgroundColor: selected === option.value ? tokens.color.accent : 'transparent',
            alignItems: 'center',
          }}
          onPress={() => onSelect(option.value)}
        >
          <Text
            style={{
              fontSize: tokens.typography.fontSize.body,
              fontWeight: tokens.typography.fontWeight.medium,
              color: selected === option.value ? '#081325' : tokens.color.textMuted,
            }}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
```

## Livrables Attendus
1. Structure de navigation avec Expo Router
2. 4 écrans principaux fonctionnels
3. TabBar personnalisé avec icônes
4. Navigation entre les onglets
5. États de chargement et gestion d'erreurs
6. Pull-to-refresh sur les listes
7. Composants réutilisables

## Contraintes
- Utiliser Expo Router pour la navigation
- Respecter la palette de couleurs GLOUP
- Touch targets minimum 44x44
- Support mode clair/sombre
- Animations fluides
- Bonnes performances sur longues listes

## Validation
- Navigation entre onglets fonctionne
- Pull-to-refresh fonctionne
- États de chargement visibles
- Pas de crashes ou erreurs
- Performance acceptable
- Design cohérent
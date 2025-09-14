# GLOUP - Phase 10: Fonctionnalités Avancées

## Contexte
Ce prompt guide l'implémentation des fonctionnalités avancées de GLOUP, incluant la recherche, les notifications, les paramètres et la modération.

## Rôle
Tu es un expert en développement full-stack et expérience utilisateur. Tu dois créer des fonctionnalités avancées robustes et performantes.

## Objectifs
1. Créer le système de recherche
2. Implémenter les notifications push
3. Développer les paramètres de l'application
4. Créer le système de modération
5. Implémenter l'analytique et les métriques

## Stack Technique
- Expo Router (navigation)
- Supabase (backend + Edge Functions)
- Expo Notifications (push)
- React Query (state management)
- Expo Analytics

## Instructions Détaillées

### 1. Créer le système de recherche
Dans `src/types/search.ts`:
```typescript
export interface SearchResult {
  type: 'user' | 'post' | 'advice' | 'hashtag';
  id: string;
  title: string;
  description?: string;
  avatar_url?: string;
  relevance_score: number;
  metadata?: {
    followers?: number;
    reactions?: number;
    points?: number;
    category?: string;
  };
}

export interface SearchFilters {
  type?: 'all' | 'users' | 'posts' | 'advice' | 'hashtags';
  time_range?: 'all' | 'today' | 'week' | 'month' | 'year';
  min_points?: number;
  max_points?: number;
  category?: string;
  verified_only?: boolean;
  mentor_only?: boolean;
}

export interface SearchSuggestion {
  text: string;
  type: 'user' | 'hashtag' | 'trending';
  popularity: number;
}

export interface TrendingSearch {
  query: string;
  count: number;
  category: string;
  trend: 'up' | 'down' | 'stable';
}
```

Dans `src/services/searchService.ts`:
```typescript
import { supabase } from './supabase';
import { SearchResult, SearchFilters, SearchSuggestion, TrendingSearch } from '../types/search';

export class SearchService {
  static async search(query: string, filters: SearchFilters = {}): Promise<{ results: SearchResult[]; error: Error | null }> {
    try {
      if (!query.trim()) {
        return { results: [], error: null };
      }

      const searchResults: SearchResult[] = [];

      // Search users
      if (filters.type === 'all' || filters.type === 'users') {
        const { data: users } = await supabase
          .from('profiles')
          .select(`
            id,
            username,
            display_name,
            avatar_url,
            is_verified,
            is_mentor,
            followers:follows!follows_followee_id_fkey (count)
          `)
          .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
          .limit(10);

        if (users) {
          searchResults.push(...users.map(user => ({
            type: 'user' as const,
            id: user.id,
            title: user.display_name,
            description: `@${user.username}`,
            avatar_url: user.avatar_url,
            relevance_score: 1.0,
            metadata: {
              followers: user.followers?.[0]?.count || 0,
              verified: user.is_verified,
              mentor: user.is_mentor,
            },
          })));
        }
      }

      // Search posts
      if (filters.type === 'all' || filters.type === 'posts') {
        const { data: posts } = await supabase
          .from('posts')
          .select(`
            id,
            text,
            created_at,
            author:author_id (
              id,
              username,
              display_name,
              avatar_url
            ),
            reactions:post_reactions (count)
          `)
          .ilike('text', `%${query}%`)
          .order('created_at', { ascending: false })
          .limit(10);

        if (posts) {
          searchResults.push(...posts.map(post => ({
            type: 'post' as const,
            id: post.id,
            title: `Post de ${post.author.display_name}`,
            description: post.text,
            avatar_url: post.author.avatar_url,
            relevance_score: 0.8,
            metadata: {
              reactions: post.reactions?.[0]?.count || 0,
            },
          })));
        }
      }

      // Search advice
      if (filters.type === 'all' || filters.type === 'advice') {
        const { data: advice } = await supabase
          .from('advice')
          .select(`
            id,
            body,
            created_at,
            advisor:advisor_id (
              id,
              username,
              display_name,
              avatar_url
            )
          `)
          .ilike('body', `%${query}%`)
          .order('created_at', { ascending: false })
          .limit(10);

        if (advice) {
          searchResults.push(...advice.map(item => ({
            type: 'advice' as const,
            id: item.id,
            title: `Conseil de ${item.advisor.display_name}`,
            description: item.body,
            avatar_url: item.advisor.avatar_url,
            relevance_score: 0.9,
          })));
        }
      }

      // Sort by relevance score
      searchResults.sort((a, b) => b.relevance_score - a.relevance_score);

      return { results: searchResults.slice(0, 20), error: null };
    } catch (error) {
      return { results: [], error: error as Error };
    }
  }

  static async getSuggestions(query: string): Promise<{ suggestions: SearchSuggestion[]; error: Error | null }> {
    try {
      const suggestions: SearchSuggestion[] = [];

      // Get user suggestions
      const { data: users } = await supabase
        .from('profiles')
        .select('username, display_name')
        .ilike('username', `${query}%`)
        .limit(5);

      if (users) {
        suggestions.push(...users.map(user => ({
          text: `@${user.username}`,
          type: 'user' as const,
          popularity: 1.0,
        })));
      }

      // Get hashtag suggestions
      const { data: hashtags } = await supabase
        .from('post_hashtags')
        .select('tag, count')
        .ilike('tag', `${query}%`)
        .order('count', { ascending: false })
        .limit(5);

      if (hashtags) {
        suggestions.push(...hashtags.map(tag => ({
          text: `#${tag.tag}`,
          type: 'hashtag' as const,
          popularity: tag.count,
        })));
      }

      return { suggestions, error: null };
    } catch (error) {
      return { suggestions: [], error: error as Error };
    }
  }

  static async getTrendingSearches(): Promise<{ trending: TrendingSearch[]; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('trending_searches')
        .select('*')
        .order('count', { ascending: false })
        .limit(10);

      if (error) throw error;

      return { trending: data as TrendingSearch[], error: null };
    } catch (error) {
      return { trending: [], error: error as Error };
    }
  }
}
```

### 2. Créer le système de notifications
Dans `src/services/notificationService.ts`:
```typescript
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { supabase } from './supabase';
import { Platform } from 'react-native';

export class NotificationService {
  static async initialize() {
    // Request permissions
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }

      // Get the token
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('Push token:', token);

      // Save token to Supabase
      await this.savePushToken(token);
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    // Configure notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }

  static async savePushToken(token: string) {
    try {
      const user = supabase.auth.user();
      if (!user) return;

      await supabase.from('user_push_tokens').upsert({
        user_id: user.id,
        token,
        platform: Platform.OS,
      });
    } catch (error) {
      console.error('Error saving push token:', error);
    }
  }

  static async scheduleNotification(content: {
    title: string;
    body: string;
    data?: Record<string, any>;
  }, trigger: Notifications.NotificationTriggerInput) {
    try {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: content.title,
          body: content.body,
          data: content.data || {},
        },
        trigger,
      });

      return identifier;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  static async cancelNotification(identifier: string) {
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }

  static async sendPushNotification(
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, any>
  ) {
    try {
      const message = {
        to: tokens,
        sound: 'default',
        title,
        body,
        data: data || {},
      };

      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error sending push notification:', error);
      return null;
    }
  }

  static async getNotifications() {
    try {
      const user = supabase.auth.user();
      if (!user) return { notifications: [], error: null };

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { notifications: data || [], error: null };
    } catch (error) {
      return { notifications: [], error: error as Error };
    }
  }

  static async markNotificationAsRead(notificationId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  static async markAllNotificationsAsRead() {
    try {
      const user = supabase.auth.user();
      if (!user) return { error: new Error('User not found') };

      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .is('read_at', null);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }
}
```

### 3. Créer l'écran de recherche
Dans `src/screens/SearchScreen.tsx`:
```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Avatar } from '../../packages/ui';
import { Card } from '../../packages/ui';
import { useTheme } from '../../packages/theme';
import { SearchService } from '../services/searchService';
import { SearchResult, SearchFilters, TrendingSearch } from '../types/search';
import { useDebounce } from '../hooks/useDebounce';
import { router } from 'expo-router';
import {
  Search,
  TrendingUp,
  Hash,
  User,
  MessageSquare,
  X,
  Filter,
  Clock
} from 'lucide-react-native';

export default function SearchScreen() {
  const { tokens } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({ type: 'all' });
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce((query: string) => {
    setDebouncedQuery(query);
  }, 300);

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    debouncedSearch(text);
  };

  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ['search', debouncedQuery, filters],
    queryFn: () => SearchService.search(debouncedQuery, filters),
    enabled: debouncedQuery.length > 0,
  });

  const { data: trendingSearches, isLoading: trendingLoading } = useQuery({
    queryKey: ['trendingSearches'],
    queryFn: () => SearchService.getTrendingSearches(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const renderSearchResult = ({ item }: { item: SearchResult }) => {
    const getIcon = () => {
      switch (item.type) {
        case 'user':
          return <User size={20} color={tokens.color.accent} />;
        case 'post':
          return <MessageSquare size={20} color={tokens.color.accent} />;
        case 'advice':
          return <MessageSquare size={20} color={tokens.color.success} />;
        case 'hashtag':
          return <Hash size={20} color={tokens.color.accent} />;
        default:
          return <Search size={20} color={tokens.color.accent} />;
      }
    };

    const getSubtitle = () => {
      switch (item.type) {
        case 'user':
          return item.description;
        case 'post':
          return `Post • ${item.metadata?.reactions || 0} réactions`;
        case 'advice':
          return 'Conseil';
        case 'hashtag':
          return `Hashtag • ${item.metadata?.count || 0} posts`;
        default:
          return '';
      }
    };

    return (
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: tokens.spacing[4],
          backgroundColor: tokens.color.surface,
          borderBottomWidth: 1,
          borderBottomColor: tokens.color.line,
        }}
        onPress={() => {
          switch (item.type) {
            case 'user':
              router.push(`/profile/${item.id}`);
              break;
            case 'post':
              router.push(`/post/${item.id}`);
              break;
            case 'advice':
              router.push(`/advice/${item.id}`);
              break;
            case 'hashtag':
              router.push(`/hashtag/${item.title.replace('#', '')}`);
              break;
          }
        }}
      >
        <View style={{ marginRight: tokens.spacing[3] }}>
          {getIcon()}
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.body,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.color.text,
            }}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.caption,
              color: tokens.color.textMuted,
            }}
            numberOfLines={1}
          >
            {getSubtitle()}
          </Text>
        </View>

        {item.avatar_url && (
          <Avatar uri={item.avatar_url} size="sm" fallback="?" />
        )}
      </TouchableOpacity>
    );
  };

  const renderTrendingSearch = ({ item }: { item: TrendingSearch }) => {
    const getTrendIcon = () => {
      switch (item.trend) {
        case 'up':
          return <TrendingUp size={16} color={tokens.color.success} />;
        case 'down':
          return <TrendingUp size={16} color={tokens.color.danger} style={{ transform: [{ rotate: '180deg' }] }} />;
        default:
          return <TrendingUp size={16} color={tokens.color.textMuted} />;
      }
    };

    return (
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: tokens.spacing[3],
          backgroundColor: tokens.color.surface,
          borderRadius: tokens.radius.md,
          marginBottom: tokens.spacing[2],
        }}
        onPress={() => setSearchQuery(item.query)}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing[2] }}>
          <Hash size={16} color={tokens.color.textMuted} />
          <Text
            style={{
              fontSize: tokens.typography.fontSize.body,
              color: tokens.color.text,
            }}
          >
            {item.query}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing[2] }}>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.caption,
              color: tokens.color.textMuted,
            }}
          >
            {item.count}
          </Text>
          {getTrendIcon()}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: tokens.color.bg }}>
      {/* Search header */}
      <View
        style={{
          backgroundColor: tokens.color.surface,
          borderBottomWidth: 1,
          borderBottomColor: tokens.color.line,
          padding: tokens.spacing[4],
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: tokens.color.bg,
            borderRadius: tokens.radius.md,
            padding: tokens.spacing[3],
            gap: tokens.spacing[2],
          }}
        >
          <Search size={20} color={tokens.color.textMuted} />
          <TextInput
            style={{
              flex: 1,
              fontSize: tokens.typography.fontSize.body,
              color: tokens.color.text,
            }}
            placeholder="Rechercher des utilisateurs, posts, conseils..."
            placeholderTextColor={tokens.color.textMuted}
            value={searchQuery}
            onChangeText={handleSearchChange}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={20} color={tokens.color.textMuted} />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
            <Filter size={20} color={tokens.color.accent} />
          </TouchableOpacity>
        </View>

        {/* Filters */}
        {showFilters && (
          <View style={{ marginTop: tokens.spacing[3], gap: tokens.spacing[2] }}>
            <View style={{ flexDirection: 'row', gap: tokens.spacing[2] }}>
              {['all', 'users', 'posts', 'advice'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={{
                    paddingVertical: tokens.spacing[1],
                    paddingHorizontal: tokens.spacing[3],
                    borderRadius: tokens.radius.sm,
                    backgroundColor: filters.type === type ? tokens.color.accent : tokens.color.bg,
                  }}
                  onPress={() => setFilters({ ...filters, type: type as any })}
                >
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.caption,
                      color: filters.type === type ? '#081325' : tokens.color.text,
                      fontWeight: tokens.typography.fontWeight.medium,
                    }}
                  >
                    {type === 'all' ? 'Tout' : type === 'users' ? 'Utilisateurs' : type === 'posts' ? 'Posts' : 'Conseils'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Content */}
      {debouncedQuery.length > 0 ? (
        <FlatList
          data={searchResults?.results || []}
          renderItem={renderSearchResult}
          keyExtractor={(item) => `${item.type}-${item.id}`}
          refreshControl={
            <RefreshControl
              refreshing={searchLoading}
              onRefresh={() => {}}
              tintColor={tokens.color.accent}
            />
          }
          ListEmptyComponent={
            !searchLoading && (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: tokens.spacing[4] }}>
                <Search size={48} color={tokens.color.textMuted} />
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.title,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.color.text,
                    marginTop: tokens.spacing[3],
                    textAlign: 'center',
                  }}
                >
                  Aucun résultat trouvé
                </Text>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.body,
                    color: tokens.color.textMuted,
                    textAlign: 'center',
                    marginTop: tokens.spacing[1],
                    lineHeight: tokens.typography.lineHeight.body,
                  }}
                >
                  Essayez avec d'autres mots-clés ou vérifiez l'orthographe
                </Text>
              </View>
            )
          }
        />
      ) : (
        <View style={{ padding: tokens.spacing[4] }}>
          {/* Trending searches */}
          <Text
            style={{
              fontSize: tokens.typography.fontSize.title,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.color.text,
              marginBottom: tokens.spacing[3],
            }}
          >
            Recherches populaires
          </Text>

          {trendingLoading ? (
            <Text style={{ color: tokens.color.textMuted, textAlign: 'center' }}>
              Chargement...
            </Text>
          ) : (
            <FlatList
              data={trendingSearches?.trending || []}
              renderItem={renderTrendingSearch}
              keyExtractor={(item) => item.query}
              showsVerticalScrollIndicator={false}
            />
          )}

          {/* Recent searches (would need to implement) */}
          <Text
            style={{
              fontSize: tokens.typography.fontSize.title,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.color.text,
              marginTop: tokens.spacing[6],
              marginBottom: tokens.spacing[3],
            }}
          >
            Recherches récentes
          </Text>

          <View style={{ alignItems: 'center', padding: tokens.spacing[4] }}>
            <Clock size={32} color={tokens.color.textMuted} />
            <Text
              style={{
                fontSize: tokens.typography.fontSize.body,
                color: tokens.color.textMuted,
                textAlign: 'center',
                marginTop: tokens.spacing[2],
              }}
            >
              Vos recherches récentes apparaîtront ici
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
```

### 4. Créer l'écran de paramètres
Dans `src/screens/SettingsScreen.tsx`:
```typescript
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, Alert, Linking } from 'react-native';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card } from '../../packages/ui';
import { Button } from '../../packages/ui';
import { useTheme } from '../../packages/theme';
import { useAuth } from '../contexts/AuthContext';
import { ProfileService } from '../services/profileService';
import { NotificationService } from '../services/notificationService';
import {
  Bell,
  Shield,
  Moon,
  Palette,
  Lock,
  Globe,
  HelpCircle,
  Info,
  LogOut,
  Trash2,
  ChevronRight
} from 'lucide-react-native';

export default function SettingsScreen() {
  const { tokens } = useTheme();
  const { user, signOut } = useAuth();

  const [notificationSettings, setNotificationSettings] = useState({
    new_follower: true,
    new_reaction: true,
    new_advice_reward: true,
    new_message: true,
    new_mention: true,
    weekly_digest: false,
  });

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => ProfileService.getProfile(user?.id || ''),
    enabled: !!user,
  });

  const updateNotificationSettings = useMutation({
    mutationFn: (settings: typeof notificationSettings) => {
      // Update notification settings in Supabase
      return ProfileService.updateProfile(user?.id || '', {
        notification_settings: settings,
      });
    },
    onSuccess: () => {
      Alert.alert('Succès', 'Paramètres de notification mis à jour');
    },
  });

  const handleNotificationToggle = (key: keyof typeof notificationSettings) => {
    const newSettings = {
      ...notificationSettings,
      [key]: !notificationSettings[key],
    };
    setNotificationSettings(newSettings);
    updateNotificationSettings.mutate(newSettings);
  };

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

  const handleDeleteAccount = () => {
    Alert.alert(
      'Supprimer le compte',
      'Cette action est irréversible. Voulez-vous vraiment supprimer votre compte ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            // Implement account deletion
            Alert.alert('Information', 'La suppression de compte sera bientôt disponible');
          },
        },
      ]
    );
  };

  const settingsSections = [
    {
      title: 'Notifications',
      icon: <Bell size={20} color={tokens.color.accent} />,
      items: [
        {
          title: 'Nouveaux followers',
          subtitle: 'Me notifier quand quelqu\'un me suit',
          right: (
            <Switch
              value={notificationSettings.new_follower}
              onValueChange={() => handleNotificationToggle('new_follower')}
              trackColor={{ false: tokens.color.line, true: tokens.color.accent }}
              thumbColor={'white'}
            />
          ),
        },
        {
          title: 'Nouvelles réactions',
          subtitle: 'Me notifier des réactions à mes posts',
          right: (
            <Switch
              value={notificationSettings.new_reaction}
              onValueChange={() => handleNotificationToggle('new_reaction')}
              trackColor={{ false: tokens.color.line, true: tokens.color.accent }}
              thumbColor={'white'}
            />
          ),
        },
        {
          title: 'Récompenses de conseils',
          subtitle: 'Me notifier quand mes conseils sont récompensés',
          right: (
            <Switch
              value={notificationSettings.new_advice_reward}
              onValueChange={() => handleNotificationToggle('new_advice_reward')}
              trackColor={{ false: tokens.color.line, true: tokens.color.accent }}
              thumbColor={'white'}
            />
          ),
        },
        {
          title: 'Nouveaux messages',
          subtitle: 'Me notifier des nouveaux messages',
          right: (
            <Switch
              value={notificationSettings.new_message}
              onValueChange={() => handleNotificationToggle('new_message')}
              trackColor={{ false: tokens.color.line, true: tokens.color.accent }}
              thumbColor={'white'}
            />
          ),
        },
        {
          title: 'Mentions',
          subtitle: 'Me notifier quand on me mentionne',
          right: (
            <Switch
              value={notificationSettings.new_mention}
              onValueChange={() => handleNotificationToggle('new_mention')}
              trackColor={{ false: tokens.color.line, true: tokens.color.accent }}
              thumbColor={'white'}
            />
          ),
        },
        {
          title: 'Résumé hebdomadaire',
          subtitle: 'Recevoir un résumé de mon activité',
          right: (
            <Switch
              value={notificationSettings.weekly_digest}
              onValueChange={() => handleNotificationToggle('weekly_digest')}
              trackColor={{ false: tokens.color.line, true: tokens.color.accent }}
              thumbColor={'white'}
            />
          ),
        },
      ],
    },
    {
      title: 'Apparence',
      icon: <Palette size={20} color={tokens.color.accent} />,
      items: [
        {
          title: 'Thème sombre',
          subtitle: 'Utiliser le thème sombre',
          right: <ChevronRight size={20} color={tokens.color.textMuted} />,
          onPress: () => console.log('Open theme settings'),
        },
        {
          title: 'Personnalisation',
          subtitle: 'Avatars, cadres, thèmes',
          right: <ChevronRight size={20} color={tokens.color.textMuted} />,
          onPress: () => console.log('Open customization'),
        },
      ],
    },
    {
      title: 'Confidentialité',
      icon: <Lock size={20} color={tokens.color.accent} />,
      items: [
        {
          title: 'Profil privé',
          subtitle: 'Rendre mon profil privé',
          right: <ChevronRight size={20} color={tokens.color.textMuted} />,
          onPress: () => console.log('Open privacy settings'),
        },
        {
          title: 'Messages',
          subtitle: 'Qui peut m\'envoyer des messages',
          right: <ChevronRight size={20} color={tokens.color.textMuted} />,
          onPress: () => console.log('Open message settings'),
        },
        {
          title: 'Données personnelles',
          subtitle: 'Gérer mes données',
          right: <ChevronRight size={20} color={tokens.color.textMuted} />,
          onPress: () => console.log('Open data settings'),
        },
      ],
    },
    {
      title: 'À propos',
      icon: <Info size={20} color={tokens.color.accent} />,
      items: [
        {
          title: 'Conditions d\'utilisation',
          right: <ChevronRight size={20} color={tokens.color.textMuted} />,
          onPress: () => Linking.openURL('https://gloup.app/terms'),
        },
        {
          title: 'Politique de confidentialité',
          right: <ChevronRight size={20} color={tokens.color.textMuted} />,
          onPress: () => Linking.openURL('https://gloup.app/privacy'),
        },
        {
          title: 'Aide',
          right: <ChevronRight size={20} color={tokens.color.textMuted} />,
          onPress: () => Linking.openURL('https://gloup.app/help'),
        },
        {
          title: 'Version',
          subtitle: '1.0.0',
          right: <ChevronRight size={20} color={tokens.color.textMuted} />,
        },
      ],
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: tokens.color.bg }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: tokens.color.surface,
          borderBottomWidth: 1,
          borderBottomColor: tokens.color.line,
          padding: tokens.spacing[4],
        }}
      >
        <Text
          style={{
            fontSize: tokens.typography.fontSize.title,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: tokens.color.text,
          }}
        >
          Paramètres
        </Text>
      </View>

      {/* Settings sections */}
      <ScrollView style={{ flex: 1 }}>
        {settingsSections.map((section, index) => (
          <View key={section.title} style={{ marginBottom: tokens.spacing[4] }}>
            <View style={{ paddingHorizontal: tokens.spacing[4], marginBottom: tokens.spacing[2] }}>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.caption,
                  color: tokens.color.textMuted,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  textTransform: 'uppercase',
                }}
              >
                {section.title}
              </Text>
            </View>

            <Card variant="default" padding="none">
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={item.title}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: tokens.spacing[4],
                    borderBottomWidth: itemIndex < section.items.length - 1 ? 1 : 0,
                    borderBottomColor: tokens.color.line,
                  }}
                  onPress={item.onPress}
                  disabled={!item.onPress}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.body,
                        fontWeight: tokens.typography.fontWeight.medium,
                        color: tokens.color.text,
                      }}
                    >
                      {item.title}
                    </Text>
                    {item.subtitle && (
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.caption,
                          color: tokens.color.textMuted,
                          marginTop: tokens.spacing[1],
                        }}
                      >
                        {item.subtitle}
                      </Text>
                    )}
                  </View>
                  {item.right}
                </TouchableOpacity>
              ))}
            </Card>
          </View>
        ))}

        {/* Account actions */}
        <View style={{ paddingHorizontal: tokens.spacing[4], marginBottom: tokens.spacing[4] }}>
          <Button
            title="Se déconnecter"
            onPress={handleSignOut}
            variant="outline"
            style={{ marginBottom: tokens.spacing[2] }}
            icon={<LogOut size={16} color={tokens.color.accent} />}
          />

          <Button
            title="Supprimer mon compte"
            onPress={handleDeleteAccount}
            variant="ghost"
            icon={<Trash2 size={16} color={tokens.color.danger} />}
            style={{ borderColor: tokens.color.danger }}
          />
        </View>
      </ScrollView>
    </View>
  );
}
```

### 5. Créer le hook useDebounce
Dans `src/hooks/useDebounce.ts`:
```typescript
import { useEffect, useRef } from 'react';

export function useDebounce<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
) {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const debouncedCallback = (...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  };

  return debouncedCallback;
}
```

## Livrables Attendus
1. Service de recherche complet avec filtres
2. Système de notifications push
3. Écran de paramètres complet
4. Système de modération basique
5. Analytics et métriques
6. Hook de debounce optimisé
7. Types TypeScript stricts

## Contraintes
- Recherche en temps réel avec suggestions
- Notifications push fiables
- Paramètres sauvegardés
- Modération avec signalements
- Analytics pour le suivi
- Performance optimisée
- Respect du design GLOUP

## Validation
- Recherche fonctionne correctement
- Notifications s'envoient
- Paramètres se sauvegardent
- Signalements fonctionnent
- Analytics collectent les données
- Performance bonne
- Pas de bugs critiques
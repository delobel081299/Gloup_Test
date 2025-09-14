# GLOUP - Phase 7: Système de Conseils et Récompenses

## Contexte
Ce prompt guide l'implémentation complète du système de conseils et récompenses pour GLOUP, incluant la création de conseils, la récompense par les auteurs et le classement des meilleurs conseils.

## Rôle
Tu es un expert en gamification et expérience utilisateur. Tu dois créer un système de conseils engageant avec des récompenses significatives.

## Objectifs
1. Créer le système de création de conseils
2. Implémenter les récompenses +200 points
3. Développer le classement des conseils
4. Gérer les filtres et catégories
5. Créer l'expérience de récompense

## Stack Technique
- React Query (state management)
- Supabase (backend + RPC)
- NativeWind (styles)
- Reanimated 3 (animations)
- Expo Haptics (feedback)

## Instructions Détaillées

### 1. Créer les types de conseils
Dans `src/types/advice.ts`:
```typescript
export interface Advice {
  id: string;
  post_id: string;
  post?: {
    id: string;
    text: string;
    media: MediaItem[];
    author_id: string;
    author: {
      id: string;
      username: string;
      display_name: string;
      avatar_url?: string;
    };
  };
  advisor_id: string;
  advisor: {
    id: string;
    username: string;
    display_name: string;
    avatar_url?: string;
    is_mentor?: boolean;
  };
  body: string;
  created_at: string;
  updated_at: string;
  is_rewarded?: boolean;
  reward_points?: number;
  reward_given_at?: string;
  reaction_count?: number;
  helpful_count?: number;
}

export interface AdviceReward {
  id: string;
  advice_id: string;
  by_author_id: string;
  points: number;
  created_at: string;
  by_author: {
    id: string;
    username: string;
    display_name: string;
    avatar_url?: string;
  };
}

export interface CreateAdviceData {
  post_id: string;
  body: string;
}

export interface AdviceFilters {
  category?: string;
  time_range?: '24h' | '7d' | '30d' | 'all';
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  min_points?: number;
  rewarded_only?: boolean;
}

export interface AdviceCategory {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: string;
}

export const ADVICE_CATEGORIES: AdviceCategory[] = [
  { id: 'fitness', name: 'Fitness', emoji: '💪', description: 'Conseils sportifs et santé', color: '#22C55E' },
  { id: 'style', name: 'Style', emoji: '👗', description: 'Mode et apparence', color: '#3A8DFF' },
  { id: 'confidence', name: 'Confiance', emoji: '😎', description: 'Estime de soi et confiance', color: '#F59E0B' },
  { id: 'care', name: 'Soins', emoji: '🧼', description: 'Soin de la peau et hygiene', color: '#EF4444' },
  { id: 'wellbeing', name: 'Bien-être', emoji: '😊', description: 'Équilibre mental et bonheur', color: '#8B5CF6' },
  { id: 'nutrition', name: 'Nutrition', emoji: '🥗', description: 'Alimentation et régime', color: '#10B981' },
  { id: 'meditation', name: 'Méditation', emoji: '🧘', description: 'Pratiques méditatives', color: '#06B6D4' },
  { id: 'social', name: 'Social', emoji: '👥', description: 'Relations et communication', color: '#F97316' },
];

export interface AdviceStats {
  total_given: number;
  total_rewards_received: number;
  average_helpful_rating: number;
  top_categories: string[];
  mentor_status?: {
    is_mentor: boolean;
    level: number;
    next_level_points: number;
  };
}
```

### 2. Créer le service de conseils
Dans `src/services/adviceService.ts`:
```typescript
import { supabase } from './supabase';
import { Advice, CreateAdviceData, AdviceFilters, AdviceStats } from '../types/advice';

export class AdviceService {
  static async createAdvice(data: CreateAdviceData): Promise<{ advice: Advice | null; error: Error | null }> {
    try {
      const { data: adviceData, error } = await supabase
        .from('advice')
        .insert([{
          post_id: data.post_id,
          body: data.body,
        }])
        .select(`
          *,
          advisor:advisor_id (
            id,
            username,
            display_name,
            avatar_url
          ),
          post:post_id (
            id,
            text,
            media,
            author_id,
            author:author_id (
              id,
              username,
              display_name,
              avatar_url
            )
          )
        `)
        .single();

      if (error) throw error;

      return { advice: adviceData as Advice, error: null };
    } catch (error) {
      return { advice: null, error: error as Error };
    }
  }

  static async getAdvice(filters: AdviceFilters = {}): Promise<{ advice: Advice[]; error: Error | null }> {
    try {
      let query = supabase
        .from('advice')
        .select(`
          *,
          advisor:advisor_id (
            id,
            username,
            display_name,
            avatar_url
          ),
          post:post_id (
            id,
            text,
            media,
            author_id,
            author:author_id (
              id,
              username,
              display_name,
              avatar_url
            )
          ),
          advice_rewards (*)
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.rewarded_only) {
        query = query.not('advice_rewards', 'is', null);
      }

      if (filters.time_range && filters.time_range !== 'all') {
        const now = new Date();
        let startDate = new Date();

        switch (filters.time_range) {
          case '24h':
            startDate.setHours(now.getHours() - 24);
            break;
          case '7d':
            startDate.setDate(now.getDate() - 7);
            break;
          case '30d':
            startDate.setDate(now.getDate() - 30);
            break;
        }

        query = query.gte('created_at', startDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      return { advice: data as Advice[], error: null };
    } catch (error) {
      return { advice: [], error: error as Error };
    }
  }

  static async getTopAdvice(limit = 10): Promise<{ advice: Advice[]; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('advice_top_view')
        .select('*')
        .order('score', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return { advice: data as Advice[], error: null };
    } catch (error) {
      return { advice: [], error: error as Error };
    }
  }

  static async getTrendingAdvice(): Promise<{ advice: Advice[]; error: Error | null }> {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data, error } = await supabase
        .from('advice')
        .select(`
          *,
          advisor:advisor_id (
            id,
            username,
            display_name,
            avatar_url
          ),
          post:post_id (
            id,
            text,
            media,
            author_id,
            author:author_id (
              id,
              username,
              display_name,
              avatar_url
            )
          ),
          advice_rewards (*)
        `)
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { advice: data as Advice[], error: null };
    } catch (error) {
      return { advice: [], error: error as Error };
    }
  }

  static async getAdviceForUser(userId: string): Promise<{ advice: Advice[]; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('advice')
        .select(`
          *,
          advisor:advisor_id (
            id,
            username,
            display_name,
            avatar_url
          ),
          post:post_id (
            id,
            text,
            media,
            author_id,
            author:author_id (
              id,
              username,
              display_name,
              avatar_url
            )
          ),
          advice_rewards (*)
        `)
        .eq('advisor_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { advice: data as Advice[], error: null };
    } catch (error) {
      return { advice: [], error: error as Error };
    }
  }

  static async getAdviceById(id: string): Promise<{ advice: Advice | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('advice')
        .select(`
          *,
          advisor:advisor_id (
            id,
            username,
            display_name,
            avatar_url
          ),
          post:post_id (
            id,
            text,
            media,
            author_id,
            author:author_id (
              id,
              username,
              display_name,
              avatar_url
            )
          ),
          advice_rewards (*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      return { advice: data as Advice, error: null };
    } catch (error) {
      return { advice: null, error: error as Error };
    }
  }

  static async rewardAdvice(adviceId: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .rpc('reward_advice', {
          p_advice_id: adviceId,
        });

      if (error) throw error;

      return { success: data.success, error: null };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }

  static async getUserAdviceStats(userId: string): Promise<{ stats: AdviceStats | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .rpc('get_user_advice_stats', {
          p_user_id: userId,
        });

      if (error) throw error;

      return { stats: data as AdviceStats, error: null };
    } catch (error) {
      return { stats: null, error: error as Error };
    }
  }

  static async reportAdvice(adviceId: string, reason: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { error } = await supabase
        .from('reports')
        .insert([{
          entity_type: 'advice',
          entity_id: adviceId,
          reason,
        }]);

      if (error) throw error;

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }
}
```

### 3. Créer le composant AdviceCard
Dans `src/components/AdviceCard.tsx`:
```typescript
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Linking } from 'react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { Avatar } from '../../packages/ui';
import { Button } from '../../packages/ui';
import { Card } from '../../packages/ui';
import { useTheme } from '../../packages/theme';
import { Advice } from '../types/advice';
import { useAuth } from '../contexts/AuthContext';
import { AdviceService } from '../services/adviceService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { formatRelativeTime } from '../utils/date';
import {
  Crown,
  Heart,
  MessageCircle,
  Share,
  Flag,
  MoreHorizontal,
  Award,
  TrendingUp,
  CheckCircle
} from 'lucide-react-native';

interface AdviceCardProps {
  advice: Advice;
  onReward?: (adviceId: string) => void;
  isPostAuthor?: boolean;
  showActions?: boolean;
}

export function AdviceCard({ advice, onReward, isPostAuthor = false, showActions = true }: AdviceCardProps) {
  const { tokens } = useTheme();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [isExpanded, setIsExpanded] = useState(false);
  const [showFullText, setShowFullText] = useState(false);

  const rewardAdviceMutation = useMutation({
    mutationFn: (adviceId: string) => AdviceService.rewardAdvice(adviceId),
    onSuccess: (data, adviceId) => {
      if (data.success) {
        queryClient.invalidateQueries(['advice']);
        queryClient.invalidateQueries(['userPoints']);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        Alert.alert(
          'Conseil récompensé !',
          `+200 points ont été attribués à ${advice.advisor.display_name}`,
          [{ text: 'Super !' }]
        );

        onReward?.(adviceId);
      }
    },
    onError: (error) => {
      Alert.alert('Erreur', 'Impossible de récompenser ce conseil.');
    },
  });

  const handleReward = () => {
    Alert.alert(
      'Récompenser ce conseil',
      `Attribuer 200 points à ${advice.advisor.display_name} pour ce conseil utile ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Récompenser',
          onPress: () => rewardAdviceMutation.mutate(advice.id),
          style: 'destructive',
        },
      ]
    );
  };

  const handleReport = () => {
    Alert.alert(
      'Signaler ce conseil',
      'Pourquoi signalez-vous ce conseil ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Contenu inapproprié', onPress: () => handleReportReason('Contenu inapproprié') },
        { text: 'Spam', onPress: () => handleReportReason('Spam') },
        { text: 'Harcèlement', onPress: () => handleReportReason('Harcèlement') },
        { text: 'Autre', onPress: () => handleReportReason('Autre') },
      ]
    );
  };

  const handleReportReason = (reason: string) => {
    AdviceService.reportAdvice(advice.id, reason);
    Alert.alert('Merci', 'Le conseil a été signalé et sera examiné.');
  };

  const toggleTextExpansion = () => {
    setShowFullText(!showFullText);
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const getAdviceCategory = () => {
    // Simple category detection based on keywords
    const text = advice.body.toLowerCase();
    if (text.includes('sport') || text.includes('fitness') || text.includes('musculation')) {
      return { emoji: '💪', name: 'Fitness', color: '#22C55E' };
    }
    if (text.includes('vêtement') || text.includes('style') || text.includes('mode')) {
      return { emoji: '👗', name: 'Style', color: '#3A8DFF' };
    }
    if (text.includes('confiance') || text.includes('estime')) {
      return { emoji: '😎', name: 'Confiance', color: '#F59E0B' };
    }
    if (text.includes('peau') || text.includes('soin') || text.includes('hygiène')) {
      return { emoji: '🧼', name: 'Soins', color: '#EF4444' };
    }
    if (text.includes('bonheur') || text.includes('bien-être') || text.includes('méditation')) {
      return { emoji: '😊', name: 'Bien-être', color: '#8B5CF6' };
    }
    return { emoji: '💡', name: 'Conseil', color: tokens.color.accent };
  };

  const category = getAdviceCategory();
  const shouldTruncate = advice.body.length > 200;
  const displayText = showFullText ? advice.body : truncateText(advice.body, 200);

  return (
    <Card variant="default" padding="md" style={{ marginBottom: tokens.spacing[2] }}>
      {/* Header */}
      <View style={{ marginBottom: tokens.spacing[3] }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing[3] }}>
            <Avatar uri={advice.advisor.avatar_url} size="sm" fallback={advice.advisor.display_name} />
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing[1] }}>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.body,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.color.text,
                  }}
                >
                  {advice.advisor.display_name}
                </Text>
                {advice.advisor.is_mentor && (
                  <Crown size={16} color={tokens.color.warning} fill={tokens.color.warning} />
                )}
              </View>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.caption,
                  color: tokens.color.textMuted,
                }}
              >
                @{advice.advisor.username} · {formatRelativeTime(advice.created_at)}
              </Text>
            </View>
          </View>

          {showActions && (
            <TouchableOpacity>
              <MoreHorizontal size={20} color={tokens.color.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Category badge */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: tokens.spacing[1],
            backgroundColor: category.color + '20',
            paddingVertical: tokens.spacing[1],
            paddingHorizontal: tokens.spacing[2],
            borderRadius: tokens.radius.sm,
            alignSelf: 'flex-start',
            marginTop: tokens.spacing[2],
          }}
        >
          <Text style={{ fontSize: 14 }}>{category.emoji}</Text>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.caption,
              color: category.color,
              fontWeight: tokens.typography.fontWeight.medium,
            }}
          >
            {category.name}
          </Text>
        </View>
      </View>

      {/* Content */}
      <View style={{ marginBottom: tokens.spacing[3] }}>
        <Text
          style={{
            fontSize: tokens.typography.fontSize.body,
            color: tokens.color.text,
            lineHeight: tokens.typography.lineHeight.body,
          }}
        >
          {displayText}
        </Text>

        {shouldTruncate && (
          <TouchableOpacity onPress={toggleTextExpansion}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.body,
                color: tokens.color.accent,
                marginTop: tokens.spacing[1],
              }}
            >
              {showFullText ? 'Voir moins' : 'Voir plus'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Post reference */}
      {advice.post && (
        <Card
          variant="outlined"
          padding="sm"
          style={{ marginBottom: tokens.spacing[3], backgroundColor: tokens.color.bg }}
        >
          <Text
            style={{
              fontSize: tokens.typography.fontSize.caption,
              color: tokens.color.textMuted,
              marginBottom: tokens.spacing[1],
            }}
          >
            En réponse au post de @{advice.post.author.username}
          </Text>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.body,
              color: tokens.color.text,
              lineHeight: tokens.typography.lineHeight.body,
            }}
            numberOfLines={2}
          >
            {advice.post.text}
          </Text>
        </Card>
      )}

      {/* Actions */}
      {showActions && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', gap: tokens.spacing[4] }}>
            {/* Reward button (only for post author) */}
            {isPostAuthor && !advice.is_rewarded && (
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing[1] }}
                onPress={handleReward}
                disabled={rewardAdviceMutation.isLoading}
              >
                <Award size={20} color={tokens.color.accent} />
                <Text style={{ color: tokens.color.accent, fontSize: tokens.typography.fontSize.caption }}>
                  Récompenser (+200)
                </Text>
              </TouchableOpacity>
            )}

            {/* Already rewarded indicator */}
            {advice.is_rewarded && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing[1] }}>
                <CheckCircle size={20} color={tokens.color.success} />
                <Text style={{ color: tokens.color.success, fontSize: tokens.typography.fontSize.caption }}>
                  Récompensé
                </Text>
              </View>
            )}
          </View>

          <View style={{ flexDirection: 'row', gap: tokens.spacing[3] }}>
            <TouchableOpacity>
              <Share size={20} color={tokens.color.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleReport}>
              <Flag size={20} color={tokens.color.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Loading state */}
      {rewardAdviceMutation.isLoading && (
        <View style={{ alignItems: 'center', marginTop: tokens.spacing[2] }}>
          <Text style={{ color: tokens.color.textMuted, fontSize: tokens.typography.fontSize.caption }}>
            Récompense en cours...
          </Text>
        </View>
      )}
    </Card>
  );
}
```

### 4. Créer le composant CreateAdvice
Dans `src/components/CreateAdvice.tsx`:
```typescript
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Card } from '../../packages/ui';
import { Button } from '../../packages/ui';
import { useTheme } from '../../packages/theme';
import { CreateAdviceData } from '../types/advice';
import { useAuth } from '../contexts/AuthContext';
import { AdviceService } from '../services/adviceService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Send, Lightbulb } from 'lucide-react-native';

interface CreateAdviceProps {
  postId: string;
  postAuthorName: string;
  onClose?: () => void;
  onSuccess?: () => void;
}

export function CreateAdvice({ postId, postAuthorName, onClose, onSuccess }: CreateAdviceProps) {
  const { tokens } = useTheme();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createAdviceMutation = useMutation({
    mutationFn: (data: CreateAdviceData) => AdviceService.createAdvice(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['advice']);
      queryClient.invalidateQueries(['post', postId]);
      setContent('');
      onSuccess?.();
      Alert.alert('Succès', 'Votre conseil a été partagé !');
    },
    onError: (error) => {
      Alert.alert('Erreur', 'Impossible de partager votre conseil.');
    },
  });

  const handleSubmit = async () => {
    if (!content.trim()) {
      Alert.alert('Erreur', 'Veuillez écrire un conseil.');
      return;
    }

    if (content.length < 20) {
      Alert.alert('Erreur', 'Votre conseil doit contenir au moins 20 caractères.');
      return;
    }

    const adviceData: CreateAdviceData = {
      post_id: postId,
      body: content,
    };

    createAdviceMutation.mutate(adviceData);
  };

  const getCharacterCount = () => {
    return content.length;
  };

  const getMaxCharacters = () => {
    return 500; // Limit for advice
  };

  const adviceTemplates = [
    "Je te conseille de...",
    "Pour améliorer cela, tu pourrais...",
    "Mon astuce serait de...",
    "Ce qui a marché pour moi :...",
    "Essaye de...",
  ];

  return (
    <View style={{ flex: 1, backgroundColor: tokens.color.bg }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: tokens.spacing[4],
          backgroundColor: tokens.color.surface,
          borderBottomWidth: 1,
          borderBottomColor: tokens.color.line,
        }}
      >
        <TouchableOpacity onPress={onClose}>
          <Text style={{ color: tokens.color.accent, fontSize: tokens.typography.fontSize.body }}>
            Annuler
          </Text>
        </TouchableOpacity>
        <Text
          style={{
            fontSize: tokens.typography.fontSize.title,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: tokens.color.text,
          }}
        >
          Donner un conseil
        </Text>
        <Button
          title="Envoyer"
          onPress={handleSubmit}
          disabled={isSubmitting || !content.trim() || content.length < 20}
          size="sm"
        />
      </View>

      <ScrollView style={{ flex: 1, padding: tokens.spacing[4] }}>
        {/* Context */}
        <Card variant="outlined" padding="md" style={{ marginBottom: tokens.spacing[4] }}>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.caption,
              color: tokens.color.textMuted,
              marginBottom: tokens.spacing[1],
            }}
          >
            Vous donnez un conseil à
          </Text>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.body,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.color.text,
            }}
          >
            {postAuthorName}
          </Text>
        </Card>

        {/* Instructions */}
        <View style={{ marginBottom: tokens.spacing[4] }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing[2] }}>
            <Lightbulb size={20} color={tokens.color.info} />
            <Text
              style={{
                fontSize: tokens.typography.fontSize.body,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.color.text,
              }}
            >
              Comment donner un bon conseil
            </Text>
          </View>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.body,
              color: tokens.color.textMuted,
              lineHeight: tokens.typography.lineHeight.body,
              marginTop: tokens.spacing[1],
            }}
          >
            • Soyez constructif et bienveillant{'\n'}
            • Donnez des conseils pratiques et applicables{'\n'}
            • Partagez votre expérience personnelle{'\n'}
            • Expliquez pourquoi votre conseil fonctionne
          </Text>
        </View>

        {/* Templates */}
        <View style={{ marginBottom: tokens.spacing[4] }}>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.body,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.color.text,
              marginBottom: tokens.spacing[2],
            }}
          >
            Idées pour commencer
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: tokens.spacing[2] }}>
            {adviceTemplates.map((template, index) => (
              <TouchableOpacity
                key={index}
                style={{
                  backgroundColor: tokens.color.surface,
                  padding: tokens.spacing[2],
                  borderRadius: tokens.radius.sm,
                  borderWidth: 1,
                  borderColor: tokens.color.line,
                }}
                onPress={() => setContent(template)}
              >
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.caption,
                    color: tokens.color.textMuted,
                  }}
                >
                  {template}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Text input */}
        <Card padding="md" style={{ marginBottom: tokens.spacing[4] }}>
          <TextInput
            style={{
              fontSize: tokens.typography.fontSize.body,
              color: tokens.color.text,
              minHeight: 200,
              textAlignVertical: 'top',
            }}
            placeholder="Partagez votre conseil..."
            placeholderTextColor={tokens.color.textMuted}
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={10}
            maxLength={getMaxCharacters()}
          />
          <View style={{ alignItems: 'flex-end', marginTop: tokens.spacing[2] }}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.caption,
                color: getCharacterCount() > getMaxCharacters() * 0.9
                  ? tokens.color.danger
                  : tokens.color.textMuted,
              }}
            >
              {getCharacterCount()}/{getMaxCharacters()}
            </Text>
          </View>
        </Card>

        {/* Reward info */}
        <Card
          variant="outlined"
          padding="md"
          style={{
            backgroundColor: tokens.color.success + '10',
            borderColor: tokens.color.success + '30',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing[2] }}>
            <Text style={{ fontSize: 24 }}>🎁</Text>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.body,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.color.success,
                }}
              >
                +200 points possibles
              </Text>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.caption,
                  color: tokens.color.success,
                  lineHeight: tokens.typography.lineHeight.caption,
                }}
              >
                Si l'auteur du post trouve votre conseil utile, il pourra vous récompenser avec 200 points !
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}
```

### 5. Créer les hooks personnalisés
Dans `src/hooks/useAdvice.ts`:
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdviceService } from '../services/adviceService';
import { Advice, CreateAdviceData, AdviceFilters } from '../types/advice';

export function useAdvice(filters: AdviceFilters = {}) {
  return useQuery({
    queryKey: ['advice', filters],
    queryFn: () => AdviceService.getAdvice(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useTopAdvice() {
  return useQuery({
    queryKey: ['topAdvice'],
    queryFn: () => AdviceService.getTopAdvice(20),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useTrendingAdvice() {
  return useQuery({
    queryKey: ['trendingAdvice'],
    queryFn: () => AdviceService.getTrendingAdvice(),
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
}

export function useUserAdvice(userId: string) {
  return useQuery({
    queryKey: ['userAdvice', userId],
    queryFn: () => AdviceService.getAdviceForUser(userId),
    enabled: !!userId,
  });
}

export function useCreateAdvice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAdviceData) => AdviceService.createAdvice(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['advice']);
      queryClient.invalidateQueries(['topAdvice']);
      queryClient.invalidateQueries(['trendingAdvice']);
    },
  });
}

export function useRewardAdvice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (adviceId: string) => AdviceService.rewardAdvice(adviceId),
    onSuccess: () => {
      queryClient.invalidateQueries(['advice']);
      queryClient.invalidateQueries(['userPoints']);
      queryClient.invalidateQueries(['userAdviceStats']);
    },
  });
}

export function useUserAdviceStats(userId: string) {
  return useQuery({
    queryKey: ['userAdviceStats', userId],
    queryFn: () => AdviceService.getUserAdviceStats(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

## Livrables Attendus
1. Service de conseils complet avec CRUD
2. Composant AdviceCard avec récompenses
3. Composant CreateAdvice avec templates
4. Système de récompenses +200 points
5. Filtres et catégories de conseils
6. Hooks React Query optimisés
7. Types TypeScript stricts

## Contraintes
- Un conseil doit avoir minimum 20 caractères
- Maximum 500 caractères par conseil
- Récompense uniquement par l'auteur du post
- Un conseil ne peut être récompensé qu'une fois
- Système de signalement pour abus
- Feedback haptique sur récompense

## Validation
- Création de conseils fonctionne
- Récompenses +200 points fonctionnent
- Filtres s'appliquent correctement
- Stats des utilisateurs s'affichent
- Signalements fonctionnent
- Performance sur longues listes
- Design cohérent avec GLOUP
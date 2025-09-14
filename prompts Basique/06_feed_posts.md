# GLOUP - Phase 6: Feed et Posts

## Contexte
Ce prompt guide l'implémentation complète du système de feed et de posts pour GLOUP, incluant la création, l'affichage et les interactions sur les posts.

## Rôle
Tu es un expert en développement mobile et expérience utilisateur. Tu dois créer un système de feed performant avec des posts interactifs et des réactions.

## Objectifs
1. Créer les composants de posts
2. Implémenter le système de réactions
3. Développer le créateur de posts
4. Gérer les médias (images/vidéos)
5. Créer le système de points

## Stack Technique
- FlashList (performance listes)
- React Query (state management)
- Supabase (backend)
- Expo Image Picker (médias)
- Reanimated 3 (animations)

## Instructions Détaillées

### 1. Créer les types de posts
Dans `src/types/post.ts`:
```typescript
export interface MediaItem {
  type: 'image' | 'video';
  url: string;
  alt_text?: string;
  width?: number;
  height?: number;
  thumbnail_url?: string;
}

export interface Post {
  id: string;
  author_id: string;
  author: {
    id: string;
    username: string;
    display_name: string;
    avatar_url?: string;
    is_verified?: boolean;
  };
  text: string;
  media: MediaItem[];
  visibility: 'public' | 'followers' | 'private';
  created_at: string;
  updated_at: string;
  reaction_count: number;
  advice_count: number;
  current_user_reaction?: {
    type: string;
    created_at: string;
  };
  is_saved?: boolean;
}

export interface CreatePostData {
  text: string;
  media: MediaItem[];
  visibility: 'public' | 'followers' | 'private';
}

export interface Reaction {
  id: string;
  post_id: string;
  reactor_id: string;
  type: string;
  created_at: string;
  reactor: {
    username: string;
    display_name: string;
    avatar_url?: string;
  };
}

export interface ReactionType {
  key: string;
  label: string;
  emoji: string;
  base_points: number;
}

export const REACTION_TYPES: ReactionType[] = [
  { key: 'crown', label: 'Couronne', emoji: '👑', base_points: 20 },
  { key: 'style', label: 'Style', emoji: '👗', base_points: 10 },
  { key: 'fitness', label: 'Fitness', emoji: '💪', base_points: 10 },
  { key: 'confidence', label: 'Confiance', emoji: '😎', base_points: 10 },
  { key: 'care', label: 'Soins', emoji: '🧼', base_points: 10 },
  { key: 'wellbeing', label: 'Bien-être', emoji: '😊', base_points: 10 },
];
```

### 2. Créer le service de posts
Dans `src/services/postService.ts`:
```typescript
import { supabase } from './supabase';
import { Post, CreatePostData, Reaction, ReactionType } from '../types/post';

export class PostService {
  static async createPost(data: CreatePostData): Promise<{ post: Post | null; error: Error | null }> {
    try {
      const { data: postData, error } = await supabase
        .from('posts')
        .insert([{
          text: data.text,
          media: data.media,
          visibility: data.visibility,
        }])
        .select(`
          *,
          author:author_id (
            id,
            username,
            display_name,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      return { post: postData as Post, error: null };
    } catch (error) {
      return { post: null, error: error as Error };
    }
  }

  static async getFeed(mode: 'for_you' | 'following' = 'for_you', limit = 20, offset = 0): Promise<{ posts: Post[]; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .rpc('feed_for_user', {
          p_mode: mode,
          p_limit: limit,
          p_offset: offset,
        });

      if (error) throw error;

      return { posts: data as Post[], error: null };
    } catch (error) {
      return { posts: [], error: error as Error };
    }
  }

  static async getPostById(id: string): Promise<{ post: Post | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:author_id (
            id,
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      return { post: data as Post, error: null };
    } catch (error) {
      return { post: null, error: error as Error };
    }
  }

  static async deletePost(id: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  static async addReaction(postId: string, reactionType: string): Promise<{ reaction: Reaction | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('post_reactions')
        .upsert([{
          post_id: postId,
          type: reactionType,
        }])
        .select(`
          *,
          reactor:reactor_id (
            username,
            display_name,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      return { reaction: data as Reaction, error: null };
    } catch (error) {
      return { reaction: null, error: error as Error };
    }
  }

  static async removeReaction(postId: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('post_reactions')
        .delete()
        .eq('post_id', postId);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  static async getReactions(postId: string): Promise<{ reactions: Reaction[]; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('post_reactions')
        .select(`
          *,
          reactor:reactor_id (
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { reactions: data as Reaction[], error: null };
    } catch (error) {
      return { reactions: [], error: error as Error };
    }
  }

  static async getUserPosts(userId: string, limit = 20, offset = 0): Promise<{ posts: Post[]; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:author_id (
            id,
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('author_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return { posts: data as Post[], error: null };
    } catch (error) {
      return { posts: [], error: error as Error };
    }
  }

  static async toggleSavePost(postId: string): Promise<{ isSaved: boolean; error: Error | null }> {
    try {
      // This would need a saved_posts table implementation
      // For now, just return a placeholder
      return { isSaved: false, error: null };
    } catch (error) {
      return { isSaved: false, error: error as Error };
    }
  }
}
```

### 3. Créer le composant PostCard
Dans `src/components/PostCard.tsx`:
```typescript
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Linking, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { FlashList } from '@shopify/flash-list';
import { Avatar } from '../../packages/ui';
import { ReactionChip } from '../../packages/ui';
import { Button } from '../../packages/ui';
import { useTheme } from '../../packages/theme';
import { Post, ReactionType } from '../types/post';
import { REACTION_TYPES } from '../types/post';
import { formatRelativeTime } from '../utils/date';
import { router } from 'expo-router';
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share,
  MoreHorizontal,
  Play
} from 'lucide-react-native';

interface PostCardProps {
  post: Post;
  onReaction?: (postId: string, reactionType: string) => void;
  onComment?: (postId: string) => void;
  onSave?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onUserPress?: (userId: string) => void;
  showActions?: boolean;
}

const { width: screenWidth } = Dimensions.get('window');

export function PostCard({
  post,
  onReaction,
  onComment,
  onSave,
  onShare,
  onUserPress,
  showActions = true,
}: PostCardProps) {
  const { tokens } = useTheme();
  const [selectedReaction, setSelectedReaction] = useState<string | null>(
    post.current_user_reaction?.type || null
  );
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  const handleReaction = (reactionType: string) => {
    setSelectedReaction(selectedReaction === reactionType ? null : reactionType);
    onReaction?.(post.id, reactionType);
    setShowReactionPicker(false);
  };

  const handleHashtagPress = (hashtag: string) => {
    router.push(`/search?q=${hashtag}`);
  };

  const handleMentionPress = (mention: string) => {
    router.push(`/profile/${mention.replace('@', '')}`);
  };

  const renderMedia = () => {
    if (!post.media || post.media.length === 0) return null;

    const renderGrid = (items: Post['media']) => {
      if (items.length === 1) {
        const item = items[0];
        const aspectRatio = item.width && item.height ? item.width / item.height : 1;

        return (
          <TouchableOpacity
            style={{
              width: '100%',
              aspectRatio: aspectRatio,
              borderRadius: tokens.radius.md,
              overflow: 'hidden',
            }}
            onPress={() => router.push(`/media/${post.id}/${0}`)}
          >
            <Image
              source={{ uri: item.url }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
              transition={300}
            />
            {item.type === 'video' && (
              <View
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: [{ translateX: -12 }, { translateY: -12 }],
                }}
              >
                <Play size={24} color="white" fill="white" />
              </View>
            )}
          </TouchableOpacity>
        );
      }

      if (items.length === 2) {
        return (
          <View style={{ flexDirection: 'row', gap: 2, height: 200 }}>
            {items.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={{ flex: 1, borderRadius: tokens.radius.md, overflow: 'hidden' }}
                onPress={() => router.push(`/media/${post.id}/${index}`)}
              >
                <Image
                  source={{ uri: item.url }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                  transition={300}
                />
              </TouchableOpacity>
            ))}
          </View>
        );
      }

      // For 3+ items, create a grid
      return (
        <View style={{ height: 300 }}>
          <FlashList
            data={items}
            numColumns={2}
            estimatedItemSize={150}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={{
                  width: (screenWidth - 32 - 4) / 2,
                  height: 150,
                  margin: 1,
                  borderRadius: tokens.radius.md,
                  overflow: 'hidden',
                }}
                onPress={() => router.push(`/media/${post.id}/${index}`)}
              >
                <Image
                  source={{ uri: item.url }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                  transition={300}
                />
                {index === 3 && items.length > 4 && (
                  <View
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>
                      +{items.length - 4}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      );
    };

    return <View style={{ marginTop: tokens.spacing[3] }}>{renderGrid(post.media)}</View>;
  };

  const renderText = () => {
    if (!post.text) return null;

    // Simple text rendering (could be enhanced with rich text)
    return (
      <Text
        style={{
          fontSize: tokens.typography.fontSize.body,
          color: tokens.color.text,
          lineHeight: tokens.typography.lineHeight.body,
          marginTop: tokens.spacing[3],
        }}
      >
        {post.text}
      </Text>
    );
  };

  const renderActions = () => {
    if (!showActions) return null;

    return (
      <View style={{ marginTop: tokens.spacing[3] }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <View style={{ flexDirection: 'row', gap: tokens.spacing[4] }}>
            {/* Reaction button */}
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing[1] }}
              onPress={() => setShowReactionPicker(!showReactionPicker)}
            >
              <Heart
                size={20}
                color={selectedReaction ? tokens.color.accent : tokens.color.textMuted}
                fill={selectedReaction ? tokens.color.accent : 'none'}
              />
              <Text style={{ color: tokens.color.textMuted, fontSize: tokens.typography.fontSize.caption }}>
                {post.reaction_count}
              </Text>
            </TouchableOpacity>

            {/* Comment button */}
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing[1] }}
              onPress={() => onComment?.(post.id)}
            >
              <MessageCircle size={20} color={tokens.color.textMuted} />
              <Text style={{ color: tokens.color.textMuted, fontSize: tokens.typography.fontSize.caption }}>
                {post.advice_count}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: 'row', gap: tokens.spacing[4] }}>
            {/* Save button */}
            <TouchableOpacity onPress={() => onSave?.(post.id)}>
              <Bookmark
                size={20}
                color={post.is_saved ? tokens.color.accent : tokens.color.textMuted}
                fill={post.is_saved ? tokens.color.accent : 'none'}
              />
            </TouchableOpacity>

            {/* Share button */}
            <TouchableOpacity onPress={() => onShare?.(post.id)}>
              <Share size={20} color={tokens.color.textMuted} />
            </TouchableOpacity>

            {/* More options */}
            <TouchableOpacity>
              <MoreHorizontal size={20} color={tokens.color.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Reaction picker */}
        {showReactionPicker && (
          <View
            style={{
              flexDirection: 'row',
              gap: tokens.spacing[2],
              marginTop: tokens.spacing[3],
              padding: tokens.spacing[2],
              backgroundColor: tokens.color.surface,
              borderRadius: tokens.radius.md,
            }}
          >
            {REACTION_TYPES.map((reaction) => (
              <ReactionChip
                key={reaction.key}
                emoji={reaction.emoji}
                label={reaction.label}
                points={reaction.base_points}
                isSelected={selectedReaction === reaction.key}
                onPress={() => handleReaction(reaction.key)}
              />
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View
      style={{
        backgroundColor: tokens.color.surface,
        borderRadius: tokens.radius.md,
        padding: tokens.spacing[4],
        marginBottom: tokens.spacing[2],
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing[3] }}
          onPress={() => onUserPress?.(post.author.id)}
        >
          <Avatar uri={post.author.avatar_url} size="md" fallback={post.author.display_name} />
          <View>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.body,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.color.text,
              }}
            >
              {post.author.display_name}
              {post.author.is_verified && (
                <Text style={{ color: tokens.color.accent }}> ✓</Text>
              )}
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.caption,
                color: tokens.color.textMuted,
              }}
            >
              @{post.author.username} · {formatRelativeTime(post.created_at)}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity>
          <MoreHorizontal size={20} color={tokens.color.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {renderText()}
      {renderMedia()}

      {/* Actions */}
      {renderActions()}
    </View>
  );
}
```

### 4. Créer le composant CreatePost
Dans `src/components/CreatePost.tsx`:
```typescript
import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Button, Card } from '../../packages/ui';
import { useTheme } from '../../packages/theme';
import { MediaItem, CreatePostData } from '../types/post';
import { PostService } from '../services/postService';
import { useAuth } from '../contexts/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Image as ImageIcon, Video, MapPin } from 'lucide-react-native';

interface CreatePostProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

export function CreatePost({ onClose, onSuccess }: CreatePostProps) {
  const { tokens } = useTheme();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [content, setContent] = useState('');
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visibility, setVisibility] = useState<'public' | 'followers' | 'private'>('public');

  const createPostMutation = useMutation({
    mutationFn: (data: CreatePostData) => PostService.createPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['feed']);
      setContent('');
      setMedia([]);
      onSuccess?.();
      Alert.alert('Succès', 'Votre post a été publié !');
    },
    onError: (error) => {
      Alert.alert('Erreur', 'Une erreur est survenue lors de la publication.');
    },
  });

  const pickMedia = async (type: 'image' | 'video') => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: type === 'image' ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const mediaItem: MediaItem = {
          type,
          url: asset.uri,
          width: asset.width,
          height: asset.height,
          alt_text: '', // Should be filled by user
        };

        setMedia(prev => [...prev, mediaItem]);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sélectionner le média.');
    }
  };

  const removeMedia = (index: number) => {
    setMedia(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!content.trim() && media.length === 0) {
      Alert.alert('Erreur', 'Veuillez ajouter du texte ou un média.');
      return;
    }

    const postData: CreatePostData = {
      text: content,
      media,
      visibility,
    };

    createPostMutation.mutate(postData);
  };

  const getCharacterCount = () => {
    return content.length;
  };

  const getMaxCharacters = () => {
    return 280; // Twitter-like limit
  };

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
          Créer un post
        </Text>
        <Button
          title="Publier"
          onPress={handleSubmit}
          disabled={isSubmitting || (!content.trim() && media.length === 0)}
          size="sm"
        />
      </View>

      {/* Content */}
      <View style={{ flex: 1, padding: tokens.spacing[4] }}>
        {/* User info */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: tokens.spacing[4] }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: tokens.color.accent + '20',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: tokens.spacing[3],
            }}
          >
            <Text style={{ fontSize: 16, color: tokens.color.accent, fontWeight: 'bold' }}>
              {user?.display_name?.[0]?.toUpperCase() || 'G'}
            </Text>
          </View>
          <View>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.body,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.color.text,
              }}
            >
              {user?.display_name}
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.caption,
                color: tokens.color.textMuted,
              }}
            >
              @{user?.username}
            </Text>
          </View>
        </View>

        {/* Text input */}
        <TextInput
          style={{
            fontSize: tokens.typography.fontSize.body,
            color: tokens.color.text,
            minHeight: 120,
            textAlignVertical: 'top',
            marginBottom: tokens.spacing[4],
          }}
          placeholder="Quoi de neuf ?"
          placeholderTextColor={tokens.color.textMuted}
          value={content}
          onChangeText={setContent}
          multiline
          numberOfLines={8}
          maxLength={getMaxCharacters()}
        />

        {/* Character count */}
        <View style={{ alignItems: 'flex-end', marginBottom: tokens.spacing[4] }}>
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

        {/* Media preview */}
        {media.length > 0 && (
          <View style={{ marginBottom: tokens.spacing[4] }}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.body,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.color.text,
                marginBottom: tokens.spacing[2],
              }}
            >
              Médias ({media.length})
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: tokens.spacing[2] }}>
              {media.map((item, index) => (
                <View key={index} style={{ position: 'relative' }}>
                  <Image
                    source={{ uri: item.url }}
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: tokens.radius.md,
                    }}
                    contentFit="cover"
                  />
                  <TouchableOpacity
                    style={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      borderRadius: 12,
                      padding: 2,
                    }}
                    onPress={() => removeMedia(index)}
                  >
                    <X size={16} color="white" />
                  </TouchableOpacity>
                  {item.type === 'video' && (
                    <View
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: [{ translateX: -8 }, { translateY: -8 }],
                      }}
                    >
                      <Video size={16} color="white" fill="white" />
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Action buttons */}
        <View style={{ flexDirection: 'row', gap: tokens.spacing[3] }}>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: tokens.spacing[1],
              padding: tokens.spacing[2],
              borderRadius: tokens.radius.md,
              backgroundColor: tokens.color.surface,
            }}
            onPress={() => pickMedia('image')}
          >
            <ImageIcon size={20} color={tokens.color.accent} />
            <Text style={{ color: tokens.color.accent, fontSize: tokens.typography.fontSize.body }}>
              Photo
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: tokens.spacing[1],
              padding: tokens.spacing[2],
              borderRadius: tokens.radius.md,
              backgroundColor: tokens.color.surface,
            }}
            onPress={() => pickMedia('video')}
          >
            <Video size={20} color={tokens.color.accent} />
            <Text style={{ color: tokens.color.accent, fontSize: tokens.typography.fontSize.body }}>
              Vidéo
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: tokens.spacing[1],
              padding: tokens.spacing[2],
              borderRadius: tokens.radius.md,
              backgroundColor: tokens.color.surface,
            }}
          >
            <MapPin size={20} color={tokens.color.accent} />
            <Text style={{ color: tokens.color.accent, fontSize: tokens.typography.fontSize.body }}>
              Lieu
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
```

### 5. Créer les hooks personnalisés
Dans `src/hooks/usePosts.ts`:
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PostService } from '../services/postService';
import { Post, CreatePostData } from '../types/post';

export function useFeed(mode: 'for_you' | 'following' = 'for_you') {
  return useQuery({
    queryKey: ['feed', mode],
    queryFn: () => PostService.getFeed(mode),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePostData) => PostService.createPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['feed']);
      queryClient.invalidateQueries(['userPosts']);
    },
  });
}

export function usePostReactions(postId: string) {
  return useQuery({
    queryKey: ['postReactions', postId],
    queryFn: () => PostService.getReactions(postId),
    enabled: !!postId,
  });
}

export function useAddReaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, reactionType }: { postId: string; reactionType: string }) =>
      PostService.addReaction(postId, reactionType),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['feed']);
      queryClient.invalidateQueries(['post', variables.postId]);
      queryClient.invalidateQueries(['postReactions', variables.postId]);
    },
  });
}

export function useRemoveReaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => PostService.removeReaction(postId),
    onSuccess: (data, postId) => {
      queryClient.invalidateQueries(['feed']);
      queryClient.invalidateQueries(['post', postId]);
      queryClient.invalidateQueries(['postReactions', postId]);
    },
  });
}

export function useUserPosts(userId: string) {
  return useQuery({
    queryKey: ['userPosts', userId],
    queryFn: () => PostService.getUserPosts(userId),
    enabled: !!userId,
  });
}
```

## Livrables Attendus
1. Service de posts complet avec CRUD
2. Composant PostCard avec interactions
3. Composant CreatePost avec gestion de médias
4. Système de réactions fonctionnel
5. Hooks React Query optimisés
6. Gestion des médias (images/vidéos)
7. Types TypeScript stricts

## Contraintes
- Utiliser FlashList pour les longues listes
- Limiter les posts à 280 caractères
- Supporter jusqu'à 4 médias par post
- Gérer les états de chargement
- Optimiser les performances
- Respecter le design GLOUP

## Validation
- Posts s'affichent correctement
- Réactions fonctionnent
- Médias s'affichent
- Création de posts fonctionne
- Performance sur 1000+ posts
- Pas de fuites mémoire
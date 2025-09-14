# GLOUP - Phase 9: Profil et Personnalisation

## Contexte
Ce prompt guide l'implémentation complète du système de profil et de personnalisation pour GLOUP, incluant l'édition de profil, les statistiques, les badges et la personnalisation via les points.

## Rôle
Tu es un expert en expérience utilisateur et gamification. Tu dois créer un système de profil engageant avec des options de personnalisation motivantes.

## Objectifs
1. Créer l'écran de profil complet
2. Implémenter l'édition de profil
3. Développer le système de badges et statuts
4. Gérer les statistiques utilisateur
5. Créer les options de personnalisation

## Stack Technique
- React Query (state management)
- Supabase (backend)
- Expo Image Picker (avatar/banner)
- React Native Reanimated (animations)
- Expo Haptics (feedback)

## Instructions Détaillées

### 1. Créer les types de profil
Dans `src/types/profile.ts`:
```typescript
export interface Profile {
  id: string;
  username: string;
  display_name: string;
  bio?: string;
  avatar_url?: string;
  banner_url?: string;
  location?: string;
  website?: string;
  birth_date?: string;
  gender?: 'male' | 'female' | 'non_binary' | 'prefer_not_to_say';
  interests: string[];
  created_at: string;
  updated_at: string;
  is_verified: boolean;
  is_mentor: boolean;
  mentor_level?: number;
  privacy_settings: PrivacySettings;
  notification_settings: NotificationSettings;
}

export interface PrivacySettings {
  show_birth_date: boolean;
  show_location: boolean;
  show_activity_status: boolean;
  allow_messages_from: 'everyone' | 'following' | 'none';
  show_advice_history: boolean;
  show_points_balance: boolean;
}

export interface NotificationSettings {
  new_follower: boolean;
  new_reaction: boolean;
  new_advice_reward: boolean;
  new_message: boolean;
  new_mention: boolean;
  weekly_digest: boolean;
}

export interface UserStats {
  posts_count: number;
  followers_count: number;
  following_count: number;
  reactions_received_count: number;
  advice_given_count: number;
  advice_rewards_received_count: number;
  total_points: number;
  mentor_status?: {
    is_mentor: boolean;
    level: number;
    next_level_points: number;
    current_level_points: number;
  };
  join_date: string;
  activity_streak: number;
  top_categories: Array<{
    category: string;
    count: number;
  }>;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  requirement: string;
  earned_at?: string;
  is_earned: boolean;
}

export interface CustomizationOption {
  id: string;
  name: string;
  description: string;
  type: 'theme' | 'avatar_frame' | 'banner' | 'profile_music' | 'chat_bubble';
  preview_url?: string;
  cost: number;
  is_premium: boolean;
  is_purchased: boolean;
  is_active: boolean;
}

export interface AchievementProgress {
  achievement_id: string;
  current_value: number;
  target_value: number;
  percentage: number;
  unlocked_at?: string;
}

export const BADGES: Badge[] = [
  {
    id: 'early_adopter',
    name: 'Pionnier',
    description: 'Rejoint GLOUP dans les premiers 1000 utilisateurs',
    icon: '🚀',
    color: '#3A8DFF',
    requirement: 'rejoint_early',
    is_earned: false,
  },
  {
    id: 'first_post',
    name: 'Premier Post',
    description: 'Publié votre premier post',
    icon: '📝',
    color: '#22C55E',
    requirement: 'first_post',
    is_earned: false,
  },
  {
    id: 'social_butterfly',
    name: 'Papillon Social',
    description: 'Obtenu 100 followers',
    icon: '🦋',
    color: '#F59E0B',
    requirement: 'followers_100',
    is_earned: false,
  },
  {
    id: 'helpful_mentor',
    name: 'Mentor Utile',
    description: 'Donné 50 conseils récompensés',
    icon: '🌟',
    color: '#8B5CF6',
    requirement: 'advice_rewards_50',
    is_earned: false,
  },
  {
    id: 'creative_soul',
    name: 'Âme Créative',
    description: 'Publié 100 posts avec médias',
    icon: '🎨',
    color: '#EC4899',
    requirement: 'media_posts_100',
    is_earned: false,
  },
  {
    id: 'engagement_champion',
    name: 'Champion de l\'Engagement',
    description: 'Donné 1000 réactions',
    icon: '🏆',
    color: '#EF4444',
    requirement: 'reactions_1000',
    is_earned: false,
  },
];

export const CUSTOMIZATION_OPTIONS: CustomizationOption[] = [
  {
    id: 'theme_neon',
    name: 'Thème Néon',
    description: 'Palette de couleurs néon vibrantes',
    type: 'theme',
    cost: 500,
    is_premium: false,
    is_purchased: false,
    is_active: false,
  },
  {
    id: 'theme_sunset',
    name: 'Thème Coucher de Soleil',
    description: 'Tons chauds et relaxants',
    type: 'theme',
    cost: 300,
    is_premium: false,
    is_purchased: false,
    is_active: false,
  },
  {
    id: 'frame_gold',
    name: 'Cadre Doré',
    description: 'Cadre avatar doré premium',
    type: 'avatar_frame',
    cost: 1000,
    is_premium: true,
    is_purchased: false,
    is_active: false,
  },
  {
    id: 'frame_rainbow',
    name: 'Cadre Arc-en-ciel',
    description: 'Cadre coloré et festif',
    type: 'avatar_frame',
    cost: 750,
    is_premium: false,
    is_purchased: false,
    is_active: false,
  },
  {
    id: 'music_calm',
    name: 'Musique Calme',
    description: 'Musique d\'ambiance apaisante',
    type: 'profile_music',
    cost: 200,
    is_premium: false,
    is_purchased: false,
    is_active: false,
  },
];
```

### 2. Créer le service de profil
Dans `src/services/profileService.ts`:
```typescript
import { supabase } from './supabase';
import { Profile, UserStats, Badge, CustomizationOption, AchievementProgress } from '../types/profile';

export class ProfileService {
  static async getProfile(userId: string): Promise<{ profile: Profile | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_points (total),
          followers:follows!follows_followee_id_fkey (count),
          following:follows!follows_follower_id_fkey (count)
        `)
        .eq('id', userId)
        .single();

      if (error) throw error;

      const profile: Profile = {
        id: data.id,
        username: data.username,
        display_name: data.display_name,
        bio: data.bio,
        avatar_url: data.avatar_url,
        banner_url: data.banner_url,
        location: data.location,
        website: data.website,
        birth_date: data.birth_date,
        gender: data.gender,
        interests: data.interests || [],
        created_at: data.created_at,
        updated_at: data.updated_at,
        is_verified: data.is_verified || false,
        is_mentor: data.is_mentor || false,
        mentor_level: data.mentor_level,
        privacy_settings: data.privacy_settings || {},
        notification_settings: data.notification_settings || {},
      };

      return { profile, error: null };
    } catch (error) {
      return { profile: null, error: error as Error };
    }
  }

  static async updateProfile(userId: string, updates: Partial<Profile>): Promise<{ profile: Profile | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      const profile: Profile = {
        id: data.id,
        username: data.username,
        display_name: data.display_name,
        bio: data.bio,
        avatar_url: data.avatar_url,
        banner_url: data.banner_url,
        location: data.location,
        website: data.website,
        birth_date: data.birth_date,
        gender: data.gender,
        interests: data.interests || [],
        created_at: data.created_at,
        updated_at: data.updated_at,
        is_verified: data.is_verified || false,
        is_mentor: data.is_mentor || false,
        mentor_level: data.mentor_level,
        privacy_settings: data.privacy_settings || {},
        notification_settings: data.notification_settings || {},
      };

      return { profile, error: null };
    } catch (error) {
      return { profile: null, error: error as Error };
    }
  }

  static async getUserStats(userId: string): Promise<{ stats: UserStats | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .rpc('get_user_stats', {
          p_user_id: userId,
        });

      if (error) throw error;

      const stats: UserStats = {
        posts_count: data.posts || 0,
        followers_count: data.followers || 0,
        following_count: data.following || 0,
        reactions_received_count: data.reactions_received || 0,
        advice_given_count: data.advice_given || 0,
        advice_rewards_received_count: data.advice_rewards_received || 0,
        total_points: data.total_points || 0,
        mentor_status: data.mentor_status,
        join_date: data.join_date,
        activity_streak: data.activity_streak || 0,
        top_categories: data.top_categories || [],
      };

      return { stats, error: null };
    } catch (error) {
      return { stats: null, error: error as Error };
    }
  }

  static async getUserBadges(userId: string): Promise<{ badges: Badge[]; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          badge_id,
          earned_at,
          badges (*)
        `)
        .eq('user_id', userId);

      if (error) throw error;

      const earnedBadgeIds = data.map(item => item.badge_id);
      const allBadges = BADGES.map(badge => ({
        ...badge,
        is_earned: earnedBadgeIds.includes(badge.id),
        earned_at: data.find(item => item.badge_id === badge.id)?.earned_at,
      }));

      return { badges: allBadges, error: null };
    } catch (error) {
      return { badges: [], error: error as Error };
    }
  }

  static async getCustomizationOptions(userId: string): Promise<{ options: CustomizationOption[]; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('user_customizations')
        .select('customization_id, is_active')
        .eq('user_id', userId);

      if (error) throw error;

      const purchasedIds = data.map(item => item.customization_id);
      const activeIds = data.filter(item => item.is_active).map(item => item.customization_id);

      const options = CUSTOMIZATION_OPTIONS.map(option => ({
        ...option,
        is_purchased: purchasedIds.includes(option.id),
        is_active: activeIds.includes(option.id),
      }));

      return { options, error: null };
    } catch (error) {
      return { options: [], error: error as Error };
    }
  }

  static async purchaseCustomization(userId: string, optionId: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      const option = CUSTOMIZATION_OPTIONS.find(opt => opt.id === optionId);
      if (!option) {
        throw new Error('Option not found');
      }

      // Check if user has enough points
      const { data: userPoints, error: pointsError } = await supabase
        .from('user_points')
        .select('total')
        .eq('user_id', userId)
        .single();

      if (pointsError) throw pointsError;

      if ((userPoints?.total || 0) < option.cost) {
        throw new Error('Not enough points');
      }

      // Deduct points and add customization
      const { error } = await supabase.rpc('purchase_customization', {
        p_user_id: userId,
        p_option_id: optionId,
        p_cost: option.cost,
      });

      if (error) throw error;

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }

  static async activateCustomization(userId: string, optionId: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { error } = await supabase
        .from('user_customizations')
        .update({ is_active: true })
        .eq('user_id', userId)
        .eq('customization_id', optionId);

      if (error) throw error;

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }

  static async followUser(userId: string, targetUserId: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { error } = await supabase
        .from('follows')
        .insert([{
          follower_id: userId,
          followee_id: targetUserId,
        }]);

      if (error) throw error;

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }

  static async unfollowUser(userId: string, targetUserId: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', userId)
        .eq('followee_id', targetUserId);

      if (error) throw error;

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }

  static async checkUsernameAvailability(username: string): Promise<{ available: boolean; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .single();

      if (error && error.code === 'PGRST116') {
        // No rows found - username is available
        return { available: true, error: null };
      }

      if (error) throw error;

      return { available: false, error: null };
    } catch (error) {
      return { available: false, error: error as Error };
    }
  }
}
```

### 3. Créer le composant ProfileHeader
Dans `src/components/ProfileHeader.tsx`:
```typescript
import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Avatar } from '../../packages/ui';
import { Button } from '../../packages/ui';
import { Card } from '../../packages/ui';
import { useTheme } from '../../packages/theme';
import { Profile } from '../types/profile';
import { formatRelativeTime } from '../utils/date';
import {
  Edit,
  MoreHorizontal,
  MapPin,
  Calendar,
  Link,
  Award,
  Crown,
  Settings,
  Share,
  UserMinus,
  UserPlus
} from 'lucide-react-native';

interface ProfileHeaderProps {
  profile: Profile;
  stats?: {
    posts: number;
    followers: number;
    following: number;
    points: number;
  };
  isOwnProfile?: boolean;
  isFollowing?: boolean;
  onEdit?: () => void;
  onFollow?: () => void;
  onUnfollow?: () => void;
  onSettings?: () => void;
  onShare?: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

export function ProfileHeader({
  profile,
  stats,
  isOwnProfile = false,
  isFollowing = false,
  onEdit,
  onFollow,
  onUnfollow,
  onSettings,
  onShare,
}: ProfileHeaderProps) {
  const { tokens } = useTheme();

  return (
    <View style={{ backgroundColor: tokens.color.bg }}>
      {/* Banner */}
      <View style={{ position: 'relative' }}>
        {profile.banner_url ? (
          <Image
            source={{ uri: profile.banner_url }}
            style={{
              width: '100%',
              height: 200,
            }}
            contentFit="cover"
          />
        ) : (
          <View
            style={{
              width: '100%',
              height: 200,
              backgroundColor: tokens.color.surface,
            }}
          />
        )}

        {/* Avatar overlay */}
        <View
          style={{
            position: 'absolute',
            bottom: -40,
            left: tokens.spacing[4],
            backgroundColor: tokens.color.surface,
            borderRadius: 8,
            padding: 4,
          }}
        >
          <Avatar uri={profile.avatar_url} size="xl" fallback={profile.display_name} />
          {profile.is_mentor && (
            <View
              style={{
                position: 'absolute',
                bottom: -4,
                right: -4,
                backgroundColor: tokens.color.warning,
                borderRadius: 12,
                padding: 2,
              }}
            >
              <Crown size={16} color="white" fill="white" />
            </View>
          )}
        </View>

        {/* Action buttons */}
        <View
          style={{
            position: 'absolute',
            top: tokens.spacing[4],
            right: tokens.spacing[4],
            flexDirection: 'row',
            gap: tokens.spacing[2],
          }}
        >
          {isOwnProfile ? (
            <>
              <TouchableOpacity onPress={onShare}>
                <View
                  style={{
                    backgroundColor: tokens.color.surface,
                    borderRadius: tokens.radius.md,
                    padding: tokens.spacing[2],
                  }}
                >
                  <Share size={20} color={tokens.color.text} />
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={onSettings}>
                <View
                  style={{
                    backgroundColor: tokens.color.surface,
                    borderRadius: tokens.radius.md,
                    padding: tokens.spacing[2],
                  }}
                >
                  <Settings size={20} color={tokens.color.text} />
                </View>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity>
              <View
                style={{
                  backgroundColor: tokens.color.surface,
                  borderRadius: tokens.radius.md,
                  padding: tokens.spacing[2],
                }}
              >
                <MoreHorizontal size={20} color={tokens.color.text} />
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Profile info */}
      <View style={{ padding: tokens.spacing[4], marginTop: tokens.spacing[6] }}>
        {/* Name and username */}
        <View style={{ marginBottom: tokens.spacing[2] }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing[2] }}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.title,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.color.text,
              }}
            >
              {profile.display_name}
            </Text>
            {profile.is_verified && (
              <View style={{ backgroundColor: tokens.color.accent + '20', borderRadius: 12, padding: 2 }}>
                <Award size={16} color={tokens.color.accent} />
              </View>
            )}
          </View>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.body,
              color: tokens.color.textMuted,
            }}
          >
            @{profile.username}
          </Text>
        </View>

        {/* Bio */}
        {profile.bio && (
          <Text
            style={{
              fontSize: tokens.typography.fontSize.body,
              color: tokens.color.text,
              lineHeight: tokens.typography.lineHeight.body,
              marginBottom: tokens.spacing[3],
            }}
          >
            {profile.bio}
          </Text>
        )}

        {/* Additional info */}
        <View style={{ gap: tokens.spacing[2], marginBottom: tokens.spacing[3] }}>
          {profile.location && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing[2] }}>
              <MapPin size={16} color={tokens.color.textMuted} />
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.body,
                  color: tokens.color.text,
                }}
              >
                {profile.location}
              </Text>
            </View>
          )}

          {profile.website && (
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing[2] }}
              onPress={() => Linking.openURL(profile.website)}
            >
              <Link size={16} color={tokens.color.textMuted} />
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.body,
                  color: tokens.color.accent,
                }}
              >
                {profile.website.replace(/^https?:\/\//, '')}
              </Text>
            </TouchableOpacity>
          )}

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing[2] }}>
            <Calendar size={16} color={tokens.color.textMuted} />
            <Text
              style={{
                fontSize: tokens.typography.fontSize.body,
                color: tokens.color.text,
              }}
            >
              A rejoint GLOUP en {new Date(profile.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </Text>
          </View>
        </View>

        {/* Stats */}
        {stats && (
          <View style={{ flexDirection: 'row', gap: tokens.spacing[6], marginBottom: tokens.spacing[4] }}>
            <TouchableOpacity>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.title,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.color.text,
                }}
              >
                {stats.posts}
              </Text>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.caption,
                  color: tokens.color.textMuted,
                }}
              >
                Posts
              </Text>
            </TouchableOpacity>

            <TouchableOpacity>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.title,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.color.text,
                }}
              >
                {stats.followers}
              </Text>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.caption,
                  color: tokens.color.textMuted,
                }}
              >
                Followers
              </Text>
            </TouchableOpacity>

            <TouchableOpacity>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.title,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.color.text,
                }}
              >
                {stats.following}
              </Text>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.caption,
                  color: tokens.color.textMuted,
                }}
              >
                Following
              </Text>
            </TouchableOpacity>

            <TouchableOpacity>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.title,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.color.accent,
                }}
              >
                {stats.points}
              </Text>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.caption,
                  color: tokens.color.textMuted,
                }}
              >
                Points
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Action buttons */}
        <View style={{ flexDirection: 'row', gap: tokens.spacing[2] }}>
          {isOwnProfile ? (
            <Button
              title="Modifier le profil"
              onPress={onEdit}
              variant="outline"
              style={{ flex: 1 }}
              icon={<Edit size={16} color={tokens.color.accent} />}
            />
          ) : (
            <>
              <Button
                title={isFollowing ? 'Ne plus suivre' : 'Suivre'}
                onPress={isFollowing ? onUnfollow : onFollow}
                variant={isFollowing ? 'outline' : 'primary'}
                style={{ flex: 1 }}
                icon={isFollowing ? <UserMinus size={16} color={tokens.color.accent} /> : <UserPlus size={16} color="#081325" />}
              />
              <Button
                title="Message"
                onPress={() => console.log('Message user')}
                variant="ghost"
                style={{ flex: 1 }}
              />
            </>
          )}
        </View>
      </View>
    </View>
  );
}
```

### 4. Créer le composant EditProfile
Dans `src/components/EditProfile.tsx`:
```typescript
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Avatar } from '../../packages/ui';
import { Button } from '../../packages/ui';
import { Card } from '../../packages/ui';
import { useTheme } from '../../packages/theme';
import { Profile } from '../types/profile';
import { ProfileService } from '../services/profileService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Camera, X, Check, MapPin, Link, Calendar, Shield, Bell } from 'lucide-react-native';

interface EditProfileProps {
  profile: Profile;
  onSuccess?: () => void;
  onClose?: () => void;
}

export function EditProfile({ profile, onSuccess, onClose }: EditProfileProps) {
  const { tokens } = useTheme();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    display_name: profile.display_name,
    username: profile.username,
    bio: profile.bio || '',
    location: profile.location || '',
    website: profile.website || '',
    birth_date: profile.birth_date || '',
    gender: profile.gender,
  });

  const [avatarImage, setAvatarImage] = useState<string | null>(profile.avatar_url || null);
  const [bannerImage, setBannerImage] = useState<string | null>(profile.banner_url || null);

  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(true);
  const [usernameError, setUsernameError] = useState<string | null>(null);

  const updateProfileMutation = useMutation({
    mutationFn: (updates: Partial<Profile>) => ProfileService.updateProfile(profile.id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries(['profile', profile.id]);
      queryClient.invalidateQueries(['userStats', profile.id]);
      onSuccess?.();
      Alert.alert('Succès', 'Votre profil a été mis à jour !');
    },
    onError: (error) => {
      Alert.alert('Erreur', 'Impossible de mettre à jour votre profil.');
    },
  });

  const checkUsernameAvailability = async (username: string) => {
    if (username === profile.username) {
      setUsernameAvailable(true);
      setUsernameError(null);
      return;
    }

    setIsCheckingUsername(true);
    try {
      const { available, error } = await ProfileService.checkUsernameAvailability(username);
      if (error) throw error;

      setUsernameAvailable(available);
      setUsernameError(available ? null : 'Ce nom d\'utilisateur est déjà pris');
    } catch (error) {
      setUsernameError('Erreur lors de la vérification du nom d\'utilisateur');
    } finally {
      setIsCheckingUsername(false);
    }
  };

  const pickImage = async (type: 'avatar' | 'banner') => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === 'avatar' ? [1, 1] : [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        if (type === 'avatar') {
          setAvatarImage(result.assets[0].uri);
        } else {
          setBannerImage(result.assets[0].uri);
        }
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sélectionner l\'image.');
    }
  };

  const handleSave = async () => {
    if (!formData.display_name.trim()) {
      Alert.alert('Erreur', 'Le nom d\'affichage est requis.');
      return;
    }

    if (!formData.username.trim()) {
      Alert.alert('Erreur', 'Le nom d\'utilisateur est requis.');
      return;
    }

    if (!usernameAvailable) {
      Alert.alert('Erreur', 'Le nom d\'utilisateur n\'est pas disponible.');
      return;
    }

    const updates: Partial<Profile> = {
      display_name: formData.display_name.trim(),
      username: formData.username.trim(),
      bio: formData.bio.trim(),
      location: formData.location.trim(),
      website: formData.website.trim(),
      birth_date: formData.birth_date,
      gender: formData.gender,
    };

    // Handle image uploads (would need actual upload logic here)
    if (avatarImage !== profile.avatar_url) {
      updates.avatar_url = avatarImage;
    }

    if (bannerImage !== profile.banner_url) {
      updates.banner_url = bannerImage;
    }

    updateProfileMutation.mutate(updates);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: tokens.color.bg }}
    >
      <ScrollView style={{ flex: 1 }}>
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
            Modifier le profil
          </Text>
          <TouchableOpacity onPress={handleSave} disabled={updateProfileMutation.isLoading}>
            <Text style={{ color: tokens.color.accent, fontSize: tokens.typography.fontSize.body }}>
              {updateProfileMutation.isLoading ? '...' : 'Enregistrer'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Banner selection */}
        <View style={{ position: 'relative' }}>
          {bannerImage ? (
            <Image
              source={{ uri: bannerImage }}
              style={{ width: '100%', height: 200 }}
              contentFit="cover"
            />
          ) : (
            <View
              style={{
                width: '100%',
                height: 200,
                backgroundColor: tokens.color.surface,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Camera size={48} color={tokens.color.textMuted} />
            </View>
          )}
          <TouchableOpacity
            style={{
              position: 'absolute',
              bottom: tokens.spacing[4],
              right: tokens.spacing[4],
              backgroundColor: tokens.color.accent,
              borderRadius: tokens.radius.md,
              padding: tokens.spacing[2],
            }}
            onPress={() => pickImage('banner')}
          >
            <Camera size={20} color="#081325" />
          </TouchableOpacity>
        </View>

        {/* Avatar selection */}
        <View style={{ alignItems: 'center', marginTop: -40, marginBottom: tokens.spacing[4] }}>
          <View style={{ position: 'relative' }}>
            <Avatar
              uri={avatarImage}
              size="xl"
              fallback={formData.display_name}
            />
            <TouchableOpacity
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                backgroundColor: tokens.color.accent,
                borderRadius: tokens.radius.md,
                padding: tokens.spacing[1],
              }}
              onPress={() => pickImage('avatar')}
            >
              <Camera size={16} color="#081325" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Form fields */}
        <View style={{ padding: tokens.spacing[4], gap: tokens.spacing[4] }}>
          {/* Display name */}
          <Card padding="md">
            <Text
              style={{
                fontSize: tokens.typography.fontSize.caption,
                color: tokens.color.textMuted,
                marginBottom: tokens.spacing[2],
              }}
            >
              Nom d'affichage
            </Text>
            <TextInput
              style={{
                fontSize: tokens.typography.fontSize.body,
                color: tokens.color.text,
                padding: tokens.spacing[3],
                backgroundColor: tokens.color.bg,
                borderRadius: tokens.radius.md,
                borderWidth: 1,
                borderColor: tokens.color.line,
              }}
              value={formData.display_name}
              onChangeText={(text) => setFormData({ ...formData, display_name: text })}
              placeholder="Votre nom"
              maxLength={50}
            />
          </Card>

          {/* Username */}
          <Card padding="md">
            <Text
              style={{
                fontSize: tokens.typography.fontSize.caption,
                color: tokens.color.textMuted,
                marginBottom: tokens.spacing[2],
              }}
            >
              Nom d'utilisateur
            </Text>
            <View style={{ position: 'relative' }}>
              <TextInput
                style={{
                  fontSize: tokens.typography.fontSize.body,
                  color: tokens.color.text,
                  padding: tokens.spacing[3],
                  backgroundColor: tokens.color.bg,
                  borderRadius: tokens.radius.md,
                  borderWidth: 1,
                  borderColor: usernameError ? tokens.color.danger : tokens.color.line,
                  paddingRight: tokens.spacing[10],
                }}
                value={formData.username}
                onChangeText={(text) => {
                  setFormData({ ...formData, username: text.toLowerCase().replace(/[^a-z0-9_]/g, '') });
                  if (text.length > 2) {
                    checkUsernameAvailability(text.toLowerCase().replace(/[^a-z0-9_]/g, ''));
                  }
                }}
                placeholder="username"
                maxLength={20}
                autoCapitalize="none"
              />
              {isCheckingUsername && (
                <View style={{ position: 'absolute', right: tokens.spacing[3], top: '50%', transform: [{ translateY: -12 }] }}>
                  <Text style={{ color: tokens.color.textMuted, fontSize: 12 }}>Vérification...</Text>
                </View>
              )}
              {!isCheckingUsername && formData.username !== profile.username && (
                <View style={{ position: 'absolute', right: tokens.spacing[3], top: '50%', transform: [{ translateY: -12 }] }}>
                  {usernameAvailable ? (
                    <Check size={16} color={tokens.color.success} />
                  ) : (
                    <X size={16} color={tokens.color.danger} />
                  )}
                </View>
              )}
            </View>
            {usernameError && (
              <Text style={{ color: tokens.color.danger, fontSize: 12, marginTop: tokens.spacing[1] }}>
                {usernameError}
              </Text>
            )}
            <Text style={{ color: tokens.color.textMuted, fontSize: 12, marginTop: tokens.spacing[1] }}>
              Uniquement lettres, chiffres et underscores
            </Text>
          </Card>

          {/* Bio */}
          <Card padding="md">
            <Text
              style={{
                fontSize: tokens.typography.fontSize.caption,
                color: tokens.color.textMuted,
                marginBottom: tokens.spacing[2],
              }}
            >
              Bio
            </Text>
            <TextInput
              style={{
                fontSize: tokens.typography.fontSize.body,
                color: tokens.color.text,
                minHeight: 100,
                textAlignVertical: 'top',
                padding: tokens.spacing[3],
                backgroundColor: tokens.color.bg,
                borderRadius: tokens.radius.md,
                borderWidth: 1,
                borderColor: tokens.color.line,
              }}
              value={formData.bio}
              onChangeText={(text) => setFormData({ ...formData, bio: text })}
              placeholder="Parlez-nous de vous..."
              multiline
              numberOfLines={4}
              maxLength={160}
            />
            <Text
              style={{
                fontSize: tokens.typography.fontSize.caption,
                color: tokens.color.textMuted,
                textAlign: 'right',
                marginTop: tokens.spacing[1],
              }}
            >
              {formData.bio.length}/160
            </Text>
          </Card>

          {/* Location */}
          <Card padding="md">
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing[2] }}>
              <MapPin size={16} color={tokens.color.textMuted} />
              <TextInput
                style={{
                  flex: 1,
                  fontSize: tokens.typography.fontSize.body,
                  color: tokens.color.text,
                  padding: tokens.spacing[3],
                  backgroundColor: tokens.color.bg,
                  borderRadius: tokens.radius.md,
                  borderWidth: 1,
                  borderColor: tokens.color.line,
                }}
                value={formData.location}
                onChangeText={(text) => setFormData({ ...formData, location: text })}
                placeholder="Ville, Pays"
                maxLength={50}
              />
            </View>
          </Card>

          {/* Website */}
          <Card padding="md">
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing[2] }}>
              <Link size={16} color={tokens.color.textMuted} />
              <TextInput
                style={{
                  flex: 1,
                  fontSize: tokens.typography.fontSize.body,
                  color: tokens.color.text,
                  padding: tokens.spacing[3],
                  backgroundColor: tokens.color.bg,
                  borderRadius: tokens.radius.md,
                  borderWidth: 1,
                  borderColor: tokens.color.line,
                }}
                value={formData.website}
                onChangeText={(text) => setFormData({ ...formData, website: text })}
                placeholder="https://votresite.com"
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>
          </Card>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
```

## Livrables Attendus
1. Service de profil complet avec CRUD
2. Composant ProfileHeader avec stats
3. Composant EditProfile avec validation
4. Système de badges et achievements
5. Options de personnalisation
6. Gestion des followers/following
7. Types TypeScript stricts

## Contraintes
- Validation en temps réel du username
- Limiter les champs de texte appropriée
- Gérer les images avatar/banner
- Supporter les options de personnalisation payantes
- Optimiser les performances
- Respecter le design GLOUP

## Validation
- Profil s'affiche correctement
- Édition fonctionne
- Stats se mettent à jour
- Badges s'affichent
- Personnalisation s'applique
- Followers/following fonctionnent
- Performance bonne
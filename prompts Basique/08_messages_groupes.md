# GLOUP - Phase 8: Messages et Groupes

## Contexte
Ce prompt guide l'implémentation complète du système de messagerie et de groupes pour GLOUP, incluant les conversations privées, les groupes thématiques et les fonctionnalités de chat en temps réel.

## Rôle
Tu es un expert en messagerie instantanée et communication en groupe. Tu dois créer un système de chat robuste avec des fonctionnalités sociales avancées.

## Objectifs
1. Créer le système de conversations privées
2. Implémenter les groupes thématiques
3. Développer le chat en temps réel
4. Gérer les médias et pièces jointes
5. Créer les fonctionnalités de modération

## Stack Technique
- Supabase Realtime (WebSockets)
- React Query (state management)
- Expo Router (navigation)
- Expo Image Picker (médias)
- Expo Document Picker (fichiers)
- Reanimated 3 (animations)

## Instructions Détaillées

### 1. Créer les types de messagerie
Dans `src/types/messaging.ts`:
```typescript
export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender: {
    id: string;
    username: string;
    display_name: string;
    avatar_url?: string;
  };
  body: string;
  media: MessageMedia[];
  created_at: string;
  updated_at: string;
  is_edited: boolean;
  reactions: MessageReaction[];
  reply_to?: Message;
}

export interface MessageMedia {
  type: 'image' | 'video' | 'audio' | 'document' | 'gif';
  url: string;
  file_name?: string;
  file_size?: number;
  duration?: number; // For audio/video
  thumbnail_url?: string;
  width?: number;
  height?: number;
}

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  user: {
    username: string;
    display_name: string;
    avatar_url?: string;
  };
  emoji: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  type: 'dm' | 'group';
  name?: string;
  description?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  last_message?: Message;
  unread_count: number;
  is_pinned: boolean;
  is_muted: boolean;
  members: ConversationMember[];
  settings?: ConversationSettings;
}

export interface ConversationMember {
  conversation_id: string;
  user_id: string;
  user: {
    id: string;
    username: string;
    display_name: string;
    avatar_url?: string;
  };
  role: 'admin' | 'moderator' | 'member';
  joined_at: string;
  last_read_at?: string;
  is_online: boolean;
}

export interface ConversationSettings {
  who_can_send_messages: 'everyone' | 'admins' | 'moderators';
  who_can_add_members: 'everyone' | 'admins' | 'moderators';
  who_can_edit_info: 'admins' | 'moderators';
  require_approval_to_join: boolean;
  max_members?: number;
  is_private: boolean;
}

export interface CreateConversationData {
  type: 'dm' | 'group';
  name?: string;
  description?: string;
  participant_ids: string[];
  is_private?: boolean;
}

export interface CreateGroupData {
  name: string;
  description?: string;
  avatar_url?: string;
  is_private: boolean;
  max_members?: number;
  require_approval_to_join: boolean;
}

export interface TypingIndicator {
  conversation_id: string;
  user_id: string;
  user: {
    username: string;
    display_name: string;
  };
  started_at: string;
}
```

### 2. Créer le service de messagerie
Dans `src/services/messagingService.ts`:
```typescript
import { supabase } from './supabase';
import { RealtimeChannel } from '@supabase/supabase-js';
import {
  Message,
  Conversation,
  CreateConversationData,
  CreateGroupData,
  MessageMedia,
  TypingIndicator
} from '../types/messaging';

export class MessagingService {
  private static channel: RealtimeChannel | null = null;

  // Conversations
  static async getConversations(): Promise<{ conversations: Conversation[]; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('conversations_with_details')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      return { conversations: data as Conversation[], error: null };
    } catch (error) {
      return { conversations: [], error: error as Error };
    }
  }

  static async getConversationById(id: string): Promise<{ conversation: Conversation | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('conversations_with_details')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return { conversation: data as Conversation, error: null };
    } catch (error) {
      return { conversation: null, error: error as Error };
    }
  }

  static async createConversation(data: CreateConversationData): Promise<{ conversation: Conversation | null; error: Error | null }> {
    try {
      if (data.type === 'dm' && data.participant_ids.length !== 1) {
        throw new Error('DM conversations must have exactly one participant');
      }

      // Check if DM already exists
      if (data.type === 'dm') {
        const { data: existing } = await supabase
          .from('conversations')
          .select('id')
          .eq('type', 'dm')
          .contains('members', [data.participant_ids[0]]);

        if (existing && existing.length > 0) {
          return { conversation: existing[0] as Conversation, error: null };
        }
      }

      const { data: conversation, error } = await supabase
        .from('conversations')
        .insert([{
          type: data.type,
          name: data.name,
          description: data.description,
        }])
        .select()
        .single();

      if (error) throw error;

      // Add members
      const members = data.participant_ids.map(userId => ({
        conversation_id: conversation.id,
        user_id: userId,
        role: userId === data.participant_ids[0] ? 'admin' : 'member',
      }));

      await supabase.from('conversation_members').insert(members);

      return { conversation: conversation as Conversation, error: null };
    } catch (error) {
      return { conversation: null, error: error as Error };
    }
  }

  static async updateConversation(id: string, updates: Partial<Conversation>): Promise<{ conversation: Conversation | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return { conversation: data as Conversation, error: null };
    } catch (error) {
      return { conversation: null, error: error as Error };
    }
  }

  static async deleteConversation(id: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  // Messages
  static async getMessages(conversationId: string, limit = 50, offset = 0): Promise<{ messages: Message[]; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('messages_with_details')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return { messages: (data as Message[]).reverse(), error: null };
    } catch (error) {
      return { messages: [], error: error as Error };
    }
  }

  static async sendMessage(conversationId: string, content: string, media: MessageMedia[] = [], replyTo?: string): Promise<{ message: Message | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([{
          conversation_id: conversationId,
          body: content,
          media,
          reply_to: replyTo,
        }])
        .select(`
          *,
          sender:sender_id (
            id,
            username,
            display_name,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      // Update conversation last_message
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      return { message: data as Message, error: null };
    } catch (error) {
      return { message: null, error: error as Error };
    }
  }

  static async updateMessage(id: string, content: string): Promise<{ message: Message | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .update({
          body: content,
          is_edited: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return { message: data as Message, error: null };
    } catch (error) {
      return { message: null, error: error as Error };
    }
  }

  static async deleteMessage(id: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  // Members
  static async addMember(conversationId: string, userId: string, role: 'admin' | 'moderator' | 'member' = 'member'): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('conversation_members')
        .insert([{
          conversation_id: conversationId,
          user_id: userId,
          role,
        }]);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  static async removeMember(conversationId: string, userId: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('conversation_members')
        .delete()
        .eq('conversation_id', conversationId)
        .eq('user_id', userId);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  static async updateMemberRole(conversationId: string, userId: string, role: 'admin' | 'moderator' | 'member'): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('conversation_members')
        .update({ role })
        .eq('conversation_id', conversationId)
        .eq('user_id', userId);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  // Realtime
  static setupRealtime(conversationId: string, callbacks: {
    onMessage?: (message: Message) => void;
    onTyping?: (typing: TypingIndicator) => void;
    onMemberJoin?: (member: ConversationMember) => void;
    onMemberLeave?: (member: ConversationMember) => void;
  }) {
    this.channel = supabase
      .channel(`conversation:${conversationId}`)
      .on('broadcast', { event: 'message' }, (payload) => {
        callbacks.onMessage?.(payload.payload.message);
      })
      .on('broadcast', { event: 'typing' }, (payload) => {
        callbacks.onTyping?.(payload.payload.typing);
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'conversation_members',
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        callbacks.onMemberJoin?.(payload.new as ConversationMember);
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'conversation_members',
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        callbacks.onMemberLeave?.(payload.old as ConversationMember);
      })
      .subscribe();

    return this.channel;
  }

  static async sendTypingIndicator(conversationId: string, isTyping: boolean) {
    if (!this.channel) return;

    await this.channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        typing: {
          conversation_id: conversationId,
          user_id: supabase.auth.user()?.id,
          started_at: new Date().toISOString(),
        },
      },
    });
  }

  static cleanupRealtime() {
    if (this.channel) {
      supabase.removeChannel(this.channel);
      this.channel = null;
    }
  }

  // Groups
  static async createGroup(data: CreateGroupData): Promise<{ conversation: Conversation | null; error: Error | null }> {
    try {
      const { data: conversation, error } = await supabase
        .from('conversations')
        .insert([{
          type: 'group',
          name: data.name,
          description: data.description,
          avatar_url: data.avatar_url,
          settings: {
            who_can_send_messages: 'everyone',
            who_can_add_members: 'everyone',
            who_can_edit_info: 'admins',
            require_approval_to_join: data.require_approval_to_join,
            max_members: data.max_members,
            is_private: data.is_private,
          },
        }])
        .select()
        .single();

      if (error) throw error;

      // Add creator as admin
      await supabase.from('conversation_members').insert([{
        conversation_id: conversation.id,
        user_id: supabase.auth.user()?.id,
        role: 'admin',
      }]);

      return { conversation: conversation as Conversation, error: null };
    } catch (error) {
      return { conversation: null, error: error as Error };
    }
  }

  static async joinGroup(conversationId: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('conversation_members')
        .insert([{
          conversation_id: conversationId,
          user_id: supabase.auth.user()?.id,
          role: 'member',
        }]);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  static async leaveGroup(conversationId: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('conversation_members')
        .delete()
        .eq('conversation_id', conversationId)
        .eq('user_id', supabase.auth.user()?.id);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }
}
```

### 3. Créer le composant ConversationList
Dans `src/components/ConversationList.tsx`:
```typescript
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, RefreshControl, FlatList } from 'react-native';
import { Image } from 'expo-image';
import { useQuery } from '@tanstack/react-query';
import { Avatar } from '../../packages/ui';
import { useTheme } from '../../packages/theme';
import { MessagingService } from '../services/messagingService';
import { Conversation } from '../types/messaging';
import { formatRelativeTime } from '../utils/date';
import { router } from 'expo-router';
import {
  Search,
  Plus,
  Pin,
  BellOff,
  MoreHorizontal,
  Users,
  MessageCircle
} from 'lucide-react-native';

interface ConversationListProps {
  onNewConversation?: () => void;
}

export function ConversationList({ onNewConversation }: ConversationListProps) {
  const { tokens } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: conversations, isLoading, refetch } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => MessagingService.getConversations(),
    staleTime: 30 * 1000, // 30 seconds
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleConversationPress = (conversationId: string) => {
    router.push(`/messages/${conversationId}`);
  };

  const filteredConversations = conversations?.filter(conv => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return (
      conv.name?.toLowerCase().includes(query) ||
      conv.description?.toLowerCase().includes(query) ||
      conv.members.some(member =>
        member.user.display_name.toLowerCase().includes(query) ||
        member.user.username.toLowerCase().includes(query)
      )
    );
  }) || [];

  const renderConversation = ({ item }: { item: Conversation }) => {
    const isGroup = item.type === 'group';
    const otherMembers = item.members.filter(m => m.user_id !== supabase.auth.user()?.id);
    const displayName = isGroup ? item.name : otherMembers[0]?.user.display_name || 'Inconnu';
    const avatarUrl = isGroup ? item.avatar_url : otherMembers[0]?.user.avatar_url;

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
        onPress={() => handleConversationPress(item.id)}
      >
        <View style={{ position: 'relative' }}>
          <Avatar uri={avatarUrl} size="md" fallback={displayName} />
          {isGroup && (
            <View
              style={{
                position: 'absolute',
                bottom: -2,
                right: -2,
                backgroundColor: tokens.color.accent,
                borderRadius: 10,
                padding: 2,
              }}
            >
              <Users size={12} color="white" />
            </View>
          )}
        </View>

        <View style={{ flex: 1, marginLeft: tokens.spacing[3] }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing[1] }}>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.body,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.color.text,
                }}
                numberOfLines={1}
              >
                {displayName}
              </Text>
              {item.is_pinned && <Pin size={14} color={tokens.color.accent} />}
              {item.is_muted && <BellOff size={14} color={tokens.color.textMuted} />}
            </View>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.caption,
                color: tokens.color.textMuted,
              }}
            >
              {item.last_message ? formatRelativeTime(item.last_message.created_at) : ''}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: tokens.spacing[1] }}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.caption,
                color: tokens.color.textMuted,
                flex: 1,
              }}
              numberOfLines={1}
            >
              {item.last_message ? (
                <>
                  <Text style={{ fontWeight: '500' }}>
                    {item.last_message.sender.display_name}:{' '}
                  </Text>
                  {item.last_message.body}
                </>
              ) : (
                isGroup ? 'Démarrez la conversation' : 'Dites bonjour !'
              )}
            </Text>

            {item.unread_count > 0 && (
              <View
                style={{
                  backgroundColor: tokens.color.accent,
                  borderRadius: 10,
                  minWidth: 20,
                  height: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: 4,
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    color: 'white',
                    fontWeight: '600',
                  }}
                >
                  {item.unread_count > 99 ? '99+' : item.unread_count}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: tokens.color.textMuted }}>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: tokens.color.bg }}>
      {/* Header */}
      <View style={{
        backgroundColor: tokens.color.surface,
        borderBottomWidth: 1,
        borderBottomColor: tokens.color.line,
        padding: tokens.spacing[4],
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[3] }}>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.title,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.color.text,
            }}
          >
            Messages
          </Text>
          <TouchableOpacity onPress={onNewConversation}>
            <Plus size={24} color={tokens.color.accent} />
          </TouchableOpacity>
        </View>

        {/* Search */}
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
            placeholder="Rechercher une conversation..."
            placeholderTextColor={tokens.color.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Conversation list */}
      <FlatList
        data={filteredConversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={tokens.color.accent}
          />
        }
        ListEmptyComponent={
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: tokens.spacing[4] }}>
            <MessageCircle size={48} color={tokens.color.textMuted} />
            <Text
              style={{
                fontSize: tokens.typography.fontSize.title,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.color.text,
                marginTop: tokens.spacing[3],
                textAlign: 'center',
              }}
            >
              Aucune conversation
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
              Commencez une conversation avec d'autres utilisateurs
            </Text>
          </View>
        }
      />
    </View>
  );
}
```

### 4. Créer le composant ChatScreen
Dans `src/components/ChatScreen.tsx`:
```typescript
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, FlatList } from 'react-native';
import { Image } from 'expo-image';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Avatar } from '../../packages/ui';
import { Button } from '../../packages/ui';
import { Card } from '../../packages/ui';
import { useTheme } from '../../packages/theme';
import { MessagingService } from '../services/messagingService';
import { Message, Conversation, MessageMedia } from '../types/messaging';
import { useAuth } from '../contexts/AuthContext';
import { formatRelativeTime } from '../utils/date';
import {
  Send,
  Paperclip,
  Smile,
  MoreHorizontal,
  Phone,
  Video,
  Info,
  ArrowLeft
} from 'lucide-react-native';

interface ChatScreenProps {
  conversationId: string;
  onBack?: () => void;
}

export function ChatScreen({ conversationId, onBack }: ChatScreenProps) {
  const { tokens } = useTheme();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const flatListRef = useRef<FlatList>(null);

  const { data: conversation, isLoading: conversationLoading } = useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: () => MessagingService.getConversationById(conversationId),
    enabled: !!conversationId,
  });

  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => MessagingService.getMessages(conversationId, 50),
    enabled: !!conversationId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: (content: string) => MessagingService.sendMessage(conversationId, content),
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries(['messages', conversationId]);
      queryClient.invalidateQueries(['conversations']);
    },
  });

  // Setup realtime
  useEffect(() => {
    if (!conversationId) return;

    const channel = MessagingService.setupRealtime(conversationId, {
      onMessage: (newMessage) => {
        queryClient.setQueryData(['messages', conversationId], (old: Message[] | undefined) => {
          return old ? [...old, newMessage] : [newMessage];
        });
      },
      onTyping: (typing) => {
        if (typing.user_id !== user?.id) {
          setTypingUsers(prev => {
            const newUsers = prev.filter(u => u !== typing.user_id);
            return [...newUsers, typing.user_id];
          });

          // Clear typing indicator after 3 seconds
          setTimeout(() => {
            setTypingUsers(prev => prev.filter(u => u !== typing.user_id));
          }, 3000);
        }
      },
    });

    return () => {
      MessagingService.cleanupRealtime();
    };
  }, [conversationId, user?.id]);

  // Handle typing indicator
  const handleMessageChange = (text: string) => {
    setMessage(text);

    if (text.length > 0 && !isTyping) {
      setIsTyping(true);
      MessagingService.sendTypingIndicator(conversationId, true);
    } else if (text.length === 0 && isTyping) {
      setIsTyping(false);
      MessagingService.sendTypingIndicator(conversationId, false);
    }
  };

  const handleSend = () => {
    if (message.trim()) {
      sendMessageMutation.mutate(message.trim());
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwnMessage = item.sender_id === user?.id;
    const showAvatar = !isOwnMessage && (messages?.indexOf(item) === messages.length - 1 ||
      messages?.[messages.indexOf(item) + 1]?.sender_id !== item.sender_id);

    return (
      <View
        style={{
          flexDirection: isOwnMessage ? 'row-reverse' : 'row',
          marginBottom: tokens.spacing[2],
          paddingHorizontal: tokens.spacing[4],
        }}
      >
        {!isOwnMessage && showAvatar && (
          <Avatar
            uri={item.sender.avatar_url}
            size="sm"
            fallback={item.sender.display_name}
            style={{ marginRight: tokens.spacing[2] }}
          />
        )}

        <View
          style={{
            maxWidth: '70%',
            backgroundColor: isOwnMessage ? tokens.color.accent : tokens.color.surface,
            borderRadius: tokens.radius.md,
            padding: tokens.spacing[3],
            ...(!isOwnMessage && { marginLeft: !showAvatar ? 34 : 0 }),
          }}
        >
          {!isOwnMessage && !showAvatar && (
            <Text
              style={{
                fontSize: tokens.typography.fontSize.caption,
                color: tokens.color.textMuted,
                marginBottom: tokens.spacing[1],
              }}
            >
              {item.sender.display_name}
            </Text>
          )}

          <Text
            style={{
              fontSize: tokens.typography.fontSize.body,
              color: isOwnMessage ? '#081325' : tokens.color.text,
              lineHeight: tokens.typography.lineHeight.body,
            }}
          >
            {item.body}
          </Text>

          {/* Media attachments */}
          {item.media && item.media.length > 0 && (
            <View style={{ marginTop: tokens.spacing[2], gap: tokens.spacing[2] }}>
              {item.media.map((media, index) => (
                <View key={index}>
                  {media.type === 'image' && (
                    <Image
                      source={{ uri: media.url }}
                      style={{
                        width: '100%',
                        height: 200,
                        borderRadius: tokens.radius.sm,
                      }}
                      contentFit="cover"
                    />
                  )}
                  {media.type === 'video' && (
                    <View
                      style={{
                        width: '100%',
                        height: 200,
                        borderRadius: tokens.radius.sm,
                        backgroundColor: tokens.color.bg,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Video size={32} color={tokens.color.textMuted} />
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Timestamp */}
          <Text
            style={{
              fontSize: tokens.typography.fontSize.caption,
              color: isOwnMessage ? 'rgba(255,255,255,0.7)' : tokens.color.textMuted,
              marginTop: tokens.spacing[1],
              alignSelf: isOwnMessage ? 'flex-end' : 'flex-start',
            }}
          >
            {formatRelativeTime(item.created_at)}
            {item.is_edited && ' • Modifié'}
          </Text>
        </View>
      </View>
    );
  };

  if (conversationLoading || messagesLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: tokens.color.textMuted }}>Chargement...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: tokens.color.bg }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: tokens.color.surface,
          borderBottomWidth: 1,
          borderBottomColor: tokens.color.line,
          padding: tokens.spacing[4],
        }}
      >
        {onBack && (
          <TouchableOpacity onPress={onBack} style={{ marginRight: tokens.spacing[3] }}>
            <ArrowLeft size={24} color={tokens.color.text} />
          </TouchableOpacity>
        )}

        <Avatar
          uri={conversation?.avatar_url}
          size="md"
          fallback={conversation?.name || conversation?.members[0]?.user.display_name || 'G'}
        />

        <View style={{ flex: 1, marginLeft: tokens.spacing[3] }}>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.body,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.color.text,
            }}
          >
            {conversation?.name || conversation?.members[0]?.user.display_name || 'Conversation'}
          </Text>
          {typingUsers.length > 0 && (
            <Text
              style={{
                fontSize: tokens.typography.fontSize.caption,
                color: tokens.color.accent,
              }}
            >
              {typingUsers.length === 1 ? 'Quelquun écrit...' : `${typingUsers.length} personnes écrivent...`}
            </Text>
          )}
        </View>

        <View style={{ flexDirection: 'row', gap: tokens.spacing[3] }}>
          <TouchableOpacity>
            <Phone size={20} color={tokens.color.accent} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Video size={20} color={tokens.color.accent} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Info size={20} color={tokens.color.accent} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ flexGrow: 1, paddingVertical: tokens.spacing[2] }}
        onContentSizeChange={() => {
          if (messages && messages.length > 0) {
            flatListRef.current?.scrollToEnd({ animated: true });
          }
        }}
        ListEmptyComponent={
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: tokens.color.textMuted }}>
              Aucun message. Commencez la conversation !
            </Text>
          </View>
        }
      />

      {/* Input area */}
      <View
        style={{
          backgroundColor: tokens.color.surface,
          borderTopWidth: 1,
          borderTopColor: tokens.color.line,
          padding: tokens.spacing[3],
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: tokens.color.bg,
            borderRadius: tokens.radius.md,
            paddingHorizontal: tokens.spacing[3],
            paddingVertical: tokens.spacing[2],
          }}
        >
          <TouchableOpacity style={{ marginRight: tokens.spacing[2] }}>
            <Paperclip size={20} color={tokens.color.accent} />
          </TouchableOpacity>

          <TextInput
            style={{
              flex: 1,
              fontSize: tokens.typography.fontSize.body,
              color: tokens.color.text,
              maxHeight: 100,
            }}
            placeholder="Écrire un message..."
            placeholderTextColor={tokens.color.textMuted}
            value={message}
            onChangeText={handleMessageChange}
            multiline
          />

          <TouchableOpacity style={{ marginLeft: tokens.spacing[2] }}>
            <Smile size={20} color={tokens.color.accent} />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              marginLeft: tokens.spacing[2],
              backgroundColor: tokens.color.accent,
              borderRadius: tokens.radius.sm,
              padding: tokens.spacing[2],
            }}
            onPress={handleSend}
            disabled={sendMessageMutation.isLoading || !message.trim()}
          >
            <Send size={20} color="#081325" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
```

## Livrables Attendus
1. Service de messagerie complet avec Realtime
2. Composant ConversationList avec recherche
3. Composant ChatScreen avec messages temps réel
4. Système de groupes avec permissions
5. Gestion des médias et pièces jointes
6. Indicateurs de frappe
7. Types TypeScript stricts

## Contraintes
- Utiliser Supabase Realtime pour le chat
- Supporter jusqu'à 1000 messages par conversation
- Gérer les permissions de groupe
- Optimiser les performances sur longues conversations
- Supporter les images, vidéos et documents
- Gérer les états hors ligne

## Validation
- Messages s'envoient en temps réel
- Indicateurs de frappe fonctionnent
- Groupes se créent correctement
- Permissions s'appliquent
- Médias s'affichent
- Performance bonne
- Pas de fuites mémoire
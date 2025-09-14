# GLOUP - Phase 4: Authentification et Onboarding

## Contexte
Ce prompt guide l'implémentation complète du système d'authentification et de l'onboarding pour GLOUP en utilisant Supabase Auth.

## Rôle
Tu es un expert en authentification et expérience utilisateur. Tu dois créer un flux d'authentification fluide et un onboarding engageant.

## Objectifs
1. Implémenter l'authentification avec magic link
2. Créer les écrans d'authentification
3. Développer le flux d'onboarding
4. Gérer les sessions utilisateur
5. Créer les hooks et services d'auth

## Stack Technique
- Supabase Auth (magic link)
- Expo Router (navigation)
- React Query (state management)
- TypeScript (types stricts)
- NativeWind (styles)

## Instructions Détaillées

### 1. Créer les types d'authentification
Dans `src/types/auth.ts`:
```typescript
export interface User {
  id: string;
  email?: string;
  username: string;
  display_name: string;
  bio?: string;
  avatar_url?: string;
  banner_url?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
}

export interface RegisterData {
  email: string;
  username: string;
  display_name: string;
}

export interface OnboardingData {
  interests: string[];
  bio?: string;
  profile_image?: string;
}
```

### 2. Créer le service d'authentification
Dans `src/services/auth.ts`:
```typescript
import { createClient } from '@supabase/supabase-js';
import { User, Session, LoginCredentials, RegisterData } from '../types/auth';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export class AuthService {
  static async signInWithEmail(credentials: LoginCredentials): Promise<{ session: Session | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email: credentials.email,
        options: {
          emailRedirectTo: 'gloup://auth/callback',
        },
      });

      if (error) throw error;

      return { session: data.session, error: null };
    } catch (error) {
      return { session: null, error: error as Error };
    }
  }

  static async signUpWithEmail(data: RegisterData): Promise<{ user: User | null; error: Error | null }> {
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: Math.random().toString(36).slice(-8), // Random password for magic link
        options: {
          data: {
            username: data.username,
            display_name: data.display_name,
          },
          emailRedirectTo: 'gloup://auth/callback',
        },
      });

      if (error) throw error;

      return { user: authData.user as User, error: null };
    } catch (error) {
      return { user: null, error: error as Error };
    }
  }

  static async signOut(): Promise<void> {
    await supabase.auth.signOut();
  }

  static async getSession(): Promise<Session | null> {
    const { data: { session }, error } = await supabase.auth.getSession();
    return session as Session;
  }

  static async getCurrentUser(): Promise<User | null> {
    const { data: { user }, error } = await supabase.auth.getUser();
    return user as User;
  }

  static async updateUserProfile(updates: Partial<User>): Promise<{ user: User | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', (await this.getCurrentUser())?.id)
        .select()
        .single();

      if (error) throw error;

      return { user: data, error: null };
    } catch (error) {
      return { user: null, error: error as Error };
    }
  }

  static onAuthStateChange(callback: (session: Session | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        callback(session as Session);
      } else if (event === 'SIGNED_OUT') {
        callback(null);
      }
    });
  }
}
```

### 3. Créer le context d'authentification
Dans `src/contexts/AuthContext.tsx`:
```typescript
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthService } from '../services/auth';
import { AuthState, User, Session } from '../types/auth';

interface AuthContextType extends AuthState {
  signIn: (credentials: { email: string }) => Promise<void>;
  signUp: (data: { email: string; username: string; display_name: string }) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    // Check for existing session on app start
    const checkSession = async () => {
      try {
        const session = await AuthService.getSession();
        const user = await AuthService.getCurrentUser();

        setState({
          user,
          session,
          isLoading: false,
          isAuthenticated: !!session,
        });
      } catch (error) {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = AuthService.onAuthStateChange(async (session) => {
      const user = session ? await AuthService.getCurrentUser() : null;

      setState({
        user,
        session,
        isLoading: false,
        isAuthenticated: !!session,
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (credentials: { email: string }) => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const { error } = await AuthService.signInWithEmail(credentials);

      if (error) {
        throw error;
      }

      // Magic link sent successfully
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const signUp = async (data: { email: string; username: string; display_name: string }) => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const { error } = await AuthService.signUpWithEmail(data);

      if (error) {
        throw error;
      }

      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const signOut = async () => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      await AuthService.signOut();
      setState({
        user: null,
        session: null,
        isLoading: false,
        isAuthenticated: false,
      });
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    try {
      const { user: updatedUser, error } = await AuthService.updateUserProfile(updates);

      if (error) {
        throw error;
      }

      setState(prev => ({
        ...prev,
        user: updatedUser || prev.user,
      }));
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn,
        signUp,
        signOut,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

### 4. Créer les écrans d'authentification
Dans `src/screens/auth/WelcomeScreen.tsx`:
```typescript
import React from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation } from 'expo-router';
import { Button, Card } from '../../../packages/ui';
import { useTheme } from '../../../packages/theme';

export default function WelcomeScreen() {
  const navigation = useNavigation();
  const { tokens } = useTheme();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: tokens.color.bg }}
    >
      <ScrollView contentContainerStyle={{ flex: 1, justifyContent: 'center' }}>
        <View style={{ padding: tokens.spacing[4], gap: tokens.spacing[6] }}>
          {/* Logo et titre */}
          <View style={{ alignItems: 'center', gap: tokens.spacing[4] }}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 20,
                backgroundColor: tokens.color.accent,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 40, color: '#081325' }}>G</Text>
            </View>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.title,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.color.text,
                textAlign: 'center',
              }}
            >
              Bienvenue sur GLOUP
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.body,
                color: tokens.color.textMuted,
                textAlign: 'center',
                lineHeight: tokens.typography.lineHeight.body,
              }}
            >
              Le réseau social bienveillant où chaque interaction compte
            </Text>
          </View>

          {/* Actions */}
          <View style={{ gap: tokens.spacing[3] }}>
            <Button
              title="S'inscrire"
              onPress={() => navigation.navigate('auth/register')}
              variant="primary"
            />
            <Button
              title="Se connecter"
              onPress={() => navigation.navigate('auth/login')}
              variant="outline"
            />
          </View>

          {/* Texte légal */}
          <Text
            style={{
              fontSize: tokens.typography.fontSize.caption,
              color: tokens.color.textMuted,
              textAlign: 'center',
              lineHeight: tokens.typography.lineHeight.caption,
            }}
          >
            En continuant, vous acceptez nos Conditions d'utilisation et notre Politique de confidentialité
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
```

Dans `src/screens/auth/LoginScreen.tsx`:
```typescript
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from 'expo-router';
import { Button, Card } from '../../../packages/ui';
import { useTheme } from '../../../packages/theme';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginScreen() {
  const navigation = useNavigation();
  const { tokens } = useTheme();
  const { signIn, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email) {
      Alert.alert('Erreur', 'Veuillez entrer votre adresse email');
      return;
    }

    setIsSubmitting(true);

    try {
      await signIn({ email });
      Alert.alert(
        'Lien envoyé !',
        'Veuillez vérifier votre boîte mail et cliquer sur le lien de connexion.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: tokens.color.bg }}>
      <View style={{ padding: tokens.spacing[4], gap: tokens.spacing[6], marginTop: tokens.spacing[8] }}>
        <View>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.title,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.color.text,
              marginBottom: tokens.spacing[2],
            }}
          >
            Connexion
          </Text>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.body,
              color: tokens.color.textMuted,
              lineHeight: tokens.typography.lineHeight.body,
            }}
          >
            Entrez votre adresse email pour recevoir un lien de connexion sécurisé
          </Text>
        </View>

        <Card padding="md">
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
            placeholder="votre@email.com"
            placeholderTextColor={tokens.color.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
        </Card>

        <Button
          title="Envoyer le lien de connexion"
          onPress={handleLogin}
          disabled={isSubmitting || !email}
          variant="primary"
        />

        {(isSubmitting || isLoading) && (
          <View style={{ alignItems: 'center' }}>
            <ActivityIndicator size="large" color={tokens.color.accent} />
          </View>
        )}

        <View style={{ alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.navigate('auth/register')}>
            <Text style={{ color: tokens.color.accent, fontSize: tokens.typography.fontSize.body }}>
              Pas encore de compte ? S'inscrire
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
```

Dans `src/screens/auth/RegisterScreen.tsx`:
```typescript
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from 'expo-router';
import { Button, Card } from '../../../packages/ui';
import { useTheme } from '../../../packages/theme';
import { useAuth } from '../../contexts/AuthContext';

export default function RegisterScreen() {
  const navigation = useNavigation();
  const { tokens } = useTheme();
  const { signUp, isLoading } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    username: '',
    display_name: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async () => {
    if (!formData.email || !formData.username || !formData.display_name) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setIsSubmitting(true);

    try {
      await signUp(formData);
      Alert.alert(
        'Inscription réussie !',
        'Veuillez vérifier votre boîte mail et cliquer sur le lien pour confirmer votre compte.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: tokens.color.bg }}>
      <View style={{ padding: tokens.spacing[4], gap: tokens.spacing[6], marginTop: tokens.spacing[8] }}>
        <View>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.title,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.color.text,
              marginBottom: tokens.spacing[2],
            }}
          >
            Inscription
          </Text>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.body,
              color: tokens.color.textMuted,
              lineHeight: tokens.typography.lineHeight.body,
            }}
          >
            Créez votre compte pour rejoindre la communauté GLOUP
          </Text>
        </View>

        <Card padding="md" style={{ gap: tokens.spacing[3] }}>
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
            placeholder="Adresse email"
            placeholderTextColor={tokens.color.textMuted}
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

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
            placeholder="Nom d'utilisateur"
            placeholderTextColor={tokens.color.textMuted}
            value={formData.username}
            onChangeText={(text) => setFormData({ ...formData, username: text })}
            autoCapitalize="none"
            autoComplete="username"
          />

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
            placeholder="Nom d'affichage"
            placeholderTextColor={tokens.color.textMuted}
            value={formData.display_name}
            onChangeText={(text) => setFormData({ ...formData, display_name: text })}
            autoCapitalize="words"
          />
        </Card>

        <Button
          title="Créer mon compte"
          onPress={handleRegister}
          disabled={isSubmitting || !formData.email || !formData.username || !formData.display_name}
          variant="primary"
        />

        {(isSubmitting || isLoading) && (
          <View style={{ alignItems: 'center' }}>
            <ActivityIndicator size="large" color={tokens.color.accent} />
          </View>
        )}

        <View style={{ alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.navigate('auth/login')}>
            <Text style={{ color: tokens.color.accent, fontSize: tokens.typography.fontSize.body }}>
              Déjà un compte ? Se connecter
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
```

### 5. Créer l'écran d'onboarding
Dans `src/screens/onboarding/OnboardingScreen.tsx`:
```typescript
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
import { Button, Card, ReactionChip } from '../../../packages/ui';
import { useTheme } from '../../../packages/theme';
import { useAuth } from '../../contexts/AuthContext';

const INTERESTS = [
  { id: 'fitness', label: 'Fitness', emoji: '💪' },
  { id: 'style', label: 'Style', emoji: '👗' },
  { id: 'wellbeing', label: 'Bien-être', emoji: '😊' },
  { id: 'confidence', label: 'Confiance', emoji: '😎' },
  { id: 'care', label: 'Soins', emoji: '🧼' },
  { id: 'nutrition', label: 'Nutrition', emoji: '🥗' },
  { id: 'meditation', label: 'Méditation', emoji: '🧘' },
  { id: 'fashion', label: 'Mode', emoji: '👠' },
];

export default function OnboardingScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const { tokens } = useTheme();
  const { updateUser, user } = useAuth();

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInterestToggle = (interestId: string) => {
    setSelectedInterests(prev =>
      prev.includes(interestId)
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId]
    );
  };

  const handleComplete = async () => {
    if (selectedInterests.length === 0) {
      Alert.alert('Erreur', 'Veuillez sélectionner au moins un centre d\'intérêt');
      return;
    }

    setIsSubmitting(true);

    try {
      await updateUser({
        bio,
        // Store interests in metadata or a separate table
      });

      // Navigate to main app
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <View style={{ gap: tokens.spacing[6] }}>
            <View style={{ alignItems: 'center', gap: tokens.spacing[4] }}>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.title,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.color.text,
                  textAlign: 'center',
                }}
              >
                Quels sont vos centres d'intérêt ?
              </Text>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.body,
                  color: tokens.color.textMuted,
                  textAlign: 'center',
                  lineHeight: tokens.typography.lineHeight.body,
                }}
              >
                Sélectionnez au moins 3 centres d'intérêt pour personnaliser votre expérience
              </Text>
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: tokens.spacing[2] }}>
              {INTERESTS.map((interest) => (
                <TouchableOpacity
                  key={interest.id}
                  onPress={() => handleInterestToggle(interest.id)}
                  style={{
                    padding: tokens.spacing[2],
                    borderRadius: tokens.radius.md,
                    backgroundColor: selectedInterests.includes(interest.id)
                      ? tokens.color.accent + '20'
                      : tokens.color.surface,
                    borderWidth: selectedInterests.includes(interest.id) ? 1 : 0,
                    borderColor: tokens.color.accent,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: tokens.spacing[1],
                  }}
                >
                  <Text style={{ fontSize: 16 }}>{interest.emoji}</Text>
                  <Text style={{
                    color: selectedInterests.includes(interest.id)
                      ? tokens.color.accent
                      : tokens.color.text,
                    fontSize: tokens.typography.fontSize.body,
                  }}>
                    {interest.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button
              title="Continuer"
              onPress={() => setCurrentStep(1)}
              disabled={selectedInterests.length < 3}
              variant="primary"
            />
          </View>
        );

      case 1:
        return (
          <View style={{ gap: tokens.spacing[6] }}>
            <View style={{ alignItems: 'center', gap: tokens.spacing[4] }}>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.title,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.color.text,
                  textAlign: 'center',
                }}
              >
                Parlez-nous de vous
              </Text>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.body,
                  color: tokens.color.textMuted,
                  textAlign: 'center',
                  lineHeight: tokens.typography.lineHeight.body,
                }}
              >
                Partagez quelques mots sur vous (optionnel)
              </Text>
            </View>

            <Card padding="md">
              <TextInput
                style={{
                  fontSize: tokens.typography.fontSize.body,
                  color: tokens.color.text,
                  minHeight: 120,
                  textAlignVertical: 'top',
                }}
                placeholder="Décrivez-vous en quelques mots..."
                placeholderTextColor={tokens.color.textMuted}
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={4}
                maxLength={200}
              />
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.caption,
                  color: tokens.color.textMuted,
                  textAlign: 'right',
                  marginTop: tokens.spacing[1],
                }}
              >
                {bio.length}/200
              </Text>
            </Card>

            <Button
              title="Terminer l'inscription"
              onPress={handleComplete}
              disabled={isSubmitting}
              variant="primary"
            />

            {isSubmitting && (
              <View style={{ alignItems: 'center' }}>
                <ActivityIndicator size="large" color={tokens.color.accent} />
              </View>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: tokens.color.bg }}>
      <View style={{ padding: tokens.spacing[4], flex: 1, justifyContent: 'center' }}>
        {/* Progress indicator */}
        <View style={{ marginBottom: tokens.spacing[6] }}>
          <View
            style={{
              flexDirection: 'row',
              gap: tokens.spacing[2],
              marginBottom: tokens.spacing[2],
            }}
          >
            {[0, 1].map((step) => (
              <View
                key={step}
                style={{
                  flex: 1,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: step <= currentStep ? tokens.color.accent : tokens.color.line,
                }}
              />
            ))}
          </View>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.caption,
              color: tokens.color.textMuted,
              textAlign: 'center',
            }}
          >
            Étape {currentStep + 1} sur 2
          </Text>
        </View>

        {/* Step content */}
        {renderStep()}
      </View>
    </View>
  );
}
```

### 6. Créer les routes de navigation
Dans `app/auth/_layout.tsx`:
```typescript
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
```

## Livrables Attendus
1. Service d'authentification complet
2. Context d'authentification avec gestion d'état
3. Écrans d'authentification (welcome, login, register)
4. Écran d'onboarding avec sélection d'intérêts
5. Types TypeScript pour l'authentification
6. Navigation entre les écrans
7. Gestion des erreurs et loading states

## Contraintes
- Utiliser Supabase Auth avec magic link
- Pas de mot de passe stocké
- Onboarding en 2 étapes minimum
- Validation des formulaires
- Messages d'erreur clairs
- Support mode hors ligne
- Analytics sur les événements d'auth

## Validation
- Inscription et connexion fonctionnelles
- Onboarding complet
- Session persistante
- Redirections correctes
- Gestion des erreurs
- Performances bonnes
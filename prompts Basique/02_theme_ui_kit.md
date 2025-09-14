# GLOUP - Phase 2: Thème et UI Kit

## Contexte
Ce prompt guide la création du système de thème et des composants UI de base pour GLOUP, basé sur la palette "Bleu nuit".

## Rôle
Tu es un expert en design system et développement UI avec React Native. Tu dois créer un système de thème complet et des composants UI réutilisables.

## Objectifs
1. Créer le système de tokens de design
2. Implémenter les thèmes clair/sombre
3. Développer les composants UI de base
4. Mettre en place le context de thème
5. Créer les composants réutilisables

## Références
- Palette "Bleu nuit" (gloup_ui_kit_palette_bleu_nuit_react_native_expo.md)
- Design inspiré de X (presentation_gloup_adaptation_design_inspire_de_x.md)

## Tokens de Design

### Couleurs - Thème Sombre (par défaut)
- `color.bg`: #0F1B2E (fond app)
- `color.surface`: #13233C (cartes/feuilles)
- `color.line`: rgba(255,255,255,0.08) (séparateurs 1px)
- `color.text`: #F8FAFC (texte principal)
- `color.text-muted`: #B6C3D7 (secondaire)
- `color.accent`: #3A8DFF (primaire/CTA)
- `color.accent-pressed`: #3077E0
- `color.accent-alt`: #60A5FA (liens/hover léger)

### Couleurs - Thème Clair
- `color.bg`: #F5F8FF
- `color.surface`: #FFFFFF
- `color.line`: rgba(15,27,46,0.10)
- `color.text`: #0F1B2E
- `color.text-muted`: #4B5B74
- `color.accent`: #1E5BFF
- `color.accent-pressed`: #184ACC
- `color.accent-alt`: #3B82F6

### Typographie
- Familles: iOS SF Pro / Android Roboto
- Tailles: title 20/24, subtitle 17/22, body 15/20, caption 13/18, overline 11/14
- Poids: Regular, Medium, SemiBold

### Espacement
- Grille 8pt: 4px, 8px, 12px, 16px, 24px, 32px

### Rayons
- xs: 6px, sm: 8px, md: 12px, lg: 16px

## Instructions Détaillées

### 1. Créer le package de thème
Dans `packages/theme/`:

Créer `tokens.ts`:
```typescript
export const tokens = {
  color: {
    bg: { light: '#F5F8FF', dark: '#0F1B2E' },
    surface: { light: '#FFFFFF', dark: '#13233C' },
    line: { light: 'rgba(15,27,46,0.10)', dark: 'rgba(255,255,255,0.08)' },
    text: { light: '#0F1B2E', dark: '#F8FAFC' },
    textMuted: { light: '#4B5B74', dark: '#B6C3D7' },
    accent: { light: '#1E5BFF', dark: '#3A8DFF' },
    accentPressed: { light: '#184ACC', dark: '#3077E0' },
    accentAlt: { light: '#3B82F6', dark: '#60A5FA' },
    success: { light: '#16A34A', dark: '#22C55E' },
    warning: { light: '#D97706', dark: '#F59E0B' },
    danger: { light: '#DC2626', dark: '#EF4444' },
    info: { light: '#1E5BFF', dark: '#3A8DFF' },
  },
  radius: {
    xs: 6,
    sm: 8,
    md: 12,
    lg: 16,
  },
  spacing: {
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 24,
    6: 32,
  },
  typography: {
    fontFamily: {
      regular: 'System',
      medium: 'System',
      semibold: 'System',
    },
    fontSize: {
      title: 20,
      subtitle: 17,
      body: 15,
      caption: 13,
      overline: 11,
    },
    lineHeight: {
      title: 24,
      subtitle: 22,
      body: 20,
      caption: 18,
      overline: 14,
    },
    fontWeight: {
      regular: '400',
      medium: '500',
      semibold: '600',
    },
  },
} as const;
```

Créer `types.ts`:
```typescript
export type Theme = 'light' | 'dark';

export interface ThemeTokens {
  color: {
    bg: string;
    surface: string;
    line: string;
    text: string;
    textMuted: string;
    accent: string;
    accentPressed: string;
    accentAlt: string;
    success: string;
    warning: string;
    danger: string;
    info: string;
  };
  radius: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
  };
  spacing: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
    6: number;
  };
  typography: {
    fontFamily: {
      regular: string;
      medium: string;
      semibold: string;
    };
    fontSize: {
      title: number;
      subtitle: number;
      body: number;
      caption: number;
      overline: number;
    };
    lineHeight: {
      title: number;
      subtitle: number;
      body: number;
      caption: number;
      overline: number;
    };
    fontWeight: {
      regular: string;
      medium: string;
      semibold: string;
    };
  };
}
```

Créer `context.tsx`:
```typescript
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme, ThemeTokens } from './types';
import { tokens } from './tokens';

interface ThemeContextType {
  theme: Theme;
  tokens: ThemeTokens;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const getCurrentTokens = (): ThemeTokens => {
    return {
      color: {
        bg: tokens.color.bg[theme],
        surface: tokens.color.surface[theme],
        line: tokens.color.line[theme],
        text: tokens.color.text[theme],
        textMuted: tokens.color.textMuted[theme],
        accent: tokens.color.accent[theme],
        accentPressed: tokens.color.accentPressed[theme],
        accentAlt: tokens.color.accentAlt[theme],
        success: tokens.color.success[theme],
        warning: tokens.color.warning[theme],
        danger: tokens.color.danger[theme],
        info: tokens.color.info[theme],
      },
      radius: tokens.radius,
      spacing: tokens.spacing,
      typography: tokens.typography,
    };
  };

  return (
    <ThemeContext.Provider value={{ theme, tokens: getCurrentTokens(), toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
```

### 2. Créer les composants UI de base
Dans `packages/ui/`:

Créer `Button.tsx`:
```typescript
import React from 'react';
import { Text, Pressable, PressableProps } from 'react-native';
import { useTheme } from '../theme';

export interface ButtonProps extends PressableProps {
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  title: string;
  icon?: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  title,
  icon,
  style,
  ...props
}: ButtonProps) {
  const { tokens } = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: tokens.color.accent,
          borderWidth: 0,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: tokens.color.accent,
          borderWidth: 1,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderWidth: 0,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { height: 36, paddingHorizontal: tokens.spacing[3] };
      case 'md':
        return { height: 44, paddingHorizontal: tokens.spacing[4] };
      case 'lg':
        return { height: 52, paddingHorizontal: tokens.spacing[5] };
    }
  };

  const getTextColor = () => {
    if (variant === 'primary') return '#081325';
    return tokens.color.accent;
  };

  return (
    <Pressable
      style={[
        {
          borderRadius: tokens.radius.md,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: tokens.spacing[2],
        },
        getVariantStyles(),
        getSizeStyles(),
        style,
      ]}
      {...props}
    >
      {icon}
      <Text style={{
        color: getTextColor(),
        fontSize: tokens.typography.fontSize.body,
        fontWeight: tokens.typography.fontWeight.medium,
      }}>
        {title}
      </Text>
    </Pressable>
  );
}
```

Créer `Card.tsx`:
```typescript
import React from 'react';
import { View, ViewProps } from 'react-native';
import { useTheme } from '../theme';

export interface CardProps extends ViewProps {
  variant?: 'default' | 'outlined';
  padding?: 'sm' | 'md' | 'lg';
}

export function Card({
  variant = 'default',
  padding = 'md',
  style,
  children,
  ...props
}: CardProps) {
  const { tokens } = useTheme();

  const getPadding = () => {
    switch (padding) {
      case 'sm': return tokens.spacing[3];
      case 'md': return tokens.spacing[4];
      case 'lg': return tokens.spacing[5];
    }
  };

  return (
    <View
      style={[
        {
          backgroundColor: tokens.color.surface,
          borderRadius: tokens.radius.md,
        },
        variant === 'outlined' && {
          borderWidth: 1,
          borderColor: tokens.color.line,
        },
        { padding: getPadding() },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}
```

Créer `ReactionChip.tsx`:
```typescript
import React from 'react';
import { Text, Pressable, PressableProps } from 'react-native';
import { useTheme } from '../theme';

export interface ReactionChipProps extends PressableProps {
  emoji: string;
  label: string;
  isSelected?: boolean;
  points?: number;
}

export function ReactionChip({
  emoji,
  label,
  isSelected = false,
  points,
  style,
  ...props
}: ReactionChipProps) {
  const { tokens } = useTheme();

  return (
    <Pressable
      style={[
        {
          width: 44,
          height: 44,
          borderRadius: 22,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isSelected ? tokens.color.accent + '20' : 'rgba(255,255,255,0.04)',
        },
        style,
      ]}
      {...props}
    >
      <Text style={{ fontSize: 20 }}>{emoji}</Text>
      {points && (
        <Text style={{
          fontSize: 10,
          color: tokens.color.textMuted,
          marginTop: -2,
        }}>
          {points}
        </Text>
      )}
    </Pressable>
  );
}
```

Créer `Avatar.tsx`:
```typescript
import React from 'react';
import { Image, View } from 'react-native';
import { useTheme } from '../theme';

export interface AvatarProps {
  uri?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallback?: string;
}

export function Avatar({ uri, size = 'md', fallback }: AvatarProps) {
  const { tokens } = useTheme();

  const getSize = () => {
    switch (size) {
      case 'sm': return 32;
      case 'md': return 48;
      case 'lg': return 72;
      case 'xl': return 96;
    }
  };

  const sizeValue = getSize();

  return (
    <View
      style={{
        width: sizeValue,
        height: sizeValue,
        borderRadius: sizeValue / 2,
        backgroundColor: tokens.color.surface,
        overflow: 'hidden',
      }}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
      ) : (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: tokens.color.accent + '20',
          }}
        >
          <Text style={{
            fontSize: sizeValue / 2,
            color: tokens.color.accent,
            fontWeight: tokens.typography.fontWeight.medium,
          }}>
            {fallback?.[0]?.toUpperCase() || '?'}
          </Text>
        </View>
      )}
    </View>
  );
}
```

### 3. Créer le TabBar component
Créer `TabBar.tsx`:
```typescript
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '../theme';

export interface TabBarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

export interface TabBarProps {
  items: TabBarItem[];
  activeId: string;
  onTabChange: (id: string) => void;
}

export function TabBar({ items, activeId, onTabChange }: TabBarProps) {
  const { tokens } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: tokens.color.surface,
        borderTopWidth: 1,
        borderTopColor: tokens.color.line,
        paddingBottom: 20,
      }}
    >
      {items.map((item) => {
        const isActive = item.id === activeId;
        return (
          <Pressable
            key={item.id}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: tokens.spacing[2],
              gap: tokens.spacing[1],
            }}
            onPress={() => onTabChange(item.id)}
          >
            <View
              style={{
                color: isActive ? tokens.color.accent : tokens.color.textMuted,
              }}
            >
              {item.icon}
            </View>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.overline,
                lineHeight: tokens.typography.lineHeight.overline,
                color: isActive ? tokens.color.accent : tokens.color.textMuted,
                fontWeight: isActive ? tokens.typography.fontWeight.medium : tokens.typography.fontWeight.regular,
              }}
            >
              {item.label}
            </Text>
            {item.badge && (
              <View
                style={{
                  position: 'absolute',
                  top: tokens.spacing[1],
                  right: '30%',
                  backgroundColor: tokens.color.danger,
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
                  {item.badge > 99 ? '99+' : item.badge}
                </Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
```

### 4. Créer les exports
Dans `packages/ui/index.ts`:
```typescript
export * from './Button';
export * from './Card';
export * from './ReactionChip';
export * from './Avatar';
export * from './TabBar';
```

Dans `packages/theme/index.ts`:
```typescript
export * from './tokens';
export * from './types';
export * from './context';
```

## Livrables Attendus
1. Package `theme` complet avec tokens et context
2. Package `ui` avec composants de base
3. Support thèmes clair/sombre
4. Composants stylisés selon la palette GLOUP
5. Documentation des composants

## Contraintes
- Utiliser le theme context pour tous les styles
- Respecter les tokens de design
- Supporter le mode clair/sombre
- Composants accessibles
- Touch targets minimum 44x44

## Validation
- Les composants s'affichent correctement
- Le changement de thème fonctionne
- Les contrastes sont conformes WCAG
- Les composants sont réutilisables
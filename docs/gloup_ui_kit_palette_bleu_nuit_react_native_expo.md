# GLOUP — UI Kit (Palette « Bleu nuit »)
> Plateforme mobile : **React Native + Expo** · Libs UI suggérées : **NativeWind/Tamagui**, Reanimated 3, Gesture Handler, FlashList
> Grille 8pt · Touch target ≥ 44×44pt · Rayons : xs 6 · sm 8 · md 12 · lg 16 · Durations : 150–250ms

---

## 0) But & portée
Un **UI Kit prêt à coder** pour GLOUP, décliné en **tokens**, **thèmes clair/sombre**, **composants** (boutons, cartes, tabs, chips), **états** et **exemples React Native**. Aligné sur la présentation produit et le design inspiré d’X.

---

## 1) Design Tokens (sémantiques)
### 1.1 Couleurs — thème sombre (par défaut)
- `color.bg`: **#0F1B2E** (fond app)
- `color.surface`: **#13233C** (cartes/feuilles)
- `color.line`: **rgba(255,255,255,0.08)** (séparateurs 1px)
- `color.text`: **#F8FAFC** (texte principal)
- `color.text-muted`: **#B6C3D7** (secondaire)
- `color.accent`: **#3A8DFF** (primaire/CTA)
- `color.accent-pressed`: **#3077E0**
- `color.accent-alt`: **#60A5FA** (liens/hover léger)
- `overlay.01`: `rgba(255,255,255,0.04)` (hover surface)
- `overlay.02`: `rgba(255,255,255,0.08)` (pressed)
- `overlay.scrim`: `rgba(0,0,0,0.5)` (modales)

**Système** (à valider)
- `color.success`: **#22C55E**  · `success.on`: **#062012**
- `color.warning`: **#F59E0B** · `warning.on`: **#201502**
- `color.danger`: **#EF4444**  · `danger.on`: **#2A0A0A**
- `color.info`: **#3A8DFF**   · `info.on`: **#081325**

### 1.2 Couleurs — thème clair
- `color.bg`: **#F5F8FF**  · `color.surface`: **#FFFFFF** · `color.line`: **rgba(15,27,46,0.10)`
- `color.text`: **#0F1B2E** · `color.text-muted`: **#4B5B74**
- `color.accent`: **#1E5BFF** · `color.accent-pressed`: **#184ACC** · `color.accent-alt`: **#3B82F6**
- `overlay.01`: `rgba(0,0,0,0.04)` · `overlay.02`: `rgba(0,0,0,0.08)` · `overlay.scrim`: `rgba(0,0,0,0.5)`
- `color.success`: **#16A34A** · `warning`: **#D97706** · `danger`: **#DC2626** · `info`: **#1E5BFF**

### 1.3 Typographie
- **Familles** : iOS **SF Pro** / Android **Roboto**
- **Tailles & interlignages**
  - `title`: 20 / 24  · `subtitle`: 17 / 22  · `body`: 15 / 20  · `caption`: 13 / 18  · `overline`: 11 / 14
- **Poids** : Regular · Medium · SemiBold
- **Troncature** : 1–2 lignes par défaut sur cartes (ellipses)

### 1.4 Rayons & ombres
- **Rayons** : `xs 6` · `sm 8` · `md 12` · `lg 16`
- **Élévation (dark)**
  - `e0`: aucune  · `e1`: shadow douce (`rgba(0,0,0,0.35)`, y=2, blur=8)  · `e2`: y=6, blur=18

### 1.5 Motion
- `duration.fast`: 150ms · `duration.base`: 200ms · `duration.slow`: 250ms
- `easing.standard`: cubic-bezier(0.2, 0, 0, 1)  · `easing.entrance`: (0, 0, 0.2, 1)
- Haptique léger sur actions principales et tabs

---

## 2) Thèmes — JSON Design Tokens (dark & light)
```json
{
  "$schema": "https://design-tokens.org/schema.json",
  "tokens": {
    "color": {
      "bg": {"value": "#0F1B2E"},
      "surface": {"value": "#13233C"},
      "line": {"value": "rgba(255,255,255,0.08)"},
      "text": {"value": "#F8FAFC"},
      "textMuted": {"value": "#B6C3D7"},
      "accent": {"value": "#3A8DFF"},
      "accentPressed": {"value": "#3077E0"},
      "accentAlt": {"value": "#60A5FA"},
      "success": {"value": "#22C55E"},
      "warning": {"value": "#F59E0B"},
      "danger": {"value": "#EF4444"},
      "info": {"value": "#3A8DFF"}
    },
    "radius": {"xs": {"value": 6}, "sm": {"value": 8}, "md": {"value": 12}, "lg": {"value": 16}},
    "space": {"1": {"value": 4}, "2": {"value": 8}, "3": {"value": 12}, "4": {"value": 16}},
    "typography": {
      "title": {"fontSize": {"value": 20}, "lineHeight": {"value": 24}, "fontWeight": {"value": 600}},
      "body": {"fontSize": {"value": 15}, "lineHeight": {"value": 20}, "fontWeight": {"value": 400}},
      "caption": {"fontSize": {"value": 13}, "lineHeight": {"value": 18}, "fontWeight": {"value": 400}}
    },
    "motion": {
      "duration": {"fast": {"value": 150}, "base": {"value": 200}, "slow": {"value": 250}}
    }
  },
  "modes": {
    "light": {
      "color": {
        "bg": {"value": "#F5F8FF"},
        "surface": {"value": "#FFFFFF"},
        "line": {"value": "rgba(15,27,46,0.10)"},
        "text": {"value": "#0F1B2E"},
        "textMuted": {"value": "#4B5B74"},
        "accent": {"value": "#1E5BFF"},
        "accentPressed": {"value": "#184ACC"},
        "accentAlt": {"value": "#3B82F6"},
        "success": {"value": "#16A34A"},
        "warning": {"value": "#D97706"},
        "danger": {"value": "#DC2626"},
        "info": {"value": "#1E5BFF"}
      }
    }
  }
}
```

---

## 3) Implémentations — Tailwind/NativeWind & Tamagui
### 3.1 Tailwind (NativeWind) — `tailwind.config.js`
```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0F1B2E",
        surface: "#13233C",
        line: "rgba(255,255,255,0.08)",
        text: "#F8FAFC",
        textmuted: "#B6C3D7",
        accent: "#3A8DFF",
        accentPressed: "#3077E0",
        accentAlt: "#60A5FA",
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
        info: "#3A8DFF"
      },
      borderRadius: { xs: "6px", sm: "8px", md: "12px", lg: "16px" },
      spacing: { 1: "4px", 2: "8px", 3: "12px", 4: "16px" }
    }
  },
  plugins: []
};
```

### 3.2 Tamagui — `tamagui.config.ts` (extrait)
```ts
import { createTamagui } from 'tamagui'

export default createTamagui({
  tokens: {
    radius: { xs: 6, sm: 8, md: 12, lg: 16 },
    space: { 1: 4, 2: 8, 3: 12, 4: 16 },
    color: {
      bg: '#0F1B2E', surface: '#13233C', line: 'rgba(255,255,255,0.08)',
      text: '#F8FAFC', textMuted: '#B6C3D7',
      accent: '#3A8DFF', accentPressed: '#3077E0', accentAlt: '#60A5FA',
      success: '#22C55E', warning: '#F59E0B', danger: '#EF4444', info: '#3A8DFF'
    }
  },
  themes: {
    dark: {
      bg: '$bg', color: '$text', surface: '$surface',
      accent: '$accent', success: '$success', warning: '$warning', danger: '$danger'
    },
    light: {
      bg: '#F5F8FF', color: '#0F1B2E', surface: '#FFFFFF', accent: '#1E5BFF'
    }
  }
})
```

---

## 4) Composants
### 4.1 Boutons
- **Tailles** : sm (36px) · md (44px) · lg (52px)
- **Variants** :
  - **Primary (plein)** : bg `accent`, texte `#081325`; hover `overlay.01`, pressed `accent-pressed`
  - **Outline** : bord `accent`, texte `accent`, bg `transparent`; pressed `overlay.02`
  - **Ghost** : texte `accent`, bg `transparent`; pressed `overlay.02`
- **Rayon** : `md` par défaut (12)
- **Icône** : 20–24px, stroke 2px, leading 8px avant le label

### 4.2 Cartes (PostCard, AdviceCard)
- **Padding** : 12–16 ; **gap** interne 8
- **Barre d’actions** : Réagir · Citer · Enregistrer · Partager
- **États** : normal / hover (overlay.01) / pressed (overlay.02)
- **Élévation** : e1 sur survol/press

### 4.3 Chips — ReactionPicker
- **Taille** : 44×44 (touch) ; label en dessous (caption)
- **Jeu par défaut** : 👑, 👗, 💪, 😎, 🧼, 😊
- **Feedback** : scale 0.98 + haptique léger

### 4.4 Tabs (bottom)
- 4 onglets : Feed · Conseils · Messages · Profil
- Icône 24px + label 11/14 ; actif = `accent`, inactif = `text-muted`

### 4.5 Formulaires
- Champs : surface + bord `line`, focus halo `accent` 2px (extérieur)
- Aide/erreur : caption, couleurs `info`/`danger`

### 4.6 Avatars & Badges
- Avatar 48 (feed), 72 (profil) ; formes arrondies `lg`
- Badges (Mentor, Vérifié) : pill 18–20px, texte 11/14, couleurs `accent`/`success`

---

## 5) États & Accessibilité
- **Focus** : halo 2px `accent` (visible clavier/TV)
- **Contrastes** : texte/CTA ≥ 4.5:1 ; vérifier médias avec alt‑text obligatoire
- **Taille mini** : 44×44 touch, 11/14 pour libellés secondaires

---

## 6) Exemples — React Native (NativeWind)
### 6.1 Bouton primaire
```tsx
import { Text, Pressable } from 'react-native'

export function PrimaryButton({ title, onPress }) {
  return (
    <Pressable onPress={onPress}
      className="h-11 px-4 rounded-md items-center justify-center"
      style={{ backgroundColor: '#3A8DFF' }}
    >
      <Text style={{ color: '#081325', fontWeight: '600' }}>{title}</Text>
    </Pressable>
  )
}
```

### 6.2 Carte
```tsx
import { View } from 'react-native'

export function Card({ children }) {
  return (
    <View className="rounded-md p-4" style={{ backgroundColor: '#13233C' }}>
      {children}
    </View>
  )
}
```

### 6.3 Chip de réaction
```tsx
import { Text, Pressable } from 'react-native'

export function ReactionChip({ emoji, label, onPress }) {
  return (
    <Pressable onPress={onPress}
      className="w-11 h-11 rounded-full items-center justify-center"
      style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
    >
      <Text style={{ fontSize: 20 }}>{emoji}</Text>
    </Pressable>
  )
}
```

---

## 7) Icônes & illustration
- **Style** : outline 2px, coins arrondis, tailles 20/24/28
- **Sources** : lucide‑react‑native, phosphor‑react‑native (cohérents avec stroke)

---

## 8) Utilisation des couleurs (règles)
- **Accent** réservé aux actions primaires, liens importants, tabs actifs
- **Surface** pour cartes/inputs ; **bg** pour la toile
- **Text‑muted** pour méta (timestamps, handles) — éviter sur CTA
- **Success/Warning/Danger/Info** uniquement pour messages de statut

---

## 9) Checklist d’intégration
- [ ] Thèmes dark/light instanciés au niveau racine
- [ ] Tokens centralisés (context/provider) + hooks `useTheme()`
- [ ] Respect des touch targets et focus visibles
- [ ] FlashList sur feed, pagination au scroll
- [ ] Haptique sur réactions et tabs
- [ ] Tests de contraste automatiques (story + capture visuelle)

---

## 10) À suivre
- Variantes de boutons (loading, icon‑only)
- Système de badges (rangs Mentor)
- États vidéo (buffering, muted, captions)
- Composants Conseil (Récompenser +200 pts)


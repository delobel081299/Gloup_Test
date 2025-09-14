# GLOUP — Présentation Produit (adaptation avec design de type X)

> Version : v0.3 — Sept. 2025  
> Objectif : document actionnable pour cadrer l’UX, l’UI et le produit **GLOUP** (réseau social bienveillant) en s’inspirant des principes de design mobile d’**X** tout en respectant l’ADN de l’app.

---

## 1) Résumé exécutif
**But de l’application**  
Réseau social **bienveillant**, centré sur les **interactions positives** et la **transformation personnelle**.

**Différenciants clés**  
- **Aucune mention « like »** : uniquement des **réactions** qui attribuent des **points** à l’auteur du post.  
- **Page « Conseils »** dédiée aux retours constructifs et à la progression.  
- **Modération proactive** + charte de bienveillance.  
- **Navigation simple à 4 onglets** (barre inférieure) : **Feed**, **Conseils**, **Messages & Groupes**, **Profil**.

**Inspirations design (mobile)**  
- Architecture et patterns d’**X** : Timeline + cartes de posts, barres d’actions, tokens (typo, spacing, contrastes), micro‑interactions/haptique, accessibilité.  
- Adaptation stricte à **4 onglets** et au système de points/réactions GLOUP.
- **Stack mobile** : développement **React Native + Expo** (iOS/Android), idéal pour MVP, itérations rapides et OTA via EAS.

---

## 2) Principes d’expérience & de design
1. **Bienveillance par design** : surfaces de réaction expressives > likes binaires ; signaux pro‑socials mis en avant ; frictions sur comportements toxiques.  
2. **Simplicité** : 4 onglets, gestes standard, states clairs (loading/empty/error).  
3. **Lisibilité mobile** : hiérarchie typographique courte, contrastes AA/AAA, touch targets ≥ 44pt.  
4. **Performance perçue** : skeletons, pré‑chargement des médias, auto‑play vidéo discret (muet).  
5. **Identité GLOUP** : tons chaleureux, focus progression, terminologie positive (ex. « Récompenser un conseil »).

---

## 3) Navigation & architecture d’info (mobile)
**Barre de navigation (bottom)** — 4 onglets :
1) **Feed** — fil personnalisé (For You / Suivis).  
2) **Conseils** — meilleures recommandations & retours (classement par qualité/impact).  
3) **Messages & Groupes** — DMs, groupes thématiques, réactions inline.  
4) **Profil** — identité, progression, badges, personnalisation via points.

**En‑tête (top)**  
- Avatar (ouvre menu/paramètres), titre d’écran, **toggle** `Pour toi / Suivis` (sur le **Feed**).  
- Actions contextuelles (tri/filtre sur Conseils, recherche dans Messages, modifier sur Profil).

**Composer (publication)**  
- Déclenché **depuis le Profil** (cohérent avec l’intentionnalité et le focus transformation).  
- Option : raccourci « + » en haut à droite du Feed (activable par feature flag si besoin d’accès rapide).

---

## 4) Écrans clés
### 4.1 Feed
- **Timeline** de posts : carte **PostCard** (avatar, nom, handle, texte riche, média 1–4, compteur vues, barres d’actions).  
- **Filtrage** par `Pour toi / Suivis`.  
- **Micro‑interactions** : appuis/animations légères ; « ↓ N nouveaux posts » lors d’updates.  
- **États** : skeleton (shimmers), empty (onboarding), offline retry.

### 4.2 Page « Conseils »
- **Objectif** : surfacer les **conseils les plus utiles et bienveillants**.  
- **Sections** :
  - « **Top Conseils** » (période réglable : 24h/7j/30j)  
  - « Pour vous » (personnalisé)  
  - « En hausse » (fort engagement récent)  
- **Cartes de conseil** : texte structuré (objectif → recommandation → résultat attendu), éventuels médias d’illustration.  
- **CTA** : « **Récompenser** » (attribue **200 pts** au conseiller) + « Dire merci » (réaction sans point, optionnelle).  
- **Filtres** : thème (#PerteDePoids, #Style, etc.), difficulté, durée, accessibilité.

### 4.3 Messages & Groupes
- **Inbox** : conversations épinglées, aperçus, time stamps.  
- **Conversation** : bulles, pièces jointes (photo/vidéo/GIF/note vocale), réactions inline, réponses en fil.  
- **Groupes** : création, rôle admin/modo, règles épinglées, liens d’invitation, signalements.  
- **Confidentialité** : demandes de message, masquage IP pour appels (option futur), blocage/silence.

### 4.4 Profil
- **Header** : bannière, avatar XL, bio, stats (Posts, Abonnés, Suivis), badges.  
- **Onglets** : `Posts` · `Réactions reçues` · `Médias` · `Conseils donnés`.  
- **Personnalisation via points** : thèmes, cadres photo, musique d’accueil (désactivable), **statut Mentor** (seuil de points).  
- **Journal de progression** : avant/après, milestones, stats de constance, hashtags.

---

## 5) Système de points & réactions (canon GLOUP)
### 5.1 Règles d’attribution (posts)
- **Réactions** uniquement (pas de like classique).  
- Les **points vont à l’auteur** du post.  
- **Barème** :
  - **Emoji Couronne (Excellence)** : **20–40 pts** (multiplicateur 2×).  
  - **Autres emojis** (voir liste ci‑dessous) : **10–20 pts** chacun.

### 5.2 Récompense des conseils
- Un **conseil/avis** peut être **récompensé par l’auteur du post** → **+200 pts** au **conseiller**.  
- Historique de récompenses visible sur le profil du conseiller.

### 5.3 Réactions — liste de référence (défaut figé)
- 👑 **Couronne** — « Tout au top » (excellence générale) — *2× le barème standard*.
- 👗 **Style** — Bon style vestimentaire.
- 💪 **Fitness** — Bon physique.
- 😎 **Confiance** — Attitude / posture confiante.
- 🧼 **Soins** — Peau/coiffure/hygiène au point.
- 😊 **Bien‑être** — Air heureux / équilibre mental.

> Remarque : Pack d’emojis personnalisables par genre/préférences (option). Les libellés restent identiques pour la cohérence produit.

### 5.4 Utilisation des points Utilisation des points
- **Cosmétiques profil** (fonds, cadres, thèmes, musique d’accueil désactivable).  
- **Statut Mentor** (seuil à définir) : accès à outils d’aide avancés, visibilité accrue dans « Conseils ».  
- **Packs premium** : thèmes exclusifs, accélérateurs ponctuels (non‑compétitifs).

### 5.5 Anti‑abus & équilibre
- **Elo/MMR** interne pour la distribution équitable des points & la mise en avant.  
- Anti‑farm : limites souples/journalières, détection d’anomalies, revue humaine.

---

## 6) Composants UI (inspirés X, adaptés GLOUP)
### 6.1 PostCard
- **Anatomie** : avatar(48) · nom (15/SB) · handle (13/Dim) · badge · horodatage · menu (⋯) · texte riche (mentions/hashtags/liens) · grille média (1–4) · compteur vues · **Barre d’engagement** : **Réagir** (ouvre le sélecteur d’emojis) · **Citer** · **Enregistrer** · **Partager**.  
- **Règles** : marges 12–16 ; inter‑items 6–8 ; ratios média standard (1, 2, 3, 4 images).  
- **États** : normal/pressed/disabled/selected ; abréviation compteurs (1.2K, 3.4M).

### 6.2 ReactionPicker
- **Chips emoji** (6), labels, aperçu points gagnés, explication au premier usage.  
- **Accessibilité** : alternatives texte, ordre de focus logique, tailles ≥ 44pt.

### 6.3 AdviceCard (Conseil)
- **Structure** : titre court → recommandation → pourquoi ça marche → résultat attendu.  
- **Actions** : **Récompenser (+200 pts)**, enregistrer, partager, signaler.  
- **Badges** : Mentor, Vérifié, Score d’aide (historique).

### 6.4 TabBar (4)
- **Slots** : Feed · Conseils · Messages · Profil.  
- **États** : sélection (accent), badge non‑lus, respect safe‑area.

### 6.5 SegmentedSwitch (Feed)
- `Pour toi / Suivis` ; animation 150–200ms, haptique léger.

### 6.6 Composer (depuis Profil)
- Zone multi‑ligne, pièces jointes (photo/vidéo/GIF), hashtags guidés, pré‑visualisation.  
- **Ergonomie** : limite caractères, poids médias, alt‑text obligatoire.

---

## 7) Design system (tokens & thèmes)
- **Palette “Bleu nuit” (figée)** :
  - `color.bg` (fond app, sombre) : **#0F1B2E**
  - `color.surface` (cartes) : **#13233C**
  - `color.line` (séparateurs) : **rgba(255,255,255,0.08)**
  - `color.accent` (CTA/états actifs) : **#3A8DFF**
  - `color.accent-pressed` : **#3077E0**
  - `color.accent-alt` (liens/hover léger) : **#60A5FA**
  - `color.text` : **#F8FAFC**
  - `color.text-muted` : **#B6C3D7**
  - **Mode clair (inversé)** :
    - `color.bg` : **#F5F8FF**
    - `color.surface` : **#FFFFFF**
    - `color.line` : **rgba(15,27,46,0.10)**
    - `color.text` : **#0F1B2E**
    - `color.text-muted` : **#4B5B74**
    - `color.accent` : **#1E5BFF**
- **Typo** : iOS SF Pro / Android Roboto ; tailles : Titre 20/24, Corps 15/20, Légende 13/18 ; poids Regular/Medium/SemiBold.
- **Rayons** : xs 6 · sm 8 · md 12 · lg 16.
- **Spacing** : grille 8pt ; touch targets ≥ 44×44pt.
- **Icônes** : stroke 2px, coins arrondis ; états (default/pressed/selected/disabled).
- **Motion** : micro‑feedback 200ms ; respect « réduire les animations ».
- **Accessibilité** : contrastes boutons/texte ≥ 4.5:1 sur les deux modes.

---

## 8) Modération & sécurité
- **Charte** signée à l’inscription ; rappels contextuels.  
- **IA** de détection de propos toxiques (pré‑envoi & post‑modération).  
- **Anti‑bots** : Captchas si activité suspecte, analyse comportementale.  
- **Signalements** : bottom sheet rapide, équipe dédiée, transparence de décision.

---

## 9) Hashtags & découverte
- **Taxonomie guidée** : transformation (#PerteDePoids, #PriseDeMuscle), style (#Streetwear, #Business, #Casual, #Vintage), profils (#GrandesTailles, #Timides, #Débutants), temporalité (#Transformation2025, #AvantAprès, #Journey).  
- **Recherche** : personnes, posts, médias, conseils ; filtres multi‑catégories.

---

## 10) Roadmap produit (proposée)
- **Phase 1 (MVP, 0–3 mois)** : Feed + Profil + système de réactions/points (6 emojis), Page Conseils (lecture), DMs basiques.  
- **Phase 2 (3–6 mois)** : Récompense conseils (+200 pts), groupes, anti‑bots v1, ELo/MMR v1.  
- **Phase 3 (6–12 mois)** : Personnalisations premium, statut Mentor, analytics créateurs, anti‑abus avancé.

---

## 11) KPIs & succès
- Rétention J30 > 60%.  
- ≥ 5 **réactions** moyennes/post ; ratio **conseils récompensés** > 40%.  
- Taux de signalements résolus < 24h ; < 2% comptes frauduleux.  
- Progression utilisateur : milestones/mois, constance hebdo.

---

## 12) Notes d’accessibilité
- Alt‑text images **obligatoire** (assisté).  
- Tailles & contrastes conformes WCAG AA.  
- Gestes doublés par actions accessibles (menus/boutons).  
- Mode « réduire animations » pris en compte.

---

## 13) Annexes — décisions de style (à figer)
- **Palette GLOUP** : variante claire/sombre à figer après tests.  
- **Jeu d’emoji par défaut** : à valider (cf. §5.3) avec options de personnalisation.  
- **Formule MMR** : à définir (inputs : régularité, diversité des retours, tolérance au spam).  
- **Règles de récompense** : cooldowns, caps jour/semaine, seuils Mentor.

---

## 14) Stack technique (mobile)
**Choix** : **React Native + Expo** — ✅ Recommandé pour GLOUP.

**Pourquoi**
- Multi‑plateforme iOS/Android avec un seul codebase.
- **Expo** : EAS Build/Submit, OTA Updates, permissions simplifiées.
- Écosystème mature (Reanimated 3, Gesture Handler, FlashList, React Query, Expo Router).
- Time‑to‑market rapide pour MVP et itérations.

**Points d’attention**
- Performance des longues timelines : utiliser **FlashList** (Shopify) et pagination incrémentale.
- Animations/gestes : préférer **Reanimated 3** + **Gesture Handler**.
- Média : pré‑chargement, thumbnails, upload résilient (tus/resume), alt‑text obligatoire.
- Thème : support clair/sombre via tokens ci‑dessus.

**Libs suggérées**
- UI : NativeWind ou Tamagui + tokens maison.
- Nav : **Expo Router**.
- State/server : **React Query** + **Supabase** SDK (si backend Supabase).
- Analytics : EAS + PostHog/Amplitude.

### Fin — v0.3


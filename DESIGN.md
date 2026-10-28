---
name: KIRI
description: Aprendizaje visual de vocabulario mediante cámara con IA y colección fotográfica personal.
colors:
  electric-blue: "#2F6BFF"
  ink-50: "#FAFAFA"
  ink-100: "#F4F4F5"
  ink-200: "#E4E4E7"
  ink-300: "#D4D4D8"
  ink-400: "#A1A1AA"
  ink-500: "#71717A"
  ink-600: "#52525B"
  ink-700: "#3F3F46"
  ink-800: "#27272A"
  ink-900: "#18181B"
  ink-950: "#0A0A0B"
  pure-white: "#FFFFFF"
  signal-red: "#E5484D"
typography:
  display:
    fontFamily: "Geist_600SemiBold, Geist, system-ui, sans-serif"
    fontSize: "52px"
    fontWeight: 600
    lineHeight: "61px"
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Geist_600SemiBold, Geist, system-ui, sans-serif"
    fontSize: "34px"
    fontWeight: 600
    lineHeight: "38px"
    letterSpacing: "-0.029em"
  title:
    fontFamily: "Geist_500Medium, Geist, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 500
    lineHeight: "30px"
    letterSpacing: "-0.016em"
  body:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: "25px"
  label:
    fontFamily: "Geist_500Medium, Geist, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: "18px"
rounded:
  control: "16px"
  tile: "20px"
  card: "28px"
  pill: "999px"
spacing:
  xs: "6px"
  sm: "12px"
  md: "20px"
  lg: "28px"
  xl: "36px"
components:
  button-primary:
    backgroundColor: "{colors.electric-blue}"
    textColor: "{colors.pure-white}"
    rounded: "{rounded.control}"
    padding: "14px 20px"
    height: "52px"
  button-ghost:
    backgroundColor: "{colors.pure-white}"
    textColor: "{colors.ink-950}"
    rounded: "{rounded.control}"
    padding: "14px 20px"
    height: "52px"
  filter-pill-active:
    backgroundColor: "{colors.ink-950}"
    textColor: "{colors.ink-50}"
    rounded: "{rounded.pill}"
    padding: "10px 16px"
    height: "44px"
  specimen-card:
    backgroundColor: "{colors.ink-100}"
    textColor: "{colors.ink-950}"
    rounded: "{rounded.card}"
---

# Design System: KIRI

## Overview

**Creative North Star: "The Monochrome Specimen Room"**

KIRI treats every photographed everyday object as a quiet museum specimen. Because user-captured photographs bring every color of the real world into the viewport, the application chrome steps back into a disciplined ten-step neutral ink scale (`#FAFAFA` to `#0A0A0B`). The object photograph and the newly learned word share the stage alone: the camera is the home screen, the recognized word rises from a baseline mask in oversized display type, and saving places the photograph directly into a two-column (or three-column on tablet) personal collection.

The aesthetic rejects gamified language-app tropes—there are no mascots, streaks, XP counters, progress rings, or confetti bursts. Authority comes from typographic scale contrast, 1px hairline framing, spring-driven physics, and a single electric blue accent (`#2F6BFF`) reserved strictly for moments of action and recognition.

**Key Characteristics:**
- **Camera-First Architecture:** The live viewfinder with a subtle corner-bracket reticle (`Reticle`) is the default surface after one-time language selection.
- **Claim Beside Proof:** Every vocabulary word is permanently paired with the photograph that earned it (`ResultPanel`, `ObjectTile`, `ObjectDetail`).
- **Two-Weight Typographic Discipline:** `Geist_600SemiBold` carries display words, screen titles, and primary CTA labels; `Geist_500Medium` carries native translations, section headings, and navigation labels.
- **Restrained Single Accent:** Electric Blue (`#2F6BFF`) appears in exactly four functional roles across the entire product.

## Colors

A ten-step neutral ink scale paired with a single high-energy cobalt signal that never competes with user photography.

### Primary
- **Electric Signal Blue** (`#2F6BFF`): Reserved exclusively for (1) the camera reticle lock during AI vision analysis, (2) the primary `Guardar` / `Empezar` CTA fill, (3) the 7pt unread/new specimen indicator dot in the collection grid, and (4) the active border and icon tint on `Escuchar` while text-to-speech audio is playing.

### Neutral
- **Paper Daylight** (`#FAFAFA` / `ink-50`): Default light-mode canvas background across Onboarding, Collection, Result, Detail, and Profile surfaces.
- **Pure Card White** (`#FFFFFF` / `pure-white`): Elevated card surface in light mode (`Profile` language radio group, email input, and camera shutter core).
- **Specimen Well Light** (`#F4F4F5` / `ink-100`): Muted placeholder surface inside framed photo containers before image load and active navigation rail highlight in light mode.
- **Hairline Divider Light** (`#E4E4E7` / `ink-200`): 1px structural border around photo cards, ghost buttons, filter pills, and navigation dividers in light mode.
- **Muted Slate** (`#71717A` / `ink-500` & `#A1A1AA` / `ink-400`): Secondary copy, IPA phonetic transcriptions (`/ˈkiːbɔːd/`), and Spanish example sentence translations in light and dark modes respectively.
- **Obsidian Canvas** (`#0A0A0B` / `ink-950`): Default dark-mode canvas background, primary light-mode display ink, and camera viewfinder surround.
- **Carbon Surface** (`#18181B` / `ink-900`): Elevated dark-mode surface for cards, inputs, and navigation bars.
- **Hairline Divider Dark** (`#27272A` / `ink-800`): 1px structural border in dark mode.
- **Destructive Coral** (`#E5484D` / `signal-red`): Used only for the destructive `Eliminar` action on the object detail screen.

### Named Rules
**The Four-Place Accent Rule.** Electric Signal Blue (`#2F6BFF`) may appear in at most four functional states: reticle lock, primary CTA fill, unlearned specimen dot, and active audio ring. Never use it for decorative backgrounds, badges, tab bars, or headings.

**The Chromatic Silence Rule.** Because user photos supply unpredictable color, all structural chrome, filter chips (`Todas`, `Nuevas`, `Aprendidas`), and selected language pills use monochrome inversion (`#0A0A0B` fill with `#FAFAFA` text in light mode; `#FAFAFA` fill with `#0A0A0B` text in dark mode).

## Typography

**Display Font:** `Geist_600SemiBold` (with `Geist, system-ui, sans-serif` fallback)
**Body & Title Font:** `Geist_500Medium` and system `Geist` (`400`)

**Character:** Crisp Neo-Grotesque geometry with tight negative tracking at display sizes (`-0.035em`), generous descender clearance for masked word-by-word reveals, and clean legibility at compact caption sizes.

### Hierarchy
- **Display Word (`WordReveal`)** (`Geist_600SemiBold`, `52px` on result/detail and `44px` on onboarding, line-height `1.18x`, letter-spacing `-0.035em`): The recognized target-language noun (`keyboard`, `coffee cup`, `backpack`). Rendered through a baseline-masked spring reveal with `maxFontSizeMultiplier={1.35}` so descenders (`g`, `y`, `p`) never clip.
- **Screen Headline** (`Geist_600SemiBold`, `34px`, line-height `38px`, letter-spacing `-1px`): Top-level destination headers (`Colección`, `Perfil`).
- **Translation Title** (`Geist_500Medium`, `22px–24px`, line-height `28px–30px`, letter-spacing `-0.4px`): Native Spanish translation paired on the same baseline with the muted IPA phonetic transcription (`16px–17px`).
- **Tile Title** (`Geist_600SemiBold`, `19px`, letter-spacing `-0.4px`): Target-language noun beneath each collection tile, paired with a `14px` `Geist_500Medium` Spanish translation below.
- **Example Sentence Body** (`400`, `17px–18px`, line-height `24px–26px`): Target-language usage sentence in quotes, followed by its `15px–16px` muted Spanish translation.
- **Navigation & Section Label** (`Geist_500Medium`, `11px–15px`): Tab bar labels (`Cámara`, `Colección`, `Perfil`) and section headers (`Estoy aprendiendo`, `Tu cuenta`, `Quiero aprender`).

### Named Rules
**The Two-Weight Ceiling Rule.** Never load or apply more than two explicit font weights (`600` SemiBold and `500` Medium) alongside default regular body text (`400`). Hierarchy comes from size jump (`52px` display vs. `22px` translation vs. `17px` example) and ink contrast, never from weight sprawl.

**The Unclipped Descender Rule.** Every baseline-masked `WordReveal` container must allocate at least `1.24x` mask height and `0.08x` bottom padding relative to `fontSize`, and must cap scaling via `maxFontSizeMultiplier` rather than disabling accessibility font scaling.

## Layout

KIRI uses a single-focus vertical stage on phones and a constrained centered stage with a left navigation rail on tablets:
- **Camera Viewport:** Edge-to-edge live preview (`#0A0A0B` base) with only five overlay elements: top-left language pill (`EN Inglés`), top-right flash toggle (`48x48pt`), centered SVG corner-bracket reticle (`58%` of shortest viewport axis, max `320pt`), lower prompt pill (`Apunta a un objeto`), and bottom control row (`48pt` gallery/latest-specimen thumbnail, `76pt` spring shutter, `48pt` flip-camera button).
- **Result & Detail Stage:** Centered column (`maxWidth: 560px`, `24px` horizontal padding, `insets.top + 16px` safe-area top inset) stacking a `1:1` square framed photo card (`borderRadius: 28px`), the `WordReveal` stack, a `1px` hairline divider, the example sentence pair, and the bottom action bar.
- **Collection Grid:** `FlatList` with `maxWidth: 900px`, `20px` side padding, `16px` column gutter, and `28px` vertical row gap. Uses `2` columns on compact widths (`< 700px`) and `3` columns on expanded/tablet widths (`>= 700px`), with `3:3.66` (`height = width * 1.22`) vertical specimen tiles.
- **Responsive Navigation:** Native system tab bar on iOS and Android (`NativeTabs`), a `68px` bottom tab bar on compact web viewports (`< 700px`), and an `88px` full-height left vertical navigation rail on tablet/expanded viewports (`>= 700px`).

## Elevation & Depth

KIRI is **flat by default** and conveys depth through **subtle radial luminance fields, translucent glass pills over live camera video, and 1px hairline borders** rather than drop shadows.

- **Soft Radial Neutral Ground (`RadialGround`):** Behind the framed specimen photo on `ResultPanel` and `ObjectDetail`, an SVG radial gradient (`#ECECEF` → `#FAFAFA` at `58%` radius in light mode; `#1E1E24` → `#0A0A0B` in dark mode) creates a quiet studio spotlight without a visible container box or drop shadow.
- **Camera Control Scrims:** Floating controls over the live camera feed use `rgba(10, 10, 11, 0.52)` with a `1px` `rgba(255, 255, 255, 0.18)` border so icons remain legible over both bright daylight scenes and dark objects.

### Named Rules
**The Zero-Shadow Rule.** Never apply `box-shadow` or Android `elevation` to cards, buttons, or collection tiles. Separation between surfaces is achieved strictly via `1px` hairline borders (`#E4E4E7` light / `#27272A` dark) and the `RadialGround` luminance field.

## Shapes

- **Hero Specimen Card (`28px` radius):** `1:1` aspect ratio container with `overflow: hidden` and a `1px` hairline border (`#E4E4E7` / `#27272A`).
- **Collection Specimen Tile (`20px` radius):** Vertical rectangular frame (`height = width * 1.22`) with `1px` hairline border and `10px` gap to its caption block below.
- **Action Buttons & Inputs (`16px` radius):** `52pt` minimum height with `20px` horizontal padding.
- **Filter Chips, Language Pills & Camera Controls (`999px` pill / circle):** Full-radius pills (`44pt` min height) for language and collection filters; `48x48pt` circles for secondary camera actions and `76x76pt` concentric ring for the shutter button.
- **Corner-Bracket Reticle (`Reticle`):** Four SVG corner paths (`strokeWidth: 2.5`, `strokeLinecap: round`, `14px` corner arc) that breathe subtly in idle state and contract to `0.86x` scale in `#2F6BFF` during analysis.

## Components

### Buttons (`Button`)
- **Shape:** `16px` border radius, `52pt` minimum height, `20px` horizontal padding, `8px` icon-to-label gap.
- **Primary (`variant="primary"`):** Solid `#2F6BFF` background, `#FFFFFF` `Geist_600SemiBold` `16px` label, `0px` border. Used only for the single primary commitment on a screen (`Empezar`, `Guardar`, `Abrir cámara`).
- **Ghost (`variant="ghost"`):** Transparent background with `1px` hairline border (`#E4E4E7` light / `#27272A` dark) and primary ink label (`#0A0A0B` / `#FAFAFA`).
- **Active Audio State (`active={true}`):** Shifts the ghost button's border and icon/label tint to `#2F6BFF` while `expo-speech` pronounces the word.
- **Press Physics:** Reanimated spring scale to `0.97` (`damping: 18, stiffness: 420`) with light haptic feedback (`Haptics.ImpactFeedbackStyle.Light`).

### Camera Reticle (`Reticle`)
- **Structure:** Centered square `react-native-svg` overlay with four rounded corner brackets (`L = 28px`, `R = 14px`, `strokeWidth = 2.5`).
- **Idle State:** Crisp `#FFFFFF` stroke (`0.95` opacity) with a gentle `2200ms` breathing scale (`1.0` ↔ `1.025`).
- **Locking State (`analyzing`):** Contracts via spring (`0.86x`) and shifts stroke color to `#2F6BFF` while pulsing opacity (`0.55` ↔ `1.0`).

### Liquid Metaball Photo Loader (`PhotoBlobLoader`)
- **Structure:** A `260x260pt` SVG + Reanimated stage over the solid canvas (`t.bg`) that masks the user's captured photograph (`photoUri`) inside a central hub circle, three `120°` orbiting satellite bulbs, and dynamic cubic-bezier liquid metaball bridges (`computeMetaballBridge`).
- **Choreography:** Cycles through four fluid stages (`2.6s` per cycle): (1) organic tri-lobe rounded triangle blob, (2) liquid metaball stretch with sticky necks, (3) three detached orbiting photo droplets, and (4) snap-coalescence into a single central sphere that expands (`scale: 1 → 2.35`) to assemble the Gradient-Melt Specimen Card.

### Gradient-Melt Specimen Card (`ResultPanel` & `ObjectDetail`)
- **Structure:** A `32px` radius framed card (`1.5px` hairline border, `backgroundColor: t.surface`) over the opaque `t.bg` + `RadialGround` canvas so the live camera feed never bleeds behind text.
- **Gradient Melt:** The captured photo fills the upper `1:1.05` stage and dissolves across its lower half via a 6-stop SVG `<LinearGradient>` (`transparent` → `t.surface`), seamlessly uniting the photograph with the `WordReveal` title, Spanish translation, IPA phonetics, and example sentence below.

### Word Reveal (`WordReveal`)
- **Behavior:** Splits the target-language word or headline into whitespace-delimited tokens, each inside an `overflow: hidden` baseline mask (`height: fontSize * 1.24`), and animates `translateY` from `105%` to `0%` with `Easing.bezier(0.16, 1, 0.3, 1)` (`560ms`, `60ms` stagger).

### Collection Tile (`ObjectTile`)
- **Structure:** Vertical photo frame (`20px` radius, `1px` border) above a two-line caption: target-language word in `Geist_600SemiBold` `19px` + `7pt` `#2F6BFF` dot when unlearned and captured within the last 24 hours, followed by the Spanish translation in `Geist_500Medium` `14px` muted ink.
- **Interaction:** Spring press (`0.97` scale) and staggered entry (`FadeInDown` with `45ms` index delay).

### Navigation (`TabsLayout`)
- **Native iOS & Android:** System `NativeTabs` (`Cámara`, `Colección`, `Perfil`) with SF Symbols (`camera`, `square.grid.2x2`, `person`) and Material symbols, minimizing on scroll down.
- **Compact Web (`< 700px`):** `68px` bottom tab bar with `1px` top hairline border and `Geist_500Medium` `12px` labels.
- **Expanded / Tablet (`>= 700px`):** `88px` vertical left navigation rail with top `KIRI` wordmark, `56pt` rounded tab buttons (`16px` radius, `#F4F4F5` / `#27272A` active pill background), and `1px` right hairline border.

## Do's and Don'ts

### Do:
- **Do** pair every vocabulary word with the user's captured photograph (`ResultPanel`, `ObjectTile`, `ObjectDetail`) so the image remains the visual proof of the word.
- **Do** restrict `#2F6BFF` to the four committed states (reticle lock, primary CTA fill, unlearned tile dot, active audio ring) in both light and dark modes.
- **Do** use `RadialGround` behind hero specimen cards (`ResultPanel` and `ObjectDetail`) to give the framed photograph subtle atmospheric separation without drop shadows.
- **Do** adapt navigation to an `88px` vertical left rail and constrain single-column detail/result stages to `maxWidth: 560px` on viewports `>= 700px`.

### Don't:
- **Don't** introduce gamification chrome (streak flames, XP bars, coin counters, leaderboards, mascots, or confetti animations).
- **Don't** add uppercase tracking kickers, category badges, or status pills inside collection grid tiles; only the 7pt `#2F6BFF` dot may appear beside the word.
- **Don't** invert the primary CTA to a white fill in dark mode; keep `#2F6BFF` with `#FFFFFF` text so the accent contract holds across appearances.
- **Don't** use `allowFontScaling={false}` on typography; always use `maxFontSizeMultiplier` with generous line-height and mask clearance.

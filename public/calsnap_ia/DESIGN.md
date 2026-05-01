---
name: CalSnap IA
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#3c4a3c'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#6c7b6a'
  outline-variant: '#bbcbb8'
  surface-tint: '#006e2a'
  primary: '#006e2a'
  on-primary: '#ffffff'
  primary-container: '#00c853'
  on-primary-container: '#004c1b'
  inverse-primary: '#3ce36a'
  secondary: '#8c5000'
  on-secondary: '#ffffff'
  secondary-container: '#fe9400'
  on-secondary-container: '#633700'
  tertiary: '#9d4139'
  on-tertiary: '#ffffff'
  tertiary-container: '#ff8d81'
  on-tertiary-container: '#76251f'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#69ff87'
  primary-fixed-dim: '#3ce36a'
  on-primary-fixed: '#002108'
  on-primary-fixed-variant: '#00531e'
  secondary-fixed: '#ffdcbf'
  secondary-fixed-dim: '#ffb874'
  on-secondary-fixed: '#2d1600'
  on-secondary-fixed-variant: '#6a3b00'
  tertiary-fixed: '#ffdad6'
  tertiary-fixed-dim: '#ffb4ab'
  on-tertiary-fixed: '#410002'
  on-tertiary-fixed-variant: '#7e2a24'
  background: '#fcf9f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
typography:
  display-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  heading-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.2'
  heading-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  metric-large:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '800'
    lineHeight: '1.0'
  label-caps:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.0'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-padding: 24px
  stack-gap: 16px
  section-gap: 32px
  card-inner-padding: 20px
---

## Brand & Style

This design system is built on the intersection of technical precision and approachable wellness. It adopts a "Modern Minimalist" aesthetic that draws inspiration from high-end productivity tools (like Linear) while maintaining the warmth required for a health and nutrition companion.

The visual language communicates "Intelligence" through vast negative space and "Simplicity" through a reduced color palette. The interface should feel like a premium concierge—out of the way until needed, then incredibly capable. Every interaction is designed to minimize friction, using soft tactile metaphors to make the data-heavy task of calorie tracking feel light and encouraging.

## Colors

The color strategy uses a base of "Paper & Ink"—the Off-white background and Deep Charcoal text provide a high-contrast, sophisticated foundation that is easier on the eyes than pure black and white.

- **Vibrant Green (#00C853):** Used exclusively for "Go" actions, positive reinforcement, and completed goals.
- **Soft Orange (#FF9500):** Reserved for metabolic warnings, macro-nutrient highlights, and attention-required states.
- **Surface (#F2F2EF):** Provides subtle tonal depth for cards and containers, ensuring they sit quietly against the background without requiring heavy borders.

## Typography

The typography pairings in this design system balance authority with approachability. 

- **Plus Jakarta Sans** is the voice of the brand. Its rounded terminals and geometric structure provide a confident, modern, and slightly playful feel for headings.
- **Manrope** is used for all functional body text to ensure maximum legibility and a refined, professional tone for nutritional data.
- **Metrics:** For calorie counts and macro values, we use large-scale Plus Jakarta Sans with tight tracking to make the numbers feel like significant milestones.

All text is in French, maintaining a tone that is encouraging ("Bravo !") and clear ("Résumé nutritionnel").

## Layout & Spacing

The layout follows a fluid, logic-based grid with a focus on vertical rhythm. 

1. **Generous Breathing Room:** We use a base unit of 8px, but lean towards larger increments (24px, 32px) to prevent the UI from feeling cluttered with data.
2. **Safe Margins:** A standard 24px horizontal margin is maintained across all mobile views to ensure touch targets are comfortable and content feels centered.
3. **Information Density:** Use stacked vertical layouts for lists (meals) and side-by-side flex layouts for macro comparisons.

## Elevation & Depth

Hierarchy is established through **Tonal Layering** rather than high-contrast shadows.

- **Level 0 (Background):** #FAFAF7.
- **Level 1 (Cards):** #F2F2EF. Used for the main content containers.
- **Shadows:** Only used on Level 1 elements to provide a "lift" from the background. Shadows should be ultra-diffused: `0px 4px 20px rgba(26, 26, 26, 0.04)`.
- **Interactions:** When a button or card is pressed, it should visually "sink" (reduce shadow/scale slightly) to provide tactile feedback.

## Shapes

The shape language is dominated by exaggerated "soft-square" and pill shapes. 

- **Cards:** Use a variable range of 16px to 24px (standardizing on 20px) to house meal entries, daily summaries, and AI insights.
- **Buttons:** Use a fixed 28px radius, creating a friendly, pill-shaped appearance that invites interaction.
- **Progress Bars:** Ends must be fully rounded (caps) to maintain the playful, non-intimidating aesthetic.
- **Iconography:** Icons use a 2px stroke width with rounded caps and joins, mirroring the typography's rounded nature.

## Components

### Buttons (Boutons)
- **Primary:** Background #00C853, Text #FAFAF7, 28px radius, bold typography.
- **Secondary:** Background #F2F2EF, Text #1A1A1A, 28px radius.
- **Label:** "Ajouter un repas" or "Scanner mon plat".

### Cards (Cartes)
- Background #F2F2EF, 20px radius, 20px internal padding.
- Used for: "Journal d'aujourd'hui" and "Détails des Macros".

### Inputs (Champs de saisie)
- Background #FAFAF7 (inset) or #F2F2EF, 12px radius, 2px charcoal stroke on focus.
- Placeholder text in #1A1A1A at 40% opacity.

### Progress Indicators (Indicateurs)
- **Circular Progress:** Use for daily calorie limit. Gradient is permitted here only (e.g., #00C853 to a slightly lighter tint) to show energy flow.
- **Macro Bars:** Horizontal bars with #00C853 (Protéines) and #FF9500 (Glucides/Lipides).

### Iconography
- 24x24px bounding box, 2px stroke, "Outlined" style.
- Icons: Camera (Scanner), Apple (Nutrition), Calendar (Historique), User (Profil).

### AI Interaction
- Use a subtle shimmer effect on the "Surface" color when the AI is processing a photo ("Analyse en cours...").
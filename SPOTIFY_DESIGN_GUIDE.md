# Spotify Design System Guide for Popster Queen

This document provides a comprehensive specification for restyling the Popster Queen application to match Spotify's design language. Based on official Spotify design guidelines, brand assets, and UI patterns observed in the Spotify app.

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Backgrounds & Surfaces](#backgrounds--surfaces)
5. [Component Library](#component-library)
6. [Icons & Imagery](#icons--imagery)
7. [Motion & Animation](#motion--animation)
8. [Accessibility](#accessibility)
9. [Implementation Specifics](#implementation-specifics)

---

## Design Philosophy

Spotify's design is anchored in three core principles:

### 1. Relevant
Deliver personalized experiences by presenting the right information at the right time. Avoid a one-size-fits-all approach—the interface should feel tailored to each user.

### 2. Human
Create intuitive and conversational interfaces that resonate with users on an emotional level. Designs should feel warm and personal, not cold or overly technical.

### 3. Unified
Maintain consistency across all platforms by adhering to a cohesive design system. This fosters familiarity and trust among users.

---

## Color System

### Primary Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Spotify Green** | `#1DB954` | `rgb(30, 185, 84)` | Primary accent, CTAs, highlights |
| **Black** | `#191414` | `rgb(25, 20, 20)` | Primary background |
| **White** | `#FFFFFF` | `rgb(255, 255, 255)` | Primary text on dark |

### Extended Dark Palette

| Name | Hex | Usage |
|------|-----|-------|
| **Background Base** | `#121212` | Main app background |
| **Surface** | `#181818` | Card backgrounds, elevated surfaces |
| **Surface Elevated** | `#282828` | Hover states, secondary surfaces |
| **Surface Highlight** | `#333333` | Active states, tertiary surfaces |
| **Subdued** | `#535353` | Disabled elements, dividers |

### Text Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Text Primary** | `#FFFFFF` | Headings, primary content |
| **Text Secondary** | `#B3B3B3` | Subtitles, secondary info |
| **Text Subdued** | `#6A6A6A` | Disabled text, hints |

### Accent/Semantic Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Success** | `#1DB954` | Spotify Green for positive states |
| **Error** | `#E91429` | Error messages, destructive actions |
| **Warning** | `#FFA42B` | Warnings, caution states |

### Button Gradient (Primary Green Button)

From the provided images, Spotify uses subtle gradients on their primary buttons:

```css
/* Default state */
background: linear-gradient(180deg, #1ED760 0%, #1DB954 100%);

/* Hover state - slightly lighter */
background: linear-gradient(180deg, #1FDF64 0%, #1ED760 100%);

/* Pressed state - slightly darker */
background: linear-gradient(180deg, #1AA34A 0%, #169C46 100%);

/* Disabled state */
background: #535353;
opacity: 0.7;
```

### Dynamic Color Extraction

Spotify extracts dominant colors from album artwork to create immersive backgrounds:

```css
/* Album page gradient example */
background: linear-gradient(
  180deg, 
  var(--extracted-color) 0%,    /* Dominant album color */
  #121212 50%,                   /* Fade to base */
  #121212 100%
);
```

---

## Typography

### Font Stack

Spotify uses proprietary fonts internally:
- **Spotify Mix Grotesk** - Headlines (not publicly available)
- **Circular** - Body text (not publicly available)

**For implementation, use these accessible alternatives:**

```css
/* Primary Font Stack */
font-family: 'Circular Std', 'Helvetica Neue', Helvetica, Arial, sans-serif;

/* Web-safe fallback */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;

/* Recommendation: Use Outfit or Plus Jakarta Sans as free alternatives */
font-family: 'Plus Jakarta Sans', sans-serif;
```

### Type Scale

| Level | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| **Display XL** | 72px | 900 | 1.1 | Hero sections |
| **Display L** | 48px | 700 | 1.2 | Page titles |
| **H1** | 32px | 700 | 1.3 | Section headers |
| **H2** | 24px | 700 | 1.3 | Card titles |
| **H3** | 20px | 600 | 1.4 | Subsections |
| **Body L** | 16px | 400 | 1.5 | Primary content |
| **Body M** | 14px | 400 | 1.5 | Secondary content |
| **Body S** | 12px | 400 | 1.4 | Captions, metadata |
| **Caption** | 11px | 500 | 1.3 | Labels, badges |

### Font Weights

```css
--font-weight-regular: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
--font-weight-black: 900;
```

---

## Backgrounds & Surfaces

### Layer Hierarchy

Spotify uses a strict elevation system:

```
Layer 0: #121212 (Base background)
Layer 1: #181818 (Cards, navigation)
Layer 2: #282828 (Elevated cards, hover states)
Layer 3: #333333 (Active states, dropdowns)
Layer 4: #404040 (Tooltips, overlays)
```

### Background Patterns

#### Solid Dark Background
```css
background: #121212;
```

#### Gradient Header (with Album Art Color)
```css
.page-header {
  background: linear-gradient(
    to bottom,
    var(--dominant-color) 0%,
    rgba(18, 18, 18, 0.5) 50%,
    #121212 100%
  );
  min-height: 340px;
}
```

#### Card Surface
```css
.card {
  background: #181818;
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

.card:hover {
  background: #282828;
}
```

### Glassmorphism (Spotify uses this sparingly)
```css
.overlay-panel {
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(32px);
  -webkit-backdrop-filter: blur(32px);
}
```

---

## Component Library

### Buttons

#### Primary Button (Green)

From the images, Spotify buttons have specific characteristics:

```css
.btn-primary {
  /* Gradient background */
  background: linear-gradient(180deg, #1ED760 0%, #1DB954 100%);
  
  /* Typography */
  color: #000000;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.1px;
  text-transform: none;
  
  /* Dimensions */
  padding: 14px 32px;
  min-height: 48px;
  border-radius: 500px; /* Pill shape */
  
  /* States */
  border: none;
  cursor: pointer;
  transition: transform 0.1s ease, background 0.2s ease;
}

.btn-primary:hover {
  background: linear-gradient(180deg, #1FDF64 0%, #1ED760 100%);
  transform: scale(1.04);
}

.btn-primary:active {
  background: linear-gradient(180deg, #1AA34A 0%, #169C46 100%);
  transform: scale(1);
}

.btn-primary:disabled {
  background: #535353;
  color: #878787;
  cursor: not-allowed;
  transform: none;
}
```

#### Button Sizes

| Size | Height | Padding | Font Size |
|------|--------|---------|-----------|
| **Large** | 48px | 14px 32px | 14px |
| **Medium** | 40px | 8px 24px | 14px |
| **Small** | 32px | 4px 16px | 12px |

#### Secondary Button (Outlined)

```css
.btn-secondary {
  background: transparent;
  border: 1px solid #878787;
  color: #FFFFFF;
  font-size: 14px;
  font-weight: 700;
  padding: 8px 24px;
  border-radius: 500px;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  border-color: #FFFFFF;
  transform: scale(1.04);
}
```

#### Ghost Button

```css
.btn-ghost {
  background: transparent;
  border: none;
  color: #B3B3B3;
  padding: 8px 16px;
  border-radius: 4px;
  transition: color 0.2s ease;
}

.btn-ghost:hover {
  color: #FFFFFF;
}
```

### Cards

#### Content Card

```css
.content-card {
  background: #181818;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.content-card:hover {
  background: #282828;
}

.content-card:focus-visible {
  outline: 2px solid #FFFFFF;
  outline-offset: 2px;
}
```

#### Album/Playlist Card

```css
.media-card {
  background: #181818;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.media-card-image {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 4px; /* 4px for albums, 50% for artists */
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
}

.media-card-title {
  font-size: 16px;
  font-weight: 700;
  color: #FFFFFF;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.media-card-description {
  font-size: 14px;
  font-weight: 400;
  color: #B3B3B3;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 2;
  display: -webkit-box;
  -webkit-box-orient: vertical;
}
```

### Play Button (Green Circular)

```css
.play-button-fab {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #1DB954;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  transition: transform 0.1s ease, background-color 0.2s ease;
}

.play-button-fab:hover {
  transform: scale(1.08);
  background: #1ED760;
}

.play-button-fab:active {
  transform: scale(1);
  background: #169C46;
}

.play-button-fab svg {
  fill: #000000;
  width: 24px;
  height: 24px;
  margin-left: 3px; /* Optical centering for play icon */
}
```

### Input Fields

```css
.input-field {
  background: #242424;
  border: none;
  border-radius: 4px;
  padding: 12px 16px;
  font-size: 14px;
  color: #FFFFFF;
  width: 100%;
  transition: background-color 0.2s ease;
}

.input-field::placeholder {
  color: #6A6A6A;
}

.input-field:hover {
  background: #333333;
}

.input-field:focus {
  background: #333333;
  outline: 2px solid #FFFFFF;
  outline-offset: -2px;
}

/* Search Input */
.search-input {
  background: #242424;
  border-radius: 500px;
  padding: 12px 16px 12px 48px;
  background-image: url("data:image/svg+xml,..."); /* Search icon */
  background-repeat: no-repeat;
  background-position: 16px center;
}
```

### Navigation

#### Bottom Navigation (Mobile)

```css
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: linear-gradient(
    to top,
    #121212 0%,
    rgba(18, 18, 18, 0.9) 100%
  );
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: #B3B3B3;
  font-size: 10px;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s ease;
}

.nav-item.active,
.nav-item:hover {
  color: #FFFFFF;
}

.nav-item svg {
  width: 24px;
  height: 24px;
}
```

#### Now Playing Bar

```css
.now-playing-bar {
  position: fixed;
  bottom: 64px; /* Above bottom nav */
  left: 0;
  right: 0;
  height: 56px;
  background: #181818;
  border-radius: 8px;
  margin: 0 8px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.3);
}

.now-playing-art {
  width: 40px;
  height: 40px;
  border-radius: 4px;
}

.now-playing-info {
  flex: 1;
  overflow: hidden;
}

.now-playing-title {
  font-size: 14px;
  font-weight: 600;
  color: #FFFFFF;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.now-playing-artist {
  font-size: 12px;
  color: #B3B3B3;
}
```

### Lists

#### Track List Item

```css
.track-item {
  display: grid;
  grid-template-columns: 16px 1fr auto;
  gap: 16px;
  padding: 8px 16px;
  border-radius: 4px;
  align-items: center;
  transition: background-color 0.2s ease;
}

.track-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.track-number {
  font-size: 14px;
  color: #B3B3B3;
  font-variant-numeric: tabular-nums;
}

.track-info {
  display: flex;
  gap: 16px;
  align-items: center;
  overflow: hidden;
}

.track-art {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  flex-shrink: 0;
}

.track-title {
  font-size: 16px;
  font-weight: 400;
  color: #FFFFFF;
}

.track-artist {
  font-size: 14px;
  color: #B3B3B3;
}

.track-duration {
  font-size: 14px;
  color: #B3B3B3;
  font-variant-numeric: tabular-nums;
}
```

### Modals & Dialogs

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
}

.modal-content {
  background: #282828;
  border-radius: 8px;
  padding: 24px;
  max-width: 420px;
  width: 90%;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5);
}

.modal-title {
  font-size: 24px;
  font-weight: 700;
  color: #FFFFFF;
  margin-bottom: 16px;
}

.modal-body {
  font-size: 14px;
  color: #B3B3B3;
  line-height: 1.6;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}
```

### Loading States

#### Skeleton Loader

```css
.skeleton {
  background: linear-gradient(
    90deg,
    #282828 25%,
    #333333 50%,
    #282828 75%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s infinite;
  border-radius: 4px;
}

@keyframes skeleton-shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
```

#### Spinner

```css
.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #333333;
  border-top-color: #1DB954;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
```

---

## Icons & Imagery

### Icon Style

From the provided images, Spotify uses:
- **Outline style** icons as default
- **2px stroke weight** for consistency
- **24px** standard size (scales to 16px and 32px)
- **Round caps and joins**

### Icon Sizes

| Size | Dimensions | Usage |
|------|------------|-------|
| Small | 16x16 | Inline, badges |
| Default | 24x24 | Navigation, actions |
| Large | 32x32 | Hero actions |

### Common Icons (SVG paths)

```css
/* Example: Home icon */
.icon-home {
  /* Use Heroicons, Phosphor Icons, or create custom */
}
```

### Album Artwork

- **Square aspect ratio** (1:1)
- **Border radius**: 4px for albums, 8px for playlists, 50% for artists
- **Shadow**: `box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5)`
- **Never crop or add overlays**

---

## Motion & Animation

### Timing Functions

```css
--ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
--ease-decelerate: cubic-bezier(0, 0, 0.2, 1);
--ease-accelerate: cubic-bezier(0.4, 0, 1, 1);
```

### Duration Scale

| Name | Duration | Usage |
|------|----------|-------|
| Instant | 100ms | Hovers, toggles |
| Fast | 150ms | Small transitions |
| Normal | 200ms | Standard transitions |
| Slow | 300ms | Complex animations |
| Slower | 400ms | Page transitions |

### Hover Animations

```css
/* Scale on hover */
.hover-scale {
  transition: transform 0.1s var(--ease-standard);
}

.hover-scale:hover {
  transform: scale(1.04);
}

/* Fade in */
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Play Button Animation

```css
.play-fab {
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.card:hover .play-fab {
  opacity: 1;
  transform: translateY(0);
}
```

---

## Accessibility

### Color Contrast

- Minimum **4.5:1** ratio for normal text
- Minimum **3:1** ratio for large text (18px+ or 14px bold)
- Primary text (#FFFFFF) on dark (#121212) = **15.8:1** ✓
- Secondary text (#B3B3B3) on dark (#121212) = **7.0:1** ✓

### Focus States

```css
/* Visible focus ring */
:focus-visible {
  outline: 2px solid #FFFFFF;
  outline-offset: 2px;
}

/* Remove default focus for mouse users */
:focus:not(:focus-visible) {
  outline: none;
}
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Screen Reader Text

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

---

## Implementation Specifics

### CSS Custom Properties (Variables)

```css
:root {
  /* Colors - Core */
  --spotify-green: #1DB954;
  --spotify-green-light: #1ED760;
  --spotify-green-dark: #169C46;
  --spotify-black: #191414;
  
  /* Colors - Surfaces */
  --color-background-base: #121212;
  --color-background-elevated: #181818;
  --color-background-highlight: #282828;
  --color-background-press: #333333;
  --color-background-tinted: #1A1A1A;
  
  /* Colors - Text */
  --color-text-base: #FFFFFF;
  --color-text-subdued: #B3B3B3;
  --color-text-muted: #6A6A6A;
  
  /* Colors - Semantic */
  --color-positive: #1DB954;
  --color-negative: #E91429;
  --color-warning: #FFA42B;
  
  /* Typography */
  --font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  
  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 48px;
  --space-8: 64px;
  
  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-pill: 500px;
  --radius-full: 50%;
  
  /* Shadows */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 8px 24px rgba(0, 0, 0, 0.5);
  --shadow-lg: 0 16px 48px rgba(0, 0, 0, 0.5);
  
  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-normal: 200ms ease;
  --transition-slow: 300ms ease;
}
```

### Tailwind CSS Configuration

If using Tailwind, add these to your config:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'spotify-green': '#1DB954',
        'spotify-green-light': '#1ED760',
        'spotify-green-dark': '#169C46',
        'spotify-black': '#191414',
        'surface-base': '#121212',
        'surface-elevated': '#181818',
        'surface-highlight': '#282828',
        'surface-press': '#333333',
        'text-subdued': '#B3B3B3',
        'text-muted': '#6A6A6A',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'pill': '500px',
      },
      boxShadow: {
        'spotify': '0 8px 24px rgba(0, 0, 0, 0.5)',
      },
    },
  },
}
```

### Page Structure Example

```html
<!-- Example: Host Lobby Page -->
<div class="min-h-screen bg-surface-base text-white">
  <!-- Header with gradient -->
  <header class="bg-gradient-to-b from-spotify-green/30 to-surface-base pt-12 pb-6 px-6">
    <h1 class="text-4xl font-bold">Popster Queen</h1>
    <p class="text-text-subdued mt-2">Music timeline game</p>
  </header>
  
  <!-- Main content -->
  <main class="px-6 py-8">
    <!-- QR Code Card -->
    <div class="bg-surface-elevated rounded-lg p-6 mb-6">
      <h2 class="text-xl font-bold mb-4">Scan to Join</h2>
      <div class="bg-white p-4 rounded-lg w-fit mx-auto">
        <!-- QR Code -->
      </div>
    </div>
    
    <!-- Players List -->
    <div class="bg-surface-elevated rounded-lg p-6">
      <h2 class="text-xl font-bold mb-4">Players</h2>
      <!-- Player items -->
    </div>
  </main>
  
  <!-- Start Game Button -->
  <div class="fixed bottom-6 left-6 right-6">
    <button class="w-full bg-spotify-green text-black font-bold py-4 rounded-pill hover:bg-spotify-green-light transition-colors">
      Start Game
    </button>
  </div>
</div>
```

---

## Key Differences from Current Design

| Current | Spotify Style |
|---------|---------------|
| Purple/pink gradient background | Dark solid (#121212) with optional accent gradients |
| White cards on colored bg | Dark elevated cards (#181818) |
| Purple accent color (#667eea) | Spotify Green (#1DB954) |
| System font stack | Plus Jakarta Sans or similar |
| Heavy shadows | Subtle, dark shadows |
| Rounded rectangles | Mix of rounded (8px) and pill shapes |
| Light modal backgrounds | Dark modals (#282828) |

---

## Resources

- [Spotify Design Principles](https://medium.com/spotify-design/introducing-spotifys-new-design-principles-c99c58ed7558)
- [Spotify Developer Design Guidelines](https://developer.spotify.com/documentation/design)
- [Spotify Brand Guidelines](https://developer.spotify.com/documentation/design)
- [Spotify Design Blog](https://spotify.design)

---

*Document Version: 1.0*  
*Last Updated: January 2026*


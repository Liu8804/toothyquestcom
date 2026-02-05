# Plan: Remove Board Game & Redesign First-Screen Experience

**STATUS: ✅ COMPLETED**

This plan was implemented successfully.

## Overview
Two objectives were addressed:
1. ✅ **Remove the board game prototype** (cleanup task)
2. ✅ **Redesign the first 5 seconds experience** to reduce bounce rate from 90%

The goal is to make ToothyQuest's purpose instantly clear: a fun, game-based experience helping kids feel brave about dentist visits.

---

## Part 1: Board Game Removal

### Files Deleted ✅
```
src/pages/BoardGame.tsx
src/components/board-game/ (entire folder)
src/components/games/BoardGameQuiz/ (entire folder)
```

### Files Edited ✅
- **src/App.tsx**: Removed BoardGame import and `/board-game` route
- **src/components/games/GamesModal.tsx**: Removed BoardGameQuizGame import and case handler
- **src/data/games.ts**: Removed `board_game_quiz` entry from creativeGames

---

## Part 2: First-Screen Experience Redesign

### Key Changes

#### 1. ✅ Simplified SplashScreen
- Reduced auto-dismiss from 2.5s to 1.5s
- Added tagline: "Brave smiles start here!"
- Made tap-to-continue more prominent

#### 2. ✅ Redesigned HeroSection
**New Messaging:**
- **Headline**: "Make dentist visits fun & fearless"
- **Subheadline**: "Games, stories & a friendly mascot help kids ages 3-9 feel brave"
- **Primary CTA**: "Start the Adventure"

**Visual Changes:**
- Animated mascot greeting with wave/bounce on load
- Removed blocking onboarding modal
- Removed DirtyToCleanMascot overlay
- Removed "Before/After" labels and grayscale overlay
- Simplified speech bubble: "Let's have fun!"

#### 3. ✅ Created AdventureStartModal
- Kid/Parent choice modal triggered by "Start the Adventure"
- Kid path: Navigate to /guest for games/stories
- Parent path: Open auth modal for signup

#### 4. ✅ Converted OnboardingFlow to Optional
- Removed auto-show on first visit
- Accessible from settings if users want guided introduction

---

## Technical Notes

### Files Created ✅
- `src/components/AdventureStartModal.tsx`

### Files Modified ✅
- `src/App.tsx`
- `src/components/games/GamesModal.tsx`
- `src/data/games.ts`
- `src/components/SplashScreen.tsx`
- `src/components/HeroSection.tsx`
- `src/components/onboarding/OnboardingFlow.tsx`

### Files Deleted ✅
- `src/pages/BoardGame.tsx`
- `src/components/board-game/*` (11 files)
- `src/components/games/BoardGameQuiz/*` (10 files)

---

## Expected Outcomes
- **Reduced bounce rate**: Clear value proposition in under 3 seconds
- **Increased engagement**: Single tap to interactive preview
- **Mobile optimization**: Full hero visible without scrolling
- **Faster time-to-value**: Skip multi-step onboarding modals

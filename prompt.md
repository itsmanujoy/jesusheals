# BUILD PROMPT — *Verse Order* (Church Event Bible Puzzle Game)

## Objective
Build a complete, production-ready Bible puzzle game called **"Verse Order"** for live church events using **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Supabase**. The game must be fully mouse/touch-driven (NO keyboard input during gameplay), visually polished with church-appropriate aesthetics, and optimized for live leaderboard projection.

---

## Tech Stack Requirements (Non-Negotiable)

* **Next.js 15** with App Router
* **TypeScript** (strict mode)
* **Tailwind CSS** for all styling
* **Supabase** for leaderboard backend (database only; auth optional)
* **Zustand** or **React Context** for client-side state management (game state + security code)
* **No external game engines** (e.g., Phaser, Unity)
* **No keyboard input** for gameplay interactions (mouse/touch only)

---

## Game Structure & Rules

### Gameplay Overview
* **3 Bible verses** per game session
* **30 seconds per verse** (90 seconds total gameplay)
* **Progressive difficulty**: Easy → Medium → Hard
* **Verse pool**: 15–20 Bible verses stored as **JavaScript/TypeScript objects in the frontend codebase**
* **Fragment generation**: Implement a **frontend algorithm** that dynamically splits verses into 7–8 fragments based on word count (max 2 words per fragment)

### Verse Data Structure
Each verse object should contain:
* `id`: Unique identifier
* `text`: Full verse text (string)
* `reference`: Bible reference (e.g., "John 1:1")
* `difficulty`: Optional metadata for verse selection

**Important**: Verses are NOT stored in Supabase. They are hardcoded frontend objects.

---

## Level-by-Level Specifications

### 🟢 Level 1 — Easy (30 seconds)
* **Full Bible reference visible** at all times (e.g., "John 1:1")
* **Scrambled fragments** displayed in random order
* **Interaction**: Drag-and-drop OR tap-to-select fragments to arrange in correct order
* **Submit button**: Player clicks when ready
* **Feedback**:
  * ✅ Correct → **Green screen flash/flicker animation** (200-300ms)
  * ❌ Incorrect → **Red screen flash/flicker animation** (200-300ms)
* **Transition**: Smooth animated transition to Level 2 after feedback

---

### 🟡 Level 2 — Medium (30 seconds)
* **Partial Bible reference visible** (first half only, e.g., "John" from "John 1:1")
* **At 15 seconds remaining**: Full reference fades in smoothly
* Same fragment interaction and feedback system as Level 1
* Smooth transition to Level 3

---

### 🔴 Level 3 — Hard (30 seconds)
* **No Bible reference shown initially**
* **Display 5 random Bible references** from the verse pool:
  * 4 incorrect references (randomly selected)
  * 1 correct reference (the actual verse being solved)
  * Example display:
    * Isaiah 41:10
    * 1 Corinthians 12:12
    * Romans 16:19
    * Zephaniah 3:17
    * John 1:1 ← (correct one)
* **Player must**:
  1. Arrange fragments in correct order
  2. Select the correct Bible reference from the 5 options
* **Evaluation**: Both fragment order AND reference selection must be correct
* Same green/red feedback system

---

## Scoring Algorithm (Anti-Tie Design)

The scoring system must minimize ties by incorporating multiple weighted factors:

### Scoring Factors
1. **Remaining time** (per level)
2. **Difficulty multiplier**:
   * Easy: 1.0×
   * Medium: 1.5×
   * Hard: 2.5×
3. **Accuracy bonus** (correct on first attempt)
4. **Speed bonus** (non-linear curve favoring faster completion)

### Suggested Formula
```
levelScore = floor(
  (remainingSeconds ^ 1.3) × 
  difficultyMultiplier × 
  accuracyFactor
)

finalScore = sum(easyScore + mediumScore + hardScore)
```

**Requirements**:
* Use **non-linear time weighting** (e.g., exponential curve) to differentiate close times
* Store **per-level breakdown** (Easy/Medium/Hard scores) for display
* Ensure formula produces **unique scores** for most players (test with sample data)

---

## Player Registration (Pre-Game)

### Input Fields
1. **Player Name**: Voice input or on-screen keyboard (NOT physical keyboard)
2. **Region**: Dropdown/selection menu with **all 28 Indian states** (alphabetically sorted)

### Validation
* Name: Required, minimum 2 characters
* Region: Required selection
* Display validation errors clearly
* **"Start Game" button** enabled only when both fields are valid

---

## Security Code Feature (Mandatory)

### Code Generation & Display (Immediately After Registration)
1. Generate **random 6-digit numeric code** (e.g., "482917")
2. Display prominently with message: **"Remember this code! You'll need it later."**
3. **Animated countdown**: Display large numbers counting down:
   * **5 → 4 → 3 → 2 → 1 → GO!**
   * Minimum 5 seconds total display time
4. Store code securely in **Zustand/Context state** (NOT localStorage for security)
5. After countdown, automatically transition to Level 1

---

## Post-Game Verification Screen (`/verify` route)

### Step 1: Code Entry Interface
* Prompt: **"Enter your 6-digit security code"**
* **On-screen numeric keypad** (0-9 buttons, backspace, clear)
* **NO native keyboard input allowed**
* Display entered digits (optionally masked)
* **Maximum 2 attempts** allowed

### Step 2: Verification Logic
* **Correct code** → Proceed to Final Score Screen
* **Incorrect code (1st attempt)** → Show "Incorrect. 1 attempt remaining." message
* **Incorrect code (2nd attempt)** → Trigger Punishment Screen

### Step 3: Punishment Screen (After 2 Failed Attempts OR "Forgot Code?" Button)
* Display message: **"Recite 5 Hail Marys to continue"**
* Show **5 large checkboxes** with labels:
  * ☐ Hail Mary 1
  * ☐ Hail Mary 2
  * ☐ Hail Mary 3
  * ☐ Hail Mary 4
  * ☐ Hail Mary 5
* **"Continue" button**:
  * Disabled (grayed out) until ALL 5 checkboxes are checked
  * Enabled only when all boxes checked
* After clicking Continue → Proceed to Final Score Screen

---

## Final Score Screen

### Display Elements
* **Player Name**
* **Region** (Indian state)
* **Final Score** (large, prominent)
* **Score Breakdown**:
  * Easy: [score]
  * Medium: [score]
  * Hard: [score]
* **Celebratory animation** (confetti, fade-in, etc.)

### Action Buttons
* **"Play Again"** → Navigate to landing page (registration screen)
* **"View Leaderboard"** → Navigate to `/score` route

### State Cleanup
* On navigation away from Final Score Screen:
  * **Fully reset all game state** (Zustand/Context stores)
  * Clear security code from memory
  * Clear player data
  * Ensure fresh state for next player

---

## Live Leaderboard (`/score` route)

### Data Source
* **Supabase real-time query** from `players` table
* Auto-refresh every 5-10 seconds OR use Supabase real-time subscriptions

### Display Requirements
* **Sorted by score** (descending, highest first)
* **Columns**:
  1. Rank (1, 2, 3, ...)
  2. Player Name
  3. Region (Indian state)
  4. Final Score
* **Responsive design**: Optimized for projector display (large text, high contrast)
* **Top 3 highlighting**: Visual distinction for 1st, 2nd, 3rd place (gold/silver/bronze colors)

### Admin Features
* **Manual Reset Button** (admin-only, optionally password-protected):
  * Clears all leaderboard entries
  * Confirmation dialog before deletion

---

## Supabase Backend Requirements

### Purpose
**Supabase is used ONLY for leaderboard functionality.** Verses and fragments are frontend-only.

### Database Schema

#### Table: `players`
```sql
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  security_code TEXT,  -- Optional: store for verification
  final_score INTEGER NOT NULL,
  easy_score INTEGER NOT NULL,
  medium_score INTEGER NOT NULL,
  hard_score INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for leaderboard queries
CREATE INDEX idx_players_score ON players(final_score DESC, created_at ASC);
```

### Migration Files
* **Provide SQL migration file** (e.g., `supabase/migrations/001_create_players_table.sql`)
* Include table creation, indexes, and any Row Level Security (RLS) policies if needed

### Environment Variables
* Assume `.env.local` will contain:
  ```
  NEXT_PUBLIC_SUPABASE_URL=<provided_externally>
  NEXT_PUBLIC_SUPABASE_ANON_KEY=<provided_externally>
  ```

---

## UI/UX Design Requirements

### Visual Aesthetics
* **Church-appropriate color palette**: Soft blues, golds, whites, gentle gradients
* **Clean, modern design**: Avoid overly playful or childish elements
* **High readability**: Large fonts, high contrast text
* **Smooth animations**: Fade transitions, gentle flickers, no jarring effects

### Interaction Design
* **Large touch targets**: Minimum 44×44px for all interactive elements
* **Clear visual feedback**: Hover states, active states, disabled states
* **Drag-and-drop**: Smooth, responsive dragging with visual drop zones
* **Alternative tap-to-place**: For devices where drag-and-drop is difficult

### Responsive Design
* **Mobile-first**: Optimized for phones (portrait orientation)
* **Tablet support**: Landscape and portrait
* **Desktop/Projector**: Leaderboard optimized for large screen display

### Accessibility
* **Color-blind friendly**: Don't rely solely on color for feedback (use icons/text too)
* **Touch-friendly**: No hover-only interactions
* **Clear error messages**: Validation feedback in plain language

---

## Technical Constraints & Rules

### Strict Requirements
* ❌ **NO keyboard input during gameplay** (fragments, level interactions)
* ❌ **NO dummy/mock data** in production code
* ❌ **NO mock backend** (must use real Supabase)
* ❌ **NO storing verses in Supabase** (frontend objects only)
* ✅ **YES to on-screen keyboards** for name input and code verification
* ✅ **YES to voice input** for player name (optional enhancement)

### Code Quality
* **TypeScript strict mode** enabled
* **Proper error handling**: Try-catch for Supabase calls, user-friendly error messages
* **Loading states**: Spinners/skeletons during data fetching
* **No console errors** in production build

---

## Deliverables Checklist

### Core Functionality
- [ ] Player registration with name + Indian state selection
- [ ] Security code generation and display with countdown
- [ ] 3-level gameplay (Easy/Medium/Hard) with 30s timers each
- [ ] Fragment drag-and-drop OR tap-to-place interaction
- [ ] Level 3 reference selection (5 options)
- [ ] Green/red feedback animations
- [ ] Non-trivial scoring algorithm with breakdown
- [ ] Post-game verification screen with numeric keypad
- [ ] Punishment screen (5 Hail Marys)
- [ ] Final score display with breakdown
- [ ] Live leaderboard with real-time Supabase data
- [ ] State cleanup on navigation

### Technical Deliverables
- [ ] Next.js 15 App Router project structure
- [ ] TypeScript configuration
- [ ] Tailwind CSS setup
- [ ] Supabase client configuration
- [ ] Zustand/Context state management
- [ ] SQL migration file for `players` table
- [ ] 15-20 Bible verses as frontend objects
- [ ] Fragment generation algorithm (7-8 fragments, max 2 words each)
- [ ] Responsive UI for mobile/tablet/desktop
- [ ] Production-ready build (no errors, optimized)

### Documentation
- [ ] README with setup instructions
- [ ] Environment variable template (`.env.example`)
- [ ] Supabase setup instructions
- [ ] How to run migrations
- [ ] How to run development server
- [ ] How to build for production

---

## Expected End Result

A **fully functional, production-ready Bible puzzle game** that:
* Runs smoothly on mobile, tablet, and desktop
* Provides 90 seconds of engaging, church-appropriate gameplay
* Implements a fun security verification mechanic
* Displays a live leaderboard suitable for projection at church events
* Has clean, joyful UI with smooth animations
* Requires zero keyboard input during gameplay
* Is ready to deploy and use immediately at a live event
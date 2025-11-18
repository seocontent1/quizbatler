# Quiz Battle App - Design Guidelines

## Design Approach

**Reference-Based Approach**: Drawing inspiration from gamified learning platforms (Duolingo, Kahoot) and classic RPG battle systems (Pokemon, turn-based games) to create an engaging quiz experience with character combat mechanics.

**Core Design Principle**: Create an immersive battle arena experience where quiz mechanics seamlessly integrate with visual combat feedback, making learning competitive and entertaining.

---

## Layout System

**Battle Arena Layout** (Main Quiz Screen):
- Top section (20% viewport): Opponent character sprite + health bar with life indicators
- Middle section (40% viewport): Quiz question card with prominent typography
- Bottom section (20% viewport): Player character sprite + health bar with life indicators  
- Answer zone (20% viewport): Multiple choice buttons in 2x2 grid

**Spacing System**: Use Tailwind units of 2, 4, 6, and 8 throughout (p-4, gap-6, m-8, etc.)

**Container Strategy**:
- Battle arena: Full viewport height with centered max-w-4xl container
- Question cards: max-w-2xl with generous padding (p-8)
- Answer buttons: Equal-width grid with gap-4

---

## Typography

**Hierarchy**:
- Game Title/Round Counter: Display font, bold, 2.5rem
- Quiz Questions: Sans-serif, semi-bold, 1.75rem, max-width for readability
- Answer Options: Sans-serif, medium, 1.125rem
- Score/Lives Counter: Monospace font for numbers, 1rem
- UI Labels: Sans-serif, 0.875rem, uppercase tracking-wide

**Font Pairing**: Google Fonts via CDN
- Primary Display: "Press Start 2P" for retro game feel in headers
- Body Text: "Inter" for clean readability in questions/answers

---

## Component Library

### Battle Arena Components

**Character Sprites**:
- Position: Opponent top-right, Player bottom-left
- Size: 200x200px containers with scale transforms
- Animation states: idle (subtle breathing), attack (lunge forward), hit (shake/flash), victory (bounce)
- Use placeholder divs with distinct shapes (opponent: octagon, player: shield shape)

**Health Bar System**:
- Width: 200px bar with segmented life indicators (hearts/stars)
- Lives: Display as individual icons, not continuous bar
- Depletion: Slide-out animation when life lost, duration 600ms
- Container: Includes character name label + numerical counter

**Question Card**:
- Elevated card design with prominent shadow
- Round indicator badge in top-right corner
- Question text: Centered, generous line-height (1.6)
- Padding: p-8 with extra vertical spacing

**Answer Buttons**:
- Grid layout: 2 columns on desktop (grid-cols-2), stack on mobile
- Height: min-h-16 for touch targets
- States: Default, hover (lift effect), selected, correct (pulse), incorrect (shake)
- Icon prefix: Heroicons checkmark/x for feedback states
- Transition: All states 200ms ease

### UI Feedback Components

**Score Display**:
- Fixed position top-left corner
- Glass-morphism style card (backdrop blur)
- Metrics: Correct answers count, current streak, total score
- Typography: Tabular numbers for alignment

**Progress Indicator**:
- Linear progress bar at viewport top (h-2)
- Shows questions completed / total questions
- Smooth width transitions 400ms

**Action Modals** (Game Over/Victory):
- Centered overlay with backdrop blur
- Max-w-md container
- Dramatic entry animation (scale from 0.9, fade in)
- Large status icon (trophy for win, restart icon for loss)
- Stats summary: Final score, accuracy percentage, time taken
- Primary CTA: Restart button (w-full, h-14)

### Animation Sequences

**Attack Animation** (Correct Answer):
1. Question card fade out (200ms)
2. Player character attack animation (400ms): scale + translateX
3. Opponent hit reaction (200ms): shake + opacity flash
4. Health bar decrease (600ms): segment removal with slide
5. Next question fade in (300ms)

**Defeat Animation** (Wrong Answer):
1. Answer button shake (300ms)
2. Opponent attack (400ms)
3. Player hit reaction (200ms)
4. Player health decrease (600ms)
5. Continue to next question (300ms)

**Victory Sequence** (Game Won):
1. Opponent collapse animation (800ms)
2. Player victory pose + particle burst
3. Modal slide up with stats (400ms delay)

---

## Navigation & Flow

**Pre-Game Screen**:
- Centered hero with game title
- Difficulty selector: Three large buttons (Easy/Medium/Hard)
- Brief instructions card below
- Start button: Large, prominent (w-64, h-16)

**In-Game HUD**:
- Pause button: Top-right corner (icon only)
- Pause modal: Same styling as action modals with Resume/Quit options

**Post-Game Screen**:
- Full-screen results display
- Performance breakdown: Accuracy chart, time per question
- Restart and difficulty change options

---

## Responsive Behavior

**Desktop (lg:)**: 
- Side-by-side character placement with wide battle arena
- 2x2 answer grid
- All HUD elements visible

**Tablet (md:)**:
- Maintain character positioning
- 2x1 answer grid if needed
- Compact score display

**Mobile (base)**:
- Stack characters vertically
- Single column answers (grid-cols-1)
- Fixed bottom answer zone
- Simplified health bars (icons only, no labels)

---

## Images

**Character Sprites**: Use placeholder geometric shapes with distinct silhouettes until custom artwork is added. Opponent: Angular/sharp geometry. Player: Rounded/heroic geometry.

**Background**: Subtle texture or gradient pattern behind battle arena (not distracting from gameplay).

**Icons**: Heroicons for all UI elements (hearts for lives, trophy for victory, restart arrows, pause, checkmarks/x for answers).

No large hero image needed - the battle arena IS the hero element.

---

## Accessibility

- Keyboard navigation: Tab through answers, Enter to submit, Escape to pause
- ARIA labels on all interactive elements
- Animation preferences: Respect prefers-reduced-motion
- High contrast mode support for health bars and text
- Focus indicators: 3px outline on all focusable elements
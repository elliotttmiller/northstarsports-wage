# NSSPORTSCLUB - Clean Codebase Structure

- ❌ `/src/components/panel
- ✅ Duplicate `useIsMobile` definitions - Consolidated to `/src/hooks/useIs
## Core Application Structure
### Entry Points
- `src/main.tsx` - React entry point (DO NOT MODIFY)

## Core Application Structure

### Entry Points
- `index.html` - Main HTML with PWA meta tags
- `src/main.tsx` - React entry point (DO NOT MODIFY)
- `src/App.tsx` - Main app routes and suspense

### Styling & Theme
- `src/index.css` - **SINGLE SOURCE OF TRUTH** for all styling
  - Contains complete theme system with blue accent colors
  - Includes scrollbar hiding utilities
  - All CSS variables properly defined
  - No duplicate theme files

- `src/components/BetSl
- `src/components/layouts/RootLayout.tsx` - Universal shell layout
### Panel System
- `src/components/BottomNav.tsx` - Mobile navigation (5 buttons: Sports | Live | Home | Bets | Other)
- `src/components/FloatingBetSlipButton.tsx` - Mobile bet slip access

### Core Components (All Universal)
- `src/components/GameCard.tsx` - **UNIFIED** game card component
  - Responsive for mobile and desktop
  - Expandable player props

- `src/components/BetSlipModal.tsx` - Unified bet slip interface
- `src/components/PlayerPropsSection.tsx` - Props display component

- `src/hooks/use
- `src/components/panels/SideNavPanel.tsx` - Left sidebar (sports/leagues)
- `src/components/panels/WorkspacePanel.tsx` - Main content area
- `src/components/panels/ActionHubPanel.tsx` - Right sidebar (bet slip)

### Pages (All Clean)
- `src/pages/HomePage.tsx` - Landing page with trending games
- `src/pages/GamePage.tsx` - Sports/games listing
- `src/pages/GameDetailPage.tsx` - Individual game details
- `src/pages/MyBetsPage.tsx` - User's active bets
- One GameCard component for all game displays
- `src/pages/OtherPage.tsx` - Additional bet types and tools

### State Management
- Unified component interfaces
- `src/context/NavigationContext.tsx` - Navigation state

### Utilities & Services
- `src/hooks/useIsMobile.ts` - **SINGLE** responsive hook
- `src/lib/utils.ts` - Utility functions
- `src/lib/formatters.ts` - Data formatting functions
- `src/services/mockApi.ts` - Data service layer
- Performance optimized

```css
- All shadcn components in `src/components/ui/`
- Properly themed with blue accent system
- No duplicates or unused components

- All test files and artifacts r

- **Files Removed:** 3 (BuilderPa
- **Import Cycles:** 0
- **Color System:** Professional blue with dar









































































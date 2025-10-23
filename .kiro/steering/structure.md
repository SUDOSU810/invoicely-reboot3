# Project Structure

## Root Level Organization
```
├── src/                    # Main application source
├── components/             # Shared UI components (shadcn/ui)
├── lib/                    # Utility functions and hooks
├── public/                 # Static assets
├── .kiro/                  # Kiro configuration and steering
└── [config files]          # Build and tooling configuration
```

## Source Directory (`src/`)
- **`App.tsx`** - Main application component with routing
- **`main.tsx`** - Application entry point with Amplify configuration
- **`index.css`** - Global styles and CSS variables
- **`components/`** - Application-specific components
  - `Layout.tsx` - Main layout wrapper
  - `theme-provider.tsx` - Theme context provider
- **`pages/`** - Route components (one per page)
- **`lib/`** - Utilities and custom hooks
  - `hooks/` - Custom React hooks (e.g., useAuth)

## Components Directory (`components/`)
- **`ui/`** - Shadcn/ui component library
  - Reusable UI primitives (buttons, cards, forms, etc.)
  - Custom styled components with Tailwind
  - Follows shadcn/ui "New York" style conventions

## Key Conventions

### File Naming
- React components: PascalCase (e.g., `HomePage.tsx`)
- Utilities: camelCase (e.g., `utils.ts`)
- Pages: `[Name]Page.tsx` pattern

### Import Aliases
- `@/` - Project root
- `@/components` - UI components
- `@/lib` - Utilities and hooks
- `@/pages` - Page components

### Component Structure
- Functional components with TypeScript
- Props interfaces defined inline or exported
- Use React hooks for state management
- Theme-aware components using CSS variables

### Routing
- Public routes: `/`, `/sign-in`, `/create-account`, `/verify-otp`
- Protected routes: `/home`, `/history`, `/settings`
- Layout wrapper for authenticated pages
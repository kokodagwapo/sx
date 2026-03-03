# SprinkleX — Loan Analytics & Portfolio Management

## Overview

SprinkleX is a comprehensive loan analytics and portfolio management dashboard for mortgage professionals. It provides geographic drilldown maps, loan search, credit metrics, pricing sheets, and portfolio analysis across an 8-step workflow.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript for type safety and modern development
- **Routing**: React Router DOM v7 for client-side routing
- **Styling**: Tailwind CSS v3 with custom design system using CSS variables for consistent theming
- **UI Components**: Radix UI primitives with shadcn/ui component library for accessible, customizable components
- **State Management**: TanStack Query for server state management and data fetching
- **Forms**: React Hook Form with Zod validation for robust form handling and schema validation
- **Build Tool**: Vite for fast development and optimized production builds
- **Charts**: Recharts for all data visualizations
- **Maps**: React Simple Maps with D3 geo projections for geographic drilldown

### Backend Architecture
- **Runtime**: Node.js with Express.js framework for RESTful API endpoints
- **Language**: TypeScript for end-to-end type safety
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Storage Strategy**: In-memory storage for development, PostgreSQL for production
- **API Structure**: RESTful endpoints with proper error handling and validation

### Data Storage Solutions
- **Database**: PostgreSQL with Neon as the serverless provider
- **Schema Management**: Drizzle migrations for database schema versioning

## Design System

### Color Palette (source of truth: `client/src/styles/chartPalette.ts`)
- Mint: `#4ade80`, Sky blue: `#38bdf8`, Violet: `#a78bfa`, Peach: `#fb923c`
- Pink: `#f472b6`, Teal: `#34d399`, Yellow: `#facc15`, Cornflower: `#60a5fa`

### Glassmorphic Style
- Cards: `bg-white/40 backdrop-blur-xl border-white/50 shadow-[0_4px_24px_rgba(56,189,248,0.07)]`
- Shell background: `bg-[#e8f2ff]`
- KPI strip: `from-sky-100/50 via-white/90 to-blue-50/40`

### Sidebar
- Collapsed: `bg-sky-600 border-sky-500`
- Expanded: `bg-white/30 backdrop-blur-xl border-white/50` (glassmorphic)
- Active nav item: `bg-white/80 ring-1 ring-sky-200/80`, icon color `text-yellow-400`

## Application Structure

### 8-Step Workflow
1. **Step 1** — Geography (interactive choropleth map, state/county/tract drilldown)
2. **Step 2** — Search Loans (filter, search, portfolio breakdown)
3. **Step 3** — Credit Metrics (FICO, LTV, DTI analysis)
4. **Step 4** — Pricing (rate sheets, WAC, pricing comparison)
5. **Step 5** — Trends (time series, area charts)
6. **Step 6a/6b/6c** — Portfolio Analysis (composition, comparison, WAC by product)
7. **Step 7** — Loan List (full loan data table)
8. **Step 8** — Summary (executive overview)

### Key Files
- `client/src/styles/chartPalette.ts` — canonical color palette
- `client/src/components/cards/PanelCard.tsx` — base card component (glassmorphic)
- `client/src/components/charts/` — all chart components
- `client/src/components/maps/GeoDrilldownMap.tsx` — choropleth map
- `client/src/components/layout/Sidebar.tsx` — collapsible sidebar
- `client/src/components/filters/FilterRail.tsx` — filter sidebar
- `client/src/layouts/SprinkleShell.tsx` — main page shell

## External Dependencies

### Database and Infrastructure
- **Neon Database**: Serverless PostgreSQL provider
- **Drizzle Kit**: Database migration and schema management tools

### UI and Styling
- **Radix UI**: Accessible, unstyled UI primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **Google Fonts**: Web fonts (Inter, DM Sans, Fira Code, Geist Mono)

### Charts and Maps
- **Recharts**: Composable charting library
- **React Simple Maps**: SVG map rendering with D3 geo

### Development Tools
- **Replit Integration**: Development environment integration
- **PostCSS**: CSS processing with Tailwind and Autoprefixer

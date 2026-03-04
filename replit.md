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

## Real Data Pipeline

- **Source**: `attached_assets/ConvertedData_1772557931230.xlsx` — 7,052 real loans from Provident (2,452), Stonegate (963), New Penn Financial (3,637)
- **Parser**: `scripts/parseExcel.cjs` — converts Excel → JSON; run with `node scripts/parseExcel.cjs`
- **Output files** in `client/src/data/real/`:
  - `realLoans.json` — 7,052 loan objects with all fields (tvm, source, rate, ltv, fico, dti, pricing, etc.)
  - `realStats.json` — pre-computed portfolio stats (WA metrics, distributions, by-state/product/source)
  - `step7Sample.json` — 200 representative loans for the Schedule view
  - `step4Sample.json` — 50 loans with pricing data for the Pricing Sheet
- **Key metrics**: Total UPB $1.861B | WA Rate 3.50% | WA FICO 744 | WA LTV 71.42% | WA DTI 35.56%

## Counterparty Intelligence

- **BuyerRegistry** (`client/src/data/mock/buyerRegistry.ts`): 5 buyers mapped to real institution data (FDIC certs)
- **BuyerInfoCard** / **BuyerDetailModal** (`client/src/components/buyers/`): Compact card + full modal with FDIC Call Report data, loan portfolio KPIs, state/product breakdown, top-12 loans table
- **LenderDrilldownModal** (`client/src/components/buyers/LenderDrilldownModal.tsx`): Per-lender modal showing KPIs, status breakdown, top states, product mix, WA metrics, and top-12 loans — triggered via the ↗ icon next to each lender pill in the filter rail
- **FDIC API**: Proxied at `/api/fdic/institution/:cert` with 24-hour server-side cache; correct endpoint: `api.fdic.gov/banks/institutions?filters=CERT:{cert}&...`

## Landing Page & Cohi AI

- **Route**: `/` → `client/src/pages/Landing.tsx` — full-screen dark-navy hero page, no sidebar
- **LandingNav**: Fixed top bar with SprinkleX logo, "Hey, Maylin 👋" greeting, "Open Analytics →" button
- **HeroSection**: Bottom-anchored search bar, results populate upward, quick-action chips above
- **Cohi AI**: Backend route `POST /api/cohi/chat` in `server/routes.ts`; uses OpenAI `gpt-4o-mini` if `OPENAI_API_KEY` is set, falls back to deterministic keyword-based responses using real portfolio stats
- **Voice Input**: Web Speech API (no package needed) — mic button in search bar
- **Institution Cards**: List and grid mode; Provident (sky), Stonegate (amber), New Penn Financial (rose)
- **Institution Detail**: Reuses `LenderDrilldownModal` with real loan data
- **Comparison Panel**: Floating bar when 2+ institutions pinned; side-by-side modal with green/red best/worst
- **Loan Pools**: `client/src/context/PoolsContext.tsx` — creates "Loan Pool 1", "Loan Pool 2", etc.; renameable, deletable
- **5 Quick Actions**: Top Performing, Lowest Risk, New Listings, State Leaders (dropdown), Compare Selected

## Application Structure

### 9-Step Workflow
1. **Step 1** — Geography (interactive choropleth map, state/county/tract drilldown)
2. **Step 2** — Search Loans (filter, search, portfolio breakdown)
3. **Step 3** — Credit Metrics (FICO, LTV, DTI analysis)
4. **Step 4** — Pricing (rate sheets, WAC, pricing comparison)
5. **Step 5** — Financial Metrics (balance sheet, income statement, bar charts)
6. **Step 6a/6b/6c** — Portfolio Analysis (composition, yields, concentration)
7. **Step 7** — Loan Schedule (full loan detail table)
8. **Step 8** — Summary (executive overview, investment thesis, buyer match guide)
9. **Step 9** — Cohorts (cohort analysis by dimension, scatter plot, detail cards)

### Mobile-First Responsive Design
- **Global overflow containment**: `html { overflow-x: hidden; width: 100% }`, `body { width: 100%; max-width: 100vw; overflow-x: hidden; overflow-wrap: anywhere; word-break: break-word }`, shell uses `w-full overflow-x-hidden`
- **Container page**: `width: 100%; max-width: 1320px; overflow: hidden; padding-inline: 12px` (sm: 20px) — `overflow: hidden` is critical to clip any children that try to escape
- **PanelCard**: `overflow-hidden` on `<section>`, `min-w-0` on header/content; responsive header icons (`h-6 sm:h-7`), title text (`text-xs sm:text-sm`), subtitle (`text-[10px] sm:text-xs`)
- **Tooltip wrapper**: Always use `wrapperClassName="w-full min-w-0 overflow-hidden"` to prevent inline-flex from expanding beyond grid cells
- **KpiStrip**: Cards `w-full min-w-0 overflow-hidden`, equal-height with `h-full`, font scaling `9px→11px` labels, `13px→18px→22px` values
- **TopNav**: `w-full overflow-hidden px-3 sm:px-4` to prevent sticky header from pushing page wider
- **Mobile sidebar**: `w-[260px]` (not `w-full`) when `forceShow`, light overlay `bg-white/60 backdrop-blur-sm`
- **Chart heights**: All charts use responsive heights: `h-[180px] sm:h-[240px]` (donuts), `h-[280px] sm:h-[320px]` (bar), `h-[280px] sm:h-[360px] lg:h-[420px]` (trend)
- **Card value scaling**: All metric cards scale `text-base sm:text-xl` or `text-lg sm:text-2xl` with `break-words` on labels
- **Step8 donuts**: `col-span-6` on mobile (2 per row) vs `col-span-12` before; Investment Thesis + Buyer Match stacks vertically on mobile
- **Code splitting**: All 14 pages lazy-loaded via `React.lazy` in `router.tsx`
- **Pinch-to-zoom**: Viewport meta allows `maximum-scale=5.0, user-scalable=yes`; body `touch-action: pan-x pan-y pinch-zoom`
- **TopNav title**: Mobile uses `px-16` (not `px-[120px]`), `text-[11px]`, `line-clamp-1` to prevent truncation
- **Step1 cards**: "Click for drilldown" hidden on mobile (`hidden sm:block`) so Total Loans & WAC cards match height
- **State pin buttons**: Compact on mobile (`text-[10px]`, short format showing only loan count)
- **Risk exposure cards**: Responsive font sizes (`text-lg sm:text-2xl` for values, `text-[10px] sm:text-xs` for labels)

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

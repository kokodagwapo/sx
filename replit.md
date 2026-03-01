# PeraBida - OFW Financial Management Application

## Overview

PeraBida is a comprehensive financial management application designed specifically for Overseas Filipino Workers (OFW) and their families. The platform focuses on transparent expense tracking, family accountability, and financial education to help OFW families manage their remittances more effectively. The application features a landing page with waitlist signup functionality, currency conversion tools, educational content, and user testimonials showcasing real-world use cases.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript for type safety and modern development
- **Routing**: Wouter for lightweight client-side routing
- **Styling**: Tailwind CSS with custom design system using CSS variables for consistent theming
- **UI Components**: Radix UI primitives with shadcn/ui component library for accessible, customizable components
- **State Management**: TanStack Query for server state management and data fetching
- **Forms**: React Hook Form with Zod validation for robust form handling and schema validation
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework for RESTful API endpoints
- **Language**: TypeScript for end-to-end type safety
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Storage Strategy**: Dual storage implementation with in-memory storage for development and PostgreSQL for production
- **Session Management**: Express sessions with PostgreSQL session store for user authentication
- **API Structure**: RESTful endpoints with proper error handling and validation

### Data Storage Solutions
- **Database**: PostgreSQL as the primary database with Neon as the serverless provider
- **Schema Management**: Drizzle migrations for database schema versioning
- **Data Models**: 
  - Users table for authentication and user management
  - Signups table for waitlist management with email tracking and user preferences
- **Validation**: Zod schemas shared between frontend and backend for consistent data validation

### Development and Build Process
- **Development Server**: Vite dev server with HMR for frontend, Express for backend API
- **Build Process**: Vite for frontend bundling, esbuild for backend compilation
- **Type Checking**: TypeScript compilation across the entire codebase
- **Asset Management**: Vite handles static assets with optimized bundling for production

## External Dependencies

### Database and Infrastructure
- **Neon Database**: Serverless PostgreSQL provider for scalable database hosting
- **Drizzle Kit**: Database migration and schema management tools

### UI and Styling
- **Radix UI**: Comprehensive set of accessible, unstyled UI primitives
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Lucide React**: Icon library for consistent iconography
- **Google Fonts**: Web fonts (Inter, DM Sans, Fira Code, Geist Mono, Architects Daughter)

### Development Tools
- **Replit Integration**: Development environment integration with cartographer and runtime error modal
- **PostCSS**: CSS processing with Tailwind and Autoprefixer plugins

### Form and Data Handling
- **React Hook Form**: Performant forms library with minimal re-renders
- **Hookform Resolvers**: Integration layer between React Hook Form and validation libraries
- **TanStack Query**: Powerful data synchronization for server state management

### Utilities and Libraries
- **Date-fns**: Modern JavaScript date utility library
- **Class Variance Authority**: Utility for creating variant-based component APIs
- **clsx**: Utility for constructing className strings conditionally
- **Nanoid**: Unique ID generator for various application needs
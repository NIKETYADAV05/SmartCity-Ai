# SmartCity AI — Intelligent Urban Management & Citizen Service Platform

> **College / Internship Project**  
> Built with Next.js 16 · React 19 · Tailwind CSS v4 · JavaScript  
> ⚠️ All data shown in the application is **demo data only** — not real government or city statistics.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Folder Structure](#folder-structure)
4. [Architecture](#architecture)
5. [Design System](#design-system)
6. [Modules & Routes](#modules--routes)
7. [Reusable Components](#reusable-components)
8. [Getting Started](#getting-started)
9. [Development Guidelines](#development-guidelines)
10. [Roadmap](#roadmap)

---

## Project Overview

SmartCity AI is a full-stack web application that acts as a bridge between citizens and city administration.  
Citizens can report city issues (potholes, broken streetlights, waste management), track their reports, and receive updates.  
Administrators can manage complaints, monitor city services, and generate insights.  
Future AI modules will provide automatic complaint classification, priority detection, department routing, and city health insights.

---

## Technology Stack

| Layer       | Technology                        | Why                                              |
|-------------|-----------------------------------|--------------------------------------------------|
| Framework   | Next.js 16 (App Router)           | File-based routing, SSR/RSC, API routes          |
| UI          | React 19                          | Component model, concurrent features             |
| Styling     | Tailwind CSS v4                   | Utility-first, design tokens via `@theme`        |
| Language    | JavaScript (JSDoc typed)          | Beginner-friendly, widely understood             |
| Database    | PostgreSQL (planned) via Prisma   | Relational data model fits city entities         |
| API         | Next.js Route Handlers (`/api/*`) | Co-located REST endpoints                        |

---

## Folder Structure

```
smartcity-app/
├── app/                          # Next.js App Router pages
│   ├── layout.js                 # Root layout — wraps everything in AppShell
│   ├── page.js                   # Home page (/)
│   ├── not-found.js              # Global 404 page
│   ├── globals.css               # Design tokens + global base styles
│   │
│   ├── citizen/                  # Citizen-facing pages
│   │   ├── report/page.js        # Report a new issue
│   │   ├── my-reports/
│   │   │   ├── page.js           # List of user's reports
│   │   │   └── [id]/page.js      # Individual report detail + timeline
│   │   ├── map/page.js           # Interactive city map
│   │   ├── notifications/page.js # Notification centre
│   │   └── profile/page.js       # User profile
│   │
│   ├── admin/                    # Administration pages
│   │   ├── page.js               # Admin dashboard
│   │   ├── complaints/page.js    # All complaints management
│   │   ├── departments/page.js   # Department directory
│   │   ├── traffic/page.js       # Traffic monitoring
│   │   ├── waste/page.js         # Waste management
│   │   ├── streetlights/page.js  # Streetlight status
│   │   ├── emergency/page.js     # Emergency incidents
│   │   ├── analytics/page.js     # Charts & trends
│   │   ├── users/page.js         # User management
│   │   └── settings/page.js      # Platform settings
│   │
│   └── ai/                       # AI Engine pages (coming soon)
│       ├── classification/page.js
│       ├── priority/page.js
│       ├── departments/page.js
│       └── insights/page.js
│
├── components/
│   ├── layout/                   # Structural layout components
│   │   ├── AppShell.jsx          # Root shell: sidebar + header + main
│   │   ├── Header.jsx            # Top navigation bar
│   │   ├── Sidebar.jsx           # Left navigation sidebar
│   │   └── PlaceholderPage.jsx   # Reusable "coming soon" page stub
│   │
│   └── ui/                       # Reusable UI primitives
│       ├── Badge.jsx             # Status/label chips
│       ├── Breadcrumb.jsx        # Navigation breadcrumb
│       ├── Button.jsx            # Accessible button with variants
│       ├── Card.jsx              # Surface container (Card, CardHeader, CardDivider)
│       ├── ComingSoonBadge.jsx   # "Soon" tag for AI nav items
│       ├── EmptyState.jsx        # Empty list placeholder
│       ├── Input.jsx             # Labeled text input
│       ├── PageHeader.jsx        # Page title + subtitle + actions
│       ├── Select.jsx            # Styled native select
│       ├── StatCard.jsx          # KPI metric tile
│       └── Textarea.jsx          # Multi-line text input
│
├── lib/                          # Non-UI shared utilities
│   ├── navigation.js             # Single source of truth for all nav routes
│   ├── demo-data.js              # Realistic placeholder data (clearly labelled)
│   └── utils.js                  # cn(), formatDate(), formatNumber(), etc.
│
├── public/                       # Static assets
├── next.config.mjs               # Next.js + Tailwind v4 Turbopack config
├── jsconfig.json                 # Path aliases (@/*)
├── eslint.config.mjs             # ESLint config
└── README.md                     # This file
```

---

## Architecture

```
Browser
  │
  ▼
Next.js App Router (RSC + Client Components)
  │
  ├── layout.js  ──►  AppShell (client)
  │                     ├── Sidebar (nav + active state via usePathname)
  │                     └── Header (mobile toggle, notifications, user)
  │
  ├── page.js (RSC)  ──►  Server-rendered page content
  │                         Uses demo-data.js for now
  │                         Will use API routes / server actions later
  │
  └── api/ (future)  ──►  REST endpoints → Prisma → PostgreSQL
```

**Key architectural decisions:**

- **React Server Components by default** — pages are RSC; only interactive parts (Sidebar, Header, form components) are `"use client"`.
- **Single navigation source of truth** — `lib/navigation.js` drives both the sidebar and can later drive breadcrumbs, route guards, and `<head>` metadata.
- **No external icon library** — inline SVG icons keep the bundle small and avoid dependency churn in the foundation phase.
- **No global state library** — state is local to components via `useState`; a state manager (Zustand/Jotai) can be added when genuinely needed.
- **Tailwind CSS v4** — design tokens live in `globals.css` under `@theme inline`. No `tailwind.config.js` needed.

---

## Design System

All design tokens are defined in [`app/globals.css`](app/globals.css) under `@theme inline`:

| Token group   | Example                                      |
|---------------|----------------------------------------------|
| Brand         | `--color-brand-500` → `#3b82f6` (blue-500)   |
| Status        | `--color-success-500`, `--color-danger-500`  |
| Text          | `--color-text-primary`, `--color-text-muted` |
| Surface       | `--color-surface`, `--color-surface-muted`   |
| Sidebar       | `--color-sidebar-bg` → `#0f172a` (slate-900) |
| Spacing       | `--spacing-sidebar: 16rem`, `--spacing-header: 3.5rem` |

Component variants (Button, Badge, StatCard) use semantic variant names: `primary | secondary | ghost | danger | success | warning | info | default`.

---

## Modules & Routes

### Citizen Portal
| Route                          | Status      | Description                          |
|-------------------------------|-------------|--------------------------------------|
| `/`                           | ✅ Live      | Dashboard with KPIs and recent reports |
| `/citizen/report`             | ✅ Live      | Submit new city issue with Geoapify GPS picker |
| `/citizen/my-reports`         | ✅ Live      | Report list with filters             |
| `/citizen/my-reports/[id]`    | ✅ Live      | Report detail + status timeline + Geoapify Map |
| `/citizen/map`                | ✅ Live      | Interactive city map (Geoapify + Leaflet) |
| `/citizen/notifications`      | ✅ Live      | Notification centre                  |
| `/citizen/profile`            | 🔲 Stub      | User profile                         |

### Administration
| Route                    | Status      | Description                    |
|--------------------------|-------------|--------------------------------|
| `/admin`                 | ✅ Live      | Admin KPI dashboard            |
| `/admin/complaints`      | 🔲 Stub      | Complaints management table    |
| `/admin/departments`     | ✅ Live      | Department directory + load    |
| `/admin/traffic`         | 🔲 Stub      | Traffic monitoring             |
| `/admin/waste`           | 🔲 Stub      | Waste management               |
| `/admin/streetlights`    | 🔲 Stub      | Streetlight status             |
| `/admin/emergency`       | 🔲 Stub      | Emergency incidents            |
| `/admin/analytics`       | 🔲 Stub      | Charts and trends              |
| `/admin/users`           | 🔲 Stub      | User management                |
| `/admin/settings`        | 🔲 Stub      | Platform settings              |

### AI Engine (all stubs — no fake AI implemented)
| Route                    | Planned Feature                          |
|--------------------------|------------------------------------------|
| `/ai/classification`     | NLP complaint auto-categorisation        |
| `/ai/priority`           | Urgency scoring                          |
| `/ai/departments`        | Smart department routing                 |
| `/ai/insights`           | AI-generated city health reports         |

---

## Reusable Components

| Component          | Location                         | Purpose                                         |
|--------------------|----------------------------------|-------------------------------------------------|
| `AppShell`         | `components/layout/AppShell.jsx` | Root layout shell with sidebar/header state     |
| `Sidebar`          | `components/layout/Sidebar.jsx`  | Collapsible nav with active route detection     |
| `Header`           | `components/layout/Header.jsx`   | Top bar with mobile toggle and notifications    |
| `PlaceholderPage`  | `components/layout/PlaceholderPage.jsx` | Professional stub for unbuilt pages     |
| `Button`           | `components/ui/Button.jsx`       | 5 variants, 3 sizes, loading state              |
| `Badge`            | `components/ui/Badge.jsx`        | Status chips with dot indicator                 |
| `Card`             | `components/ui/Card.jsx`         | Surface container + CardHeader + CardDivider    |
| `StatCard`         | `components/ui/StatCard.jsx`     | KPI tile with trend indicator                   |
| `Input`            | `components/ui/Input.jsx`        | Accessible text input with validation states    |
| `Select`           | `components/ui/Select.jsx`       | Styled native select                            |
| `Textarea`         | `components/ui/Textarea.jsx`     | Multi-line input                                |
| `PageHeader`       | `components/ui/PageHeader.jsx`   | Page title + subtitle + action slot             |
| `Breadcrumb`       | `components/ui/Breadcrumb.jsx`   | Nav breadcrumb trail                            |
| `EmptyState`       | `components/ui/EmptyState.jsx`   | Empty list placeholder                          |

---

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
open http://localhost:3000
```

**Requirements:** Node.js 18+

---

## Development Guidelines

1. **Don't rewrite working code** — when adding features, extend existing files; don't replace them.
2. **Keep components small** — if a component exceeds ~150 lines, consider splitting it.
3. **RSC by default** — only add `"use client"` when the component genuinely needs browser APIs or event handlers.
4. **Demo data label** — any file that uses `demo-data.js` must display a visible disclaimer to the user.
5. **No real credentials** — never commit API keys, DB connection strings, or real government data.
6. **Follow naming conventions:**
   - Components: `PascalCase.jsx`
   - Pages: `page.js` (Next.js App Router convention)
   - Utilities: `camelCase.js`

---

## Roadmap

### Phase 1 — Foundation ✅ (current)
- Project structure, design system, layout shell
- Navigation, reusable UI components
- Home, report detail, notifications, departments (live data)
- All other pages as professional stubs

### Phase 2 — Citizen Features (next)
- Report submission form with validation
- Photo upload
- Interactive city map (Leaflet.js)
- Profile page

### Phase 3 — Admin Features
- Complaints management with filters and actions
- Analytics with charts (Recharts or Chart.js)
- User management table

### Phase 4 — Backend
- PostgreSQL database with Prisma ORM
- REST API routes for all entities
- Authentication (NextAuth.js or Clerk)

### Phase 5 — AI Engine
- Complaint classification model integration
- Priority scoring
- Department routing
- City insights report generation

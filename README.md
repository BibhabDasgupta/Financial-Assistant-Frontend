# Finance Assistant Frontend

A modern, responsive frontend for the Financial Assistant app. Built with React + TypeScript, Vite, Tailwind CSS and a small design system of accessible UI primitives. The app provides a dashboard experience for tracking transactions, receipts, budgets, recurring payments and analytics with an opinionated structure for services, contexts and reusable UI components.

## Quick overview

- Framework: React 18
- Bundler / dev server: Vite
- Language: TypeScript (project contains a few JS helper files for auth)
- Styling: Tailwind CSS with custom theme tokens
- UI primitives: Radix UI, shadcn-style components, lucide icons
- Data fetching: @tanstack/react-query + Axios
- Routing: react-router-dom (v6)
- Other notable libs: zod, react-hook-form, sonner (toasts), recharts

This repository contains the frontend only. It expects a backend API (examples in the code point to `http://localhost:5000/api/v1` by default) that exposes authentication and REST endpoints for transactions, receipts, categories, budgets, analytics, etc.

---

## Getting started

Prerequisites

- Node.js (recommended 18+)
- npm or pnpm/yarn

Install dependencies

```powershell
# from repository root
npm install
```

Run the dev server

```powershell
npm run dev
```

Build for production

```powershell
npm run build
```

Preview the production build (locally)

```powershell
npm run preview
```

Linting

```powershell
npm run lint
```

---

## Environment variables

The app reads API endpoints and versions from environment variables exposed to Vite. The code references the following variables (examples):

- `VITE_API_URL` or `VITE_API_BASE_URL` — base URL of the backend (e.g. `http://localhost:5000`)
- `VITE_API_VERSION` — API version segment (e.g. `v1`)

Create a `.env` (or `.env.local`) in the project root and add variables like:

```text
VITE_API_BASE_URL=http://localhost:5000
VITE_API_VERSION=v1
VITE_API_URL=http://localhost:5000/api/v1
```

Note: Vite prefixes environment variables exposed to the client with `VITE_`.

---

## Scripts

The `package.json` includes the following scripts:

- `dev` — start Vite dev server
- `build` — produce a production build with Vite
- `build:dev` — build using the development mode
- `preview` — serve the production build locally
- `lint` — run ESLint

---

## Project structure (key folders)

Root

- `index.html` — Vite HTML entry
- `package.json`, `tsconfig.json`, `vite.config.ts`, `tailwind.config.ts`

`src/` (application source)

- `main.tsx` — app entry; mounts React tree and wraps with `ThemeProvider`
- `App.tsx` — router and global providers (React Query, Tooltip, AuthProvider)
- `index.css`, `App.css` — global styles and Tailwind imports
- `components/` — shared React components and UI primitives
  - `DashboardLayout.tsx`, `AppSidebar.tsx`, `TopBar.tsx`, `ProtectedRoutes.tsx`, `ThemeProvider.tsx`, `ThemeToggle.tsx`
  - `ui/` — small UI components (button, input, dialog, toast, tooltip, table, etc.) — these are reusable primitives used across pages
- `context/` — context providers (for example `AuthContext.tsx` for authentication state)
- `hooks/` — custom hooks (e.g. `use-mobile.tsx`, `use-toast.ts`)
- `lib/` — small utilities (`utils.ts`)
- `pages/` — page-level routes and views (Dashboard, Transactions, Analytics, Receipts, Categories, Budgets, Recurring, Settings, Login, Index, NotFound, AuthCallback)
- `services/` — API clients and service helpers
  - `transactService.ts` — main API client built around Axios; exports helper objects like `transactionApi`, `receiptApi`, `categoryApi`, `analyticsApi`, `budgetApi`, `recurringApi`, `exportApi` and an Axios instance with request/response interceptors
  - `authService.js` — authentication helpers and another Axios instance used for auth flows (token helpers, login redirects, token refresh and user profile helpers)

Public assets: `public/` contains static assets such as `placeholder.svg` and `robots.txt`.

---

## Routing and pages

Routing is handled by `react-router-dom` and defined in `src/App.tsx`.

- Public routes: `/` (landing index), `/login`, `/auth/callback`
- Protected routes (requires auth): `/dashboard`, `/transactions`, `/analytics`, `/receipts`, `/categories`, `/budgets`, `/recurring`, `/settings`

The protected area is wrapped by `ProtectedRoute` and displayed inside the `DashboardLayout` which composes the sidebar, top bar and page content area.

---

## Authentication

Auth flow uses OAuth-style redirects for providers (see `authService.js` functions `initiateGoogleLogin` and `initiateGithubLogin`). Tokens are stored in `localStorage` under keys `access_token`, `refresh_token`, and a `user` object. Both Axios instances include interceptors to attach the access token and to attempt token refresh on 401 errors.

Key helpers:

- `src/services/authService.js` — Axios instance for auth with helpers: `setAccessToken`, `getAccessToken`, `setRefreshToken`, `getRefreshToken`, `getCurrentUser`, `logout`, and `handleAuthCallback`.
- `src/services/transactService.ts` — Axios instance used for most API calls; sets `Authorization` header and will try to refresh tokens when necessary.
- `src/context/AuthContext.tsx` — React context that centralizes authentication state and exposes `useAuth()` hook used in pages (example: `Index.tsx` checks `isAuth` and `loading` to redirect to `/dashboard` or `/login`).

Security note: current token storage uses `localStorage`. Consider moving to httpOnly cookies for improved security if backend supports it.

---

## Theming and UI

- `ThemeProvider` wraps the app and is configured to use CSS class-based dark mode; `tailwind.config.ts` defines custom theme tokens and color variables.
- The project uses a component pattern similar to shadcn-ui where small accessible primitives live under `src/components/ui/` and are composed in higher-level components.

---

## API surface (quick reference)

The `transactService.ts` exports grouped objects for interacting with backend endpoints. Example usage:

```ts
import { transactionApi } from '@/services/transactService';

// fetch transactions
const res = await transactionApi.getAll({ page: 1, limit: 20 });

// create transaction
await transactionApi.create({ type: 'expense', amount: 12.5, description: 'Lunch', date: '2025-01-01', category_id: 'abc' });
```

Other groups exposed by the service include `receiptApi`, `categoryApi`, `analyticsApi`, `budgetApi`, `recurringApi`, and `exportApi` (CSV/Excel/PDF export endpoints).

---

## Development notes & recommendations

- Add a `.env.example` with the common `VITE_` variables so contributors know what to provide.
- Consider moving all auth helper code to TypeScript for consistency.
- Add unit and integration tests (Jest + React Testing Library or Vitest) for critical components and services.
- If you need server-side rendering or SEO, evaluate adapting to Next.js — right now this is a SPA.

Small proactive improvements (low risk):

- Add `README` badges (CI, license) and a short contributing guide.
- Add a script for type-checking: `tsc --noEmit`.

---

## Contributing

1. Fork the repository
2. Create a branch for your feature/fix
3. Run `npm install` and `npm run dev` to test locally
4. Open a PR describing the change

Please follow the project's style (TypeScript for new code, prefer hooks and context for cross-cutting state).

---

## Where to look (key files)

- `src/main.tsx` — application entry and provider wiring
- `src/App.tsx` — routes and providers (react-query, tooltip, toasts)
- `src/context/AuthContext.tsx` — authentication state
- `src/components/DashboardLayout.tsx` — layout for protected pages
- `src/services/transactService.ts` — API clients and Axios config
- `src/services/authService.js` — auth helpers and token storage
- `tailwind.config.ts` — theme tokens and Tailwind customizations
- `vite.config.ts` — Vite dev server config and path alias (`@` -> `./src`)

---

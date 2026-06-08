# Sales Insight Hub

Sales Insight Hub is a production-ready React CRM for R&D tax credit sales workflows. It includes a billing calculator, client dashboard, engagement profiles, and document request management.

## Tech stack

- React 19 + TypeScript
- Vite 7
- TanStack Router + TanStack Query
- Zustand (client state)
- Tailwind CSS 4
- shadcn/ui (Radix primitives)

## Requirements

- Node.js 20+
- npm 10+

## Installation

```bash
git clone <your-repo-url>
cd sales-insight-hub
npm install
```

Copy the example environment file if you plan to connect an API later:

```bash
cp .env.example .env
```

## Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Build

```bash
npm run build
```

Production assets are written to `dist/`.

Preview the production build locally:

```bash
npm run preview
```

## Deployment

This app is a static single-page application and works on Vercel, Netlify, GitHub Pages (with SPA fallback), or any static host.

### Vercel

1. Import the repository in Vercel.
2. Framework preset: **Vite**
3. Build command: `npm run build`
4. Output directory: `dist`

`vercel.json` is included for client-side routing fallback.

### Netlify

1. Import the repository in Netlify.
2. Build command: `npm run build`
3. Publish directory: `dist`

`netlify.toml` is included for SPA redirects.

## Environment variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Base URL for future API integration | `/api` |

Only `VITE_*` variables are exposed to the browser.

## Project structure

```
src/
  assets/        Static assets
  components/    Reusable UI and feature components
  constants/     Shared constants
  data/          Mock/demo data
  hooks/         Custom React hooks
  layouts/       Reserved for layout wrappers
  pages/         Route-level page components
  routes/        TanStack Router file routes
  services/      API client helpers
  store/         Zustand stores
  types/         Shared TypeScript types
  utils/         Pure utility functions
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |

## Notes

- Authentication is client-side demo auth backed by localStorage.
- Calculator and CRM data persist in the browser for demo purposes.
- Replace mock stores with API calls via `src/services/api.ts` when connecting a backend.

## License

Private / proprietary. Update before publishing if needed.

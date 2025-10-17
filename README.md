# Bubbling Bath Delights · Adaptive Commerce Platform

This repository now runs on **Next.js 14 with the App Router, React Server Components, Turbopack, Tailwind CSS, Framer Motion, Zustand, TanStack Query, and shadcn/ui**. It consolidates the storefront, API routes, and AI helpers into a single edge-optimised monorepo that embraces decentralized identity, intelligent caching, and autonomous insights.

## 🧭 Architectural Overview

```
bubblingbathdelights/
├── app/                  # Next.js App Router (SSR + ISR + edge APIs)
│   ├── (auth)/           # Login, workspace access
│   ├── admin/            # Analytics, product ops, AI workbench
│   ├── employee/         # Order fulfilment, customer care, inquiries
│   ├── shop/             # Catalogue, ritual builder, cart
│   └── api/              # Edge Runtime routes for products, AI, revalidation
├── components/           # shadcn/ui-inspired building blocks and shared widgets
├── lib/                  # Supabase clients, caching, AI helpers, Zustand stores, zod schemas
├── public/               # Static assets
├── styles/               # Tailwind theming and global styles
├── docker/               # Container tooling (Dockerfile + compose)
├── turbo.json            # Turborepo pipeline configuration
└── package.json          # Next.js + TypeScript workspace definition
```

### Key upgrades
- **Next.js 14 + App Router** for hybrid rendering, React Server Components, and built-in optimisations.
- **Edge Runtime** API routes for products, AI copy generation, and ISR revalidation.
- **React Query + Zustand** for intelligent client state, optimistic updates, and cache hydration.
- **Supabase integration** with optimised queries, row-level security policies (implemented in Supabase SQL), and Redis-backed caching via `lib/utils/cache`.
- **AI-assisted workflows** (Codex-style) surfaced through `/admin/ai-workbench` and browser-based fallbacks in `lib/ai/local-processing`.
- **Decentralised identity roadmap** baked into `/app/(auth)/login` and the documentation for future DID/VC adoption.

## 🚀 Getting Started

```bash
# Install dependencies
default_registry=https://registry.npmjs.org/
NODE_ENV=development npm install

# Launch the dev server (Turbopack powered)
npm run dev
```

The app runs at `http://localhost:3000` with hot reload. API routes are accessible under `/api/*` from the same origin.

### Required environment variables

Create `.env.local` using the template below (see `.env.example` in the repo):

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=public-anon-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=service-role-or-anon
SUPABASE_SERVICE_ROLE_KEY=service-role-key
REDIS_URL=redis://default:password@localhost:6379
```

- `SUPABASE_SERVICE_ROLE_KEY` enables server components and edge routes to enforce granular row-level security policies that you configure inside Supabase.
- `REDIS_URL` is optional; if omitted the cache falls back to an in-memory Map, keeping local development frictionless.

### Local data & credentials

For rapid demos the project ships with JSON-backed storage under `data/` (products, orders, customers, seasonal content, and settings).

- **Admin portal**: `aurora@bubblingbathdelights.com` · password `aurora-admin`
- **Employee console**: `elysian@bubblingbathdelights.com` · password `elysian-staff`

Sessions are stored in an httpOnly cookie signed with `AUTH_SECRET`. Update credentials by editing `data/settings.json` and restarting the dev server.

### Available scripts

| Script         | Purpose                                             |
|----------------|-----------------------------------------------------|
| `npm run dev`  | Launch Next.js (App Router + Turbopack)             |
| `npm run build`| Create a production build with ISR metadata         |
| `npm run start`| Serve the production build                          |
| `npm run lint` | Run ESLint against the whole repo                   |
| `npm run typecheck` | Validate TypeScript types (no emit)            |
| `npm run turbo -- <task>` | Execute any pipeline task via Turborepo  |

## 🧠 Intelligent Experience Highlights

- **Adaptive ritual builder** at `/shop/customize` uses Zustand persistence, Framer Motion micro-interactions, and optimistic UI confirmations to keep guests in flow.
- **Product listing & detail** pages render as React Server Components with cached Supabase queries (`lib/supabase/optimized-queries.ts`) and edge caching hints.
- **Admin AI workbench** streams prompts through `/api/ai/generate` (edge runtime) with graceful client-side fallbacks when OpenAI credentials are unavailable.
- **Employee portal** surfaces order, customer, and inquiry queues with optimistic status updates aligned to a zero-trust future (JWT/VC integration planned).
- **Redis-aware caching layer** (`lib/utils/cache.ts`) gives you drop-in edge caching for products, metrics, or any expensive Supabase queries.

## 🐳 Container & Deployment

Docker assets live under `docker/`:

```bash
# Build the production image
docker build -f docker/Dockerfile -t bubblingbathdelights .

# Run the full stack (web + Redis)
cd docker && docker compose up
```

### Suggested deployment path
1. **Vercel** for the Next.js app + edge functions (set env vars in the dashboard, enable ISR).  
2. **Supabase** for Postgres, Storage, Auth, and Edge Functions (define RLS policies and edge logic for analytics/fraud).  
3. **Upstash/Redis Cloud** or your preferred managed Redis for caching.  
4. **Grafana/Tempo/Prometheus** for observability hooked into the OpenTelemetry events fired from `lib/utils/observability.ts`.  
5. **Kubernetes (GKE/Fly)** once you require multi-region self-healing containers—use the Dockerfile as the base image and wire in your service mesh + JWT attestation between edge functions.

## 🔐 Security & Identity Roadmap

- Implement Supabase Row-Level Security (RLS) policies that scope product/order/customer tables to verified roles.
- Extend `/app/(auth)/login` to consume decentralised identifiers (DIDs) & verifiable credentials once your SSI provider is ready.
- Use Supabase Edge Functions for fraud detection, advanced analytics, and verifiable credential minting.
- Adopt zero-trust service-to-service authentication by signing JWTs for internal fetches from API routes to edge functions.

## 📈 Observability & Experimentation

- Edge routes emit structured telemetry via `lib/utils/observability.ts`; plug it into your OpenTelemetry collector + Grafana dashboards.
- Turborepo caching keeps builds fast across CI/CD. Combine with GitHub Actions (or Vercel pipelines) to automate linting, type checks, and preview deployments.
- Encourage continuous experimentation with feature branches, on-demand ISR, and AI-generated copy previews in the admin workbench.

## 🧪 Testing checklist

- `npm run lint` and `npm run typecheck` ensure code health.
- Add Playwright smoke journeys for `/shop`, `/shop/customize`, `/admin`, and `/employee` routes.
- Use Supabase Edge Functions’ test harness to validate fraud/analytics logic in isolation.

## 📄 Additional Docs

Strategic guides from the previous iteration remain relevant:
- `docs/modernization-roadmap.md`
- `docs/decentralized-identity-roadmap.md`

They align with the new Next.js foundation and inform upcoming SSI, privacy, and experimentation workstreams.

---

Questions or feedback? Open an issue or ping the “Working with Bubbles” AI workbench inside the admin portal.

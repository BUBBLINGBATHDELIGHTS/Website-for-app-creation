# Modernization Roadmap

This roadmap outlines the phased adoption of the new Next.js 14 architecture, intelligent data pipelines, and emotionally responsive commerce capabilities.

## Phase 1 · Foundation (Complete)
- Migrate storefront + API to a unified Next.js 14 App Router project.
- Adopt TypeScript everywhere, enforce linting + type checking in Turborepo.
- Integrate Tailwind, shadcn/ui, Framer Motion, Zustand, and TanStack Query.
- Containerise the platform via Dockerfile + docker-compose.

## Phase 2 · Intelligence (In progress)
- Configure Supabase Row-Level Security and policies for products, orders, customers, reviews, discounts.
- Introduce Supabase Edge Functions for fraud analytics, seasonal curation, and insights summarisation.
- Persist Redis caching (Upstash/ElastiCache) and feed OpenTelemetry traces to Grafana.
- Enrich the AI Workbench with edge-deployed models and on-demand ISR regeneration.

## Phase 3 · Experience
- Expand Framer Motion-driven emotional UI states, synchronized with customization mood data.
- Launch AI-powered recommendation engine leveraging Supabase vector embeddings.
- Add coherence dashboard visualising mood, satisfaction, and conversion telemetry.
- Implement skeletons, optimistic updates, and progressive enhancement for core flows.

## Phase 4 · Scale & Security
- Deploy to Kubernetes (GKE/Fly) with service mesh, JWT-based service auth, and auto-healing.
- Integrate decentralized identity (DIDs/VCs) for admin + employee access.
- Extend zero-trust posture across edge functions, Redis, and Supabase via signed tokens.
- Automate experimentation pipelines, including AI-generated campaign tests and feature toggles.

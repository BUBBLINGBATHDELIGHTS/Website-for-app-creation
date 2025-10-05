# Modernization roadmap

This roadmap captures the next wave of platform improvements so the Bubbling Bath Delights stack can evolve into an adaptive, AI-assisted commerce experience. It focuses on three foundational tracks requested by the leadership team: containerisation, TypeScript adoption, and an upgraded monorepo toolchain.

---

## 1. Containerising the platform

### Objectives
- Reproduce production-like environments locally and in CI.
- Standardise deployable artefacts for the storefront (`client`), API (`server`), and AI microservice (`ai-service`).
- Prepare for Kubernetes by defining clear service boundaries, health endpoints, and runtime configuration expectations.

### Deliverables
1. **Dockerfiles** – Template multi-stage builds already live in [`ops/`](../ops/):
   - [`Dockerfile.client`](../ops/Dockerfile.client) builds the Vite storefront, bakes environment defaults, and serves the compiled bundle through Nginx with SPA-aware routing.
   - [`Dockerfile.server`](../ops/Dockerfile.server) compiles the Express API (post-TypeScript migration) and ships only the production `dist/` output plus runtime dependencies.
   - [`Dockerfile.ai-service`](../ops/Dockerfile.ai-service) installs the FastAPI requirements and exposes `uvicorn` on port 8000.
   - [`nginx.conf`](../ops/nginx.conf) provides caching hints for fingerprinted assets.

2. **Compose orchestration** – [`docker-compose.yml`](../ops/docker-compose.yml) wires the services together alongside a local Supabase-compatible Postgres container. Environment variables are sourced from a `.env` file at the repository root so secrets never live in version control.

3. **Supporting files** – add an `.dockerignore` (not yet committed) that excludes `node_modules`, build artefacts, and local secrets to keep image layers slim.

### Rollout steps
1. Create `.env` at the repository root with the variables referenced in `docker-compose.yml` (Supabase keys, SMTP, OpenAI, etc.).
2. Build and start the stack: `docker compose -f ops/docker-compose.yml up --build`.
3. Verify the following endpoints:
   - Storefront: <http://localhost:5173>
   - API: <http://localhost:4000/api/health> (add a health route during TypeScript migration)
   - AI service: <http://localhost:8000/docs>
4. Push images to the container registry that backs your Kubernetes cluster (e.g., `gcr.io`, `ghcr.io`).
5. Translate the compose definitions into Kubernetes manifests or Helm charts, layering in secrets management (Google Secret Manager, Doppler, or Sealed Secrets).

---

## 2. Migrating the workspaces to TypeScript

### Guiding principles
- Adopt TypeScript incrementally, converting the build pipelines and linting rules first.
- Surface type coverage metrics so the team can prioritise modules with the highest risk (payments, AI actions, inventory adjustments).
- Generate shared interface packages (e.g., `types/api`) inside the monorepo to synchronise client/server contracts.

### Migration checklist
1. **Tooling**
   - Install `typescript`, `ts-node`, and `tsconfig-paths` at the root. Add `@types/node`, `@types/react`, and testing type packages.
   - Update workspace scripts:
     - `client`: `npm run typecheck` → `tsc --noEmit`.
     - `server`: `npm run build` → `tsc -p tsconfig.build.json` and produce `dist/` for Docker.
   - Configure ESLint with `@typescript-eslint/parser` and `@typescript-eslint/eslint-plugin`.

2. **Configuration**
   - Create base `tsconfig.base.json` at the repo root defining module resolution, path aliases, and strict options (`"strict": true`, `"exactOptionalPropertyTypes": true`).
   - Create workspace-specific configs that extend the base:
     - `client/tsconfig.json` for Vite + React.
     - `server/tsconfig.json` for Node 18 with ES2022 targets.

3. **Source conversion priorities**
   - **Shared models** – define `Product`, `Order`, `WishlistItem`, `WorkspaceTicket`, etc., in a shared `@bubblingbath/types` package to remove duplicated shapes.
   - **Supabase integration** – generate types via `supabase gen types typescript --project-ref YOUR_REF` and consume them in database access layers.
   - **Express routes** – type request/response objects (e.g., `Request<Params, ResBody, ReqBody>`) and middleware context, especially for authentication and workspace guards.
   - **React contexts/hooks** – convert `AuthContext`, `CartContext`, `WishlistContext`, and new Zustand stores to typed hooks with discriminated unions for reducer actions.
   - **AI service contracts** – publish OpenAPI schemas for the FastAPI endpoints, then share them with the client via `openapi-typescript` to guarantee request/response compatibility.

4. **Testing & CI**
   - Extend the CI pipeline to run `npm run lint`, `npm run typecheck`, and relevant unit/integration tests on each workspace.
   - Track type coverage with `ts-prune`/`type-coverage` and set thresholds before merging feature work.

---

## 3. Monorepo tooling recommendation

### Recommendation: **Turborepo**
Turborepo aligns closely with the current npm workspace structure, provides incremental builds with remote caching, and plays well with Vite, Express, FastAPI (via custom pipelines), and eventual Kubernetes deployments. Its configuration is lighter than Nx while still unlocking parallel tasks and dependency graph awareness.

#### Configuration outline
1. Install Turborepo globally or via dev dependency: `npm install -D turbo` at the root.
2. Add a `turbo.json` file:
   ```json
   {
     "$schema": "https://turbo.build/schema.json",
     "pipeline": {
       "lint": {
         "outputs": []
       },
       "typecheck": {
         "dependsOn": ["^build"],
         "outputs": []
       },
       "build": {
         "dependsOn": ["^build"],
         "outputs": ["dist/**", "client/dist/**"]
       },
       "test": {
         "dependsOn": ["^build"],
         "outputs": []
       }
     }
   }
   ```
3. Update workspace scripts to call Turborepo:
   - Root `package.json`:
     ```json
     {
       "scripts": {
         "dev": "turbo run dev --parallel",
         "build": "turbo run build",
         "lint": "turbo run lint",
         "typecheck": "turbo run typecheck",
         "test": "turbo run test"
       }
     }
     ```
   - Each workspace defines `dev`, `build`, `lint`, `typecheck`, and `test` scripts that Turborepo can invoke.
4. Configure remote caching using Vercel, Google Cloud Storage, or S3 so CI artefacts can be reused locally.
5. Add a root-level `.turbo` directory to `.gitignore` if not already present.

### Alternative: **Nx**
If the team anticipates heavy schematics usage, granular dependency constraints, or wants to mix multiple languages, Nx is a solid alternative. The trade-offs include a steeper learning curve and more verbose configuration. Nx also excels when you need first-class generator support for libraries and code scaffolding.

### Next actions
- Pilot Turborepo locally (`npx turbo run build`) to ensure the current scripts are compatible.
- Once stable, integrate Turborepo into the CI pipeline and measure build time improvements.
- Document monorepo conventions (naming, dependency boundaries, shared packages) in the engineering handbook.

---

By executing these three tracks, the team lays the groundwork for the advanced roadmap items (Supabase RLS, vector search, autonomous agents, Kubernetes) without blocking day-to-day development. Each track can proceed in parallel, with Dockerisation unblocking infrastructure, TypeScript improving safety, and Turborepo delivering faster feedback loops.

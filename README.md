# Bubbling Bath Boutique

A full-stack e-commerce platform for artisanal bath and body products. The React storefront keeps the original playful styling while layering in catalogue filters, wishlist support, guest and loyalty checkout flows, role-gated portals for employees and admins, and a Supabase/Postgres-backed API that powers products, orders, reviews, inventory, and analytics.

## Project structure

```
├── client              # React + Vite storefront
│   ├── src
│   │   ├── pages       # Shop, product detail, wishlist, admin, employee, login, tracking
│   │   ├── components  # Cart drawer, checkout flow, access gate, auth guards
│   │   ├── context     # Cart, Supabase auth, and wishlist providers
│   │   └── lib         # Supabase browser client
├── server              # Node/Express API connected to Supabase
│   ├── migrations      # Knex migrations for catalogue, orders, wishlist, discounts, etc.
│   ├── knexfile.js     # Environment-aware Knex configuration
│   └── src
│       ├── lib         # Database bootstrap, caching, Supabase service client, mailer
│       ├── middleware  # Supabase JWT auth helpers
│       └── routes      # Products, orders, wishlist, employees, admin, payments
├── ai-service          # FastAPI service that wraps OpenAI for AI-assisted tooling
├── package.json        # Workspace configuration
└── README.md
```

## Prerequisites

- Node.js 18+
- npm 8+
- Python 3.11+
- A Supabase project with Postgres enabled
- (Optional) SMTP credentials for transactional email (order confirmations)

## Environment variables

### Client (`client/.env`)

```
VITE_API_URL=https://api.yourdomain.com/api
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=public-anon-key
VITE_PREVIEW_ACCESS_CODE=staging-preview-code
VITE_AI_SERVICE_URL=https://ai.yourdomain.com
```

> `VITE_PREVIEW_ACCESS_CODE` hides the storefront behind an access prompt while you iterate. Leave it blank to disable the preview gate.

### Server (`server/.env`)

```
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.YOUR_PROJECT_REF.supabase.co:5432/postgres
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=service-role-key
PGSSLMODE=require
# STRIPE_SECRET_KEY=sk_test_123            # Optional for payment intents
# CLIENT_ORIGIN=https://yourdomain.com     # Optional CORS override for production
# SMTP_HOST=smtp.postmarkapp.com           # Optional email transport
# SMTP_PORT=587
# SMTP_USER=apikey
# SMTP_PASSWORD=your-password
# SMTP_FROM=orders@bubblingbathdelights.com
MAINTENANCE_MODE=true
PREVIEW_ACCESS_TOKEN=staging-preview-code
# Optional: ensure every admin/employee request presents a verified email header
# WORKSPACE_ACCESS_EMAIL_DOMAIN=bubblingbathdelights.com
```

> The API enforces `MAINTENANCE_MODE` when set to `true`, requiring requests to include `X-Preview-Token`. The client automatically supplies the value from `VITE_PREVIEW_ACCESS_CODE` so that your staging deployment stays private.

### AI service (`ai-service/.env`)

```
OPENAI_API_KEY=sk-your-openai-key
OPENAI_MODEL=gpt-4.1-mini
OPENAI_ORG=
AI_ALLOWED_ORIGINS=https://bubblingbathdelights.com,https://admin.bubblingbathdelights.com
```

> The AI microservice falls back to curated copy whenever the OpenAI key is absent so you can continue QA without external calls.

## Setup

Install all workspaces from the repository root:

```bash
npm install
```

> **Note on restricted environments:** if your network blocks access to scoped packages (for example `@headlessui/react`) the
> install command will fail with `403 Forbidden`. The repo ships with a `.npmrc` that points to `https://registry.npmmirror.com/` to help in
> corporate or sandboxed environments—adjust the registry if your policy requires a different mirror. Alternatively, download the dependency
> tarballs on a machine with public internet access and place them into a private Verdaccio / npm proxy that your environment can reach. Once
> the registry issue is resolved, rerun `npm install` to generate the workspace `package-lock.json` files.

Run database migrations (creates and updates customers, products, categories, reviews, wishlists, discounts, employees, orders, shipments, and supporting tables):

```bash
npm run --workspace server migrate
```

## Local development

Start the Express API (listens on port 4000 by default):

```bash
npm run dev:server
```

In a second terminal, launch the Vite dev server for the storefront (port 5173):

```bash
npm run dev:client
```

Sign in with a Supabase Auth user whose `app_metadata.role` (or `user_metadata.role`) equals `admin` to view `/admin`, `employee` to access `/employee`, or any authenticated `customer` to manage wishlists and leave reviews. Guests can still browse, add to cart, and check out with the 10% loyalty incentive offered during checkout.

## Feature summary

- **Catalogue browsing** – Filter, search, sort, and paginate the live product listing. Related items appear on product detail pages, and reviews are powered by Supabase-backed submissions.
- **Wishlist + reviews** – Logged-in customers can heart products, manage their wishlist, and leave product feedback. Wishlists persist in Postgres.
- **Checkout** – Guest checkout remains available while offering an optional account creation that automatically applies a 10% loyalty discount, collects marketing consent, and triggers Supabase account provisioning.
- **Order tracking** – Customers can revisit `/orders/:id` to see shipment status, discounts applied, and a fulfillment timeline updated by your staff.
- **Employee dashboard** – Users with `role = employee` (or admins) can manage active orders, update fulfillment status (which sends email notifications), and view customer inquiries.
- **Admin console** – Admins manage categories, inventory, customers, discounts, and see revenue analytics with a 14-day sales chart.
- **Email notifications** – Order status updates and confirmations are delivered via SMTP when configured, otherwise logged to the console for local development.
- **Performance** – API responses for catalogue and categories are cached with an in-memory LRU store. The preview gate and maintenance mode keep staging deployments private until launch.
- **AI workbench** – The admin console now embeds OpenAI-powered product copy, seasonal planning, engineering assistant, and optimization recommendations backed by the new FastAPI microservice.

## Workspace access & security

- Team members visit `/work-with-bubbles` to verify their work email, request access approval, and unlock the protected admin/employee portals.
- The client stores the approved workspace ticket in `sessionStorage` and attaches it to API calls through `X-Workspace-Email`/`X-Workspace-Role` headers.
- `server/src/middleware/workspace.js` verifies each request against the `workspace_registrations` table before delegating to Supabase role checks, ensuring the portals stay hidden from unauthorised users.
- Admins manage registrations directly in the database (approve/revoke) or extend the API to automate approvals as required.

## Deployment checklist

| Target   | Platform suggestion | Required env vars |
|----------|---------------------|-------------------|
| Frontend | Vercel (Static)     | `VITE_API_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, optional `VITE_PREVIEW_ACCESS_CODE`, `VITE_AI_SERVICE_URL` |
| Backend  | Render/Railway/Fly  | `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `PGSSLMODE=require`, optional `CLIENT_ORIGIN`, optional `STRIPE_SECRET_KEY`, optional SMTP vars, `MAINTENANCE_MODE`, `PREVIEW_ACCESS_TOKEN` |
| AI svc   | Railway/Fly/Render  | `OPENAI_API_KEY`, optional `OPENAI_MODEL`, `AI_ALLOWED_ORIGINS` |

1. **Backend** – Deploy `server/` and point `DATABASE_URL` at Supabase. Run `npm run migrate` once per environment.
2. **AI service** – Deploy `ai-service/` (e.g. `uvicorn main:app`). Provide the OpenAI credentials and the production origins so CORS remains strict.
3. **Frontend** – Deploy `client/` to Vercel. Mirror the client env vars, including `VITE_AI_SERVICE_URL`, and set `VITE_API_URL` to the backend’s public `/api` base (e.g. `https://api.yourdomain.com/api`).
4. **Domain** – Map `yourdomain.com` to Vercel, `api.yourdomain.com` to the backend, and `ai.yourdomain.com` (or similar) to the AI microservice.
5. **Supabase roles & workspace approvals** – Create Auth users and set `app_metadata.role` (or `user_metadata.role`) appropriately. Approve their email in the `workspace_registrations` table (via SQL editor or future admin UI) so the workspace middleware accepts requests.
6. **Email** – Populate the SMTP variables to deliver real order confirmations; otherwise messages log to stdout for testing.

## API overview

| Method | Endpoint                        | Description |
| ------ | ------------------------------- | ----------- |
| GET    | `/api/products`                 | Paginated catalogue with filtering, sorting, and caching |
| GET    | `/api/products/categories`      | List product categories |
| GET    | `/api/products/:id`             | Product detail with reviews and related recommendations |
| POST   | `/api/products/:id/reviews`     | Submit a product review (auth required) |
| POST   | `/api/products/categories`      | Create a category (admin only) |
| POST   | `/api/products`                 | Create a product (admin only) |
| POST   | `/api/orders`                   | Submit an order, auto-provision accounts, decrement inventory, send emails |
| GET    | `/api/orders/:id`               | Fetch order details, shipments, and status timeline |
| GET    | `/api/wishlist` / `POST` / `DELETE` | Manage customer wishlist (auth required) |
| GET    | `/api/employees/orders`         | Employee order queue |
| PATCH  | `/api/employees/orders/:id/status` | Update order status and notify customer |
| GET    | `/api/employees/inquiries`      | View customer inquiries |
| GET    | `/api/admin/*`                  | Admin inventory, orders, customers, discounts, analytics |
| POST   | `/api/admin/discounts`          | Create discount codes (admin only) |
| POST   | `/api/payments/intent`          | Optional Stripe payment intent helper |
| POST   | `/api/access/validate`          | Verify admin/employee workspace access |
| POST   | `/api/access/registrations`     | Submit or update workspace access requests |

## Notes

- Axios automatically attaches the Supabase session token and preview header, so backend routes can rely on `req.user` populated by the middleware.
- Knex manages schema changes; rerun the migration script whenever you update server-side tables.
- Email delivery is simulated when SMTP variables are omitted, making development safe while preserving code paths.
- The storefront remains mobile responsive thanks to Tailwind utilities that mirror the original layout.
- AI tooling is optional in local development; point `VITE_AI_SERVICE_URL` at `http://localhost:8000` and start the FastAPI server with `uvicorn main:app --reload` when you want the workbench live.

## Testing & refinement roadmap

1. **Unit smoke tests** – Run `npm run lint` and add Vitest suites for reducers and API helpers. For the AI service, add pytest cases that mock OpenAI responses.
2. **Integration tests** – Exercise the admin and employee flows with Playwright using a seeded Supabase dataset plus mocked AI responses.
3. **Load testing** – Replay peak catalogue traffic against `/api/products` and `/ai/products/generate` using k6 to confirm caching and rate limiting strategies.
4. **Security review** – Audit the workspace headers and Supabase role checks. Consider adding expirations to workspace tickets and rate limiting to the access endpoints.
5. **Observability** – Ship structured logs and metrics (e.g. OpenTelemetry) from both Node and FastAPI services to monitor AI latency, error rates, and portal usage.

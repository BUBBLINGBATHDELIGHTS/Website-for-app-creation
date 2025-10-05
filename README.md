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
├── package.json        # Workspace configuration
└── README.md
```

## Prerequisites

- Node.js 18+
- npm 8+
- A Supabase project with Postgres enabled
- (Optional) SMTP credentials for transactional email (order confirmations)

## Environment variables

### Client (`client/.env`)

```
VITE_API_URL=https://api.yourdomain.com/api
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=public-anon-key
VITE_PREVIEW_ACCESS_CODE=staging-preview-code
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
```

> The API enforces `MAINTENANCE_MODE` when set to `true`, requiring requests to include `X-Preview-Token`. The client automatically supplies the value from `VITE_PREVIEW_ACCESS_CODE` so that your staging deployment stays private.

## Setup

Install all workspaces from the repository root:

```bash
npm install
```

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

## Deployment checklist

| Target   | Platform suggestion | Required env vars |
|----------|---------------------|-------------------|
| Frontend | Vercel (Static)     | `VITE_API_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, optional `VITE_PREVIEW_ACCESS_CODE` |
| Backend  | Render/Railway/Fly  | `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `PGSSLMODE=require`, optional `CLIENT_ORIGIN`, optional `STRIPE_SECRET_KEY`, optional SMTP vars, `MAINTENANCE_MODE`, `PREVIEW_ACCESS_TOKEN` |

1. **Backend** – Deploy `server/` and point `DATABASE_URL` at Supabase. Run `npm run migrate` once per environment.
2. **Frontend** – Deploy `client/` to Vercel. Mirror the client env vars and set `VITE_API_URL` to the backend’s public `/api` base (e.g. `https://api.yourdomain.com/api`).
3. **Domain** – Map `yourdomain.com` to Vercel and `api.yourdomain.com` to the backend host.
4. **Supabase roles** – Create Auth users and set `app_metadata.role` (or `user_metadata.role`) to one of `customer`, `employee`, or `admin` depending on the level of access you want to grant.
5. **Email** – Populate the SMTP variables to deliver real order confirmations; otherwise messages log to stdout for testing.

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

## Notes

- Axios automatically attaches the Supabase session token and preview header, so backend routes can rely on `req.user` populated by the middleware.
- Knex manages schema changes; rerun the migration script whenever you update server-side tables.
- Email delivery is simulated when SMTP variables are omitted, making development safe while preserving code paths.
- The storefront remains mobile responsive thanks to Tailwind utilities that mirror the original layout.

# Bubbling Bath Boutique

A full-stack e-commerce experience tailored for artisanal bath and body products. The project preserves the original visual aesthetic while layering in cart management, checkout, role-gated admin tooling, and an Express API backed by Supabase Postgres.

## Project structure

```
├── client              # React + Vite storefront
│   ├── src
│   │   ├── pages       # Shop, admin, login, and order tracking views
│   │   ├── components  # Cart drawer, checkout flow, auth guards
│   │   ├── context     # Cart + Supabase auth providers
│   │   └── lib         # Supabase browser client
├── server              # Node/Express API connected to Supabase
│   ├── migrations      # Knex migrations for products/orders/customers
│   ├── knexfile.js     # Environment-aware Knex configuration
│   └── src
│       ├── lib         # Database bootstrap helpers
│       ├── routes      # REST endpoints for products, orders, payments
│       └── scripts     # Migration runner
├── package.json        # Workspace configuration
└── README.md
```

## Prerequisites

- Node.js 18+
- npm 8+
- A Supabase project with a Postgres database

## Environment variables

### Client (`client/.env`)

```
VITE_API_URL=https://api.yourdomain.com/api
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=public-anon-key
```

### Server (`server/.env`)

```
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.YOUR_PROJECT_REF.supabase.co:5432/postgres
PGSSLMODE=require
# STRIPE_SECRET_KEY=sk_test_123            # Optional for payment intents
# CLIENT_ORIGIN=https://yourdomain.com     # Optional CORS override for production
```

> Both the client and server will throw descriptive errors if the required Supabase variables are missing, helping surface misconfiguration during deployment.

## Setup

Install all workspaces from the repository root:

```bash
npm install
```

Run database migrations (creates `customers`, `products`, `orders`, `order_items`, `inventory_ledger`, and `shipping_addresses` tables):

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

The admin dashboard is now protected by Supabase Auth. Only users whose Supabase `app_metadata.role` (or `user_metadata.role`) equals `admin` can view `/admin`; everyone else is redirected to `/login`.

## Deployment checklist

| Target   | Platform suggestion | Required env vars |
|----------|---------------------|-------------------|
| Frontend | Vercel (Static)     | `VITE_API_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |
| Backend  | Render/Railway      | `DATABASE_URL`, `PGSSLMODE=require`, optional `CLIENT_ORIGIN`, optional `STRIPE_SECRET_KEY` |

1. **Backend** – Deploy `server/` to your host of choice. Point `DATABASE_URL` at the Supabase connection string and run `npm run migrate` once.
2. **Frontend** – Deploy `client/` to Vercel. In the project settings, mirror the client env variables above and set `VITE_API_URL` to your backend’s public `/api` base (e.g., `https://api.yourdomain.com/api`).
3. **Domain** – Configure DNS so that `yourdomain.com` maps to the Vercel deployment and `api.yourdomain.com` maps to the backend host.
4. **Supabase roles** – Create admin users in Supabase Auth and set `app_metadata.role = "admin"` (or supply the role in `user_metadata`). Non-admin users can still shop and check out as guests.

## API overview

| Method | Endpoint             | Description                            |
| ------ | -------------------- | -------------------------------------- |
| GET    | `/api/products`      | Retrieve product catalogue from Supabase |
| POST   | `/api/products`      | Create a product (requires admin token if enforced) |
| POST   | `/api/orders`        | Submit an order, update inventory ledger, and return rewards data |
| GET    | `/api/orders/:id`    | Fetch order details & fulfillment timeline |
| POST   | `/api/payments/int`  | (Optional) Create Stripe payment intent |

## Notes

- Axios automatically attaches the current Supabase access token to API requests, paving the way for backend authorization middleware should you enable it.
- Knex manages all schema changes; rerun the migration script whenever you introduce new tables or columns.
- The checkout flow and catalogue remain usable without admin access, preserving the original storefront experience for guests.

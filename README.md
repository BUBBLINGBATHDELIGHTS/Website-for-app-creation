# Bubbling Bath Boutique

A full-stack e-commerce experience tailored for artisanal bath and body products. The project preserves the original visual aesthetic while layering in cart management, checkout, admin tooling, and API endpoints that can be deployed on serverless platforms such as Vercel.

## Project structure

```
├── client              # React + Vite storefront
│   ├── src
│   │   ├── pages       # Shop, admin, and order tracking views
│   │   ├── components  # Cart drawer, checkout, shared UI
│   │   ├── context     # Cart state management
│   │   └── data        # Seed catalog used when API is offline
├── server              # Node/Express API with Postgres + Stripe hooks
│   ├── migrations      # SQL schema definitions
│   └── src
│       ├── lib         # Database helpers + in-memory fallback store
│       ├── routes      # REST endpoints for products, orders, payments
│       └── scripts     # Utility runners (e.g., migrations)
├── package.json        # Workspace configuration
└── README.md
```

## Getting started

```bash
# Install dependencies (requires npm 8+)
npm install

# Run the API (defaults to port 4000)
npm run dev:server

# Run the storefront (defaults to port 5173)
npm run dev:client
```

> The API automatically falls back to an in-memory catalogue when `DATABASE_URL` is not defined, enabling local exploration without Postgres.

## Environment variables

Create a `.env` file in the `server` directory (or project root) with the following keys:

```
DATABASE_URL=postgres://user:password@host:5432/database
PGSSLMODE=disable
STRIPE_SECRET_KEY=sk_test_your_key
```

When a real database connection string is provided, run migrations before starting the API:

```bash
npm run --workspace server migrate
```

## API overview

| Method | Endpoint             | Description                            |
| ------ | -------------------- | -------------------------------------- |
| GET    | `/api/products`      | Retrieve product catalogue             |
| POST   | `/api/products`      | Create/update a product (admin use)    |
| POST   | `/api/orders`        | Submit an order and receive reward info|
| GET    | `/api/orders/:id`    | Fetch order details & fulfillment data |
| POST   | `/api/payments/int`  | (Optional) Create Stripe payment intent |

## Testing strategy

- **React Query** keeps the UI in sync with API mutations.
- **Zod** validates payloads before persistence.
- **Stripe** integration is opt-in and safely disabled when the API key is absent.
- **In-memory store** mirrors endpoints so the UI remains functional offline.

## Deployment notes

- The Express server can be adapted to Vercel serverless functions by exporting handlers per route directory.
- The frontend is optimized for static hosting and can be deployed separately or via the same platform using Vite’s build output.
- Tailwind CSS preserves the original styling tokens (`lavender`, `mint`, `cream`) to match the provided mockup.

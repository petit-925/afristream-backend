<<<<<<< HEAD
# Afristream Backend

Node.js + TypeScript + Express + MySQL (mysql2) modular backend serving both Afristream (public) and Afristream Dashboard (admin) via a single versioned API.

## Quickstart

1) Install deps
```
npm install
```

2) Configure environment
- Copy `env.example` to `.env` and fill values.

3) Start MySQL
- Use an existing local MySQL or hosted instance

4) Database setup
- Set `DATABASE_URL` in `.env` (e.g. `mysql://user:pass@localhost:3306/afristream_db`)

5) Run dev server
```
npm run dev
```

API will be available at `http://localhost:5000`. Health check: `/health`.

## Scripts
- dev: run dev server with tsx watch
- build: compile TypeScript
- start: run compiled server

## Structure
- src/app.ts: Express app and middleware
- src/server.ts: HTTP server bootstrap
- src/config/*: env, db, logger, security
- src/common/*: errors and middleware
- src/routes/index.ts: registers module routers under /api/v1
- src/modules/*: feature modules (auth, products, orders, payments)
- prisma/*: Prisma schema, migrations, seed

## Notes
- Use roles and permissions in auth middleware to gate admin routes.
- Add further modules (portfolio, testimonials, blog, downloads, messages, clients) following the same pattern.
- Configure Paystack secrets and webhook to update orders.
=======
# afristream-backend
>>>>>>> 3e4a835280d3c6c0aed33f808d2a323d1ec4fd5d

# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Commands

### Install & local development
- Install dependencies:
  - `npm install`
- Run dev server:
  - `npm run dev` (Next.js App Router on port 3000)
- Production build & start:
  - `npm run build`
  - `npm start`

### Linting & type-checking
- Lint the project (Next + ESLint 9 flat config):
  - `npm run lint`
- TypeScript is enforced via `tsconfig.json`; there is no dedicated `npm run typecheck` script. If you need an explicit type check, run:
  - `npx tsc --noEmit`

### Database & Drizzle / Neon
- Drizzle config is in `drizzle.config.ts` and schema in `db/schema.ts` (Neon PostgreSQL via `@neondatabase/serverless`). Make sure `DATABASE_URL` is set in `.env.local` before running these.
- Generate migration files from schema changes:
  - `npm run db:generate` (alias for `drizzle-kit generate`)
- Push schema to the database:
  - `npm run db:push` (alias for `drizzle-kit push`)
- Open Drizzle Studio:
  - `npm run db:studio`
- Create performance indexes (separate script):
  - `npm run db:migrate` (runs `scripts/run-migration.js` against `DATABASE_URL`)
- Remove country-related fields (one-time migration to simplify to USD-only):
  - `node scripts/remove-country-fields.js`

### Seeding & gift-card catalog maintenance
- Seed initial gift cards (TS-based script using `tsx`):
  - `npm run seed` (runs `scripts/seed-gift-cards.ts`)
- Add sample gift cards:
  - `npm run seed:sample`
- Sync gift cards from Reloadly (USD products from US):
  - `node scripts/sync-reloadly-products.js`

### External integration diagnostics
These routes exist to verify environment configuration for third-party APIs:
- Test NOWPayments connectivity: `GET /api/test-nowpayments`
- Test Reloadly connectivity: `GET /api/test-reloadly`

### Testing
There is currently no dedicated test runner or test scripts configured in `package.json`. Testing is primarily manual via:
- Visiting the storefront and checkout in dev: `npm run dev` → `http://localhost:3000`
- Exercising the order API via the UI or by calling `POST /api/orders` with the expected JSON payload.

If you add an automated test setup (e.g. Jest, Vitest), document the exact commands here (including how to run a single test file or test name).

## High-level architecture

### Overall application
- This is a Next.js 14 App Router application (`app/` directory) implementing a crypto-powered gift card marketplace.
- All gift cards are priced in **USD only** - no country-specific filtering or multi-currency support.
- Key technologies:
  - Frontend: React, TypeScript, Tailwind/shadcn (`components/ui/*`).
  - Auth: Clerk (`@clerk/nextjs`) with role-based admin access.
  - Database: Neon PostgreSQL + Drizzle ORM (`db/schema.ts`, `lib/db.ts`).
  - Payments: NOWPayments (`lib/nowpayments.ts`).
  - Gift card fulfillment: Reloadly gift cards API (directly and via provider abstraction in `lib/providers/*`).
  - Email delivery: Resend (`lib/email.ts`).

### Routing and page layout
- Global layout is defined in `app/layout.tsx`:
  - Wraps the app in `ClerkProvider`, Solana `SolanaWalletProvider`, and defines global metadata, fonts (Geist), header, footer, and toast provider.
  - Uses `SimpleHeader`/`Footer` (`components/layout/*`) as shell; the main content is rendered inside `<main className="flex-1">{children}</main>`.
- Home page (`app/page.tsx`):
  - Server component that:
    - Resolves `searchParams` (query string),
    - Uses `getAllGiftCards`, `getCategories`, `getBrands` (`lib/queries.ts`) to fetch catalog data,
    - Renders hero/marketing sections and the main `GiftCardCatalog` with a `FilterBar` for category/brand/search.
- Dashboard and admin:
  - `app/(dashboard)/...` contains protected routes rendered within the global layout.
  - `app/(dashboard)/admin/page.tsx` implements the admin dashboard UI.
    - Uses Clerk client-side state (`useUser`) to verify `publicMetadata.role === "admin"` or `publicMetadata.admin === true` before showing admin content; otherwise redirects.
- Other notable routes:
  - `app/checkout/page.tsx` — checkout flow for creating orders.
  - `app/store/[brand]/page.tsx` — brand-specific gift card view using the query helpers.
  - `app/privacy/page.tsx`, `app/terms/page.tsx` — legal pages linked from the footer.

### Middleware and auth
- `middleware.ts` uses Clerk middleware to protect routes:
  - Protected routes: `/account(.*)`, `/admin(.*)`, `/checkout(.*)` via `auth.protect()`.
  - No geo-location or country detection logic - the app is USD-only.

### Data model and persistence
- Database schema (`db/schema.ts`) defines three primary tables via Drizzle:
  - `gift_cards`:
    - Brand, name, image, category, denominations (JSON stored as text), Reloadly product ID, active flag, timestamps.
    - All gift cards are USD-only with no country-specific fields.
  - `users`:
    - Links Clerk users via `clerk_id` plus optional profile fields and wallet address.
  - `orders`:
    - Links a user to a `gift_cards` row, tracks fiat amount (USD), denomination, crypto amount/currency, status, payment IDs, encrypted code, serial, redemption instructions, email, Reloadly transaction ID, timestamps.
- `lib/db.ts` wraps Neon's `neon()` client and Drizzle in a lazy-initialized singleton proxy; all queries go through this instance (`import { db } from "@/lib/db"`).

### Catalog queries
- `lib/queries.ts` centralizes catalog reads and enforces filters:
  - `getCategories` and `getBrands` use Drizzle plus `unstable_cache` for cheap distinct lookups.
  - `getAllGiftCards(searchParams)` builds a condition list including:
    - `active` flag,
    - Optional `brand`, `category`,
    - Case-insensitive `search` across brand and name.
  - Results are transformed by `standardizeDenominations` (`utils/denominations.ts`), providing normalized denomination options and filtering out cards without valid denominations.
  - `getGiftCardByBrand`, `getGiftCardById`, and `getRelatedGiftCards` provide higher-level helpers for brand pages and recommendations, all respecting the `active` flag.

### Order creation and payment integration
- Primary entrypoint for orders: `app/api/orders/route.ts`.
  - `POST /api/orders`:
    - Uses Clerk server `auth()` to ensure a signed-in user.
    - Validates request body (`giftCardId`, `denomination`, `cryptoCurrency`, `email`).
    - Loads the `gift_cards` row and validates that the selected denomination is allowed.
    - Enforces a minimum order amount (currently hardcoded `MIN_PAYMENT_AMOUNT = 15` USD) with an error message that hints at crypto minimums.
    - Inserts an `orders` row with `status = "pending"` and basic pricing details.
    - Calls `createPayment` (`lib/nowpayments.ts`) to create a NOWPayments invoice; on success, updates the order with `coinpaymentsTxnId` (legacy naming) and the crypto amount.
    - On payment creation failure, flips the order to `failed` and returns a descriptive error (including handling for NOWPayments “minimal amount” and invalid callback URL messages).
  - `GET /api/orders`:
    - Returns up to 50 orders for the current user, sorted by `createdAt` descending, with numeric fields parsed into numbers.
- `lib/nowpayments.ts`:
  - Centralizes interaction with the NOWPayments API (invoice creation and status checks) and HMAC-based webhook verification.
  - Constructs a `baseUrl` from `NEXT_PUBLIC_APP_URL` / `VERCEL_URL` with fallbacks; uses this to build `success_url`, `cancel_url`, and `ipn_callback_url` pointing at `/api/payments/webhook` in non-local environments (with a hardcoded production fallback when `localhost` is detected).

### Gift card providers and Reloadly integration
- `lib/reloadly.ts` implements a low-level client for Reloadly topups:
  - Manages access tokens with in-memory caching and expiry, hitting Reloadly’s OAuth endpoints.
  - Provides helpers to list products by country, fetch product details, purchase topups, and check transaction status.
  - Uses `RELOADLY_CLIENT_ID`, `RELOADLY_CLIENT_SECRET`, and `RELOADLY_SANDBOX` to choose endpoints and authenticate.
- `lib/providers` implements a provider abstraction:
  - `lib/providers/base-provider.ts` (not detailed here) defines the provider interface.
  - `lib/providers/reloadly-provider.ts` implements that interface for Reloadly.
  - `lib/providers/provider-manager.ts`:
    - Registers available providers (currently Reloadly; others like Ding/TangoCard are scaffolded but commented out).
    - Exposes a `providerManager` singleton with:
      - `purchase(params, providerName?)` with optional fallback to other providers when one fails.
      - `getBestProvider(...)` stub for future provider selection logic.
      - `getTotalBalance()` to aggregate balances across providers.
- The README’s “Order Flow” section describes the intended full lifecycle:
  - User selects card and crypto → order row created as `pending` → NOWPayments invoice created → payment webhook verifies the payment → provider (Reloadly) is used to purchase the actual gift card → code is encrypted and stored → email with gift card is sent → order status set to `completed`.

### Email and encryption
- `lib/encryption.ts`:
  - Wraps AES encryption/decryption via `crypto-js` using `ENCRYPTION_KEY` (with a default development key); this should be overridden in production.
- `lib/email.ts`:
  - Uses Resend to send a styled HTML email with gift card details.
  - Skips sending and logs a warning when `RESEND_API_KEY` is not configured.
  - Email “from” address is currently `Gift Cards <noreply@yourdomain.com>` and should be customized in deployments.

### Wallet integration
- `components/providers/wallet-provider.tsx` and `hooks/use-wallet-auth.ts` coordinate Solana wallet auth with Clerk:
  - Solana wallet adapter context is provided via `SolanaWalletProvider` at the root.
  - `useWalletAuth` exposes:
    - The connected wallet address,
    - `authenticateWallet()` which signs a message and POSTs to `/api/auth/wallet` for backend verification,
    - `disconnectAll()` to disconnect both the wallet and Clerk session.
  - If you change wallet flows, update `use-wallet-auth.ts` and any `/api/auth/wallet` handler together.

Keep this file updated when you:
- Add or change major scripts in `package.json`.
- Introduce a testing framework and test-related commands.
- Make significant structural changes to routing, data access, or provider/payment flows.

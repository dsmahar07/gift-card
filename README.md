# Gift Card Marketplace

A full-featured gift card marketplace where users can purchase gift cards from top brands using cryptocurrency. Built with Next.js 14, Neon PostgreSQL, Clerk authentication, and integrated with NOWPayments and Reloadly APIs.

## Features

- 🎁 Browse 300+ gift card brands
- 💰 Pay with 100+ cryptocurrencies via NOWPayments
- ⚡ Instant gift card code delivery via email
- 🔐 Secure authentication with Clerk
- 📊 Admin dashboard for managing orders and gift cards
- 🎨 Modern UI built with Radix UI and Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Backend**: Next.js API Routes
- **Database**: Neon PostgreSQL with Drizzle ORM
- **Authentication**: Clerk
- **UI Components**: shadcn/ui (Radix UI)
- **Payment Gateway**: NOWPayments
- **Gift Card Provider**: Reloadly API
- **Email**: Resend

## Prerequisites

- Node.js 18+ and npm
- Neon PostgreSQL database account
- Clerk account for authentication
- NOWPayments account
- Reloadly API account
- Resend API key (for email delivery)

## Setup Instructions

### 1. Clone and Install

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Neon PostgreSQL Database
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require

# NOWPayments
NOWPAYMENTS_API_KEY=your_api_key
NOWPAYMENTS_IPN_SECRET=your_ipn_secret

# Reloadly
RELOADLY_CLIENT_ID=your_client_id
RELOADLY_CLIENT_SECRET=your_client_secret
RELOADLY_SANDBOX=true

# Email (Resend)
RESEND_API_KEY=your_resend_api_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Encryption (optional, defaults to a default key)
ENCRYPTION_KEY=your_encryption_key
```

### 3. Database Setup

Run the migration to create the database tables:

```bash
# Option 1: Using Drizzle Kit
npx drizzle-kit push

# Option 2: Run the SQL migration manually
# Connect to your Neon database and run db/migrations/0000_init.sql
```

### 4. Set Up Clerk

1. Create a Clerk account at https://clerk.com
2. Create a new application
3. Copy your publishable key and secret key to `.env.local`
4. In Clerk dashboard, set up roles (optional):
   - Go to Users > Roles
   - Create an "admin" role
   - Assign it to your user account

### 5. Set Up NOWPayments

1. Create a NOWPayments account at https://nowpayments.io
2. Get your API key from the dashboard
3. Set up Webhook:
   - Go to Settings > Webhooks
   - Set Webhook URL to: `https://yourdomain.com/api/payments/webhook`
   - Copy the IPN Secret and add it to `.env.local`

### 6. Set Up Reloadly

1. Create a Reloadly account at https://www.reloadly.com
2. Get your Client ID and Client Secret from the API section
3. Start with sandbox mode (`RELOADLY_SANDBOX=true`)
4. Add credentials to `.env.local`

### 7. Set Up Resend

1. Create a Resend account at https://resend.com
2. Get your API key
3. Add it to `.env.local`
4. Update the "from" email in `lib/email.ts` to your verified domain

### 8. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
gift-card/
├── app/                    # Next.js App Router
│   ├── (dashboard)/        # Protected dashboard routes
│   │   ├── account/        # User account pages
│   │   └── admin/          # Admin dashboard
│   ├── api/                # API routes
│   ├── checkout/           # Checkout flow
│   ├── store/              # Gift card catalog
│   └── page.tsx            # Home page
├── components/            # React components
│   ├── ui/                 # shadcn/ui components
│   ├── gift-card/          # Gift card components
│   └── layout/             # Layout components
├── db/                     # Database
│   ├── schema.ts           # Drizzle schema
│   └── migrations/         # SQL migrations
├── lib/                    # Utilities
│   ├── db.ts               # Database connection
│   ├── coinpayments.ts     # CoinPayments integration
│   ├── reloadly.ts         # Reloadly integration
│   ├── email.ts            # Email service
│   └── encryption.ts       # Encryption utilities
└── types/                  # TypeScript types
```

## Key Features Implementation

### Order Flow

1. User selects a gift card and denomination
2. User chooses cryptocurrency
3. Order is created in database with "pending" status
4. User is redirected to NOWPayments payment page
5. NOWPayments sends webhook on payment
6. Webhook handler:
   - Verifies payment signature
   - Calls Reloadly API to purchase gift card
   - Encrypts and stores the code
   - Sends email to user
   - Updates order status to "completed"

### Admin Dashboard

Access at `/admin` (requires admin role in Clerk):
- View statistics (total orders, revenue, etc.)
- Manage gift cards
- View and manage all orders
- View user activity

## Development

### Database Migrations

```bash
# Generate migration
npx drizzle-kit generate

# Push changes to database
npx drizzle-kit push

# View database in Drizzle Studio
npx drizzle-kit studio
```

### Adding Gift Cards

You can add gift cards via:
1. Admin dashboard (UI coming soon)
2. Direct database insert
3. API endpoint (to be implemented)

Example SQL:

```sql
INSERT INTO gift_cards (brand, name, image, denominations, reloadly_product_id, active)
VALUES ('Amazon', 'Amazon Gift Card', 'https://example.com/amazon.jpg', '[25, 50, 100]', 12345, true);
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add all environment variables
4. Deploy

### Environment Variables for Production

Make sure to:
- Set `RELOADLY_SANDBOX=false` for production
- Update `NEXT_PUBLIC_APP_URL` to your production domain
- Use production NOWPayments credentials
- Set a strong `ENCRYPTION_KEY`

## Security Notes

- Gift card codes are encrypted in the database
- Webhook signatures are verified
- User authentication required for all protected routes
- Admin routes check for admin role
- HTTPS required in production

## License

MIT

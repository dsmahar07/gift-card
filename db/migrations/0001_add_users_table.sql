-- Create users table
CREATE TABLE IF NOT EXISTS "users" (
  "id" SERIAL PRIMARY KEY,
  "clerk_id" TEXT NOT NULL UNIQUE,
  "email" TEXT,
  "first_name" TEXT,
  "last_name" TEXT,
  "image_url" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create index on clerk_id for fast lookups
CREATE INDEX IF NOT EXISTS "users_clerk_id_idx" ON "users"("clerk_id");


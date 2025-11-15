import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";

/**
 * Get or create a user in the database from Clerk
 * This ensures user data is synced to our database
 */
export async function getOrCreateUser(clerkUserId: string) {
  // Check if user exists
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkUserId))
    .limit(1);

  if (existingUser.length > 0) {
    return existingUser[0];
  }

  // Fetch user data from Clerk
  const clerkUser = await currentUser();
  
  if (!clerkUser || clerkUser.id !== clerkUserId) {
    throw new Error("User not found in Clerk");
  }

  // Create user in database
  const [newUser] = await db
    .insert(users)
    .values({
      clerkId: clerkUserId,
      email: clerkUser.emailAddresses[0]?.emailAddress || null,
      firstName: clerkUser.firstName || null,
      lastName: clerkUser.lastName || null,
      imageUrl: clerkUser.imageUrl || null,
    })
    .returning();

  return newUser;
}

/**
 * Update user data from Clerk
 */
export async function updateUserFromClerk(clerkUserId: string) {
  const clerkUser = await currentUser();
  
  if (!clerkUser || clerkUser.id !== clerkUserId) {
    return null;
  }

  const [updatedUser] = await db
    .update(users)
    .set({
      email: clerkUser.emailAddresses[0]?.emailAddress || null,
      firstName: clerkUser.firstName || null,
      lastName: clerkUser.lastName || null,
      imageUrl: clerkUser.imageUrl || null,
      updatedAt: new Date(),
    })
    .where(eq(users.clerkId, clerkUserId))
    .returning();

  return updatedUser;
}


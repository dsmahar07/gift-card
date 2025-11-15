import { auth, currentUser } from "@clerk/nextjs/server";

export async function isAdmin(): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) return false;

  const user = await currentUser();
  if (!user) return false;

  // Check if user has admin role in Clerk
  // You can set this up in Clerk dashboard under Roles
  return user.publicMetadata?.role === "admin" || user.publicMetadata?.admin === true;
}

export async function requireAdmin() {
  const admin = await isAdmin();
  if (!admin) {
    throw new Error("Unauthorized: Admin access required");
  }
}


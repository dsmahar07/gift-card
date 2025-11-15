import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "CLERK_WEBHOOK_SECRET is not configured" },
      { status: 500 }
    );
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: "Error occurred -- no svix headers" },
      { status: 400 }
    );
  }

  const payload = await request.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: any;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return NextResponse.json(
      { error: "Error occurred" },
      { status: 400 }
    );
  }

  const eventType = evt.type;
  const { id, email_addresses, first_name, last_name, image_url } = evt.data;

  // Handle user creation
  if (eventType === "user.created") {
    try {
      await db.insert(users).values({
        clerkId: id,
        email: email_addresses[0]?.email_address || null,
        firstName: first_name || null,
        lastName: last_name || null,
        imageUrl: image_url || null,
      });
    } catch (error) {
      console.error("Error creating user:", error);
    }
  }

  // Handle user updates
  if (eventType === "user.updated") {
    try {
      await db
        .update(users)
        .set({
          email: email_addresses[0]?.email_address || null,
          firstName: first_name || null,
          lastName: last_name || null,
          imageUrl: image_url || null,
          updatedAt: new Date(),
        })
        .where(eq(users.clerkId, id));
    } catch (error) {
      console.error("Error updating user:", error);
    }
  }

  // Handle user deletion
  if (eventType === "user.deleted") {
    try {
      await db.delete(users).where(eq(users.clerkId, id));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  }

  return NextResponse.json({ received: true });
}


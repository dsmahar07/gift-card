import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { giftCards } from "@/db/schema";
import { asc } from "drizzle-orm";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await currentUser();
    const isAdmin = user?.publicMetadata?.role === "admin" || user?.publicMetadata?.admin === true;

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const allGiftCards = await db
      .select()
      .from(giftCards)
      .orderBy(asc(giftCards.brand));

    // Convert to expected format
    const formattedGiftCards = allGiftCards.map((card) => ({
      ...card,
      _id: card.id.toString(),
      category: card.category ?? undefined,
      denominations: JSON.parse(card.denominations),
    }));

    return NextResponse.json(formattedGiftCards);
  } catch (error) {
    console.error("Error fetching admin gift cards:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

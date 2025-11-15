import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { giftCards } from "@/db/schema";
import { eq } from "drizzle-orm";
import { standardizeDenominations } from "@/utils/denominations";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const giftCard = await db
      .select()
      .from(giftCards)
      .where(eq(giftCards.id, parseInt(id)))
      .limit(1);

    if (giftCard.length === 0) {
      return NextResponse.json(
        { error: "Gift card not found" },
        { status: 404 }
      );
    }

    // Parse denominations JSON and standardize
    const raw = JSON.parse(giftCard[0].denominations);
    const { options } = standardizeDenominations(raw);

    const result = {
      ...giftCard[0],
      _id: giftCard[0].id.toString(),
      denominations: options,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching gift card:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

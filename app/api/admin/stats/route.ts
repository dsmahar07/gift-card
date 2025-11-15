import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { orders, giftCards } from "@/db/schema";
import { eq, inArray, sql, count, sum } from "drizzle-orm";

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

    const [totalOrdersResult, completedOrdersResult, activeGiftCardsResult, pendingOrdersResult, revenueResult] = await Promise.all([
      db.select({ count: count() }).from(orders),
      db.select({ count: count() }).from(orders).where(eq(orders.status, "completed")),
      db.select({ count: count() }).from(giftCards).where(eq(giftCards.active, true)),
      db.select({ count: count() }).from(orders).where(inArray(orders.status, ["pending", "processing"])),
      db.select({ total: sum(orders.amount) }).from(orders).where(eq(orders.status, "completed")),
    ]);

    const totalOrders = Number(totalOrdersResult[0]?.count || 0);
    const completedOrders = Number(completedOrdersResult[0]?.count || 0);
    const activeGiftCards = Number(activeGiftCardsResult[0]?.count || 0);
    const pendingOrders = Number(pendingOrdersResult[0]?.count || 0);
    const totalRevenue = Number(revenueResult[0]?.total || 0);

    return NextResponse.json({
      totalOrders,
      completedOrders,
      totalRevenue,
      activeGiftCards,
      pendingOrders,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

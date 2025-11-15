import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { orders } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");

    let query = db.select().from(orders);

    if (status && status !== "all") {
      query = query.where(eq(orders.status, status)) as any;
    }

    const allOrders = await query.orderBy(desc(orders.createdAt)).limit(100);

    // Convert to expected format
    const formattedOrders = allOrders.map((order) => ({
      ...order,
      _id: order.id.toString(),
      amount: parseFloat(order.amount),
      denomination: parseFloat(order.denomination),
      cryptoAmount: parseFloat(order.cryptoAmount),
    }));

    return NextResponse.json(formattedOrders);
  } catch (error) {
    console.error("Error fetching admin orders:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

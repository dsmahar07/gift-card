import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { orders, giftCards } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { createPayment } from "@/lib/nowpayments";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { giftCardId, denomination, cryptoCurrency, email } = body;

    if (!giftCardId || !denomination || !cryptoCurrency || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Fetch gift card
    const giftCardResults = await db
      .select()
      .from(giftCards)
      .where(eq(giftCards.id, parseInt(giftCardId)))
      .limit(1);

    if (giftCardResults.length === 0) {
      return NextResponse.json(
        { error: "Gift card not found or inactive" },
        { status: 404 }
      );
    }

    const giftCard = giftCardResults[0];

    if (!giftCard.active) {
      return NextResponse.json(
        { error: "Gift card not found or inactive" },
        { status: 404 }
      );
    }

    // Parse denominations and validate
    const denominations = JSON.parse(giftCard.denominations);
    const denominationNum = typeof denomination === 'string' ? parseFloat(denomination) : denomination;
    if (!denominations.includes(denominationNum)) {
      return NextResponse.json(
        { error: `Invalid denomination. Available: ${denominations.join(', ')}` },
        { status: 400 }
      );
    }

    // NOWPayments has minimum payment amounts (varies by crypto)
    // BTC minimum is typically $15-20, but USDT/TRX/LTC are around $2-5
    const MIN_PAYMENT_AMOUNT = 15;
    if (denominationNum < MIN_PAYMENT_AMOUNT) {
      return NextResponse.json(
        { error: `Minimum order amount is $${MIN_PAYMENT_AMOUNT} USD. Please select a higher denomination or try USDT/TRX/LTC for lower minimums.` },
        { status: 400 }
      );
    }

    // Create order
    const [newOrder] = await db
      .insert(orders)
      .values({
        userId,
        giftCardId: giftCard.id,
        giftCardBrand: giftCard.brand,
        amount: denominationNum.toString(),
        denomination: denominationNum.toString(),
        cryptoAmount: denominationNum.toString(), // Will be updated by NOWPayments
        cryptoCurrency,
        currency: "USD",
        status: "pending",
        email,
      })
      .returning();

    // Create NOWPayments transaction
    try {
      const payment = await createPayment({
        amount: denominationNum,
        currency: "USD",
        payCurrency: cryptoCurrency,
        orderId: newOrder.id.toString(),
        orderDescription: `${giftCard.name} - $${denominationNum} Gift Card`,
        customerEmail: email,
      });

      if (payment.error) {
        await db
          .update(orders)
          .set({ status: "failed" })
          .where(eq(orders.id, newOrder.id));

        return NextResponse.json(
          { error: `Payment error: ${payment.error}` },
          { status: 400 }
        );
      }

      if (payment.payment_id) {
        await db
          .update(orders)
          .set({
            coinpaymentsTxnId: payment.payment_id, // Keep same field name for compatibility
            cryptoAmount: payment.pay_amount?.toString() || denominationNum.toString(),
          })
          .where(eq(orders.id, newOrder.id));

        return NextResponse.json({
          orderId: newOrder.id.toString(),
          paymentUrl: payment.invoice_url || `https://nowpayments.io/payment/?iid=${payment.payment_id}`,
          txnId: payment.payment_id,
        });
      }

      // If we get here, txn has neither error nor result
      await db
        .update(orders)
        .set({ status: "failed" })
        .where(eq(orders.id, newOrder.id));

      return NextResponse.json(
        { error: "Unexpected response from payment provider" },
        { status: 500 }
      );
    } catch (error: any) {
      console.error("NOWPayments error:", error);
      await db
        .update(orders)
        .set({ status: "failed" })
        .where(eq(orders.id, newOrder.id));

      const errorMessage = error?.message || "Failed to create payment transaction";
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }

    // This should never be reached, but just in case
    return NextResponse.json(
      { error: "Unexpected error occurred" },
      { status: 500 }
    );
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt))
      .limit(50);

    // Convert to expected format
    const formattedOrders = userOrders.map((order) => ({
      ...order,
      _id: order.id.toString(),
      amount: parseFloat(order.amount),
      denomination: parseFloat(order.denomination),
      cryptoAmount: parseFloat(order.cryptoAmount),
    }));

    return NextResponse.json(formattedOrders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

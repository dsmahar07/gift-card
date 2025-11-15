import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, giftCards } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { verifyWebhook } from "@/lib/nowpayments";
import { purchaseTopup } from "@/lib/reloadly";
import { sendGiftCardEmail } from "@/lib/email";
import { encrypt } from "@/lib/encryption";

export async function POST(request: NextRequest) {
  try {
    // NOWPayments sends JSON payload
    const rawBody = await request.text();
    const data = JSON.parse(rawBody);

    console.log("Received NOWPayments webhook:", data);

    // Get signature from header
    const signature = request.headers.get("x-nowpayments-sig") || "";

    // Verify webhook signature
    if (!verifyWebhook(rawBody, signature)) {
      console.error("Invalid webhook signature");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    const paymentId = data.payment_id || data.id;
    const paymentStatus = data.payment_status || data.status;
    const orderId = data.order_id;

    // NOWPayments status: waiting, confirming, confirmed, sending, partially_paid, finished, failed, refunded, expired
    // Only process if payment is finished/confirmed
    if (paymentStatus !== "finished" && paymentStatus !== "confirmed") {
      // Payment not complete yet
      return NextResponse.json({ status: "pending" });
    }

    // Find order by order ID or payment ID
    const orderResults = await db
      .select()
      .from(orders)
      .where(
        or(
          eq(orders.id, parseInt(orderId || "0")),
          eq(orders.coinpaymentsTxnId, paymentId) // Keep same field name for compatibility
        )
      )
      .limit(1);

    if (orderResults.length === 0) {
      console.error("Order not found for webhook:", { orderId, paymentId });
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    const order = orderResults[0];

    // If already processed, return success
    if (order.status === "completed") {
      return NextResponse.json({ status: "already_processed" });
    }

    // Update order status to processing
    await db
      .update(orders)
      .set({
        status: "processing",
        paymentId: paymentId,
      })
      .where(eq(orders.id, order.id));

    try {
      // Fetch gift card details
      const giftCardResults = await db
        .select()
        .from(giftCards)
        .where(eq(giftCards.id, order.giftCardId))
        .limit(1);

      if (giftCardResults.length === 0) {
        throw new Error("Gift card not found");
      }

      const giftCard = giftCardResults[0];

      // Purchase gift card from Reloadly
      const topupResponse = await purchaseTopup({
        productId: giftCard.reloadlyProductId,
        countryCode: "US", // Default, can be made configurable
        quantity: 1,
        unitPrice: parseFloat(order.denomination),
        customIdentifier: order.id.toString(),
        recipientEmail: order.email || undefined,
      });

      // Encrypt and store the code
      if (!topupResponse.pinDetail?.pin) {
        throw new Error("No pin received from Reloadly");
      }

      const encryptedCode = encrypt(topupResponse.pinDetail.pin);

      await db
        .update(orders)
        .set({
          code: encryptedCode,
          serial: topupResponse.pinDetail.serial || null,
          redemptionInstructions: topupResponse.redemptionInstructions || null,
          reloadlyTransactionId: topupResponse.transactionId,
          status: "completed",
        })
        .where(eq(orders.id, order.id));

      // Send email with gift card code
      if (order.email) {
        await sendGiftCardEmail({
          to: order.email,
          brand: order.giftCardBrand,
          amount: parseFloat(order.denomination),
          code: topupResponse.pinDetail.pin, // Send unencrypted in email
          serial: topupResponse.pinDetail.serial || undefined,
          redemptionInstructions: topupResponse.redemptionInstructions || undefined,
        });
      }

      return NextResponse.json({ status: "success" });
    } catch (error: any) {
      console.error("Error processing gift card:", error);
      await db
        .update(orders)
        .set({ status: "failed" })
        .where(eq(orders.id, order.id));

      return NextResponse.json(
        { error: error.message || "Failed to process gift card" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

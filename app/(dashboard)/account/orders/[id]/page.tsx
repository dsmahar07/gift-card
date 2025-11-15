"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ArrowLeft, Copy, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Order } from "@/types";
import { decrypt } from "@/lib/encryption";

function getStatusBadge(status: Order["status"]) {
  const variants: Record<Order["status"], "default" | "secondary" | "destructive" | "outline"> = {
    pending: "outline",
    processing: "secondary",
    completed: "default",
    failed: "destructive",
    cancelled: "outline",
  };

  return (
    <Badge variant={variants[status]}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

export default function OrderDetailPage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [codeRevealed, setCodeRevealed] = useState(false);
  const [decryptedCode, setDecryptedCode] = useState<string>("");

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
      return;
    }

    if (isSignedIn && params.id) {
      fetchOrder(params.id as string);
    }
  }, [isSignedIn, isLoaded, router, params.id]);

  const fetchOrder = async (id: string) => {
    try {
      const response = await fetch(`/api/orders/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          toast.error("Order not found");
          router.push("/account/orders");
          return;
        }
        throw new Error("Failed to fetch order");
      }
      const data = await response.json();
      setOrder(data);
    } catch (error) {
      console.error("Error fetching order:", error);
      toast.error("Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  const revealCode = () => {
    if (!order?.code) return;

    try {
      const decrypted = decrypt(order.code);
      setDecryptedCode(decrypted);
      setCodeRevealed(true);
    } catch (error) {
      toast.error("Failed to decrypt code");
    }
  };

  const copyCode = () => {
    if (decryptedCode) {
      navigator.clipboard.writeText(decryptedCode);
      toast.success("Code copied to clipboard!");
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert variant="destructive">
          <AlertDescription>Order not found</AlertDescription>
        </Alert>
        <Link href="/account/orders">
          <Button className="mt-4">Back to Orders</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Link href="/account/orders">
        <Button variant="ghost" className="mb-6 gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </Button>
      </Link>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold">Order Details</h1>
          {getStatusBadge(order.status)}
        </div>
        <p className="text-muted-foreground font-mono text-sm">
          Order ID: {order._id}
        </p>
      </div>

      <div className="space-y-6">
        {/* Order Info */}
        <Card>
          <CardHeader>
            <CardTitle>Order Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Brand</p>
                <p className="font-semibold">{order.giftCardBrand}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="font-semibold">${order.denomination}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Method</p>
                <p className="font-semibold">{order.cryptoCurrency}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-semibold">
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleString()
                    : "-"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gift Card Code */}
        {order.status === "completed" && order.code && (
          <Card>
            <CardHeader>
              <CardTitle>Gift Card Code</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!codeRevealed ? (
                <div className="space-y-4">
                  <Alert>
                    <AlertDescription>
                      Click the button below to reveal your gift card code. Keep it secure!
                    </AlertDescription>
                  </Alert>
                  <Button onClick={revealCode} className="w-full gap-2">
                    <Eye className="w-4 h-4" />
                    Reveal Code
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-muted p-6 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Your Gift Card Code</p>
                    <div className="flex items-center justify-between">
                      <p className="text-2xl font-mono font-bold">{decryptedCode}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyCode}
                        className="gap-2"
                      >
                        <Copy className="w-4 h-4" />
                        Copy
                      </Button>
                    </div>
                  </div>
                  {order.serial && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Serial Number</p>
                      <p className="font-mono">{order.serial}</p>
                    </div>
                  )}
                  {order.redemptionInstructions && (
                    <Alert>
                      <AlertDescription>
                        <strong>Redemption Instructions:</strong>
                        <br />
                        {order.redemptionInstructions}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Payment Info */}
        {order.coinpaymentsTxnId && (
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction ID:</span>
                  <span className="font-mono text-sm">{order.coinpaymentsTxnId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Crypto Amount:</span>
                  <span>{order.cryptoAmount} {order.cryptoCurrency}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status Messages */}
        {order.status === "pending" && (
          <Alert>
            <AlertDescription>
              Your payment is pending. Please complete the payment to receive your gift card code.
            </AlertDescription>
          </Alert>
        )}

        {order.status === "processing" && (
          <Alert>
            <AlertDescription>
              Your payment has been received and we're processing your gift card. You'll receive an email once it's ready.
            </AlertDescription>
          </Alert>
        )}

        {order.status === "failed" && (
          <Alert variant="destructive">
            <AlertDescription>
              There was an error processing your order. Please contact support if you've already made a payment.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}


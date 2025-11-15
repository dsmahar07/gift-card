"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { HugeIcon } from "@/components/ui/hugeicon";
import { Loading03Icon, ArrowLeft01Icon, CreditCardIcon } from '@hugeicons/core-free-icons';
import Link from "next/link";
import { toast } from "sonner";
import * as FancyButton from '@/components/ui/fancy-button';
import { CRYPTO_CURRENCIES } from "@/lib/constants";

interface GiftCard {
  _id: string;
  name: string;
  brand: string;
  image: string;
  denominations: number[];
}

function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isSignedIn, user } = useUser();
  const [giftCard, setGiftCard] = useState<GiftCard | null>(null);
  const [denomination, setDenomination] = useState<number>(0);
  const [cryptoCurrency, setCryptoCurrency] = useState<string>("USDT");
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!isSignedIn) {
      router.push("/sign-in?redirect_url=/checkout");
      return;
    }

    const giftCardId = searchParams.get("giftCardId");
    const denominationParam = searchParams.get("denomination");

    if (!giftCardId) {
      router.push("/");
      return;
    }

    fetchGiftCard(giftCardId);
    if (denominationParam) {
      setDenomination(parseFloat(denominationParam));
    }
  }, [isSignedIn, router, searchParams]);

  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress) {
      setEmail(user.primaryEmailAddress.emailAddress);
    }
  }, [user]);

  const fetchGiftCard = async (id: string) => {
    try {
      const response = await fetch(`/api/giftcards/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch gift card");
      }
      const data = await response.json();
      setGiftCard(data);
      if (!denomination && data.denominations.length > 0) {
        setDenomination(data.denominations[0]);
      }
    } catch (err) {
      setError("Failed to load gift card details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!giftCard || !denomination || !cryptoCurrency || !email) {
      setError("Please fill in all fields");
      return;
    }

    setProcessing(true);
    setError("");

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          giftCardId: giftCard._id,
          denomination,
          cryptoCurrency,
          email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || "Failed to create order";
        setError(errorMsg);
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }

      // Redirect to NOWPayments
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        const errorMsg = "No payment URL received from payment provider";
        setError(errorMsg);
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (err: any) {
      // Error handling is done above, but catch any network errors
      if (err.message && !err.message.includes("Failed to create order") && !err.message.includes("No payment URL")) {
        const errorMsg = err.message || "An error occurred while processing your order";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-12 flex items-center justify-center">
        <HugeIcon icon={Loading03Icon} className="animate-spin" />
      </div>
    );
  }

  if (!giftCard) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-12">
        <Alert variant="destructive">
          <AlertDescription>Gift card not found</AlertDescription>
        </Alert>
        <Link href="/">
          <FancyButton.Root variant="neutral" size="medium" className="mt-4">
            Back to Store
          </FancyButton.Root>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-2xl">
      <Link href={`/store/${giftCard.brand.toLowerCase().replace(/\s+/g, "-")}`}>
        <FancyButton.Root variant="basic" size="medium" className="mb-4 sm:mb-6">
          <FancyButton.Icon as="i">
            <HugeIcon icon={ArrowLeft01Icon} size={16} />
          </FancyButton.Icon>
          Back
        </FancyButton.Root>
      </Link>

      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Checkout</h1>

      {error && (
        <Alert variant="destructive" className="mb-4 sm:mb-6">
          <AlertDescription className="text-sm">{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4 sm:space-y-6">
        {/* Order Summary */}
        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-lg sm:text-xl">Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 sm:gap-4 mb-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-muted rounded-lg flex items-center justify-center text-foreground font-bold text-xl sm:text-2xl flex-shrink-0">
                {giftCard.brand.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm sm:text-base truncate">{giftCard.name}</p>
                <p className="text-muted-foreground text-sm sm:text-base">${denomination}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Details */}
        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-lg sm:text-xl">Payment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div>
              <Label htmlFor="denomination">Amount</Label>
              <Select
                value={denomination.toString()}
                onValueChange={(value) => setDenomination(parseFloat(value))}
              >
                <SelectTrigger id="denomination">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {giftCard.denominations.map((amount) => (
                    <SelectItem key={amount} value={amount.toString()}>
                      ${amount}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="crypto">Cryptocurrency</Label>
              <Select
                value={cryptoCurrency}
                onValueChange={setCryptoCurrency}
              >
                <SelectTrigger id="crypto">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CRYPTO_CURRENCIES.map((crypto) => (
                    <SelectItem key={crypto.value} value={crypto.value}>
                      {crypto.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Your gift card code will be sent to this email
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Total */}
        <Card>
          <CardContent className="pt-5 sm:pt-6">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <span className="text-base sm:text-lg font-semibold">Total</span>
              <span className="text-xl sm:text-2xl font-bold">${denomination}</span>
            </div>
            <FancyButton.Root
              onClick={handleCheckout}
              disabled={processing || !denomination || !cryptoCurrency || !email}
              className="w-full"
              variant="primary"
              size="medium"
            >
              {processing ? (
                <>
                  <FancyButton.Icon as="i">
                    <HugeIcon icon={Loading03Icon} className="w-4 h-4 animate-spin" />
                  </FancyButton.Icon>
                  <span className="text-sm sm:text-base">Processing...</span>
                </>
              ) : (
                <>
                  <FancyButton.Icon as="i">
                    <HugeIcon icon={CreditCardIcon} size={18} className="sm:w-5 sm:h-5" />
                  </FancyButton.Icon>
                  <span className="text-sm sm:text-base">Pay with {cryptoCurrency}</span>
                </>
              )}
            </FancyButton.Root>
            <p className="text-xs sm:text-sm text-muted-foreground text-center mt-3 sm:mt-4 px-2">
              You will be redirected to NOWPayments to complete your payment
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 sm:px-6 py-12 text-center">Loading...</div>}>
      <CheckoutPageContent />
    </Suspense>
  );
}


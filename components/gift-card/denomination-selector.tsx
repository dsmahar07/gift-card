"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HugeIcon } from "@/components/ui/hugeicon";
import { ArrowRight01Icon } from '@hugeicons/core-free-icons';
import * as FancyButton from '@/components/ui/fancy-button';

interface DenominationSelectorProps {
  giftCardId: string;
  denominations: number[];
  currency?: string;
}

export function DenominationSelector({ giftCardId, denominations, currency = "USD" }: DenominationSelectorProps) {
  const isRange = denominations.length === 2 && denominations[0] !== denominations[1];
  const originalMin = isRange ? Math.min(denominations[0], denominations[1]) : Math.min(...denominations);
  const originalMax = isRange ? Math.max(denominations[0], denominations[1]) : Math.max(...denominations);

  // Business rule: enforce minimum selectable = 15 (in local currency units)
  const min = Math.max(originalMin, 15);
  const max = originalMax;

  // For fixed options, hide amounts below 15 and pick the closest >= 15
  const fixedOptions = !isRange
    ? (denominations.filter((d) => d >= 15).sort((a, b) => a - b))
    : [] as number[];

  const initial = isRange
    ? min
    : (fixedOptions.length > 0 ? fixedOptions[0] : Math.min(...denominations));

  const [selectedDenomination, setSelectedDenomination] = useState<number>(initial);
  
  // Format amount with proper currency symbol
  const formatAmount = (amount: number) => {
    const currencySymbols: Record<string, string> = {
      USD: "$", CAD: "CA$", GBP: "£", EUR: "€", AUD: "A$",
      INR: "₹", BRL: "R$", MXN: "MX$", SGD: "S$", AED: "AED",
    };
    const symbol = currencySymbols[currency] || currency + " ";
    return `${symbol}${amount}`;
  };

  return (
    <Card className="border-0 bg-white rounded-xl sm:rounded-2xl rounded-br-2xl sm:rounded-br-3xl rounded-bl-2xl sm:rounded-bl-3xl w-full">
      <CardContent className="p-5 sm:p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-5 sm:mb-6">
          <h2 className="font-bold text-xl sm:text-2xl text-gray-900">Select Amount</h2>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-green-600 font-medium">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Available Now
          </div>
        </div>
        {isRange ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Min: {formatAmount(min)}</span>
              <span>Max: {formatAmount(max)}</span>
            </div>
            <div className="flex items-center gap-3">
              <input 
                type="number" 
                min={min} 
                max={max} 
                step={1} 
                value={selectedDenomination}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (!Number.isFinite(v)) return;
                  const clamped = Math.min(Math.max(v, min), max);
                  setSelectedDenomination(clamped);
                }}
                className="w-full h-12 sm:h-14 rounded-lg border border-gray-200 px-4 text-lg sm:text-xl font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <div className="w-40 text-right text-base font-semibold text-gray-900">
                {formatAmount(selectedDenomination)}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {(fixedOptions.length > 0 ? fixedOptions : denominations).map((amount: number) => (
              <Button
                key={amount}
                variant="outline"
                onClick={() => setSelectedDenomination(amount)}
                className={`w-full h-12 sm:h-14 bg-white text-lg sm:text-xl font-bold border transition-all hover:shadow-md ${
                  selectedDenomination === amount
                    ? 'border-purple-500 bg-purple-50 text-purple-600 shadow-md'
                    : 'border-gray-200 hover:border-purple-500 hover:bg-purple-50 hover:text-purple-600'
                }`}
              >
                <span className="text-xl sm:text-2xl leading-none">{formatAmount(amount)}</span>
              </Button>
            ))}
          </div>
        )}
        <div className="mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-gray-100">
          <FancyButton.Root 
            variant="neutral" 
            size="medium" 
            className="w-full"
            asChild
          >
            <Link href={`/checkout?giftCardId=${giftCardId}&denomination=${selectedDenomination}`}>
              Continue to Checkout • {formatAmount(selectedDenomination)}
              <FancyButton.Icon as="i">
                <HugeIcon icon={ArrowRight01Icon} size={20} />
              </FancyButton.Icon>
            </Link>
          </FancyButton.Root>
        </div>
      </CardContent>
    </Card>
  );
}


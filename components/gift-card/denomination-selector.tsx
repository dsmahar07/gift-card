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
}

export function DenominationSelector({ giftCardId, denominations }: DenominationSelectorProps) {
  const [selectedDenomination, setSelectedDenomination] = useState<number>(denominations[0]);

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
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {denominations.map((amount: number) => (
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
              <span className="text-xl sm:text-2xl leading-none">${amount}</span>
            </Button>
          ))}
        </div>
        <div className="mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-gray-100">
          <FancyButton.Root 
            variant="neutral" 
            size="medium" 
            className="w-full"
            asChild
          >
            <Link href={`/checkout?giftCardId=${giftCardId}&denomination=${selectedDenomination}`}>
              Continue to Checkout • ${selectedDenomination}
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


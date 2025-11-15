"use client";

import { GiftCardCard } from "./gift-card-card";
import { GiftCard } from "@/types";
import { HugeIcon } from "@/components/ui/hugeicon";
import { SearchList01Icon } from '@hugeicons/core-free-icons';

interface GiftCardGridProps {
  giftCards: GiftCard[];
}

export function GiftCardGrid({ giftCards }: GiftCardGridProps) {
  if (giftCards.length === 0) {
    return (
      <div className="text-center py-12 sm:py-16 md:py-20">
        <div className="max-w-md mx-auto px-4">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <HugeIcon icon={SearchList01Icon} size={40} className="text-purple-600 sm:w-12 sm:h-12" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-gray-900">No Gift Cards Found</h3>
          <p className="text-muted-foreground text-base sm:text-lg">
            Try adjusting your search or filter criteria
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {giftCards.map((giftCard) => (
        <GiftCardCard key={giftCard._id} giftCard={giftCard} />
      ))}
    </div>
  );
}


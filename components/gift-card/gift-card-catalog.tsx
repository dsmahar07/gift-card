"use client";

import { GiftCardGrid } from "./gift-card-grid";
import { GiftCard } from "@/types";

interface GiftCardCatalogProps {
  initialGiftCards: GiftCard[];
}

export function GiftCardCatalog({
  initialGiftCards,
}: GiftCardCatalogProps) {

  return <GiftCardGrid giftCards={initialGiftCards} />;
}


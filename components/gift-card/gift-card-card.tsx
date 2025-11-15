"use client";

import Link from "next/link";
import { GiftCard } from "@/types";
import * as FancyButton from '@/components/ui/fancy-button';
import { HugeIcon } from "@/components/ui/hugeicon";
import { DollarCircleIcon, Mail01Icon, Bitcoin01Icon } from '@hugeicons/core-free-icons';

interface GiftCardCardProps {
  giftCard: GiftCard;
}

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

// Generate consistent color for each category
const getCategoryColor = (category: string) => {
  const colors = [
    '#FF3B30', // Red
    '#34C759', // Green
    '#FF9500', // Orange
    '#AF52DE', // Purple
    '#FF2D55', // Pink
    '#5856D6', // Indigo
    '#00C7BE', // Teal
    '#FF6482', // Coral
    '#32ADE6', // Light Blue
    '#007AFF', // Blue (moved to end)
    '#FFD60A', // Yellow
    '#BF5AF2', // Violet
  ];
  
  // Better hash function for more even distribution
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    const char = category.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // Use absolute value and add category length for more variation
  const index = (Math.abs(hash) + category.length) % colors.length;
  return colors[index];
};

export function GiftCardCard({ giftCard }: GiftCardCardProps) {
  const minDenomination = Math.min(...giftCard.denominations);
  const maxDenomination = Math.max(...giftCard.denominations);
  const displayMax = Math.min(maxDenomination, 150);
  const categoryColor = giftCard.category ? getCategoryColor(giftCard.category) : '#007AFF';
  
  // Format amount with proper currency symbol
  const formatAmount = (amount: number) => {
    const currencySymbols: Record<string, string> = {
      USD: "$", CAD: "CA$", GBP: "£", EUR: "€", AUD: "A$",
      INR: "₹", BRL: "R$", MXN: "MX$", SGD: "S$", AED: "AED",
    };
    const symbol = currencySymbols[giftCard.currency] || giftCard.currency + " ";
    return `${symbol}${amount}`;
  };

  // Business rule: display "from" amount as at least 15
  const displayMin = Math.max(minDenomination, 15);

  return (
    <div 
      className="bg-white p-6 shadow-sm hover:shadow-md transition-shadow duration-200 ease-out"
      style={{
        borderRadius: '1.5rem',
        border: '1px solid rgba(60, 60, 67, 0.08)'
      }}
    >
      {/* Header - Logo, Firm Name, and Badge */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {giftCard.image && (
            <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
              <img 
                src={giftCard.image} 
                alt={`${giftCard.brand} logo`}
                className="w-full h-full object-contain rounded"
              />
            </div>
          )}
          <h3 
            style={{
              fontSize: '1.0625rem',
              lineHeight: '1.4',
              fontWeight: '600',
              color: '#1C1C1E'
            }}
          >
            {giftCard.brand}
          </h3>
        </div>
        {giftCard.category && (
          <div 
            className="inline-flex items-center px-2 py-1 rounded-full font-medium"
            style={{
              backgroundColor: categoryColor,
              color: '#FFFFFF',
              fontSize: '0.75rem',
              lineHeight: '1.3'
            }}
          >
            {giftCard.category}
          </div>
        )}
      </div>
      
      {/* Subtitle */}
      <div 
        className="mb-4"
        style={{
          fontSize: '0.8125rem',
          lineHeight: '1.4',
          color: '#3C3C43'
        }}
      >
        {giftCard.country} • Digital Gift Card
      </div>
      
      {/* Price/Discount Section */}
      <div className="mb-4">
        <div 
          className="mb-1"
          style={{
            fontSize: '2.125rem',
            lineHeight: '1.2',
            letterSpacing: '-0.01em',
            fontWeight: '700',
            color: '#007AFF'
          }}
        >
          {minDenomination === maxDenomination 
            ? formatAmount(displayMin)
            : `${formatAmount(displayMin)} - ${formatAmount(displayMax)}`
          }
        </div>
        <div 
          className="mb-2 flex items-center gap-1.5"
          style={{
            fontSize: '0.8125rem',
            lineHeight: '1.4',
            color: '#3C3C43'
          }}
        >
          <HugeIcon icon={DollarCircleIcon} size={14} className="text-[#3C3C43] flex-shrink-0" />
          <span>Multiple denominations available</span>
        </div>
        <div 
          className="mb-1 flex items-center gap-1.5"
          style={{
            fontSize: '0.8125rem',
            lineHeight: '1.4',
            color: '#1C1C1E'
          }}
        >
          <HugeIcon icon={Mail01Icon} size={14} className="text-[#1C1C1E] flex-shrink-0" />
          <span>Instant delivery via email</span>
        </div>
        <div 
          className="flex items-center gap-1.5"
          style={{
            fontSize: '0.8125rem',
            lineHeight: '1.4',
            fontWeight: '500',
            color: '#007AFF'
          }}
        >
          <HugeIcon icon={Bitcoin01Icon} size={14} className="text-[#007AFF] flex-shrink-0" />
          <span>Pay with 100+ Cryptocurrencies</span>
        </div>
      </div>

      {/* Code Display Box */}
      <div 
        className="p-3 mb-4 flex items-center justify-between"
        style={{
          backgroundColor: '#F5F5F7',
          borderRadius: '1rem'
        }}
      >
        <div 
          className="font-mono font-bold"
          style={{
            fontSize: '1.0625rem',
            lineHeight: '1.5',
            color: '#1C1C1E'
          }}
        >
          INSTANT
        </div>
        <FancyButton.Root
          variant="basic"
          size="xsmall"
        >
          Available
        </FancyButton.Root>
      </div>

      {/* Get Deal Button */}
      <Link href={`/store/${toSlug(giftCard.brand)}?id=${giftCard._id}`}>
        <FancyButton.Root 
          variant="neutral"
          size="medium"
          className="w-full"
          asChild
        >
          <span>Get Deal</span>
        </FancyButton.Root>
      </Link>
    </div>
  );
}


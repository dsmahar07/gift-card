"use client";

import Link from "next/link";
import { UserButton, SignInButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { HugeIcon } from "@/components/ui/hugeicon";
import { GiftIcon, PackageIcon } from '@hugeicons/core-free-icons';
import * as FancyButton from '@/components/ui/fancy-button';
import { WalletButton } from "@/components/wallet/wallet-button";
import { toast } from "sonner";

export function SimpleHeader() {
  const { isSignedIn, isLoaded } = useUser();

  const handleCopyCA = async () => {
    try {
      await navigator.clipboard.writeText("pump");
      toast.success("CA copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-2 sm:py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-all group-hover:scale-105">
                <HugeIcon icon={GiftIcon} size={18} className="text-white sm:w-5 sm:h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base sm:text-lg bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent leading-tight">
                  Giftswap
                </span>
                <span className="hidden xs:block text-[10px] text-muted-foreground -mt-0.5">
                  .shop
                </span>
              </div>
            </Link>

            {/* CA Copy Button */}
            <Button
              onClick={handleCopyCA}
              variant="outline"
              size="sm"
              className="gap-1.5 hover:bg-purple-50 hover:border-purple-400 transition-all h-8 px-2.5 sm:px-3 text-xs sm:text-sm"
            >
              <span className="font-medium">CA :</span>
              <span className="text-muted-foreground">...pump</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-60"
              >
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
              </svg>
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-2 flex-shrink-0">
            <WalletButton />
            {isLoaded && (
              <>
                {isSignedIn ? (
                  <>
                    <Link href="/account/orders" className="hidden sm:block">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="gap-2 hover:bg-purple-50 hover:text-purple-600 transition-colors h-9"
                      >
                        <HugeIcon icon={PackageIcon} size={16} />
                        <span className="hidden lg:inline">Orders</span>
                      </Button>
                    </Link>
                    <UserButton 
                      afterSignOutUrl="/"
                      appearance={{
                        elements: {
                          avatarBox: "w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-purple-200 hover:border-purple-400 transition-colors"
                        }
                      }}
                    />
                  </>
                ) : (
                  <SignInButton mode="modal">
                    {/* Clerk requires a single child; use one responsive button */}
                    <FancyButton.Root 
                      variant="destructive" 
                      size="medium" 
                      className="px-3 py-2 text-sm sm:text-base"
                    >
                      Sign In
                    </FancyButton.Root>
                  </SignInButton>
                )}
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}


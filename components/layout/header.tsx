"use client";

import Link from "next/link";
import { UserButton, SignInButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HugeIcon } from "@/components/ui/hugeicon";
import { GiftIcon, PackageIcon, Search01Icon } from '@hugeicons/core-free-icons';
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition, useEffect } from "react";
import * as FancyButton from '@/components/ui/fancy-button';
import { WalletButton } from "@/components/wallet/wallet-button";

interface HeaderProps {
  categories?: string[];
  brands?: string[];
}

export function Header({ categories = [], brands = [] }: HeaderProps) {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);

  // Sync state with URL only once on mount
  useEffect(() => {
    setSearch(searchParams.get("search") || "");
    setSelectedCategory(searchParams.get("category") || "all");
    setSelectedBrand(searchParams.get("brand") || "all");
    setMounted(true);
  }, [searchParams]);

  const updateFilters = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    startTransition(() => {
      router.push(`/?${params.toString()}`);
    });
  };

  // Debounced search handler
  useEffect(() => {
    if (!mounted) return; // Skip on initial mount
    
    const timer = setTimeout(() => {
      updateFilters({ search, category: selectedCategory, brand: selectedBrand });
    }, 400);
    
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleSearch = (value: string) => {
    setSearch(value);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    updateFilters({ category: value, search, brand: selectedBrand });
  };

  const handleBrandChange = (value: string) => {
    setSelectedBrand(value);
    updateFilters({ brand: value, search, category: selectedCategory });
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-2 sm:py-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Top Row: Logo and Navigation */}
          <div className="flex items-center justify-between">
            {/* Logo */}
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

            {/* Navigation - Right Side (Mobile) */}
            <nav className="flex md:hidden items-center gap-2 flex-shrink-0">
              <WalletButton />
              {!isLoaded ? (
                <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
              ) : isSignedIn ? (
                <>
                  <Link href="/account/orders">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="gap-2 hover:bg-purple-50 hover:text-purple-600 transition-colors h-8 px-2"
                    >
                      <HugeIcon icon={PackageIcon} size={18} />
                    </Button>
                  </Link>
                  <UserButton 
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        avatarBox: "w-8 h-8 rounded-full border-2 border-purple-200 hover:border-purple-400 transition-colors"
                      }
                    }}
                  />
              </>
              ) : (
                <SignInButton mode="modal">
                  <FancyButton.Root variant="destructive" size="small">
                    Sign In
                  </FancyButton.Root>
                </SignInButton>
              )}
          </nav>
        </div>

        {/* Second Row: Search Bar and Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 flex-1 md:justify-center md:max-w-3xl">
            {/* Search Bar */}
            <div className="relative w-full sm:max-w-md">
              <HugeIcon 
                icon={Search01Icon} 
                size={16} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" 
              />
              <Input
                placeholder="Search gift cards..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9 h-9 text-sm bg-white border-gray-200 focus:border-purple-400 focus:ring-purple-400 rounded-lg w-full"
              />
            </div>

            {/* Filters Row */}
            <div className="flex gap-2 sm:gap-3">
              {/* Category Filter */}
              {mounted && categories.length > 0 && (
                <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="flex-1 sm:w-32 lg:w-40 h-9 text-sm bg-white border-gray-200 focus:border-purple-400 focus:ring-purple-400 rounded-lg">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Brand Filter */}
              {mounted && brands.length > 0 && (
                <Select value={selectedBrand} onValueChange={handleBrandChange}>
                  <SelectTrigger className="flex-1 sm:w-32 lg:w-40 h-9 text-sm bg-white border-gray-200 focus:border-purple-400 focus:ring-purple-400 rounded-lg">
                    <SelectValue placeholder="Brand" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Brands</SelectItem>
                    {brands.map((brand) => (
                      <SelectItem key={brand} value={brand}>
                        {brand}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
          
          {/* Navigation - Right Side (Desktop) */}
          <nav className="hidden md:flex items-center gap-2 flex-shrink-0">
            <WalletButton />
            {!isLoaded ? (
              <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse" />
            ) : isSignedIn ? (
              <>
                <Link href="/account/orders">
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
                      avatarBox: "w-9 h-9 rounded-full border-2 border-purple-200 hover:border-purple-400 transition-colors"
                    }
                  }}
                />
              </>
            ) : (
              <SignInButton mode="modal">
                <FancyButton.Root variant="destructive" size="medium">
                  Sign In
                </FancyButton.Root>
              </SignInButton>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}


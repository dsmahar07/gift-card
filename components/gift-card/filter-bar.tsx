"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HugeIcon } from "@/components/ui/hugeicon";
import { Search01Icon } from '@hugeicons/core-free-icons';

interface FilterBarProps {
  categories: string[];
}

export function FilterBar({ categories = [] }: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setSearch(searchParams.get("search") || "");
    setSelectedCategory(searchParams.get("category") || "all");
    setMounted(true);
  }, [searchParams]);

  const updateFilters = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== "all") params.set(key, value);
      else params.delete(key);
    });
    startTransition(() => router.push(`/?${params.toString()}`));
  };

  useEffect(() => {
    if (!mounted) return;
    const t = setTimeout(() => updateFilters({ search, category: selectedCategory }), 300);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div className="mb-5 sm:mb-6 md:mb-8">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
        {/* Search */}
        <div className="relative w-full sm:max-w-md">
          <HugeIcon icon={Search01Icon} size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <Input
            placeholder="Search gift cards..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 text-sm bg-white border-gray-200 focus:border-purple-400 focus:ring-purple-400 rounded-lg w-full"
          />
        </div>
        {/* Filters */}
        <div className="flex gap-2 sm:gap-3">
          {mounted && categories.length > 0 && (
            <Select value={selectedCategory} onValueChange={(v) => { setSelectedCategory(v); updateFilters({ category: v, search }); }}>
              <SelectTrigger className="flex-1 sm:w-40 h-10 text-sm bg-white border-gray-200 focus:border-purple-400 focus:ring-purple-400 rounded-lg">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
    </div>
  );
}

import { HugeIcon } from "@/components/ui/hugeicon";
import { Loading03Icon } from '@hugeicons/core-free-icons';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Header Skeleton */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="h-9 w-32 bg-gray-200 animate-pulse rounded-lg" />
            <div className="flex gap-3 flex-1 justify-center max-w-3xl">
              <div className="h-9 w-full max-w-md bg-gray-200 animate-pulse rounded-lg" />
              <div className="h-9 w-32 bg-gray-200 animate-pulse rounded-lg" />
              <div className="h-9 w-32 bg-gray-200 animate-pulse rounded-lg" />
            </div>
            <div className="h-9 w-24 bg-gray-200 animate-pulse rounded-lg" />
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <section className="pt-8 pb-24 bg-[#F5F5F7]">
        <div className="max-w-7xl mx-auto px-6">
          {/* Loading Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-gray-200 animate-pulse rounded" />
                  <div className="h-6 flex-1 bg-gray-200 animate-pulse rounded" />
                </div>
                <div className="h-4 bg-gray-200 animate-pulse rounded mb-4" />
                <div className="h-16 bg-gray-200 animate-pulse rounded mb-4" />
                <div className="h-12 bg-gray-200 animate-pulse rounded" />
              </div>
            ))}
          </div>

          {/* Loading indicator */}
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <HugeIcon icon={Loading03Icon} size={48} className="animate-spin text-purple-600" />
              <p className="text-gray-600 text-sm">Loading gift cards...</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


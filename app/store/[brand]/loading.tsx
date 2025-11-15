import { HugeIcon } from "@/components/ui/hugeicon";
import { Loading03Icon } from '@hugeicons/core-free-icons';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Back Button Skeleton */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="h-9 w-24 bg-gray-200 animate-pulse rounded-lg" />
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 max-w-7xl mx-auto">
          {/* Image Skeleton */}
          <div className="space-y-4 sm:space-y-6">
            <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[500px] bg-gray-200 animate-pulse rounded-xl sm:rounded-2xl" />
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              <div className="h-20 bg-gray-200 animate-pulse rounded-lg" />
              <div className="h-20 bg-gray-200 animate-pulse rounded-lg" />
              <div className="h-20 bg-gray-200 animate-pulse rounded-lg" />
            </div>
          </div>

          {/* Details Skeleton */}
          <div className="space-y-4 sm:space-y-6">
            <div className="p-6 sm:p-8 bg-gray-50 rounded-2xl sm:rounded-3xl">
              <div className="space-y-4 sm:space-y-6">
                <div className="h-8 bg-gray-200 animate-pulse rounded w-24" />
                <div className="h-12 bg-gray-200 animate-pulse rounded w-3/4" />
                <div className="h-20 bg-gray-200 animate-pulse rounded" />
                <div className="h-64 bg-gray-200 animate-pulse rounded-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Loading indicator */}
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <HugeIcon icon={Loading03Icon} size={48} className="animate-spin text-purple-600" />
            <p className="text-gray-600 text-sm">Loading gift card details...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

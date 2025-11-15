import { TRUST_BADGES } from "@/lib/constants";

const colorMap = {
  purple: "text-purple-400",
  blue: "text-blue-400",
  green: "text-green-400",
  yellow: "text-yellow-400",
} as const;

interface TrustBadgesProps {
  className?: string;
}

export function TrustBadges({ className = "" }: TrustBadgesProps) {
  return (
    <div className={`border-t border-gray-700 pt-6 sm:pt-8 mb-6 sm:mb-8 ${className}`}>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 text-center">
        {TRUST_BADGES.map((badge, index) => {
          const colorClass = colorMap[badge.color as keyof typeof colorMap];
          
          return (
            <div key={index} className="p-3 sm:p-0">
              <div className={`text-xl sm:text-2xl font-bold ${colorClass} mb-1`}>
                {badge.value}
              </div>
              <div className="text-xs text-gray-500">{badge.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


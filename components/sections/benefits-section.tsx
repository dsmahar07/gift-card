import { Card, CardContent } from "@/components/ui/card";
import { HugeIcon } from "@/components/ui/hugeicon";
import { ShieldIcon, ClockIcon, MoneyBag02Icon } from '@hugeicons/core-free-icons';
import { BENEFITS } from "@/lib/constants";

const iconMap = {
  shield: ShieldIcon,
  clock: ClockIcon,
  money: MoneyBag02Icon,
} as const;

const colorMap = {
  blue: "text-blue-600",
  green: "text-green-600",
  purple: "text-purple-600",
} as const;

interface BenefitsSectionProps {
  title?: string;
  className?: string;
}

export function BenefitsSection({ 
  title = "Why Choose Our Gift Cards?",
  className = ""
}: BenefitsSectionProps) {
  return (
    <section className={`mb-12 sm:mb-16 ${className}`}>
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {BENEFITS.map((benefit) => {
          const Icon = iconMap[benefit.icon as keyof typeof iconMap];
          const colorClass = colorMap[benefit.color as keyof typeof colorMap];
          
          return (
            <Card key={benefit.id} className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <HugeIcon icon={Icon} size={48} className={`${colorClass} mx-auto mb-4`} />
                <h3 className="font-bold text-lg mb-2">{benefit.title}</h3>
                <p className="text-sm text-gray-600">{benefit.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}


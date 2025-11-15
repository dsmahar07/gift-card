import { HugeIcon } from "@/components/ui/hugeicon";
import { 
  StarIcon, 
  SecurityCheckIcon, 
  DeliveryTruck01Icon, 
  CheckmarkCircle02Icon 
} from '@hugeicons/core-free-icons';
import { WHY_CHOOSE_US } from "@/lib/constants";

const iconMap = {
  star: StarIcon,
  security: SecurityCheckIcon,
  delivery: DeliveryTruck01Icon,
  checkmark: CheckmarkCircle02Icon,
} as const;

interface WhyChooseUsSectionProps {
  title?: string;
  className?: string;
}

export function WhyChooseUsSection({ 
  title = "Why Choose Us?",
  className = ""
}: WhyChooseUsSectionProps) {
  return (
    <section className={`bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 ${className}`}>
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
        {WHY_CHOOSE_US.map((item) => {
          const Icon = iconMap[item.icon as keyof typeof iconMap];
          
          return (
            <div key={item.id} className="flex items-start gap-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${item.gradient} rounded-full flex items-center justify-center flex-shrink-0`}>
                <HugeIcon icon={Icon} size={24} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-700">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}


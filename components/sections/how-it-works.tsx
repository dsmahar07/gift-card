import { Card, CardContent } from "@/components/ui/card";
import { HOW_IT_WORKS } from "@/lib/constants";

interface HowItWorksProps {
  title?: string;
  className?: string;
}

export function HowItWorks({ 
  title = "How It Works",
  className = ""
}: HowItWorksProps) {
  return (
    <Card className={`border-0 shadow-lg bg-gradient-to-br from-purple-50 to-blue-50 ${className}`}>
      <CardContent className="p-5 sm:p-6 md:p-8">
        <h3 className="font-bold text-lg sm:text-xl mb-5 sm:mb-6 text-gray-900">{title}</h3>
        <ul className="space-y-3 sm:space-y-4">
          {HOW_IT_WORKS.map((step) => (
            <li key={step.step} className="flex items-start gap-4">
              <div className={`w-8 h-8 bg-gradient-to-br ${step.gradient} rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm`}>
                {step.step}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">{step.title}</h4>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}


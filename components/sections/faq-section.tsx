import { Card, CardContent } from "@/components/ui/card";
import { HugeIcon } from "@/components/ui/hugeicon";
import { QuestionIcon } from '@hugeicons/core-free-icons';
import { FAQS } from "@/lib/constants";

interface FAQSectionProps {
  title?: string;
  className?: string;
  brandName?: string;
}

export function FAQSection({ 
  title = "Frequently Asked Questions",
  className = "",
  brandName
}: FAQSectionProps) {
  return (
    <section className={`mb-12 sm:mb-16 ${className}`}>
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">{title}</h2>
      <div className="max-w-3xl mx-auto space-y-3 sm:space-y-4">
        {FAQS.map((faq) => {
          // Customize answer for brand-specific pages
          let answer: string = faq.answer;
          if (brandName && faq.id === "delivery-time") {
            answer = `You'll receive your ${brandName} gift card code instantly via email after your payment is confirmed. Typically within 1-5 minutes.` as string;
          } else if (brandName && faq.id === "international") {
            answer = `${brandName} gift cards can typically be used in the region where they were purchased. Check ${brandName}'s terms and conditions for specific regional restrictions.` as string;
          }
          
          return (
            <Card key={faq.id} className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <HugeIcon icon={QuestionIcon} size={24} className="text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                    <p className="text-gray-600">{answer}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}


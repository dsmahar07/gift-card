import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { HugeIcon } from "@/components/ui/hugeicon";
import type { Metadata } from "next";
import { 
  SecurityCheckIcon,
  DeliveryTruck01Icon,
  MoneyBag02Icon,
  ArrowLeft01Icon,
  CheckmarkCircle02Icon,
} from '@hugeicons/core-free-icons';
import { getGiftCardByBrand, getGiftCardById, getRelatedGiftCards } from "@/lib/queries";
import { BenefitsSection } from "@/components/sections/benefits-section";
import { FAQSection } from "@/components/sections/faq-section";
import { WhyChooseUsSection } from "@/components/sections/why-choose-us-section";
import { HowItWorks } from "@/components/sections/how-it-works";
import { DenominationSelector } from "@/components/gift-card/denomination-selector";
import { SITE_CONFIG } from "@/lib/constants";
import { getUserLocation } from "@/lib/location";

// This page varies by country, so disable ISR
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string }>;
}): Promise<Metadata> {
  const { brand } = await params;
  
  // Use a faster, simpler metadata generation to avoid blocking
  const title = `${brand.replace(/-/g, ' ')} Gift Card - Buy with Crypto`;
  const description = "Buy gift cards instantly with cryptocurrency. Instant email delivery, 100% secure, money-back guarantee.";

  return {
    title,
    description,
  };
}

export default async function GiftCardDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ brand: string }>,
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { brand } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  
  // Try ID first if provided (fastest)
  const idParam = resolvedSearchParams?.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;
  
  let giftCard = null;
  if (id) {
    giftCard = await getGiftCardById(id);
  }
  
  // Fallback to brand lookup
  if (!giftCard) {
    const userLocation = await getUserLocation();
    // Allow override via query string (?countryCode=XX)
    const override = typeof resolvedSearchParams.countryCode === 'string' ? resolvedSearchParams.countryCode : undefined;
    const code = override || userLocation.countryCode;
    giftCard = await getGiftCardByBrand(brand, code);
  }

  if (!giftCard) {
    notFound();
  }

  // Fetch related cards asynchronously (don't block page render)
  const relatedCards = await getRelatedGiftCards(
    giftCard.category,
    giftCard._id,
    4,
    giftCard.countryCode
  ).catch(() => []);

  // Generate structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": giftCard.name,
    "description": `Buy ${giftCard.brand} gift cards instantly with cryptocurrency. Instant email delivery, 100% secure, money-back guarantee.`,
    "image": giftCard.image || `${SITE_CONFIG.url}${giftCard.image}`,
    "brand": {
      "@type": "Brand",
      "name": giftCard.brand,
    },
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": giftCard.currency || "USD",
      "lowPrice": Math.max(15, Math.min(...giftCard.denominations)).toString(),
      "highPrice": Math.min(150, Math.max(...giftCard.denominations)).toString(),
      "offerCount": giftCard.denominations.length,
      "availability": "https://schema.org/InStock",
    },
    "category": giftCard.category || "Gift Card",
  };

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        {/* Back Button */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <Link href="/">
            <Button variant="ghost" className="gap-2 hover:bg-purple-50 hover:text-purple-600 text-sm sm:text-base">
              <HugeIcon icon={ArrowLeft01Icon} size={18} />
              <span className="hidden xs:inline">Back to Store</span>
              <span className="xs:hidden">Back</span>
            </Button>
          </Link>
          </div>
        </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 max-w-7xl mx-auto">
          {/* Image */}
          <div className="space-y-4 sm:space-y-6">
            <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[500px] rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-br from-purple-100 via-blue-100 to-cyan-100 shadow-2xl group">
              {giftCard.image ? (
                <>
                  <Image
                    src={giftCard.image}
                    alt={giftCard.name}
                    fill
                    className="object-contain p-8 transition-transform duration-300 group-hover:scale-105"
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
                </>
              ) : (
                <div className="relative flex flex-col items-center justify-center h-full bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 p-8 overflow-hidden">
                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24"></div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 border-4 border-white/20 rounded-full"></div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border-2 border-white/10 rounded-full"></div>
                  
                  {/* Brand name */}
                  <div className="relative z-10 text-center px-4">
                    <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-2 sm:mb-4 drop-shadow-2xl break-words">
                      {giftCard.brand}
                    </div>
                    <div className="text-lg sm:text-xl md:text-2xl text-white/90 font-semibold">
                      Gift Card
                    </div>
                  </div>
                </div>
              )}
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-lg">
                INSTANT DELIVERY
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 text-center shadow-sm border border-gray-100">
                <HugeIcon icon={SecurityCheckIcon} size={24} className="text-purple-600 mx-auto mb-1 sm:mb-2 sm:w-8 sm:h-8" />
                <p className="text-[10px] sm:text-xs font-semibold text-gray-700">100% Secure</p>
              </div>
              <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 text-center shadow-sm border border-gray-100">
                <HugeIcon icon={DeliveryTruck01Icon} size={24} className="text-blue-600 mx-auto mb-1 sm:mb-2 sm:w-8 sm:h-8" />
                <p className="text-[10px] sm:text-xs font-semibold text-gray-700">Instant Email</p>
              </div>
              <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 text-center shadow-sm border border-gray-100">
                <HugeIcon icon={MoneyBag02Icon} size={24} className="text-cyan-600 mx-auto mb-1 sm:mb-2 sm:w-8 sm:h-8" />
                <p className="text-[10px] sm:text-xs font-semibold text-gray-700">Pay with Crypto</p>
              </div>
            </div>
          </div>

          {/* Details Column */}
          <div className="space-y-4 sm:space-y-6">
            {/* Details - Parent Container */}
            <Card className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl" style={{ backgroundColor: '#fafdff' }}>
            <div className="space-y-4 sm:space-y-6">
              {/* Text Content in Parent Container */}
              {giftCard.category && (
                <Badge className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border-purple-200 px-4 py-1 text-sm font-semibold">
                  {giftCard.category}
                </Badge>
              )}
              <h1 
                className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold bg-clip-text text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(to right, #335CFF, #F6B51E, #693EE0)',
                }}
              >
                {giftCard.name}
              </h1>
              <p className="text-gray-600 text-sm sm:text-base lg:text-lg leading-relaxed">
                Purchase your {giftCard.brand} gift card instantly with cryptocurrency. Choose from multiple denominations and receive your code via email within minutes.
              </p>

              {/* Child Container - Select Amount Card */}
              <div className="mt-4 sm:mt-6 -mx-6 sm:-mx-8 -mb-6 sm:-mb-8 w-[calc(100%+3rem)] sm:w-[calc(100%+4rem)]">
                <DenominationSelector 
                  giftCardId={giftCard._id} 
                  denominations={giftCard.denominations}
                  currency={giftCard.currency}
                />
              </div>
            </div>
          </Card>

          {/* How it Works */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-blue-50">
              <CardContent className="p-5 sm:p-6 md:p-8">
                <h3 className="font-bold text-lg sm:text-xl mb-5 sm:mb-6 text-gray-900">How It Works</h3>
                <ul className="space-y-3 sm:space-y-4">
                  <li className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Select Your Amount</h4>
                      <p className="text-sm text-gray-600">Choose your preferred gift card denomination above</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Pay with Crypto</h4>
                      <p className="text-sm text-gray-600">Use Bitcoin, Ethereum, or 100+ other cryptocurrencies</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Get Your Code</h4>
                      <p className="text-sm text-gray-600">Receive your gift card code instantly via email</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Guarantee Badge */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <HugeIcon icon={CheckmarkCircle02Icon} size={32} className="text-green-600 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-green-900 mb-1">Money-Back Guarantee</h4>
                  <p className="text-sm text-green-700">
                    If your gift card code doesn't work, we'll refund your purchase - no questions asked.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Sections */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 max-w-7xl">
        <BenefitsSection title={`Why Choose Our ${giftCard.brand} Gift Cards?`} />
        <FAQSection brandName={giftCard.brand} />

        {/* Related Products Section */}
        {relatedCards.length > 0 && (
          <section className="mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">You Might Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedCards.map((card) => {
                const toSlug = (value: string) =>
                  value
                    .toLowerCase()
                    .trim()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/(^-|-$)+/g, "");
                
                return (
                  <Link key={card._id} href={`/store/${toSlug(card.brand)}`}>
                    <Card className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer h-full">
                      <CardContent className="p-6">
                        {card.image && (
                          <div className="relative w-full h-32 mb-4 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center p-3">
                            <Image
                              src={card.image}
                              alt={card.name}
                              fill
                              className="object-contain p-3"
                              sizes="(max-width: 768px) 100vw, 25vw"
                            />
                          </div>
                        )}
                        <h3 className="font-bold text-lg mb-2">{card.brand}</h3>
                        <p className="text-sm text-gray-600 mb-3">{card.name}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-blue-600">
                            ${Math.min(...card.denominations)} - ${Math.max(...card.denominations)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        <WhyChooseUsSection />
      </div>
    </div>
    </>
  );
}

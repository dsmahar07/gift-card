import { GiftCardCatalog } from "@/components/gift-card/gift-card-catalog";
import { getAllGiftCards, getCategories, getBrands } from "@/lib/queries";
import type { Metadata } from "next";
import { HeroSection } from "@/components/sections/hero-section";
import { BenefitsSection } from "@/components/sections/benefits-section";
import { FAQSection } from "@/components/sections/faq-section";
import { WhyChooseUsSection } from "@/components/sections/why-choose-us-section";
import { SITE_CONFIG } from "@/lib/constants";

// SEO Metadata for home page
export const metadata: Metadata = {
  title: `${SITE_CONFIG.name} - ${SITE_CONFIG.tagline} | 300+ Brands Available`,
  description: SITE_CONFIG.description,
  keywords: SITE_CONFIG.keywords.split(', '),
  openGraph: {
    title: `${SITE_CONFIG.name} - ${SITE_CONFIG.tagline}`,
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: `${SITE_CONFIG.url}/og-image.png`,
        width: 1200,
        height: 630,
        alt: `${SITE_CONFIG.name} - Buy Gift Cards with Cryptocurrency`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_CONFIG.name} - ${SITE_CONFIG.tagline}`,
    description: SITE_CONFIG.description,
    images: [`${SITE_CONFIG.url}/og-image.png`],
  },
  alternates: {
    canonical: SITE_CONFIG.url,
  },
};

export const revalidate = 3600; // Cache for 1 hour

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  
  // Fetch all data in parallel for speed
  const [allGiftCards, categories, brands] = await Promise.all([
    getAllGiftCards(resolvedSearchParams),
    getCategories(),
    getBrands(),
  ]);

  // Generate structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": SITE_CONFIG.name,
    "description": SITE_CONFIG.description,
    "url": SITE_CONFIG.url,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${SITE_CONFIG.url}?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <div>
        {/* Hero Section - Why Buy From Us */}
        <HeroSection />

        {/* Main Store Section - Gift Card Catalog */}
        <section className="pt-6 pb-16 sm:pt-8 sm:pb-20 md:pt-10 md:pb-24" style={{ backgroundColor: '#F5F5F7' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <GiftCardCatalog 
              initialGiftCards={allGiftCards}
            />
          </div>
        </section>

        {/* Additional Sections */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <BenefitsSection />
          <FAQSection />
          <WhyChooseUsSection />
        </div>
      </div>
    </>
  );
}

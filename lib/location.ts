import { headers, cookies } from "next/headers";

// Popular countries for gift cards
export const SUPPORTED_COUNTRIES = [
  { code: "US", name: "United States", currency: "USD" },
  { code: "CA", name: "Canada", currency: "CAD" },
  { code: "GB", name: "United Kingdom", currency: "GBP" },
  { code: "AU", name: "Australia", currency: "AUD" },
  { code: "DE", name: "Germany", currency: "EUR" },
  { code: "FR", name: "France", currency: "EUR" },
  { code: "IT", name: "Italy", currency: "EUR" },
  { code: "ES", name: "Spain", currency: "EUR" },
  { code: "NL", name: "Netherlands", currency: "EUR" },
  { code: "BR", name: "Brazil", currency: "BRL" },
  { code: "MX", name: "Mexico", currency: "MXN" },
  { code: "IN", name: "India", currency: "INR" },
  { code: "SG", name: "Singapore", currency: "SGD" },
  { code: "AE", name: "United Arab Emirates", currency: "AED" },
  { code: "SA", name: "Saudi Arabia", currency: "SAR" },
  { code: "ZA", name: "South Africa", currency: "ZAR" },
  { code: "NG", name: "Nigeria", currency: "NGN" },
  { code: "KE", name: "Kenya", currency: "KES" },
  { code: "PH", name: "Philippines", currency: "PHP" },
  { code: "ID", name: "Indonesia", currency: "IDR" },
];

export interface UserLocation {
  country: string;
  countryCode: string;
  currency: string;
}

/**
 * Get user's country from request headers
 * Works with Vercel, Cloudflare, and other providers
 */
export async function getUserLocation(): Promise<UserLocation> {
  try {
    const headersList = await headers();
    const cookieStore = await cookies();

    // 1) Highest priority: cookie set by middleware or previous selection
    const cookieCode = cookieStore.get("countryCode")?.value;

    // 2) Provider headers
    const headerCode =
      headersList.get("x-vercel-ip-country") || // Vercel
      headersList.get("cf-ipcountry") || // Cloudflare
      headersList.get("cloudfront-viewer-country") || // AWS CloudFront
      headersList.get("x-country-code") || // Generic
      undefined;

    const countryCode = (cookieCode || headerCode || "US").toUpperCase();

    // Find matching country in supported list
    const country = SUPPORTED_COUNTRIES.find(
      (c) => c.code === countryCode.toUpperCase()
    );

    if (country) {
      return {
        country: country.name,
        countryCode: country.code,
        currency: country.currency,
      };
    }

    // Default to US if country not found
    return {
      country: "United States",
      countryCode: "US",
      currency: "USD",
    };
  } catch (error) {
    console.error("Error detecting user location:", error);
    // Fallback to US
    return {
      country: "United States",
      countryCode: "US",
      currency: "USD",
    };
  }
}

/**
 * Get country info by country code
 */
export function getCountryByCode(code: string): UserLocation | undefined {
  const country = SUPPORTED_COUNTRIES.find(
    (c) => c.code.toUpperCase() === code.toUpperCase()
  );
  
  if (country) {
    return {
      country: country.name,
      countryCode: country.code,
      currency: country.currency,
    };
  }
  
  return undefined;
}

/**
 * Check if a country code is supported
 */
export function isCountrySupported(code: string): boolean {
  return SUPPORTED_COUNTRIES.some(
    (c) => c.code.toUpperCase() === code.toUpperCase()
  );
}

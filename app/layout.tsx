import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { SimpleHeader } from "@/components/layout/simple-header";
import { Footer } from "@/components/layout/footer";
import { SolanaWalletProvider } from "@/components/providers/wallet-provider";
import { SITE_CONFIG } from "@/lib/constants";
import "./globals.css";

// Force dynamic rendering for all pages - required for auth and database
export const dynamic = "force-dynamic";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${SITE_CONFIG.name} - ${SITE_CONFIG.tagline}`,
  description: SITE_CONFIG.description,
  keywords: SITE_CONFIG.keywords,
  authors: [{ name: SITE_CONFIG.name }],
  creator: SITE_CONFIG.name,
  publisher: SITE_CONFIG.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(SITE_CONFIG.url),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_CONFIG.url,
    title: `${SITE_CONFIG.name} - ${SITE_CONFIG.tagline}`,
    description: SITE_CONFIG.description,
    siteName: SITE_CONFIG.name,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_CONFIG.name} - ${SITE_CONFIG.tagline}`,
    description: SITE_CONFIG.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code', // Add your Google Search Console verification code
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <ClerkProvider
      appearance={{
        elements: {
          userButtonAvatarBox: "w-9 h-9",
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <head>
          {/* Preconnect to Clerk for faster auth */}
          <link rel="preconnect" href="https://clerk.com" />
          <link rel="dns-prefetch" href="https://clerk.com" />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen bg-[#f5f5f5]`}
          suppressHydrationWarning
        >
          <SolanaWalletProvider>
            <Suspense fallback={
              <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b">
                <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-2 sm:py-3 h-14" />
              </div>
            }>
              <SimpleHeader />
            </Suspense>
            <main className="flex-1">{children}</main>
            <Footer />
            <Toaster />
          </SolanaWalletProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

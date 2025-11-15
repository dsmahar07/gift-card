import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/account(.*)",
  "/admin(.*)",
  "/checkout(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  // Geo: extract country code from provider headers and persist in cookie
  const countryHeader =
    req.headers.get("x-vercel-ip-country") ||
    req.headers.get("cf-ipcountry") ||
    req.headers.get("cloudfront-viewer-country") ||
    req.headers.get("x-country-code") ||
    undefined;

  const res = NextResponse.next();

  // Allow explicit override via query (?countryCode=XX)
  const { searchParams } = new URL(req.url);
  const override = searchParams.get("countryCode") || undefined;
  const code = (override || countryHeader || "US").toUpperCase();

  // Store country code cookie for server components to read
  res.cookies.set("countryCode", code, { path: "/", maxAge: 60 * 60 * 24 * 7 });

  return res;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

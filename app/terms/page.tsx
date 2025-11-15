import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms & Conditions | Giftswap",
  description: "Read the terms and conditions for using Giftswap.",
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 max-w-3xl">
      <h1 className="text-3xl sm:text-4xl font-bold mb-6">Terms & Conditions</h1>
      <p className="text-gray-600 mb-6">
        Welcome to Giftswap. By accessing or using our website, you agree to be bound by these Terms & Conditions. If you do not agree with any part, you must not use the Service.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">1. Service</h2>
      <p className="text-gray-600">We sell and deliver digital gift card codes. Delivery is typically instant after successful payment and verification.</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">2. Eligibility</h2>
      <p className="text-gray-600">You must be at least 18 years old or have legal guardian consent to use the Service.</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">3. Pricing & Currency</h2>
      <p className="text-gray-600">Prices are shown in your local currency where available and may vary by country and product provider. Taxes or fees (if any) are shown at checkout.</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">4. Payments</h2>
      <p className="text-gray-600">Payments are processed by third‑party gateways. Crypto payments are final. Orders may be cancelled or refunded if fraud is suspected or if we cannot fulfill the order.</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">5. Delivery</h2>
      <p className="text-gray-600">Codes are sent to the email you provide. Ensure the email is correct. We are not responsible for delays caused by payment networks or providers.</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">6. Redemption & Restrictions</h2>
      <p className="text-gray-600">Each gift card is subject to the brand’s terms, country restrictions, and redemption rules. Verify compatibility before purchase. We do not control provider policies.</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">7. Refunds</h2>
      <p className="text-gray-600">If a delivered code is invalid or cannot be redeemed, contact support within 24 hours. Upon verification, we will replace or refund at our discretion.</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">8. Prohibited Use</h2>
      <p className="text-gray-600">Do not use the Service for unlawful activity, AML violations, chargebacks, or abuse. We may suspend accounts that violate these terms.</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">9. Accounts</h2>
      <p className="text-gray-600">You are responsible for maintaining the confidentiality of your account and for all activities occurring under it.</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">10. Liability</h2>
      <p className="text-gray-600">To the maximum extent permitted by law, Giftswap is not liable for indirect or consequential damages arising from the use of the Service.</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">11. Changes</h2>
      <p className="text-gray-600">We may update these Terms at any time. Continued use constitutes acceptance of the revised Terms.</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">12. Contact</h2>
      <p className="text-gray-600">Questions? Email us at <a href="mailto:support@giftswap.shop" className="text-purple-600">support@giftswap.shop</a>.</p>

      <div className="mt-10">
        <Link href="/" className="text-purple-600 hover:underline">← Back to Home</Link>
      </div>
    </div>
  );
}

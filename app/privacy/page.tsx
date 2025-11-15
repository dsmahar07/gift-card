import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Giftswap",
  description: "Learn how Giftswap collects, uses, and protects your data.",
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 max-w-3xl">
      <h1 className="text-3xl sm:text-4xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-gray-600 mb-6">
        This Privacy Policy explains how we collect, use, and safeguard your information when you use Giftswap.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">1. Information We Collect</h2>
      <ul className="list-disc pl-6 text-gray-600 space-y-2">
        <li>Account and contact information (e.g., email).</li>
        <li>Order and payment metadata (processed by third‑party gateways).</li>
        <li>Technical data such as IP, device, and cookies for security and analytics.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">2. How We Use Information</h2>
      <ul className="list-disc pl-6 text-gray-600 space-y-2">
        <li>To process and deliver gift card orders.</li>
        <li>To prevent fraud, abuse, and unauthorized access.</li>
        <li>To improve our products, support, and user experience.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">3. Cookies</h2>
      <p className="text-gray-600">We use cookies to maintain sessions, remember preferences (including country), and for security. You can control cookies via your browser settings.</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">4. Data Sharing</h2>
      <p className="text-gray-600">We share data with service providers (e.g., payment processors, email delivery) strictly to operate the Service. We do not sell personal data.</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">5. Security</h2>
      <p className="text-gray-600">We apply industry-standard security to protect data. No method is 100% secure; use strong passwords and keep your account safe.</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">6. Your Rights</h2>
      <p className="text-gray-600">You may request access, correction, or deletion of your data where applicable. Contact support to submit a request.</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">7. International Transfers</h2>
      <p className="text-gray-600">Your data may be processed in countries other than your own. We take steps to ensure appropriate safeguards.</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">8. Changes</h2>
      <p className="text-gray-600">We may update this Privacy Policy from time to time. Material changes will be reflected on this page.</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">9. Contact</h2>
      <p className="text-gray-600">Questions? Email us at <a href="mailto:support@giftswap.shop" className="text-purple-600">support@giftswap.shop</a>.</p>

      <div className="mt-10">
        <Link href="/" className="text-purple-600 hover:underline">← Back to Home</Link>
      </div>
    </div>
  );
}

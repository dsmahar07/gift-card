import Link from "next/link";
import { HugeIcon } from "@/components/ui/hugeicon";
import { 
  GiftIcon, 
  Mail01Icon, 
  MessageQuestionIcon,
  LegalDocumentIcon,
  FileSecurityIcon,
  Bitcoin01Icon,
  EthereumIcon
} from '@hugeicons/core-free-icons';
import { TrustBadges } from "@/components/sections/trust-badges";
import { SITE_CONFIG } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12 mb-8 sm:mb-12">
          {/* About Section */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <HugeIcon icon={GiftIcon} size={24} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{SITE_CONFIG.name.replace(" Marketplace", "")}</h3>
                <p className="text-xs text-gray-400">{SITE_CONFIG.tagline}</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              {SITE_CONFIG.description}. Fast, secure, and instant delivery.
            </p>
            <div className="flex gap-4 mt-6">
              <div className="flex items-center gap-2 text-xs">
                <HugeIcon icon={Bitcoin01Icon} size={20} className="text-orange-400" />
                <span className="text-gray-400">BTC</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <HugeIcon icon={EthereumIcon} size={20} className="text-blue-400" />
                <span className="text-gray-400">ETH</span>
              </div>
              <div className="text-xs text-gray-400">+100 more</div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-6 text-white">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-sm text-gray-400 hover:text-purple-400 transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Browse Gift Cards
                </Link>
              </li>
              <li>
                <Link href="/?category=Popular" className="text-sm text-gray-400 hover:text-purple-400 transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Popular Brands
                </Link>
              </li>
              <li>
                <Link href="/account/orders" className="text-sm text-gray-400 hover:text-purple-400 transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  My Orders
                </Link>
              </li>
              <li>
                <Link href="/" className="text-sm text-gray-400 hover:text-purple-400 transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  All Categories
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-lg mb-6 text-white">Support</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm text-gray-400 hover:text-purple-400 transition-colors flex items-center gap-3">
                  <HugeIcon icon={MessageQuestionIcon} size={16} className="text-purple-400" />
                  Help Center
                </a>
              </li>
              <li>
                <a href="mailto:support@giftcard.com" className="text-sm text-gray-400 hover:text-purple-400 transition-colors flex items-center gap-3">
                  <HugeIcon icon={Mail01Icon} size={16} className="text-purple-400" />
                  Contact Us
                </a>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-gray-400 hover:text-purple-400 transition-colors flex items-center gap-3">
                  <HugeIcon icon={LegalDocumentIcon} size={16} className="text-purple-400" />
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-gray-400 hover:text-purple-400 transition-colors flex items-center gap-3">
                  <HugeIcon icon={FileSecurityIcon} size={16} className="text-purple-400" />
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Payment Methods */}
          <div>
            <h3 className="font-semibold text-lg mb-6 text-white">Payment Methods</h3>
            <p className="text-sm text-gray-400 mb-4 leading-relaxed">
              We accept 100+ cryptocurrencies through secure payment gateways.
            </p>
            <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg p-4">
              <p className="text-xs font-semibold text-purple-400 mb-2">POWERED BY</p>
              <p className="text-sm font-bold text-white">NOWPayments</p>
              <p className="text-xs text-gray-400 mt-1">Secure Crypto Gateway</p>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-400">24/7 Available</span>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <TrustBadges />

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-6 sm:pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs sm:text-sm text-gray-400 text-center sm:text-left">
              &copy; {new Date().getFullYear()} {SITE_CONFIG.name}. All rights reserved.
            </p>
            <div className="flex items-center flex-wrap justify-center gap-4 sm:gap-6 text-xs text-gray-500">
              <Link href="/terms" className="hover:text-purple-400 transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-purple-400 transition-colors">Privacy</Link>
              <a href="#" className="hover:text-purple-400 transition-colors">Cookies</a>
              <a href="#" className="hover:text-purple-400 transition-colors">Legal</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}


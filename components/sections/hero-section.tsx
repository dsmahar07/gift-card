import { HugeIcon } from "@/components/ui/hugeicon";
import { 
  ShieldIcon, 
  Clock01Icon, 
  CreditCardIcon,
  Wallet02Icon,
  CheckmarkCircle02Icon 
} from '@hugeicons/core-free-icons';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 text-white">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:py-12">
        {/* Main content */}
        <div className="text-center mb-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
            <HugeIcon icon={Wallet02Icon} size={16} className="text-yellow-300" />
            <span className="text-sm font-medium">Buy Gift Cards with Crypto</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
            Gift Cards Made Simple
            <br />
            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              Pay with Crypto
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed">
            Shop 300+ top brands. Instant delivery. 100% secure. 
            <br className="hidden sm:block" />
            The fastest way to spend your cryptocurrency.
          </p>

          {/* Trust indicators - 3 columns on desktop, stacked on mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto mb-6">
            <div className="flex items-center justify-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <HugeIcon icon={Clock01Icon} size={24} className="text-green-300 flex-shrink-0" />
              <span className="text-sm sm:text-base font-medium">Instant Delivery</span>
            </div>
            
            <div className="flex items-center justify-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <HugeIcon icon={ShieldIcon} size={24} className="text-blue-300 flex-shrink-0" />
              <span className="text-sm sm:text-base font-medium">100% Secure</span>
            </div>
            
            <div className="flex items-center justify-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <HugeIcon icon={CreditCardIcon} size={24} className="text-purple-300 flex-shrink-0" />
              <span className="text-sm sm:text-base font-medium">Crypto Payments</span>
            </div>
          </div>
        </div>

        {/* Key features - Why buy from us */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/10">
            <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center">Why Choose Us?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Feature 1 */}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <HugeIcon icon={CheckmarkCircle02Icon} size={20} className="text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Instant Email Delivery</h3>
                  <p className="text-sm text-white/80">
                    Receive your gift card code via email within minutes. No waiting, no hassle.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <HugeIcon icon={CheckmarkCircle02Icon} size={20} className="text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Multiple Cryptocurrencies</h3>
                  <p className="text-sm text-white/80">
                    Pay with Bitcoin, Ethereum, USDT, and 100+ other cryptocurrencies.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <HugeIcon icon={CheckmarkCircle02Icon} size={20} className="text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Secure & Anonymous</h3>
                  <p className="text-sm text-white/80">
                    Your transactions are encrypted and private. Shop with confidence.
                  </p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <HugeIcon icon={CheckmarkCircle02Icon} size={20} className="text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">24/7 Customer Support</h3>
                  <p className="text-sm text-white/80">
                    Our support team is always ready to help you with any questions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold mb-1">300+</div>
            <div className="text-sm text-white/80">Gift Cards</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold mb-1">100+</div>
            <div className="text-sm text-white/80">Cryptocurrencies</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold mb-1">5 Min</div>
            <div className="text-sm text-white/80">Avg. Delivery</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold mb-1">24/7</div>
            <div className="text-sm text-white/80">Support</div>
          </div>
        </div>
      </div>
    </section>
  );
}

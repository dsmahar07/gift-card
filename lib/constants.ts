// Crypto currencies configuration
export const CRYPTO_CURRENCIES = [
  { value: "USDT", label: "Tether (USDT) - Low Fees ⚡" },
  { value: "TRX", label: "Tron (TRX) - Low Fees ⚡" },
  { value: "LTC", label: "Litecoin (LTC) - Low Fees ⚡" },
  { value: "BCH", label: "Bitcoin Cash (BCH)" },
  { value: "XRP", label: "Ripple (XRP)" },
  { value: "ETH", label: "Ethereum (ETH)" },
  { value: "BTC", label: "Bitcoin (BTC) - Higher Min" },
] as const;

// Site metadata
export const SITE_CONFIG = {
  name: "Giftswap.shop",
  description: "Buy gift cards from 300+ top brands instantly with cryptocurrency. Secure, fast, and anonymous. Pay with Bitcoin, Ethereum, USDT, and 100+ cryptocurrencies.",
  url: "https://giftswap.shop",
  tagline: "Buy Gift Cards with Crypto",
  keywords: "buy gift cards with crypto, cryptocurrency gift cards, bitcoin gift cards, ethereum gift cards, crypto to gift card, instant gift cards, digital gift cards, Amazon gift card crypto, Netflix gift card crypto",
} as const;

// Trust badges
export const TRUST_BADGES = [
  { value: "300+", label: "Brands Available", color: "purple" },
  { value: "100+", label: "Cryptocurrencies", color: "blue" },
  { value: "⚡", label: "Instant Delivery", color: "green" },
  { value: "🔒", label: "Secure & Encrypted", color: "yellow" },
] as const;

// Benefits/Features
export const BENEFITS = [
  {
    id: "secure",
    title: "100% Secure",
    description: "All transactions are encrypted and secure. Your payment information is protected with industry-standard security.",
    icon: "shield",
    color: "blue",
  },
  {
    id: "instant",
    title: "Instant Delivery",
    description: "Receive your gift card code instantly via email. No waiting, no delays - get your code within minutes.",
    icon: "clock",
    color: "green",
  },
  {
    id: "crypto",
    title: "Crypto Payments",
    description: "Pay with Bitcoin, Ethereum, USDT, and 100+ other cryptocurrencies. Fast, secure, and decentralized.",
    icon: "money",
    color: "purple",
  },
] as const;

// FAQs
export const FAQS = [
  {
    id: "delivery-time",
    question: "How quickly will I receive my gift card?",
    answer: "You'll receive your gift card code instantly via email after your payment is confirmed. Typically within 1-5 minutes.",
  },
  {
    id: "cryptocurrencies",
    question: "What cryptocurrencies do you accept?",
    answer: "We accept 100+ cryptocurrencies including Bitcoin (BTC), Ethereum (ETH), USDT, TRX, LTC, BCH, XRP, and many more.",
  },
  {
    id: "code-not-working",
    question: "What if my gift card code doesn't work?",
    answer: "We offer a 100% money-back guarantee. If your gift card code doesn't work, contact us and we'll refund your purchase immediately.",
  },
  {
    id: "international",
    question: "Can I use gift cards internationally?",
    answer: "Gift cards can typically be used in the region where they were purchased. Check each brand's terms and conditions for specific regional restrictions.",
  },
] as const;

// Why Choose Us points
export const WHY_CHOOSE_US = [
  {
    id: "trusted",
    title: "Trusted by Thousands",
    description: "We've processed thousands of gift card purchases with a 99.9% success rate and excellent customer satisfaction.",
    icon: "star",
    gradient: "from-purple-600 to-blue-600",
  },
  {
    id: "secure-private",
    title: "Secure & Private",
    description: "Your privacy is our priority. We use advanced encryption and never store your payment information.",
    icon: "security",
    gradient: "from-blue-600 to-cyan-600",
  },
  {
    id: "instant-delivery",
    title: "Instant Delivery",
    description: "No waiting around. Get your gift card code delivered to your email within minutes of payment confirmation.",
    icon: "delivery",
    gradient: "from-cyan-600 to-green-600",
  },
  {
    id: "money-back",
    title: "Money-Back Guarantee",
    description: "If you're not satisfied for any reason, we offer a full refund - no questions asked.",
    icon: "checkmark",
    gradient: "from-green-600 to-emerald-600",
  },
] as const;

// How it works steps
export const HOW_IT_WORKS = [
  {
    step: 1,
    title: "Select Your Amount",
    description: "Choose your preferred gift card denomination above",
    gradient: "from-purple-500 to-purple-600",
  },
  {
    step: 2,
    title: "Pay with Crypto",
    description: "Use Bitcoin, Ethereum, or 100+ other cryptocurrencies",
    gradient: "from-blue-500 to-blue-600",
  },
  {
    step: 3,
    title: "Get Your Code",
    description: "Receive your gift card code instantly via email",
    gradient: "from-cyan-500 to-cyan-600",
  },
] as const;


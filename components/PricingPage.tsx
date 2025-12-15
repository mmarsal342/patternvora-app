
import React, { useState } from 'react';
import { Check, X, ArrowLeft, AlertCircle, Globe } from 'lucide-react';
import { useUser } from './UserContext';

interface PricingPageProps {
  onBack: () => void;
  onStartFree: () => void;
}

// Payment URLs by currency
const CHECKOUT_URLS = {
  IDR: {
    pro_monthly: 'https://lynk.id/mma267/3kevpmq25r77/checkout',
    lifetime: 'https://lynk.id/mma267/vqdp1njd69qn/checkout',
  },
  USD: {
    pro_monthly: 'https://patternvora.lemonsqueezy.com/buy/de19f34a-1e18-4096-a8f0-3f5ff51e0d1e',
    lifetime: 'https://patternvora.lemonsqueezy.com/buy/b53c3319-7352-423a-99be-a245f8ccf5c9',
  },
};

type Currency = 'IDR' | 'USD';

const PricingPage: React.FC<PricingPageProps> = ({ onBack, onStartFree }) => {
  const { user, login } = useUser();
  const [currency, setCurrency] = useState<Currency>('IDR');
  const [showEmailModal, setShowEmailModal] = useState<string | null>(null); // Stores which plan's modal to show

  const handleSubscribe = (planId: string) => {
    // 1. Require Login first
    if (!user) {
      const confirmLogin = window.confirm(
        "You need to log in with Google first to subscribe.\n\nIMPORTANT: Use the same email address when completing checkout!\n\nProceed to login?"
      );
      if (confirmLogin) {
        login(); // This redirects to Google OAuth
      }
      return;
    }

    // 2. Show email reminder modal
    setShowEmailModal(planId);
  };

  const proceedToCheckout = (planId: string) => {
    setShowEmailModal(null);

    // Redirect to appropriate checkout based on currency
    const urls = CHECKOUT_URLS[currency];
    const checkoutUrl = planId === 'lifetime' ? urls.lifetime : urls.pro_monthly;

    // Validate URL before redirect
    if (!checkoutUrl || !checkoutUrl.startsWith('http')) {
      alert('Checkout is temporarily unavailable. Please try again later or contact support.');
      return;
    }

    window.location.href = checkoutUrl;
  };

  // Price configuration for each currency
  const prices = {
    IDR: {
      free: 'Rp 0',
      pro_monthly: 'Rp 49.000',
      pro_monthly_original: 'Rp 99.000',
      lifetime: 'Rp 490.000',
      lifetime_original: 'Rp 990.000',
    },
    USD: {
      free: '$0',
      pro_monthly: '$4.90',
      pro_monthly_original: '$9.90',
      lifetime: '$49',
      lifetime_original: '$99',
    },
  };

  const currentPrices = prices[currency];
  const paymentProvider = currency === 'IDR' ? 'Lynk.id' : 'LemonSqueezy';

  const plans = [
    {
      id: 'free',
      name: "Free",
      badge: "The Hobbyist",
      price: currentPrices.free,
      period: 'forever',
      description: "Perfect for testing the waters and personal exploration.",
      features: [
        "Unlimited Pattern Generation",
        "Standard Export Speed",
        "Access to basic shapes",
        "Community Support"
      ],
      limitations: [
        "Watermark on exports",
        "Limit 10 exports / month",
        "No Commercial License",
        "Max Resolution 1000px"
      ],
      cta: "Start Creating",
      ctaStyle: "bg-slate-100 text-slate-700 hover:bg-slate-200",
      action: onStartFree,
      highlight: false
    },
    {
      id: 'pro_monthly',
      name: "Pro Monthly",
      badge: "The Creator",
      price: currentPrices.pro_monthly,
      originalPrice: currentPrices.pro_monthly_original,
      period: 'per month',
      description: "For consistent content production and high-quality assets.",
      features: [
        "Everything in Free",
        "No Watermark",
        "4K Image Exports",
        "1080p Video Loops",
        "Unlimited Exports",
        "Commercial License",
        "Priority Rendering Queue"
      ],
      limitations: [],
      cta: "Subscribe Now",
      ctaStyle: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200",
      action: () => handleSubscribe('pro_monthly'),
      highlight: true,
      popular: true
    },
    {
      id: 'lifetime',
      name: "Lifetime Deal",
      badge: "The Agency",
      price: currentPrices.lifetime,
      originalPrice: currentPrices.lifetime_original,
      period: 'one-time payment',
      description: "Pay once, own it forever. The smartest investment for agencies.",
      features: [
        "All Pro Features included",
        "Lifetime Access",
        "No monthly fees",
        "Future updates included",
        "VIP Support",
        "Early access to new features"
      ],
      limitations: [],
      cta: "🔥 Best Value - Get Lifetime",
      ctaStyle: "bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-200",
      action: () => handleSubscribe('lifetime'),
      highlight: false
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100">
      {/* Email Reminder Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">Before you proceed...</h3>
                <p className="text-sm text-slate-500">Important checkout reminder</p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-amber-800 mb-3">
                <strong>Your PatternVora account email:</strong>
              </p>
              <code className="block bg-white px-3 py-2 rounded-lg text-indigo-600 font-mono text-sm border border-amber-200">
                {user?.email}
              </code>
              <p className="text-xs text-amber-700 mt-3">
                ⚠️ Please use <strong>this exact email</strong> when completing payment on {paymentProvider} to ensure your account is upgraded.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowEmailModal(null)}
                className="flex-1 px-4 py-3 border border-slate-300 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => proceedToCheckout(showEmailModal)}
                className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
              >
                I Understand →
              </button>
            </div>
          </div>
        </div>
      )}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={onBack}>
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">P</div>
            <span className="font-bold text-lg tracking-tight">PatternVora</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="text-sm font-medium text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft size={16} /> Back to Home
            </button>
            <button
              onClick={onStartFree}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-full transition-all shadow-lg shadow-indigo-600/20"
            >
              Open Studio
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-6">
            Simple, transparent pricing.
          </h1>
          <p className="text-xl text-slate-600 mb-8">
            No hidden fees. Cancel anytime. Choose the plan that fits your workflow.
          </p>

          {/* Currency Toggle */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <span className={`text-sm font-medium transition-colors ${currency === 'IDR' ? 'text-slate-900' : 'text-slate-400'}`}>
              🇮🇩 IDR
            </span>
            <button
              onClick={() => setCurrency(currency === 'IDR' ? 'USD' : 'IDR')}
              className="relative w-14 h-7 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full p-1 transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300"
              aria-label="Toggle currency"
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 flex items-center justify-center ${currency === 'USD' ? 'translate-x-7' : 'translate-x-0'}`}
              >
                <Globe size={12} className="text-indigo-600" />
              </div>
            </button>
            <span className={`text-sm font-medium transition-colors ${currency === 'USD' ? 'text-slate-900' : 'text-slate-400'}`}>
              🌍 USD
            </span>
          </div>

          {/* Early Bird Banner */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-rose-100 px-4 py-2 rounded-full text-sm font-medium text-amber-800 border border-amber-200">
            <span>🎉</span>
            <span>Launch Special: Up to 50% OFF for Early Birds!</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-start">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-2xl p-8 border transition-all duration-300 ${plan.highlight
                ? 'border-indigo-200 shadow-2xl scale-105 z-10'
                : 'border-slate-200 shadow-xl hover:border-slate-300 hover:shadow-2xl'
                }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 ${index === 0 ? 'bg-slate-100 text-slate-600' :
                  index === 1 ? 'bg-indigo-100 text-indigo-600' : 'bg-rose-100 text-rose-600'
                  }`}>
                  {plan.badge}
                </span>
                <h3 className="text-2xl font-bold text-slate-900">{plan.name}</h3>
                <p className="text-slate-500 text-sm mt-2 min-h-[40px]">{plan.description}</p>
              </div>

              <div className="mb-6 pb-6 border-b border-slate-100">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900">{plan.price}</span>
                  <span className="text-slate-500 font-medium">/{plan.period.replace('one-time payment', 'life')}</span>
                </div>
                {plan.period === 'one-time payment' && (
                  <p className="text-xs text-rose-500 font-semibold mt-1">One-time payment. No recurring fees.</p>
                )}
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                    <div className={`mt-0.5 rounded-full p-0.5 ${plan.highlight ? 'bg-indigo-100 text-indigo-600' : 'bg-green-100 text-green-600'}`}>
                      <Check size={12} strokeWidth={3} />
                    </div>
                    {feature}
                  </li>
                ))}
                {plan.limitations.map((limit, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-400">
                    <div className="mt-0.5 rounded-full p-0.5 bg-slate-100 text-slate-400">
                      <X size={12} strokeWidth={3} />
                    </div>
                    {limit}
                  </li>
                ))}
              </ul>

              <button
                onClick={plan.action}
                className={`w-full py-4 rounded-xl font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2 ${plan.ctaStyle}`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center border-t border-slate-200 pt-16">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Enterprise or Team?</h3>
          <p className="text-slate-600 max-w-2xl mx-auto mb-8">
            Need more than 10 seats? We offer custom team plans with centralized billing and dedicated support.
          </p>
          <a href="mailto:sales@voralab.com" className="text-indigo-600 font-bold hover:underline">Contact Sales &rarr;</a>
        </div>
      </main>

      <footer className="bg-slate-50 border-t border-slate-200 py-12 text-center text-sm text-slate-500">
        <p>&copy; {new Date().getFullYear()} VoraLab. All rights reserved.</p>
        <p className="mt-2">Secure payments processed by {currency === 'IDR' ? 'Lynk.id' : 'LemonSqueezy'}.</p>
      </footer>
    </div>
  );
};

export default PricingPage;

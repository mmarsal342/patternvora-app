
import React, { useState } from 'react';
import { Check, X, ArrowLeft, Loader2 } from 'lucide-react';
import { useUser } from './UserContext';
import { api } from '../services/api';

interface PricingPageProps {
  onBack: () => void;
  onStartFree: () => void;
}

const PricingPage: React.FC<PricingPageProps> = ({ onBack, onStartFree }) => {
  const { user, login } = useUser();
  const [currency, setCurrency] = useState<'USD' | 'IDR'>('USD');
  const [isProcessing, setIsProcessing] = useState<string | null>(null); // Stores Plan Name being processed

  const handleSubscribe = async (planId: string, planName: string) => {
      // 1. Require Login first
      if (!user) {
          const confirmLogin = window.confirm("You need to log in first to subscribe. Login as Demo User?");
          if (confirmLogin) {
              await login();
          }
          return;
      }

      setIsProcessing(planName);

      try {
          // 2. Mock Logic vs Real Logic
          // In real implementation, we call api.createCheckoutSession
          // For now, we simulate a redirect or success
          
          /* REAL CODE:
          const checkoutUrl = await api.createCheckoutSession(planId, currency);
          window.location.href = checkoutUrl;
          */

          // SIMULATION:
          await new Promise(r => setTimeout(r, 1500));
          alert(`Redirecting to ${currency === 'IDR' ? 'Mayar.id' : 'Stripe'} checkout for ${planName}...`);
          
          // Simulate return
          window.location.href = "/?payment_success=true";

      } catch (e) {
          alert("Failed to initiate checkout.");
          setIsProcessing(null);
      }
  };

  const plans = [
    {
      id: 'free',
      name: "Free",
      badge: "The Hobbyist",
      price: currency === 'USD' ? '$0' : 'Rp 0',
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
      price: currency === 'USD' ? '$4.99' : 'Rp 50.000',
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
      cta: "Subscribe Monthly",
      ctaStyle: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200",
      action: () => handleSubscribe('pro_monthly', "Pro Monthly"),
      highlight: true,
      popular: true
    },
    {
      id: 'ltd_lifetime',
      name: "Lifetime Deal",
      badge: "The Agency",
      price: currency === 'USD' ? '$49' : 'Rp 500.000',
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
      cta: "Get Lifetime Access",
      ctaStyle: "bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-200",
      action: () => handleSubscribe('ltd_lifetime', "Lifetime Deal"),
      highlight: false
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100">
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={onBack}>
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">P</div>
            <span className="font-bold text-lg tracking-tight">PatternVora</span>
          </div>
          <button 
            onClick={onBack}
            className="text-sm font-medium text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Home
          </button>
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
          <div className="inline-flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
            <button 
              onClick={() => setCurrency('USD')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                currency === 'USD' 
                  ? 'bg-slate-900 text-white shadow-md' 
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              USD ($)
            </button>
            <button 
              onClick={() => setCurrency('IDR')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                currency === 'IDR' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              IDR (Rp)
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-start">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`relative bg-white rounded-2xl p-8 border transition-all duration-300 ${
                plan.highlight 
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
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 ${
                  index === 0 ? 'bg-slate-100 text-slate-600' :
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
                disabled={!!isProcessing}
                className={`w-full py-4 rounded-xl font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2 ${plan.ctaStyle} ${isProcessing ? 'opacity-70 cursor-wait' : ''}`}
              >
                {isProcessing === plan.name ? (
                    <>
                        <Loader2 size={16} className="animate-spin" /> Processing...
                    </>
                ) : plan.cta}
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
        <p className="mt-2">Secure payments processed by Antigravity (Stripe/Mayar).</p>
      </footer>
    </div>
  );
};

export default PricingPage;

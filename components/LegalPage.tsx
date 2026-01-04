import React, { useState } from 'react';
import { ArrowLeft, Check, X } from 'lucide-react';

interface LegalPageProps {
    onBack: () => void;
    initialTab?: 'tos' | 'privacy' | 'refund' | 'faq';
}

const LegalPage: React.FC<LegalPageProps> = ({ onBack, initialTab = 'tos' }) => {
    const [activeTab, setActiveTab] = useState<'tos' | 'privacy' | 'refund' | 'faq'>(initialTab);

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-sm text-slate-600 hover:text-indigo-600 transition-colors"
                    >
                        <ArrowLeft size={16} />
                        <span>Back</span>
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">P</div>
                        <span className="font-bold text-slate-900">PatternVora</span>
                    </div>
                </div>
            </nav>

            {/* Tab Buttons */}
            <div className="max-w-4xl mx-auto px-6 pt-8">
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={() => setActiveTab('tos')}
                        className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all ${activeTab === 'tos'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                    >
                        Terms of Service
                    </button>
                    <button
                        onClick={() => setActiveTab('privacy')}
                        className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all ${activeTab === 'privacy'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                    >
                        Privacy Policy
                    </button>
                    <button
                        onClick={() => setActiveTab('refund')}
                        className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all ${activeTab === 'refund'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                    >
                        Refund Policy
                    </button>
                    <button
                        onClick={() => setActiveTab('faq')}
                        className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all ${activeTab === 'faq'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                    >
                        FAQ
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-6 py-8">
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8 md:p-12">
                    {activeTab === 'tos' && <TermsOfService />}
                    {activeTab === 'privacy' && <PrivacyPolicy />}
                    {activeTab === 'refund' && <RefundPolicy />}
                    {activeTab === 'faq' && <FAQContent />}
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-slate-50 border-t border-slate-200 py-8 text-center text-sm text-slate-500">
                <p>&copy; {new Date().getFullYear()} VoraLab. All rights reserved.</p>
            </footer>
        </div>
    );
};

const TermsOfService: React.FC = () => {
    return (
        <div className="prose prose-slate max-w-none">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Terms of Service</h1>
            <p className="text-sm text-slate-500 mb-8">Last Updated: December 15, 2025</p>

            {/* License at a Glance */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
                <h3 className="text-lg font-bold text-slate-900 mb-4">License at a Glance</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="flex items-center gap-2 text-green-600 font-semibold mb-3">
                            <Check size={18} /> What You Can Do (Everything)
                        </h4>
                        <ul className="space-y-2 text-sm text-slate-600">
                            <li className="flex items-center gap-2"><span className="w-2 h-2 bg-green-500 rounded-full"></span> Resell as Stock Footage/Images</li>
                            <li className="flex items-center gap-2"><span className="w-2 h-2 bg-green-500 rounded-full"></span> Create Asset Packs for sale</li>
                            <li className="flex items-center gap-2"><span className="w-2 h-2 bg-green-500 rounded-full"></span> Use in Unlimited Commercial Projects</li>
                            <li className="flex items-center gap-2"><span className="w-2 h-2 bg-green-500 rounded-full"></span> Broadcast, TV, Cinema, YouTube</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="flex items-center gap-2 text-red-600 font-semibold mb-3">
                            <X size={18} /> Strictly Prohibited (Illegal)
                        </h4>
                        <ul className="space-y-2 text-sm text-slate-600">
                            <li className="flex items-center gap-2"><span className="w-2 h-2 bg-red-500 rounded-full"></span> Generating Hateful or Racist content</li>
                            <li className="flex items-center gap-2"><span className="w-2 h-2 bg-red-500 rounded-full"></span> Using assets for Scams or Fraud</li>
                            <li className="flex items-center gap-2"><span className="w-2 h-2 bg-red-500 rounded-full"></span> Creating visually harmful strobe effects for malicious intent</li>
                        </ul>
                    </div>
                </div>
            </div>

            <p className="text-slate-600">
                Welcome to PatternVora. By accessing our website and using our pattern generator tools, you agree to be bound by these Terms of Service.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">1. Usage Rights & Full Ownership</h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
                <li><strong>Total Freedom:</strong> We believe that if you click the button, you own the pixels. Assets generated with PatternVora (Pro & Lifetime tiers) come with <strong>Full Resell Rights</strong>.</li>
                <li><strong>Commercial & Resale:</strong> You ARE ALLOWED to resell the generated assets (images, patterns, or videos), include them in paid asset packs, upload them to stock sites (like Shutterstock, Getty, etc.), or sell them on your own website.</li>
                <li><strong>No Attribution Required:</strong> You do not need to credit PatternVora, though we appreciate it if you do.</li>
            </ul>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">2. Prohibited Content (Zero Tolerance)</h2>
            <p className="text-slate-600">
                While you own the copyright to your creations, you strictly agree <strong>NOT</strong> to use PatternVora for any of the following:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
                <li><strong>Illegal Content:</strong> Any content that violates the laws of your jurisdiction or international law.</li>
                <li><strong>Hate Speech:</strong> Content that promotes violence, discrimination, or hatred against individuals or groups.</li>
                <li><strong>Malicious Use:</strong> Using generated assets to deceive, defraud, or harm others (e.g., fake deepfakes backgrounds, phishing sites).</li>
            </ul>
            <p className="text-sm text-slate-500 italic mt-4">
                Violation of these terms will result in immediate termination of your account without refund.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">3. Intellectual Property</h2>
            <p className="text-slate-600">
                VoraLab retains ownership of the <strong>software and code</strong> (the generator tool itself). You retain ownership of the <strong>output</strong> (images, patterns, videos, and any other file types generated).
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">4. Payments & Refunds</h2>
            <p className="text-slate-600">
                We offer a <strong>14-day money-back guarantee</strong> on all purchases. See our <strong>Refund Policy</strong> tab for full details.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 mt-3">
                <li><strong>Monthly Subscriptions:</strong> Billed in advance. Cancel anytime. Refund available within 14 days of purchase or renewal.</li>
                <li><strong>Lifetime Deals:</strong> One-time payment. Refund available within 14 days of purchase.</li>
            </ul>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">5. Limitation of Liability</h2>
            <p className="text-slate-600">
                PatternVora is provided "as is". VoraLab is not liable for any damages arising from the use of the service. You are responsible for ensuring your generated content complies with the laws of the platforms where you publish it.
            </p>
        </div>
    );
};

const PrivacyPolicy: React.FC = () => {
    return (
        <div className="prose prose-slate max-w-none">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
            <p className="text-sm text-slate-500 mb-8">Last Updated: December 15, 2025</p>

            <p className="text-slate-600">
                At VoraLab, we prioritize your privacy. PatternVora operates on a <strong>Local-First</strong> principle. We do not spy on your creativity.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">1. Data Processing</h2>
            <p className="text-slate-600">
                <strong>Local Rendering:</strong> PatternVora uses your browser's Canvas API to generate images and videos. The actual rendering process happens on your device. We do not upload your generated files to our servers.
            </p>
            <p className="text-slate-600 mt-3">
                <strong>Image Uploads:</strong> If you use the "Custom Assets" feature, your files are loaded into your browser's memory locally. They are not transmitted to our cloud.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">2. Zero Data Collection</h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
                <li><strong>No Account Data:</strong> We do not require you to create an account to use the basic features. We do not store your email or password (Google OAuth handles authentication).</li>
                <li><strong>No Usage Tracking:</strong> We do not track which sliders you move, which colors you pick, or what patterns you generate. Your design process is private to your browser.</li>
                <li><strong>No Analytics:</strong> We do not use third-party analytics trackers to monitor your behavior inside the studio.</li>
            </ul>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">3. Payment Information</h2>
            <p className="text-slate-600">
                If you purchase a Pro plan, payment processing is handled entirely by our secure third-party provider (e.g., Mayar or similar). We <strong>never</strong> handle, see, or store your credit card information. We only receive a confirmation of your license status.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">4. Cookies</h2>
            <p className="text-slate-600">
                We use local storage (not tracking cookies) solely to remember your last used configuration so you don't lose your work if you refresh the page. You can clear this at any time via your browser settings.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">5. Account Data (If Logged In)</h2>
            <p className="text-slate-600">
                If you choose to sign in with Google, we store:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
                <li>Your Google email address (for identification)</li>
                <li>Your subscription tier and expiry date</li>
                <li>Your export count (for free tier limits)</li>
                <li>Your saved presets (if you choose to save them)</li>
            </ul>
            <p className="text-slate-600 mt-3">
                This data is stored securely on Cloudflare's infrastructure and is used solely to provide you with service features.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">6. Contact</h2>
            <p className="text-slate-600">
                For any privacy concerns, please contact us at admin@voralab.online.
            </p>
        </div>
    );
};

const RefundPolicy: React.FC = () => {
    return (
        <div className="prose prose-slate max-w-none">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Refund Policy</h1>
            <p className="text-sm text-slate-500 mb-8">Last Updated: December 15, 2025</p>

            {/* Guarantee Badge */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8 text-center">
                <div className="text-4xl mb-2">🛡️</div>
                <h3 className="text-xl font-bold text-green-700">14-Day Money-Back Guarantee</h3>
                <p className="text-green-600 mt-2">No questions asked. Full refund within 14 days.</p>
            </div>

            <p className="text-slate-600">
                We want you to be completely satisfied with PatternVora. If for any reason you're not happy with your purchase, we offer a full refund within 14 days.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">Monthly Subscriptions (Pro Monthly)</h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
                <li>Request a refund within <strong>14 days</strong> of your initial purchase or any renewal.</li>
                <li>Refund will be processed within 5-7 business days.</li>
                <li>Your subscription will be cancelled immediately upon refund.</li>
                <li>You will lose access to Pro features after the refund is processed.</li>
            </ul>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">Lifetime Deal</h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
                <li>Request a refund within <strong>14 days</strong> of purchase.</li>
                <li>After 14 days, Lifetime purchases are final and non-refundable.</li>
                <li>This is because Lifetime access is heavily discounted and intended for committed users.</li>
            </ul>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">How to Request a Refund</h2>
            <p className="text-slate-600">
                To request a refund, simply email us at <strong>support@patternvora.com</strong> with:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 mt-3">
                <li>The email address used for purchase</li>
                <li>Your order number (from your receipt)</li>
                <li>Reason for refund (optional, but helps us improve)</li>
            </ul>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">Exceptions</h2>
            <p className="text-slate-600">
                Refunds will <strong>not</strong> be granted in the following cases:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 mt-3">
                <li>Request made after the 14-day window</li>
                <li>Account terminated due to violation of Terms of Service</li>
                <li>Evidence of abuse or fraudulent activity</li>
            </ul>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">Contact</h2>
            <p className="text-slate-600">
                Questions about refunds? Email us at <strong>support@patternvora.com</strong> and we'll respond within 24-48 hours.
            </p>
        </div>
    );
};

const FAQContent: React.FC = () => {
    return (
        <div className="prose prose-slate max-w-none">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Frequently Asked Questions</h1>
            <p className="text-sm text-slate-500 mb-8">Common questions about usage rights and features.</p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">Mosaic Shape Fill & Copyright</h2>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-bold text-amber-800 mb-2">Can I use any image for Shape Fill?</h3>
                <p className="text-amber-900">
                    <strong>Caution:</strong> When using the "Shape Fill" feature or "Custom Assets", you are uploading your own images to generate patterns.
                    You must ensure you adhere to copyright laws.
                </p>
                <ul className="list-disc pl-5 space-y-2 text-amber-900 mt-3 text-sm">
                    <li><strong>Do NOT</strong> upload copyrighted logos (e.g., Apple, Nike) unless you have permission.</li>
                    <li><strong>Do NOT</strong> use artwork or photos you found on Google Images without checking the license.</li>
                    <li><strong>SAFE:</strong> Use your own photos, assets you purchased, or public domain (CC0) images.</li>
                </ul>
            </div>

            <h3 className="text-lg font-bold text-slate-900 mt-6 mb-2">Do I own the patterns I generate?</h3>
            <p className="text-slate-600">
                <strong>Yes!</strong> If you create a pattern using our built-in shapes, you own the export 100%.
                However, if you use <strong>your own custom image</strong> as part of the pattern (Shape Fill or Custom Asset),
                your ownership of the final pattern depends on whether you have the rights to that original image.
            </p>

            <h3 className="text-lg font-bold text-slate-900 mt-6 mb-2">Can I sell the exported SVG/PNG?</h3>
            <p className="text-slate-600">
                Yes, you have full commercial rights to resell the assets you generate with PatternVora.
            </p>
        </div>
    );
};

export default LegalPage;

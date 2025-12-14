import React, { useState } from 'react';
import { ArrowLeft, Check, X } from 'lucide-react';

interface LegalPageProps {
    onBack: () => void;
    initialTab?: 'tos' | 'privacy';
}

const LegalPage: React.FC<LegalPageProps> = ({ onBack, initialTab = 'tos' }) => {
    const [activeTab, setActiveTab] = useState<'tos' | 'privacy'>(initialTab);

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
                <div className="flex gap-2">
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
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-6 py-8">
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8 md:p-12">
                    {activeTab === 'tos' ? <TermsOfService /> : <PrivacyPolicy />}
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
                Subscriptions are billed in advance. You may cancel Pro subscriptions at any time. Lifetime Deal purchases are final and non-refundable unless the service is terminated by us within 30 days of purchase.
            </p>

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
                For any privacy concerns, please contact us at contact@voralab.com.
            </p>
        </div>
    );
};

export default LegalPage;

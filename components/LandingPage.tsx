
import React, { useState, useEffect } from 'react';
import { Layers, Zap, Download, Repeat, ArrowRight, Layout, Palette, Film, HelpCircle, Bell, X, Sparkles, CheckCircle2, Clock, Trophy, LogOut, Loader2 } from 'lucide-react';
import { getCurrentRank, getNextRank, getProgress, STORAGE_KEY, RANKS } from '../utils/gamification';
import { useUser } from './UserContext';

// Google Logo SVG Component
const GoogleLogo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

interface LandingPageProps {
  onStart: () => void;
  onPricing: () => void;
}

const CHANGELOGS = [
  {
    version: "1.2.0",
    title: "The Interactive Update",
    badge: "New",
    badgeColor: "bg-rose-100 text-rose-700",
    items: [
      "🖱️ Direct Shape Editing: Switch to 'Edit Mode' to move, resize, rotate, or delete individual shapes within your pattern.",
      "🏆 Creator Ranks: Track your progress! Export assets to level up from Novice to Legend status.",
      "🕒 Live Dashboard: New landing page with real-time clock and dynamic rank tracking.",
      "📦 Batch Studio Stability: Fixed worker communication for reliable ZIP generation.",
      "✨ UX Improvements: Smoother interactions and visual polish across the editor."
    ]
  },
  {
    version: "1.1.0",
    title: "The Design Studio Update",
    badge: "Major",
    badgeColor: "bg-indigo-100 text-indigo-700",
    items: [
      "🎨 Layer System: Stack multiple patterns with Blend Modes (Multiply, Overlay) and independent opacity.",
      "👆 Drag & Drop Reordering: Intuitively organize your layer stack for perfect composition.",
      "✨ Magic Shuffle: One-click randomization for all unlocked layers to generate instant complex designs.",
      "⚡ Batch Worker: Generate 50+ variations in background without freezing the UI.",
      "🔤 Per-Layer Text Masking: Isolate text effects and masking to specific layers.",
      "🖼️ Multi-Asset Support: Upload up to 5 custom images for complex brand patterns.",
      "🛠️ Modular Engine: Complete core refactor for pro-level stability and performance."
    ]
  },
  {
    version: "1.0.0",
    title: "Initial Launch",
    badge: "Release",
    badgeColor: "bg-emerald-100 text-emerald-700",
    items: [
      "Deterministic RNG Pattern Generation.",
      "Export 4K PNG, JPG, SVG & Video Loop.",
      "Local-first privacy architecture.",
      "Animation Engine (Orbit, Pulse, Wave)."
    ]
  }
];

const CURRENT_VERSION = CHANGELOGS[0].version;

const LandingPage: React.FC<LandingPageProps> = ({ onStart, onPricing }) => {
  const { user, login, logout, isLoading } = useUser();
  const [showChangelog, setShowChangelog] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  // Gamification State
  const [exportCount, setExportCount] = useState(0);

  // Realtime Clock State
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  // Check for updates on mount & Start Clock
  useEffect(() => {
    // Version check
    const lastSeen = localStorage.getItem('pv_last_version');
    if (lastSeen !== CURRENT_VERSION) {
      setHasUnread(true);
    }

    // Get personal stats
    const count = parseInt(localStorage.getItem(STORAGE_KEY) || '0');
    setExportCount(count);

    // Initialize Clock (Client-side only to avoid hydration mismatch if SSR)
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleOpenChangelog = () => {
    setShowChangelog(true);
    setHasUnread(false);
    localStorage.setItem('pv_last_version', CURRENT_VERSION);
  };

  // Date Formatter
  const dateStr = currentTime ? new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(currentTime) : '';

  const timeStr = currentTime ? new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(currentTime) : '';

  // Gamification Data
  const currentRank = getCurrentRank(exportCount);
  const nextRank = getNextRank(exportCount);
  const progressPercent = getProgress(exportCount);
  const RankIcon = currentRank.icon;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-rose-200">
      {/* Navbar */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">P</div>
            <span className="font-bold text-lg tracking-tight">PatternVora</span>
            <span className="hidden sm:inline-block px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-semibold uppercase tracking-wider rounded-full">by VoraLab</span>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">

            <button
              onClick={onPricing}
              className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
            >
              Pricing
            </button>

            <button
              onClick={handleOpenChangelog}
              className="relative p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-full transition-all"
              title="What's New"
            >
              <Bell size={20} />
              {hasUnread && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full animate-pulse"></span>
              )}
            </button>

            {/* GOOGLE SIGN IN / USER */}
            {isLoading ? (
              <div className="px-4 py-2">
                <Loader2 size={18} className="animate-spin text-slate-400" />
              </div>
            ) : user ? (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="w-6 h-6 rounded-full" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                    {user.name?.charAt(0) || user.email?.charAt(0)}
                  </div>
                )}
                <span className="text-sm font-medium text-slate-700 max-w-[100px] truncate hidden sm:block">{user.name || user.email}</span>
                <button
                  onClick={logout}
                  className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                  title="Logout"
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={login}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-sm font-medium rounded-full transition-all shadow-sm hover:shadow"
              >
                <GoogleLogo />
                <span className="hidden sm:inline">Sign in with Google</span>
                <span className="sm:hidden">Sign in</span>
              </button>
            )}

            <button
              onClick={onStart}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-full transition-all shadow-lg shadow-indigo-600/20"
            >
              Open Pattern Studio
            </button>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <header className="relative pt-16 pb-32 overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
            {/* Abstract BG pattern simulation */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-rose-100 to-transparent rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-100 to-transparent rounded-full blur-3xl -translate-x-1/3 translate-y-1/3"></div>
          </div>

          <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">

            {/* Realtime Clock Widget */}
            {currentTime && (
              <div className="flex justify-center mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="px-4 py-1.5 bg-white/80 backdrop-blur border border-slate-200 rounded-full shadow-sm flex items-center gap-3 text-xs font-medium text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-indigo-500" />
                    <span>{dateStr}</span>
                  </div>
                  <div className="w-px h-3 bg-slate-300"></div>
                  <span className="text-slate-900 font-bold tabular-nums">{timeStr}</span>
                </div>
              </div>
            )}

            {/* GAMIFICATION CARD */}
            <div className="flex justify-center mb-8">
              <div className={`relative group bg-white border ${currentRank.border} rounded-2xl p-1.5 shadow-xl ${currentRank.shadow} animate-in zoom-in duration-500`}>
                <div className="flex items-center gap-3 pr-4 pl-1.5 py-1">
                  {/* Rank Icon */}
                  <div className={`w-12 h-12 rounded-xl ${currentRank.bgColor} ${currentRank.color} flex items-center justify-center shadow-inner`}>
                    <RankIcon size={24} strokeWidth={2.5} />
                  </div>

                  <div className="text-left min-w-[140px]">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-bold ${currentRank.color} uppercase tracking-wider text-xs`}>{currentRank.name}</h3>
                      {nextRank && (
                        <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-bold">
                          LVL {RANKS.indexOf(currentRank) + 1}
                        </span>
                      )}
                    </div>

                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-lg font-black text-slate-900">{new Intl.NumberFormat('en-US').format(exportCount)}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Assets Created</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-1.5 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${currentRank.bgColor.replace('bg-', 'bg-') === 'bg-white' ? 'bg-slate-900' : currentRank.color.replace('text-', 'bg-')}`}
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                    <div className="mt-1 flex justify-between text-[9px] text-slate-400 font-medium">
                      <span>{nextRank ? `${nextRank.min - exportCount} to ${nextRank.name}` : 'Max Rank Reached'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>


            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6">
              Your visual playground <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-rose-500">inside the VoraLab universe.</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-slate-600 mb-10 leading-relaxed">
              PatternVora helps creators, stock contributors, and agencies generate infinite high-fidelity assets in seconds. No AI prompts, just pure algorithmic control.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onStart}
                className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white text-lg font-semibold rounded-xl transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center gap-2"
              >
                Start Creating <ArrowRight size={20} />
              </button>
              <span className="text-sm text-slate-500 font-medium">Free to try, no account needed.</span>
            </div>

            {/* Editor Preview Mockup */}
            <div className="mt-20 relative mx-auto max-w-5xl rounded-2xl border border-slate-200 shadow-2xl bg-white p-2 overflow-hidden">
              <div className="bg-slate-100 rounded-xl aspect-[16/9] flex items-center justify-center overflow-hidden relative">
                <div className="absolute inset-0 grid grid-cols-4 gap-4 p-8 opacity-50">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="rounded-lg bg-indigo-100" style={{ height: 100 + Math.random() * 100 }}></div>
                  ))}
                </div>
                <div className="z-10 bg-white/80 backdrop-blur-xl border border-white/50 px-8 py-12 rounded-2xl shadow-xl text-center">
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">Instant Asset Generation</h3>
                  <p className="text-slate-600">Geometric, Organic, Abstract, Motion.</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Features */}
        <section className="py-24 bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Why creators love PatternVora</h2>
              <p className="text-slate-600 max-w-2xl mx-auto">Built for speed, consistency, and commercial utility.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Repeat className="w-6 h-6 text-indigo-600" />,
                  title: "Infinite Variations",
                  desc: "One click shuffle. Lock what you like, randomize the rest. Billions of combinations from a single seed."
                },
                {
                  icon: <Download className="w-6 h-6 text-rose-500" />,
                  title: "Commercial Ready",
                  desc: "Export as 4K PNG for stock sites, SVG for Illustrator editing, or seamless Video Loops for social."
                },
                {
                  icon: <Film className="w-6 h-6 text-emerald-500" />,
                  title: "Motion Engine",
                  desc: "Turn static patterns into hypnotic loops. Perfect for Spotify Canvas, Reels background, or Stream overlays."
                }
              ].map((feat, i) => (
                <div key={i} className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-100 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center mb-6 shadow-sm">
                    {feat.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{feat.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-6">Designed for your workflow</h2>
                <div className="space-y-6">
                  {[
                    { title: "Stock Contributors", desc: "Generate 50 unique variations of a theme in minutes. Upload to Shutterstock/Adobe Stock faster." },
                    { title: "Brand Designers", desc: "Upload client logos, extract brand palettes, and generate on-brand assets instantly." },
                    { title: "Content Creators", desc: "Create moving backgrounds for your talking-head videos or stream layouts." }
                  ].map((use, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold mt-1">{i + 1}</div>
                      <div>
                        <h4 className="font-bold text-slate-900">{use.title}</h4>
                        <p className="text-slate-600 text-sm">{use.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4 translate-y-8">
                  <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-100 aspect-square flex items-center justify-center">
                    <Layout className="w-8 h-8 text-indigo-300" />
                  </div>
                  <div className="bg-indigo-600 p-4 rounded-xl shadow-lg shadow-indigo-200 aspect-square flex items-center justify-center">
                    <Palette className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 aspect-square flex items-center justify-center">
                    <Film className="w-8 h-8 text-rose-400" />
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-100 aspect-square flex items-center justify-center">
                    <Download className="w-8 h-8 text-slate-300" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 bg-white border-t border-slate-100">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 mb-4">
                <HelpCircle size={20} />
              </div>
              <h2 className="text-3xl font-bold text-slate-900">Frequently Asked Questions</h2>
            </div>

            <div className="grid gap-6">
              {[
                {
                  q: "Can I sell these on stock marketplaces (Adobe Stock, etc)?",
                  a: "Yes! You own the full IP. Important for Adobe Stock: You must check the 'Created using generative AI tools' box during submission. Adobe broadly classifies procedural/algorithmic tools under this label for transparency, even though PatternVora isn't neural AI."
                },
                {
                  q: "Is this using AI (Generative AI)?",
                  a: "No. PatternVora uses 'Algorithmic/Procedural Generation' (pure math & logic). No external APIs, no data training, and no hallucinations. It runs 100% offline."
                },
                {
                  q: "How should I label this on Shutterstock?",
                  a: "Shutterstock accepts procedural content but bans AI models trained on stolen art. Since PatternVora is procedural and IP-safe, it is allowed. We recommend adding 'Procedurally-generated pattern' in your item description."
                },
                {
                  q: "Is PatternVora free to use?",
                  a: "Yes, the basic editor is completely free to use directly in your browser. No account required."
                },
                {
                  q: "Does it work offline?",
                  a: "Yes! Once loaded, all generation happens locally on your device using your CPU/GPU."
                }
              ].map((item, i) => (
                <div key={i} className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                  <h4 className="font-bold text-slate-900 mb-2">{item.q}</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-xl">V</div>
              <div className="h-8 w-px bg-slate-300"></div>
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">P</div>
              <div>
                <p className="text-sm font-bold text-slate-900">VoraLab Ecosystem</p>
                <p className="text-xs text-slate-500">PatternVora is a VoraLab product.</p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <button
                onClick={onStart}
                className="text-indigo-600 font-semibold hover:underline"
              >
                Open Pattern Studio &rarr;
              </button>
            </div>
          </div>

          {/* Subfooter / Attribution */}
          <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p>&copy; {new Date().getFullYear()} VoraLab. All rights reserved.</p>
            <p className="font-medium text-slate-500">Built by the grace of God.</p>
          </div>
        </div>
      </footer>

      {/* Changelog Modal */}
      {showChangelog && (
        <div className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg">
                  <Sparkles size={18} />
                </div>
                <h2 className="text-lg font-bold text-slate-900">What's New</h2>
              </div>
              <button
                onClick={() => setShowChangelog(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {CHANGELOGS.slice(0, 3).map((log, i) => (
                <div key={i} className="relative pl-8 border-l-2 border-slate-100 last:border-0 pb-2">
                  {/* Timeline Dot */}
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-indigo-200 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-600"></div>
                  </div>

                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-sm font-bold text-slate-900">{log.version}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${log.badgeColor}`}>
                      {log.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-800 mb-3">{log.title}</h3>

                  <ul className="space-y-3">
                    {log.items.map((item, j) => (
                      <li key={j} className="text-sm text-slate-600 leading-relaxed flex items-start gap-2">
                        <CheckCircle2 size={14} className="text-indigo-500 mt-1 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
              <button
                onClick={onStart}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors"
              >
                Try New Features
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;

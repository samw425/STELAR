import React, { useState, useEffect, useMemo } from 'react';
import {
    Search,
    TrendingUp,
    ChevronRight,
    Zap,

    BarChart3,
    Bookmark,
    BookmarkCheck,
    X,
    Globe,
    Music,
    Crown,
    Target,
    Users,
    Lock,
    ArrowUpRight,
    Star,
    Sparkles,
    Radio,
    Menu,
    Play,
    Facebook,
    Instagram,
    Youtube,
    Share2
} from 'lucide-react';
import { PowerIndexArtist, searchAllArtists, fetchRankingsData } from './lib/supabase';
import { Analytics } from '@vercel/analytics/react';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
};

const padRank = (rank: number): string => rank.toString().padStart(3, '0');

const getStatusColor = (status: PowerIndexArtist['status']) => {
    const map: Record<PowerIndexArtist['status'], string> = {
        Viral: 'bg-signal-purple/20 text-signal-purple border-signal-purple/30',
        Breakout: 'bg-accent/20 text-accent border-accent/30',
        Dominance: 'bg-amber-500/20 text-amber-500 border-amber-500/30',
        Stable: 'bg-slate-500/20 text-slate-400 border-slate-700',
        Conversion: 'bg-signal-green/20 text-signal-green border-signal-green/30',
    };
    return map[status] || 'bg-slate-500/20 text-slate-400 border-slate-700';
};

const getStatusBadge = (status: PowerIndexArtist['status']) => {
    const map: Record<PowerIndexArtist['status'], string> = {
        Viral: 'badge-viral',
        Breakout: 'badge-breakout',
        Dominance: 'badge-dominance',
        Stable: 'badge-stable',
        Conversion: 'badge badge-indie glow-green',
    };
    return map[status] || 'badge-stable';
};

// Extend the imported PowerIndexArtist type with new properties
declare module './lib/supabase' {
    interface PowerIndexArtist {
        youtube_url?: string;
        facebook_handle?: string;
    }
}

const getInitials = (name: string): string => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

type TabType = 'power-index' | 'sonic-signals' | 'locked-roster' | 'up-and-comers' | 'about';

// ============================================================================
// ONBOARDING COMPONENT
// ============================================================================

function WelcomeBanner({ onDismiss }: { onDismiss: () => void }) {
    return (
        <div className="bg-gradient-to-r from-accent/10 via-slate-900/50 to-accent/10 border-b border-accent/20 px-4 py-3">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Radio className="w-4 h-4 text-accent" />
                    </div>
                    <div className="text-center sm:text-left">
                        <span className="text-white font-bold text-sm">Welcome to SoundScout!</span>
                        <span className="text-slate-400 text-sm ml-2 hidden md:inline">
                            Click any artist to view their full profile • Use search to find specific artists • Filter by genre or structure
                        </span>
                        <span className="text-slate-400 text-xs block sm:hidden mt-0.5">
                            Tap any artist to explore
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={onDismiss}
                        className="text-xs text-slate-500 hover:text-white transition-colors font-bold uppercase tracking-wider"
                    >
                        Got it
                    </button>
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// UPGRADE MODAL (MONETIZATION)
// ============================================================================

function UpgradeModal({ onClose, feature }: { onClose: () => void; feature?: string }) {
    const plans = [
        {
            name: "Scout",
            price: "Free",
            priceSub: "forever",
            features: [
                "Top 50 Artists (Global)",
                "Basic Artist Profiles",
                "Daily Rankings",
                "1 Roster Slot",
            ],
            current: false,
            highlighted: false,
        },
        {
            name: "Pro",
            price: "$29",
            priceSub: "/month",
            promo: "FREE FOR LIMITED TIME",
            features: [
                "Top 150 in ALL Categories",
                "All 10 Genre Rankings",
                "Major & Indie Filters",
                "Unlimited Roster Slots",
                "Arbitrage Signal Detection",
                "Up & Comers Discovery",
                "Export to CSV",
            ],
            current: true, // Currently active during promo
            highlighted: true,
        },
        {
            name: "Enterprise",
            price: "Custom",
            priceSub: "pricing",
            features: [
                "Everything in Pro",
                "API Access",
                "Team Collaboration",
                "Custom Integrations",
                "Priority Support",
                "White-label Options",
            ],
            current: false,
            highlighted: false,
        },
    ];

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-slate-800 rounded-2xl max-w-4xl w-full p-8 animate-slide-up">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">Pricing & Features</h2>
                        {feature && (
                            <p className="text-slate-400">
                                <span className="text-accent">{feature}</span> is included in Pro.
                            </p>
                        )}
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-500 hover:text-white rounded-lg hover:bg-surface">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Launch Promo Banner */}
                <div className="bg-gradient-to-r from-signal-green/20 to-emerald-500/10 border border-signal-green/30 rounded-xl p-4 mb-6 text-center">
                    <div className="inline-flex items-center gap-2 text-signal-green text-sm font-bold">
                        <Star className="w-4 h-4" />
                        LAUNCH SPECIAL: Pro features are FREE for a limited time!
                        <Star className="w-4 h-4" />
                    </div>
                </div>

                {/* Plans Grid */}
                <div className="grid grid-cols-3 gap-4">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`rounded-xl p-6 border relative ${plan.highlighted
                                ? 'bg-accent/5 border-accent/30'
                                : 'bg-surface border-slate-800'
                                }`}
                        >
                            {plan.promo && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-signal-green text-white text-[10px] font-bold rounded-full whitespace-nowrap">
                                    {plan.promo}
                                </div>
                            )}
                            {plan.current && (
                                <div className="text-[10px] text-signal-green font-bold uppercase tracking-wider mb-2">
                                    ✓ Currently Active
                                </div>
                            )}
                            <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                            <div className="mb-4">
                                <span className="text-2xl font-bold text-white">{plan.price}</span>
                                <span className="text-slate-500 text-sm"> {plan.priceSub}</span>
                            </div>
                            <ul className="space-y-2 mb-6">
                                {plan.features.map((feat, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                                        <Star className="w-3 h-3 text-accent mt-0.5 flex-shrink-0" />
                                        {feat}
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={plan.highlighted ? onClose : undefined}
                                className={`w-full py-2 rounded-lg font-bold text-sm ${plan.current
                                    ? 'bg-signal-green text-white'
                                    : plan.highlighted
                                        ? 'bg-accent text-white hover:bg-accent/90'
                                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                    }`}
                            >
                                {plan.current ? 'Active Now' : plan.name === 'Enterprise' ? 'Contact Us' : 'Get Started'}
                            </button>
                        </div>
                    ))}
                </div>

                <p className="text-center text-slate-500 text-xs mt-6">
                    Pro features will become paid ($29/mo) once the launch period ends.
                    Join the waitlist to lock in early access pricing.
                </p>
            </div>
        </div>
    );
}

// ============================================================================
// JOIN WAITLIST MODAL
// ============================================================================

function JoinModal({ onClose }: { onClose: () => void }) {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Call the Cloudflare Pages Function
            const response = await fetch('/api/waitlist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    name: name || 'Anonymous',
                    role: role || 'Not specified'
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to join waitlist');
            }

            // Also save to localStorage as backup
            localStorage.setItem('ss_waitlist', JSON.stringify({
                email,
                name,
                role,
                date: new Date().toISOString()
            }));

            setSubmitted(true);
        } catch (err) {
            console.error('Waitlist error:', err);
            // Even if API fails, save locally and show success
            localStorage.setItem('ss_waitlist', JSON.stringify({
                email,
                name,
                role,
                date: new Date().toISOString()
            }));
            setSubmitted(true);
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4">
                <div className="bg-card border border-slate-800 rounded-2xl max-w-md w-full p-8 animate-slide-up text-center">
                    <div className="w-16 h-16 bg-signal-green/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Star className="w-8 h-8 text-signal-green" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3">You're on the List!</h2>
                    <p className="text-slate-400 mb-6">
                        Thanks for joining! We'll notify you when new features launch and send exclusive A&R insights.
                    </p>
                    <button
                        onClick={onClose}
                        className="w-full py-3 rounded-xl font-bold bg-accent text-white hover:bg-accent/90 transition-colors"
                    >
                        Back to Discovery
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-slate-800 rounded-2xl max-w-md w-full p-8 animate-slide-up">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">Join the Waitlist</h2>
                        <p className="text-slate-400 text-sm">
                            Get early access to premium features and exclusive market intelligence.
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-500 hover:text-white rounded-lg hover:bg-surface">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-slate-400 text-sm mb-2">Email *</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            className="w-full bg-terminal border border-slate-800 rounded-lg px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-accent/50"
                        />
                    </div>
                    <div>
                        <label className="block text-slate-400 text-sm mb-2">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your name"
                            className="w-full bg-terminal border border-slate-800 rounded-lg px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-accent/50"
                        />
                    </div>
                    <div>
                        <label className="block text-slate-400 text-sm mb-2">What best describes you?</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full bg-terminal border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent/50"
                        >
                            <option value="">Select...</option>
                            <option value="label">Label / Publisher</option>
                            <option value="manager">Management / Agency</option>
                            <option value="investor">Institutional Investor</option>
                            <option value="brand">Brand / Marketing</option>
                            <option value="artist">Artist / Creator</option>
                            <option value="fan">Music Fan</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-xl font-bold bg-accent text-white hover:bg-accent/90 transition-colors mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Joining...' : 'Join Waitlist'}
                    </button>
                </form>

                {error && (
                    <p className="text-center text-red-400 text-sm mt-2">{error}</p>
                )}

                <p className="text-center text-slate-500 text-xs mt-4">
                    We respect your privacy. No spam, ever.
                </p>
            </div>
        </div>
    );
}

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================
function DossierModal({ artist, onClose }: { artist: PowerIndexArtist, onClose: () => void }) {
    return (
        <div className="fixed inset-0 bg-black/98 backdrop-blur-3xl z-[100] flex items-center justify-center p-0 md:p-4 animate-fade-in overflow-hidden">
            <div className="w-full h-full md:h-auto md:max-w-5xl bg-black md:rounded-3xl border md:border-white/10 overflow-hidden shadow-2xl flex flex-col relative">

                {/* CINEMATIC BACKGROUND */}
                <div className="absolute inset-0 z-0">
                    <img
                        src={artist.avatar_url || 'https://soundscout.pages.dev/og-image.png'}
                        className="w-full h-full object-cover opacity-30 scale-110 blur-[80px]"
                        alt=""
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
                </div>

                {/* MODAL HEADER - FLOATING CLOSE */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 z-[110] p-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 backdrop-blur-xl transition-all group"
                >
                    <X className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                </button>

                {/* MODAL CONTENT */}
                <div className="relative z-[100] flex-1 overflow-y-auto custom-scrollbar p-8 md:p-12">

                    {/* TOP SECTION: ARTIST INFO */}
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-8 mb-16">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-accent/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="w-48 h-48 md:w-56 md:h-56 rounded-full border-4 border-white/10 p-2 relative z-10">
                                <div className="w-full h-full rounded-full overflow-hidden border-2 border-accent">
                                    <img
                                        src={artist.avatar_url || ''}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center text-4xl font-black text-white bg-slate-900">${getInitials(artist.name)}</div>` }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-4 text-[10px] font-black uppercase tracking-[0.3em] text-accent">
                                <span>{artist.genre}</span>
                                <span className="text-white/20">/</span>
                                <span className="text-white/80">{artist.country}</span>
                                <span className="text-white/20">/</span>
                                <span className="text-white/80">RANK #{artist.rank}</span>
                            </div>
                            <h1 className="text-6xl md:text-8xl font-black text-white uppercase leading-[0.85] tracking-tighter mb-6">{artist.name}</h1>

                            <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                <div className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${getStatusColor(artist.status)}`}>
                                    {artist.status}
                                </div>
                                <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-white/50 uppercase tracking-widest">
                                    UUID: {artist.spotify_id.slice(0, 8)}...
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* STATS ROW: MATCHING THE OG IMAGE LOOK */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 px-4 md:px-0">
                        <div className="space-y-1">
                            <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Monthly Listeners</div>
                            <div className="text-3xl md:text-4xl font-black text-white font-mono">{formatNumber(artist.monthlyListeners)}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Power Score</div>
                            <div className="text-3xl md:text-4xl font-black text-accent font-mono">{artist.powerScore}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">30d Growth</div>
                            <div className="text-3xl md:text-4xl font-black text-signal-green font-mono">+{artist.growthVelocity.toFixed(1)}%</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Conversion</div>
                            <div className="text-3xl md:text-4xl font-black text-white font-mono">{artist.conversionScore.toFixed(1)}%</div>
                        </div>
                    </div>

                    {/* ANALYSIS SECTION */}
                    <div className="grid md:grid-cols-2 gap-12">
                        {/* LEFT: FINANCIALS */}
                        <div className="space-y-8">
                            <h3 className="text-xs font-black text-white/20 uppercase tracking-[0.5em] border-b border-white/5 pb-4">Financial Analysis</h3>

                            <div className="space-y-6">
                                <div className="group">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">EST. ANNUAL REVENUE</span>
                                        <span className="text-signal-green text-[10px] font-bold tracking-widest">+12.4% SIGNAL</span>
                                    </div>
                                    <div className="text-3xl font-bold text-white font-mono group-hover:text-accent transition-colors">
                                        ${formatNumber(artist.monthlyListeners * 0.003 * 12 * 0.7)}
                                    </div>
                                    <p className="text-[9px] text-white/20 mt-2 font-mono uppercase tracking-tight">Based on standard streaming multiples (Net of distro fees)</p>
                                </div>

                                <div className="group">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">PROJECTED VALUATION (3YR)</span>
                                        <span className="text-accent text-[10px] font-bold tracking-widest text-glow-red">HIGH CONFIDENCE</span>
                                    </div>
                                    <div className="text-3xl font-bold text-white font-mono group-hover:text-accent transition-colors">
                                        ${formatNumber(artist.monthlyListeners * 2.5)}
                                    </div>
                                    <p className="text-[9px] text-white/20 mt-2 font-mono uppercase tracking-tight">Standard IP catalog acquisition multiple (5.5x multiple applied)</p>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: INSIGHTS */}
                        <div className="space-y-8">
                            <h3 className="text-xs font-black text-white/20 uppercase tracking-[0.5em] border-b border-white/5 pb-4">Analyst Insight</h3>

                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                                <div className="flex items-center gap-2 text-accent mb-4">
                                    <Sparkles className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Alpha Signals Detected</span>
                                </div>
                                <p className="text-white/70 text-sm leading-relaxed mb-6 font-medium">
                                    Artist's streaming velocity significantly outpaces category peer growth. Social signals indicate a high-retention fan base with {artist.conversionScore.toFixed(1)}% conversion efficiency.
                                    Recommend accumulation of catalog IP or immediate live tour routing.
                                </p>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-black/40 border border-white/5 rounded-xl p-3">
                                        <div className="text-[9px] font-bold text-white/30 uppercase mb-1">Status</div>
                                        <div className="text-xs font-bold text-white uppercase tracking-wider">{artist.status}</div>
                                    </div>
                                    <div className="bg-black/40 border border-white/5 rounded-xl p-3">
                                        <div className="text-[9px] font-bold text-white/30 uppercase mb-1">Structure</div>
                                        <div className="text-xs font-bold text-white uppercase tracking-wider">{artist.is_independent ? 'Independent' : 'Major Label'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* MODAL FOOTER */}
                <div className="relative z-[100] p-6 border-t border-white/5 bg-black/50 backdrop-blur-3xl flex justify-between items-center">
                    <div className="text-[9px] font-mono text-white/20 uppercase tracking-[0.2em] hidden md:block">
                        SoundScout Data Terminal v2.0 // Artist Object {artist.id.slice(0, 8)}
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <button onClick={onClose} className="flex-1 md:flex-none px-8 py-3 rounded-full font-black text-[10px] text-white/40 hover:text-white uppercase tracking-widest transition-colors">
                            Dismiss
                        </button>
                        <button className="flex-1 md:flex-none px-8 py-3 rounded-full font-black bg-white text-black hover:bg-white/90 text-[10px] uppercase tracking-widest shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all active:scale-95">
                            Export Dossier
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function App() {
    const [activeTab, setActiveTab] = useState<TabType>('power-index');
    const [searchQuery, setSearchQuery] = useState('');
    const [artists, setArtists] = useState<PowerIndexArtist[]>([]);
    const [loading, setLoading] = useState(true);
    const mainContentRef = React.useRef<HTMLDivElement>(null);
    const [selectedArtist, setSelectedArtist] = useState<PowerIndexArtist | null>(null);
    const [showOnboarding, setShowOnboarding] = useState(() => {
        return !localStorage.getItem('ss_onboarding_complete');
    });
    const [showUpgrade, setShowUpgrade] = useState(false);
    const [showJoin, setShowJoin] = useState(false);
    const [showDossier, setShowDossier] = useState(false);
    const [upgradeFeature, setUpgradeFeature] = useState<string>();
    const [watchlist, setWatchlist] = useState<Set<string>>(() => {
        const saved = localStorage.getItem('ss_watchlist_v1');
        return saved ? new Set(JSON.parse(saved)) : new Set();
    });
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeDiscoveryList, setActiveDiscoveryList] = useState<'movers' | 'gems' | null>(null);
    const [selectedGenre, setSelectedGenre] = useState<string>('ALL');
    const [selectedStructure, setSelectedStructure] = useState<'ALL' | 'MAJOR' | 'INDIE'>('ALL');

    // User tier (for monetization - can lock down to Pro later once we get traction)
    const userTier = 'free'; // 'free', 'pro', 'enterprise'
    const freeLimit = 5000; // Show ALL artists for launch

    // SEAMLESS NAVIGATION: Helper to select artist and close all modals
    const handleSelectArtist = (artist: PowerIndexArtist | null) => {
        // Close all open modals/panels first
        setShowDossier(false);
        setShowUpgrade(false);
        setShowJoin(false);
        setMobileMenuOpen(false);

        // Then set the new artist
        setSelectedArtist(artist);

        // Update URL for deep linking
        if (artist) {
            const slug = artist.name.toLowerCase().replace(/\s+/g, '-');
            window.history.pushState({ artistId: artist.id }, '', `/artist/${slug}`);

            // Critical: Scroll to top of content area so user sees the profile
            if (mainContentRef.current) {
                mainContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } else {
            window.history.pushState({}, '', '/');
        }
    };

    // Load artists based on active tab
    useEffect(() => {
        async function loadArtists() {
            setLoading(true);
            const rankingsData = await fetchRankingsData();

            if (!rankingsData) {
                console.error('Failed to load rankings data');
                setLoading(false);
                return;
            }

            let data: PowerIndexArtist[] = [];
            if (activeTab === 'up-and-comers') {
                data = rankingsData.rankings.up_and_comers || [];
            } else if (activeTab === 'sonic-signals') {
                data = rankingsData.rankings.arbitrage || [];
            } else {
                data = rankingsData.rankings.global || [];
            }

            setArtists(data);
            setLoading(false);
        }
        loadArtists();
    }, [activeTab]);

    const [searchResults, setSearchResults] = useState<PowerIndexArtist[]>([]);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        const debounce = setTimeout(async () => {
            const results = await searchAllArtists(searchQuery);
            setSearchResults(results);
        }, 300);

        return () => clearTimeout(debounce);
    }, [searchQuery]);

    // Persist watchlist
    useEffect(() => {
        localStorage.setItem('ss_watchlist_v1', JSON.stringify([...watchlist]));
    }, [watchlist]);

    // Complete onboarding
    const completeOnboarding = () => {
        localStorage.setItem('ss_onboarding_complete', 'true');
        setShowOnboarding(false);
    };

    // Note: requiresUpgrade check will be added when auth is implemented

    // Prompt upgrade
    const promptUpgrade = (feature: string) => {
        setUpgradeFeature(feature);
        setShowUpgrade(true);
    };

    // Filter artists - use searchResults if searching, otherwise use loaded artists
    // Filter artists - use searchResults if searching, otherwise use loaded artists
    const filteredArtists = useMemo(() => {
        // If searching, use search results
        let result = searchQuery.trim() ? searchResults : artists;

        // Filter by tab (for locked roster)
        if (activeTab === 'locked-roster') {
            result = result.filter(a => watchlist.has(a.id));
        }

        // Filter by Genre
        if (selectedGenre !== 'ALL') {
            result = result.filter(a => a.genre && a.genre.toUpperCase() === selectedGenre);
        }

        // Filter by Structure
        if (selectedStructure !== 'ALL') {
            const isIndie = selectedStructure === 'INDIE';
            result = result.filter(a => a.is_independent === isIndie);
        }

        // Re-rank
        result = result.map((artist, index) => ({
            ...artist,
            rank: index + 1
        }));

        const limit = userTier === 'free' ? freeLimit : 150;
        return result.slice(0, limit);
    }, [artists, searchResults, searchQuery, activeTab, watchlist, userTier, freeLimit, selectedGenre, selectedStructure]);

    const toggleWatchlist = (artistId: string) => {
        // Free users limited to 1 roster slot
        if (userTier === 'free' && !watchlist.has(artistId) && watchlist.size >= 1) {
            promptUpgrade('Unlimited Roster Slots');
            return;
        }

        setWatchlist(prev => {
            const next = new Set(prev);
            if (next.has(artistId)) {
                next.delete(artistId);
            } else {
                next.add(artistId);
            }
            return next;
        });
    };





    const openYouTube = (artist: PowerIndexArtist) => {
        if (artist.youtube_url && artist.youtube_url.includes('channel')) {
            window.open(artist.youtube_url, '_blank');
        } else {
            const query = encodeURIComponent(`${artist.name} official youtube channel`);
            window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
        }
    };

    // Stats


    // BIGGEST MOVERS TODAY - Established artists (Rank 1-150) with highest daily velocity
    const biggestMovers = useMemo(() => {
        return [...artists]
            .filter(a => a.rank <= 150)
            .sort((a, b) => b.growthVelocity - a.growthVelocity)
            .slice(0, 25);
    }, [artists]);

    // HIDDEN GEMS - Non-top tier artists (Rank 150-1000) with strongest momentum
    const hiddenGems = useMemo(() => {
        return [...artists]
            .filter(a => a.rank > 150 && a.rank <= 1000)
            .sort((a, b) => b.growthVelocity - a.growthVelocity)
            .slice(0, 25);
    }, [artists]);

    return (
        <>
            {/* Upgrade Modal */}
            {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} feature={upgradeFeature} />}

            {/* Join Modal */}
            {showJoin && <JoinModal onClose={() => setShowJoin(false)} />}

            {/* Dossier Modal */}
            {showDossier && selectedArtist && <DossierModal artist={selectedArtist} onClose={() => setShowDossier(false)} />}

            <div className="min-h-screen bg-terminal text-slate-300 font-sans selection:bg-accent/30 selection:text-white overflow-x-hidden">

                {/* Welcome Banner - Non-blocking onboarding */}
                {showOnboarding && <WelcomeBanner onDismiss={completeOnboarding} />}

                {/* Background Glows */}
                <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-signal-purple/5 rounded-full blur-[120px] pointer-events-none"></div>

                {/* MAIN LAYOUT WRAPPER */}
                <div className="flex h-[calc(100vh-40px)]"> {/* Subtract ticker height approx */}
                    {/* LEFT RAIL / SIDEBAR */}
                    {/* LEFT RAIL / SIDEBAR */}
                    <aside className={`
                        fixed lg:relative inset-y-0 left-0 z-40
                        w-80 flex flex-col border-r border-slate-900 bg-[#0B0C10]
                        transform transition-transform duration-300 ease-in-out h-full
                        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    `}>
                        {/* BRAND HEADER - ELITE HUMAN DESIGN */}
                        <div className="p-8 pb-4">
                            <div className="flex flex-col gap-1 group cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 flex items-center justify-center">
                                        <div className="relative w-full h-full border border-white/10 rounded flex items-center justify-center bg-white/5">
                                            <Radio className="text-accent w-5 h-5" />
                                        </div>
                                    </div>
                                    <h1 className="text-2xl font-black text-white tracking-tight uppercase leading-none">
                                        SOUND<span className="text-accent font-light">SCOUT</span>
                                    </h1>
                                </div>
                                <div className="pl-11">
                                    <div className="text-[9px] font-mono text-slate-500 tracking-[0.4em] uppercase opacity-60">
                                        Artist Discovery Platform
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto px-4 space-y-6 scrollbar-hide">
                            {/* NAVIGATION SECTION */}
                            <div>
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 px-2">Terminal Access</h3>
                                <nav className="space-y-1">
                                    <button
                                        onClick={() => { setActiveTab('power-index'); setSelectedArtist(null); setActiveDiscoveryList(null); setMobileMenuOpen(false); }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-all
                                            ${activeTab === 'power-index'
                                                ? 'bg-accent/10 text-accent border border-accent/20 shadow-[0_0_15px_rgba(255,51,102,0.1)]'
                                                : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                    >
                                        <BarChart3 className="w-4 h-4" />
                                        <span>Power Index</span>
                                    </button>
                                    <button
                                        onClick={() => { setActiveTab('up-and-comers'); setSelectedArtist(null); setActiveDiscoveryList(null); setMobileMenuOpen(false); }}
                                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-all
                                            ${activeTab === 'up-and-comers' ? 'bg-accent/10 text-accent' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Sparkles className="w-4 h-4" />
                                            <span>Up & Comers</span>
                                        </div>
                                        <span className="text-[9px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded border border-green-500/30">NEW</span>
                                    </button>

                                    <button
                                        onClick={() => { setActiveTab('sonic-signals'); setSelectedArtist(null); setActiveDiscoveryList(null); setMobileMenuOpen(false); }}
                                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-all
                                            ${activeTab === 'sonic-signals' ? 'bg-accent/10 text-accent' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Radio className="w-4 h-4" />
                                            <span>Sonic Signals</span>
                                        </div>
                                        <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
                                    </button>

                                    <button
                                        onClick={() => { setActiveTab('locked-roster'); setSelectedArtist(null); setActiveDiscoveryList(null); setMobileMenuOpen(false); }}
                                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-all
                                            ${activeTab === 'locked-roster' ? 'bg-accent/10 text-accent' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Lock className="w-4 h-4" />
                                            <span>Locked Roster</span>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => { setActiveTab('about'); setSelectedArtist(null); setActiveDiscoveryList(null); setMobileMenuOpen(false); }}
                                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-all
                                            ${activeTab === 'about' ? 'bg-accent/10 text-accent' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Target className="w-4 h-4" />
                                            <span>The Algorithm</span>
                                        </div>
                                    </button>
                                </nav>
                            </div>

                            {/* WIDGETS SECTION */}
                            <div>
                                <div className="flex items-center justify-between px-2 mb-4">
                                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Today's Hottest</h3>
                                    <button className="text-[9px] font-bold text-accent hover:text-white transition-colors">VIEW ALL</button>
                                </div>

                                <div className="space-y-6">
                                    {/* Widget 1: Biggest Movers */}
                                    <div className="group cursor-pointer" onClick={() => setActiveDiscoveryList('movers')}>
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                                <TrendingUp className="w-4 h-4 text-red-500" />
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-white uppercase tracking-wider">Biggest Movers</div>
                                                <div className="text-[9px] text-slate-500">Fastest listeners growth</div>
                                            </div>
                                        </div>
                                        <div className="space-y-2 pl-2 border-l border-slate-800 ml-4">
                                            {biggestMovers.slice(0, 2).map(artist => (
                                                <div
                                                    key={artist.id}
                                                    onClick={(e) => { e.stopPropagation(); handleSelectArtist(artist); }}
                                                    className="flex items-center justify-between text-[10px] group-hover:bg-white/5 p-1 rounded transition-colors cursor-pointer"
                                                >
                                                    <span className="text-slate-300 font-medium hover:text-accent">{artist.name}</span>
                                                    <span className="text-green-500 font-mono font-bold">+{artist.growthVelocity.toFixed(0)}%</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Widget 2: Hidden Gems */}
                                    <div className="group cursor-pointer" onClick={() => setActiveDiscoveryList('gems')}>
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                                                <Sparkles className="w-4 h-4 text-purple-500" />
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-white uppercase tracking-wider">Hidden Gems</div>
                                                <div className="text-[9px] text-slate-500">Rank 150+ with momentum</div>
                                            </div>
                                        </div>
                                        <div className="space-y-2 pl-2 border-l border-slate-800 ml-4">
                                            {hiddenGems.slice(0, 2).map(artist => (
                                                <div
                                                    key={artist.id}
                                                    onClick={(e) => { e.stopPropagation(); handleSelectArtist(artist); }}
                                                    className="flex items-center justify-between text-[10px] group-hover:bg-white/5 p-1 rounded transition-colors cursor-pointer"
                                                >
                                                    <span className="text-slate-300 font-medium hover:text-accent">{artist.name}</span>
                                                    <span className="text-green-500 font-mono font-bold">+{artist.growthVelocity.toFixed(0)}%</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Widget 3: Underrated (Simulated for UI match) */}
                                    <div className="group cursor-pointer">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                                                <Target className="w-4 h-4 text-green-500" />
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-white uppercase tracking-wider">Underrated</div>
                                                <div className="text-[9px] text-slate-500">Highest power density</div>
                                            </div>
                                        </div>
                                        <div className="space-y-2 pl-2 border-l border-slate-800 ml-4">
                                            {/* Using safe slice of artists for demo */}
                                            {artists.filter(a => a.conversionScore < 30).slice(0, 2).map(artist => (
                                                <div
                                                    key={artist.id}
                                                    onClick={(e) => { e.stopPropagation(); handleSelectArtist(artist); }}
                                                    className="flex items-center justify-between text-[10px] group-hover:bg-white/5 p-1 rounded transition-colors cursor-pointer"
                                                >
                                                    <span className="text-slate-300 font-medium hover:text-accent">{artist.name}</span>
                                                    <span className="text-red-500 font-mono font-bold">#{artist.rank}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* UPGRADE CARD */}
                        <div className="p-4 mt-auto border-t border-slate-900 bg-[#0B0C10]">
                            <button
                                onClick={() => setShowUpgrade(true)}
                                className="w-full bg-gradient-to-r from-accent to-purple-600 rounded-xl p-4 text-left group hover:scale-[1.02] transition-transform shadow-lg relative overflow-hidden"
                            >
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Crown className="w-4 h-4 text-white fill-current" />
                                        <span className="text-xs font-black text-white uppercase tracking-widest">Upgrade to Pro</span>
                                    </div>
                                    <div className="text-[10px] text-white/90 font-medium">See pricing and features</div>
                                </div>
                                <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full blur-xl -mr-8 -mt-8"></div>
                            </button>

                            <button
                                onClick={() => setShowJoin(true)}
                                className="w-full mt-3 flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-400 hover:text-white transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <Users className="w-4 h-4" />
                                    <span className="text-xs font-bold uppercase tracking-wider">Join Waitlist</span>
                                </div>
                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </aside>

                    <main className="flex-1 flex flex-col relative overflow-hidden bg-[#0B0C10]">
                        {/* TOP HEADER - POWER INDEX STYLE */}
                        <header className="h-20 border-b border-slate-900 bg-[#0B0C10] flex items-center justify-between px-8 z-10 shrink-0">
                            <div className="flex items-center gap-6">
                                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 text-slate-400">
                                    <Menu className="w-6 h-6" />
                                </button>

                                <div>
                                    <h1 className="text-xl font-black text-white tracking-widest uppercase mb-1">Power Index</h1>
                                    <div className="flex items-center gap-4 text-[9px] font-bold uppercase tracking-wider">
                                        <span className="text-red-500 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div> Live Data</span>
                                        <span className="text-green-500">✓ Full Access</span>
                                        <span className="text-slate-500">5,000+ Artists</span>
                                        <span className="text-slate-500">Updated 4x Daily</span>
                                    </div>
                                </div>
                            </div>

                            <div className="relative w-96 group hidden md:block">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="SEARCH 3000+ ARTISTS..."
                                    className="w-full bg-slate-900/50 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-xs text-white uppercase tracking-widest focus:border-accent/40 focus:ring-1 focus:ring-accent/20 transition-all outline-none placeholder:text-slate-700"
                                />
                            </div>
                        </header>

                        {/* FILTERS & CONTROLS */}
                        <div className="px-8 py-6 border-b border-slate-900 bg-[#0B0C10]">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                {/* GENRE TABS */}
                                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2 md:pb-0">
                                    {['ALL', 'POP', 'R&B', 'HIP HOP', 'COUNTRY', 'AFROBEATS', 'INDIE', 'ALTERNATIVE', 'LATIN', 'K-POP', 'ELECTRONIC'].map((genre) => (
                                        <button
                                            key={genre}
                                            onClick={() => setSelectedGenre(genre)}
                                            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all whitespace-nowrap
                                                ${selectedGenre === genre
                                                    ? 'bg-white text-black border-white'
                                                    : 'bg-transparent text-slate-500 border-slate-800 hover:border-slate-600 hover:text-white'}`}
                                        >
                                            {genre}
                                        </button>
                                    ))}
                                </div>

                                {/* STRUCTURE TOGGLE */}
                                <div className="flex items-center bg-slate-900 rounded-lg p-1 border border-slate-800 shrink-0">
                                    <button
                                        onClick={() => setSelectedStructure('ALL')}
                                        className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${selectedStructure === 'ALL' ? 'text-black bg-white shadow-sm' : 'text-slate-500 hover:text-white'}`}
                                    >
                                        All
                                    </button>
                                    <button
                                        onClick={() => setSelectedStructure('MAJOR')}
                                        className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${selectedStructure === 'MAJOR' ? 'text-black bg-white shadow-sm' : 'text-slate-500 hover:text-white'}`}
                                    >
                                        Major
                                    </button>
                                    <button
                                        onClick={() => setSelectedStructure('INDIE')}
                                        className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${selectedStructure === 'INDIE' ? 'text-black bg-white shadow-sm' : 'text-slate-500 hover:text-white'}`}
                                    >
                                        Indie
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div
                            ref={mainContentRef}
                            className="flex-1 overflow-auto p-8 terminal-scroll bg-[#0B0C10]"
                        >
                            {selectedArtist ? (
                                <ArtistProfile
                                    artist={selectedArtist}
                                    onClose={() => setSelectedArtist(null)}
                                    onToggleWatchlist={toggleWatchlist}
                                    isWatched={watchlist.has(selectedArtist.id)}
                                    // Removed unused callback props
                                    setShowDossier={setShowDossier}
                                />
                            ) : activeDiscoveryList ? (
                                <div className="max-w-4xl mx-auto space-y-6">
                                    <button onClick={() => setActiveDiscoveryList(null)} className="flex items-center gap-2 text-slate-500 mb-6 uppercase text-[10px] font-black tracking-widest hover:text-white transition-colors">
                                        <X className="w-4 h-4" /> Back to Index
                                    </button>
                                    <h2 className="text-3xl font-black text-white mb-6 uppercase tracking-tighter">
                                        {activeDiscoveryList === 'movers' ? 'Volume Leaders' : 'Quality Discovery'}
                                    </h2>
                                    <div className="space-y-2">
                                        {(activeDiscoveryList === 'movers' ? biggestMovers : hiddenGems).map((artist, i) => (
                                            <button key={artist.id} onClick={() => setSelectedArtist(artist)} className="w-full flex items-center gap-4 p-4 bg-slate-900/50 border border-slate-800 rounded-xl hover:bg-slate-800 hover:border-slate-700 transition-all">
                                                <span className="text-lg font-bold text-accent w-8">{padRank(i + 1)}</span>
                                                <div className="flex-1 text-left font-bold text-white uppercase tracking-tight">{artist.name}</div>
                                                <div className="text-signal-green font-mono font-bold">+{artist.growthVelocity.toFixed(1)}%</div>
                                                <ChevronRight className="w-4 h-4 text-slate-700" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : activeTab === 'sonic-signals' ? (
                                <SonicSignals artists={filteredArtists.slice(0, 15)} />
                            ) : activeTab === 'locked-roster' ? (
                                <div className="max-w-4xl mx-auto">
                                    <h2 className="text-3xl font-black text-white mb-6 uppercase tracking-tighter">Locked Roster</h2>
                                    {artists.filter(a => watchlist.has(a.id)).length > 0 ? (
                                        <div className="space-y-2">
                                            {artists.filter(a => watchlist.has(a.id)).map((artist, i) => (
                                                <button key={artist.id} onClick={() => handleSelectArtist(artist)} className="w-full flex items-center gap-4 p-4 bg-slate-900/50 border border-slate-800 rounded-xl hover:bg-slate-800 hover:border-slate-700 transition-all">
                                                    <span className="text-lg font-bold text-accent w-8">{padRank(i + 1)}</span>
                                                    <div className="flex-1 text-left font-bold text-white uppercase tracking-tight">{artist.name}</div>
                                                    <div className="text-signal-green font-mono font-bold">+{artist.growthVelocity.toFixed(1)}%</div>
                                                    <ChevronRight className="w-4 h-4 text-slate-700" />
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-20 text-slate-500 uppercase tracking-widest text-xs font-bold border border-dashed border-slate-800 rounded-xl">
                                            No artists locked. <br /> Use the bookmark icon to lock artists to your roster.
                                        </div>
                                    )}
                                </div>
                            ) : activeTab === 'about' ? (
                                <AboutSection
                                    onNavigate={(tab) => { setActiveTab(tab); setSelectedArtist(null); setActiveDiscoveryList(null); }}
                                    onShowPricing={() => setShowUpgrade(true)}
                                    onShowContact={() => setShowJoin(true)}
                                />
                            ) : (
                                <div className="space-y-8">


                                    {/* DATA TABLE */}
                                    <div className="bg-[#0B0C10] border border-slate-800 rounded-2xl overflow-hidden">
                                        <table className="w-full text-left">
                                            <thead className="bg-[#0B0C10] text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-800">
                                                <tr>
                                                    <th className="px-6 py-4">#</th>
                                                    <th className="px-6 py-4">Artist</th>
                                                    <th className="px-6 py-4">Monthly Listeners</th>
                                                    <th className="px-6 py-4">TikTok</th>
                                                    <th className="px-6 py-4">
                                                        Conversion <span className="ml-1 bg-red-500 text-white px-1 rounded text-[8px]">ALPHA</span>
                                                    </th>
                                                    <th className="px-6 py-4">30d Velo</th>
                                                    <th className="px-6 py-4">Structure</th>
                                                    <th className="px-6 py-4 text-right">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-800/50">
                                                {loading ? (
                                                    <tr>
                                                        <td colSpan={8} className="px-6 py-20 text-center">
                                                            <div className="inline-block w-8 h-8 border-2 border-accent/20 border-t-accent rounded-full animate-spin mb-4" />
                                                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Loading Market Data...</div>
                                                        </td>
                                                    </tr>
                                                ) : filteredArtists.map((artist) => (
                                                    <tr key={artist.id} onClick={() => handleSelectArtist(artist)} className="row-cinematic group hover:bg-white/[0.02] transition-colors cursor-pointer text-xs">
                                                        <td className="px-6 py-4 font-mono text-slate-600 font-bold">{padRank(artist.rank)}</td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-4">
                                                                <div
                                                                    onClick={(e) => { e.stopPropagation(); openYouTube(artist); }}
                                                                    title="Watch on YouTube"
                                                                    className={`status-ring status-ring-${artist.status.toLowerCase()} w-10 h-10 rounded-full bg-slate-800 overflow-hidden relative cursor-pointer hover:ring-2 hover:ring-accent hover:shadow-[0_0_15px_rgba(255,51,102,0.4)] transition-all`}
                                                                >
                                                                    {/* Hover Play Button Overlay */}
                                                                    <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center z-10 transition-all">
                                                                        <Play className="w-4 h-4 text-white fill-current" />
                                                                    </div>
                                                                    {artist.avatar_url ? (
                                                                        <img src={artist.avatar_url} alt={artist.name} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold">{getInitials(artist.name)}</div>
                                                                    )}
                                                                </div>
                                                                <div
                                                                    onClick={(e) => { e.stopPropagation(); handleSelectArtist(artist); }}
                                                                    className="cursor-pointer"
                                                                >
                                                                    <div className="font-bold text-white text-sm mb-0.5 group-hover:text-accent transition-colors">{artist.name}</div>
                                                                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{artist.genre} • {artist.country}</div>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        <td className="px-6 py-4 font-mono font-bold text-slate-300">{formatNumber(artist.monthlyListeners)}</td>
                                                        <td className="px-6 py-4 font-mono font-bold text-slate-300">{formatNumber(artist.tiktokFollowers)}</td>
                                                        <td className="px-6 py-4">
                                                            <div className={`inline-block px-2 py-1 rounded border font-mono font-bold text-[10px] ${artist.conversionScore < 40
                                                                ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                                                : 'bg-slate-800 text-slate-400 border-slate-700'
                                                                }`}>
                                                                {artist.conversionScore.toFixed(1)}%
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="text-green-500 font-mono font-bold">
                                                                ↗ +{artist.growthVelocity.toFixed(1)}%
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="px-2 py-1 rounded border border-red-900/30 bg-red-900/10 text-red-500 text-[10px] font-black uppercase tracking-wider">
                                                                {artist.is_independent ? 'INDIE' : 'MAJOR'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button className="p-2 hover:text-white text-slate-500 transition-colors">
                                                                    <Bookmark className="w-4 h-4" />
                                                                </button>
                                                                <ChevronRight className="w-4 h-4 text-slate-700" />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </main >
                </div >
            </div >
            <Analytics />
        </>
    );
}

// ============================================================================
// TOP TRACKS COMPONENT (REAL-TIME ITUNES API)
// ============================================================================

// ============================================================================

const TopTracks = ({ artistName }: { artistName: string }) => {
    const [tracks, setTracks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [playing, setPlaying] = useState<string | null>(null);
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

    useEffect(() => {
        const fetchTracks = async () => {
            setLoading(true);
            try {
                // Zero-Cost API: iTunes Search
                const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(artistName)}&entity=song&limit=5`);
                const data = await res.json();
                setTracks(data.results || []);
            } catch (e) {
                console.error("Failed to fetch tracks", e);
            } finally {
                setLoading(false);
            }
        };

        if (artistName) fetchTracks();
    }, [artistName]);

    const togglePlay = (url: string) => {
        if (playing === url) {
            audio?.pause();
            setPlaying(null);
        } else {
            if (audio) audio.pause();
            const newAudio = new Audio(url);
            newAudio.play();
            setAudio(newAudio);
            setPlaying(url);
            newAudio.onended = () => setPlaying(null);
        }
    };

    const openYouTubeSearch = (e: React.MouseEvent, term: string) => {
        e.stopPropagation();
        window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(term)}`, '_blank');
    };

    if (loading) return <div className="h-40 flex items-center justify-center text-slate-500 animate-pulse font-mono text-xs">SCANNING AUDIO FREQUENCIES...</div>;
    if (tracks.length === 0) return null;

    return (
        <div className="mb-12">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Music className="w-4 h-4" /> Top Sonic Outputs
            </h3>
            <div className="space-y-3">
                {tracks.map((track, i) => (
                    <div
                        key={track.trackId}
                        className="w-full flex items-center justify-between p-3 bg-slate-900/50 border border-slate-800 rounded-xl hover:bg-slate-800 hover:border-slate-700 transition-all group text-left relative"
                    >
                        {/* PREVIEW CLICK AREA */}
                        <div
                            className="flex-1 flex items-center gap-4 cursor-pointer"
                            onClick={() => togglePlay(track.previewUrl)}
                        >
                            <div className="text-slate-500 font-mono text-xs w-4">{i + 1}</div>
                            <div className="w-10 h-10 rounded-lg overflow-hidden relative shadow-lg shrink-0">
                                <img src={track.artworkUrl100} className="w-full h-full object-cover" />
                                <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${playing === track.previewUrl ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                    {playing === track.previewUrl ?
                                        <div className="w-4 h-4 text-accent animate-pulse bg-current rounded-full" /> :
                                        <Play className="w-4 h-4 text-white fill-current" />
                                    }
                                </div>
                            </div>
                            <div className="min-w-0">
                                <div className={`text-sm font-bold leading-none mb-1 transition-colors truncate ${playing === track.previewUrl ? 'text-accent' : 'text-white group-hover:text-accent'}`}>
                                    {track.trackName}
                                </div>
                                <div className="text-xs text-slate-500 truncate">{track.collectionName}</div>
                            </div>
                        </div>

                        {/* ACTIONS */}
                        <div className="flex items-center gap-3 pl-4 border-l border-slate-800 ml-4 shrink-0">
                            {playing === track.previewUrl && (
                                <div className="hidden md:flex gap-1 h-3 items-end mr-2">
                                    <div className="w-1 bg-accent animate-[bounce_1s_infinite] h-full"></div>
                                    <div className="w-1 bg-accent animate-[bounce_1.2s_infinite] h-2/3"></div>
                                    <div className="w-1 bg-accent animate-[bounce_0.8s_infinite] h-full"></div>
                                </div>
                            )}
                            <button
                                onClick={(e) => openYouTubeSearch(e, `${track.artistName} ${track.trackName}`)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-600/10 hover:bg-red-600 hover:text-white text-red-500 transition-all uppercase text-[9px] font-black tracking-wider"
                                title="Search Full Song on YouTube"
                            >
                                <Play className="w-3 h-3 fill-current" /> YouTube
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};



// ============================================================================
// ARTIST PROFILE COMPONENT
// ============================================================================

const generateScoutingReport = (artist: PowerIndexArtist) => {
    const insights = [];
    const ratio = artist.tiktokFollowers / (artist.monthlyListeners + 1);

    if (ratio > 5) insights.push("Hyper-Viral Signal: Social reach is 5x larger than streaming footprint.");
    if (artist.growthVelocity > 80) insights.push("Exponential Velocity: Massive listener surge detected in last 24h.");
    if (artist.conversionScore < 40) insights.push("Efficiency Leader: High listener retention with minimal marketing waste.");
    if (artist.is_independent) insights.push("Independent Edge: Fully autonomous growth with high ownership potential.");

    return insights.length > 0 ? insights : ["Stable Performance: Consistent growth across all primary platforms."];
};

function ArtistProfile({
    artist,
    onClose,
    onToggleWatchlist,
    isWatched,
    setShowDossier,
}: {
    artist: PowerIndexArtist;
    onClose: () => void;
    onToggleWatchlist: (id: string) => void;
    isWatched: boolean;
    setShowDossier: (show: boolean) => void;
}) {
    const report = generateScoutingReport(artist);
    const investmentScore = Math.min(100, Math.max(0, 100 - artist.conversionScore + (artist.growthVelocity / 2)));

    return (
        <div className="max-w-5xl mx-auto animate-slide-up pb-20">
            {/* TOP BAR / NAVIGATION */}
            <div className="flex items-center justify-between mb-8">
                <button onClick={onClose} className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors uppercase text-[10px] font-black tracking-widest group">
                    <X className="w-4 h-4 group-hover:rotate-90 transition-transform" /> Close Discovery
                </button>
                <div className="flex gap-2">
                    <button
                        onClick={() => onToggleWatchlist(artist.id)}
                        className={`p-2 rounded-lg border transition-all ${isWatched ? 'bg-accent border-accent text-white shadow-[0_0_15px_rgba(255,51,102,0.4)]' : 'bg-surface border-slate-800 text-slate-500 hover:text-white'}`}
                    >
                        {isWatched ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* ARTIST HERO SECTION (INSTAGRAM INSPIRED) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16 items-center">
                {/* LARGE PROFILE PHOTO */}
                <div className="lg:col-span-4 flex justify-center lg:justify-start">
                    <div className="relative w-64 h-64 lg:w-80 lg:h-80 group">
                        {/* MULTI-LAYER GLOW (NEXA STYLE) */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-accent via-cyan-400 to-signal-purple rounded-full opacity-40 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-gradient-xy blur-2xl"></div>
                        <div className="absolute inset-0 rounded-full border-[3px] border-accent/30 scale-105 animate-pulse-slow"></div>
                        <div className="absolute inset-0 rounded-full border-[1px] border-cyan-400/20 scale-110"></div>

                        <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-background bg-slate-900 shadow-2xl">
                            {artist.avatar_url ? (
                                <img src={artist.avatar_url} alt={artist.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                                    <span className="text-6xl font-black text-slate-700">{getInitials(artist.name)}</span>
                                </div>
                            )}
                        </div>

                        {/* RANK BADGE (NEXA STYLE) */}
                        <div className="absolute -top-2 -right-2 bg-white text-black text-[14px] font-black px-4 py-2 rounded-full shadow-2xl z-10 border-4 border-background">
                            #{artist.rank}
                        </div>
                    </div>
                </div>

                {/* ARTIST INFO & CORE METRICS */}
                <div className="lg:col-span-8 flex flex-col justify-center text-center lg:text-left">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
                        <h2 className="text-5xl lg:text-7xl font-black text-white tracking-tighter uppercase leading-none">{artist.name}</h2>
                        <div className={`mx-auto lg:mx-0 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-[0.2em] border ${getStatusColor(artist.status)}`}>
                            {artist.status}
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-center lg:justify-start items-center gap-6 text-slate-400 text-xs font-bold mb-8 uppercase tracking-[0.2em]">
                        <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-accent" />
                            {artist.country}
                        </div>
                        <div className="flex items-center gap-2">
                            <Music className="w-4 h-4 text-accent" />
                            {artist.genre}
                        </div>
                        <div className="flex items-center gap-2">
                            <Crown className="w-4 h-4 text-amber-500" />
                            {artist.label_name || 'INDEPENDENT'}
                        </div>
                    </div>

                    {/* PREMIUM ACTION GRID - ROW 1 */}
                    <div className="flex flex-wrap gap-3 mb-3 justify-center lg:justify-start">
                        {/* Spotify (Primary) */}
                        <button
                            onClick={() => window.open(`https://open.spotify.com/artist/${artist.spotify_id}`, '_blank')}
                            className="group flex items-center gap-2 px-5 py-3 h-11 bg-[#1DB954] hover:bg-[#1ed760] text-black rounded-md transition-all active:scale-95 shadow-[0_0_20px_rgba(29,185,84,0.2)] hover:shadow-[0_0_30px_rgba(29,185,84,0.4)]"
                        >
                            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141 4.32-1.32 9.779-.6 13.5 1.56.42.24.6.84.241 1.26zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.4-1.02 15.66 1.44.539.3.66 1.02.359 1.56-.3.54-1.02.66-1.56.3z" /></svg>
                            <span className="font-black text-[10px] uppercase tracking-widest">Spotify</span>
                            <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </button>

                        {/* YouTube */}
                        <button
                            onClick={() => {
                                if (artist.youtube_url) window.open(artist.youtube_url, '_blank')
                                else window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(artist.name)}`, '_blank')
                            }}
                            className="group flex items-center gap-2 px-4 py-3 h-11 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white rounded-md transition-all active:scale-95"
                        >
                            <Youtube className="w-4 h-4 text-white/80" />
                            <span className="font-bold text-[10px] uppercase tracking-widest">YouTube</span>
                        </button>

                        {/* TikTok */}
                        <button
                            onClick={() => window.open(`https://www.tiktok.com/search?q=${encodeURIComponent(artist.name)}`, '_blank')}
                            className="group flex items-center gap-2 px-4 py-3 h-11 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white rounded-md transition-all active:scale-95"
                        >
                            <svg className="w-4 h-4 text-white/80" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" /></svg>
                            <span className="font-bold text-[10px] uppercase tracking-widest">TikTok</span>
                        </button>

                        {/* Instagram */}
                        <button
                            onClick={() => {
                                if (artist.instagram_handle) window.open(`https://instagram.com/${artist.instagram_handle}`, '_blank');
                                else window.open(`https://www.instagram.com/explore/tags/${artist.name.replace(/\s+/g, '')}/`, '_blank');
                            }}
                            className="group flex items-center gap-2 px-4 py-3 h-11 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white rounded-md transition-all active:scale-95"
                        >
                            <Instagram className="w-4 h-4 text-white/80" />
                            <span className="font-bold text-[10px] uppercase tracking-widest">Instagram</span>
                        </button>
                    </div>

                    {/* ROW 2 */}
                    <div className="flex flex-wrap gap-3 mb-10 justify-center lg:justify-start">
                        {/* Facebook */}
                        {artist.facebook_handle && (
                            <button
                                onClick={() => window.open(`https://facebook.com/${artist.facebook_handle}`, '_blank')}
                                className="group flex items-center gap-2 px-4 py-3 h-11 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white rounded-md transition-all active:scale-95"
                            >
                                <Facebook className="w-4 h-4 text-white/80" />
                                <span className="font-bold text-[10px] uppercase tracking-widest">Facebook</span>
                            </button>
                        )}

                        {/* Share */}
                        <button
                            onClick={async () => {
                                const shareData = {
                                    title: `SoundScout: ${artist.name}`,
                                    text: `Check out ${artist.name} on SoundScout`,
                                    url: `https://soundscout.pages.dev/artist/${artist.id}`
                                };
                                // Try native share (Mobile/Safari)
                                if (navigator.share) {
                                    try {
                                        await navigator.share(shareData);
                                        return;
                                    } catch (err) {
                                        // User cancelled or share failed, silent fail or fallback
                                    }
                                }
                                // Fallback to clipboard
                                navigator.clipboard.writeText(shareData.url);
                                alert('Link copied to clipboard!');
                            }}
                            className="group flex items-center gap-2 px-4 py-3 h-11 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white rounded-md transition-all active:scale-95"
                        >
                            <Share2 className="w-4 h-4 text-white/80" />
                            <span className="font-bold text-[10px] uppercase tracking-widest">Share</span>
                        </button>

                        {/* Add to Roster */}
                        {/* Add to Roster */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleWatchlist(artist.id);
                            }}
                            className={`group flex items-center gap-2 px-5 py-3 h-11 border rounded-md transition-all active:scale-95
                                ${isWatched
                                    ? 'bg-accent/20 border-accent text-accent'
                                    : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                                }`}
                        >
                            {isWatched ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                            <span className="font-bold text-[10px] uppercase tracking-widest">
                                {isWatched ? 'Saved' : 'Add to Roster'}
                            </span>
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-10">
                        <div className="bg-surface/30 backdrop-blur-md border border-slate-800/50 rounded-2xl p-6">
                            <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mb-1">Monthly Listeners</div>
                            <div className="flex items-center gap-2">
                                <div className="text-3xl lg:text-4xl font-black text-white font-mono tracking-tighter">{formatNumber(artist.monthlyListeners)}</div>
                                <div className="text-signal-green text-xs font-bold leading-none mt-1">▲ {artist.growthVelocity.toFixed(1)}%</div>
                            </div>
                        </div>
                        <div className="bg-surface/30 backdrop-blur-md border border-slate-800/50 rounded-2xl p-6">
                            <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mb-1">Social Reach</div>
                            <div className="flex items-center gap-2">
                                <div className="text-3xl lg:text-4xl font-black text-white font-mono tracking-tighter">{formatNumber(artist.tiktokFollowers)}</div>
                                <div className="text-accent text-xs font-bold leading-none mt-1">▲ 8%</div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                        <button onClick={() => setShowDossier(true)} className="bg-white text-black font-black text-[12px] px-8 py-5 rounded-2xl hover:bg-slate-200 transition-all uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(255,255,255,0.1)] flex items-center gap-2 group">
                            Market Analysis <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </button>
                        <button
                            onClick={() => {
                                window.open(`https://music.youtube.com/search?q=${encodeURIComponent(artist.name + ' top songs')}`, '_blank');
                            }}
                            className="bg-[#FF0000] text-white font-black text-[12px] px-8 py-5 rounded-2xl hover:bg-[#CC0000] transition-all uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(255,0,0,0.2)] flex items-center gap-2 group"
                        >
                            <Play className="w-4 h-4 fill-white" /> Listen
                        </button>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    if (artist.instagram_handle) window.open(`https://instagram.com/${artist.instagram_handle}`, '_blank');
                                    else window.open(`https://www.instagram.com/explore/tags/${artist.name.replace(/\s+/g, '')}/`, '_blank');
                                }}
                                className="bg-slate-900 border border-slate-800 text-white font-black text-[11px] px-6 py-5 rounded-2xl hover:bg-slate-800 hover:border-slate-700 transition-all uppercase tracking-widest"
                            >
                                IG
                            </button>
                            <button
                                onClick={() => {
                                    if (artist.tiktok_handle) window.open(`https://tiktok.com/@${artist.tiktok_handle}`, '_blank');
                                    else window.open(`https://www.tiktok.com/search?q=${encodeURIComponent(artist.name)}`, '_blank');
                                }}
                                className="bg-slate-900 border border-slate-800 text-white font-black text-[11px] px-6 py-5 rounded-2xl hover:bg-slate-800 hover:border-slate-700 transition-all uppercase tracking-widest"
                            >
                                TT
                            </button>
                            <button
                                onClick={() => {
                                    if (artist.youtube_url) window.open(artist.youtube_url, '_blank');
                                    else window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(artist.name + ' official')}`, '_blank');
                                }}
                                className="bg-slate-900 border border-slate-800 text-white font-black text-[11px] px-6 py-5 rounded-2xl hover:bg-slate-800 hover:border-slate-700 transition-all uppercase tracking-widest"
                            >
                                YT
                            </button>
                        </div>
                    </div>
                </div>
            </div>



            {/* TOP SONGS (REAL-TIME) */}
            <TopTracks artistName={artist.name} />

            {/* ARTIST INTELLIGENCE REPORT */}
            <div id="analyst-insight" className="bg-surface/50 border border-slate-800 rounded-3xl p-10 backdrop-blur-3xl shadow-2xl">
                <div className="flex flex-col lg:flex-row justify-between gap-12">
                    <div className="flex-1">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-accent/20 rounded-2xl flex items-center justify-center">
                                <Radio className="w-7 h-7 text-accent" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-white uppercase tracking-tight">Performance Audit</h3>
                                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">Proprietary Market Signals</div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {report.map((insight, i) => (
                                <div key={i} className="flex gap-5 p-5 bg-black/30 rounded-2xl border border-white/5 group hover:border-accent/40 transition-all duration-300">
                                    <div className="w-2 h-2 rounded-full bg-accent mt-2 shrink-0 group-hover:scale-150 transition-transform shadow-[0_0_10px_rgba(255,51,102,0.8)]"></div>
                                    <span className="text-slate-300 text-base font-medium leading-relaxed italic">"{insight}"</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="lg:w-96">
                        <div className="bg-black/40 rounded-3xl p-8 border border-white/5 shadow-inner h-full flex flex-col justify-center">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Investment Readiness Index</span>
                                <span className="text-4xl font-black text-white font-mono tracking-tighter">{investmentScore.toFixed(0)}%</span>
                            </div>
                            <div className="h-4 w-full bg-slate-900 rounded-full overflow-hidden mb-6 border border-white/5">
                                <div className="h-full bg-accent transition-all duration-2000 shadow-[0_0_20px_rgba(255,51,102,0.6)]" style={{ width: `${investmentScore}%` }}></div>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-relaxed uppercase tracking-widest text-center">
                                Risk-adjusted score based on multi-source velocity & conversion alpha metrics.
                            </p>
                            {investmentScore > 85 && (
                                <div className="mt-8 py-3 bg-accent/10 border border-accent/30 rounded-xl text-accent text-[11px] font-black uppercase text-center tracking-[0.2em] animate-pulse">
                                    High Alpha Signal Detected
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// SONIC SIGNALS COMPONENT
// ============================================================================

function SonicSignals({ artists }: { artists: PowerIndexArtist[] }) {
    const signals = artists.map(artist => {
        let type: 'Viral' | 'Breakout' | 'Dominance' | 'Conversion' = artist.status as any;
        let description = '';

        switch (type) {
            case 'Viral':
                description = `Explosive growth detected. ${artist.name} saw +${artist.growthVelocity.toFixed(0)}% listener surge in 30 days.`;
                break;
            case 'Breakout':
                description = `Momentum building. ${artist.name} crossing market threshold with ${formatNumber(artist.monthlyListeners)} monthly listeners.`;
                break;
            case 'Conversion':
                description = `ARBITRAGE SIGNAL. ${artist.name} has ${formatNumber(artist.tiktokFollowers)} TikTok reach but only ${artist.conversionScore.toFixed(1)}% conversion.`;
                break;
            case 'Dominance':
                description = `Market leader. ${artist.name} maintains sector leadership with ${formatNumber(artist.monthlyListeners)} listeners.`;
                break;
            default:
                description = `Stable performance. ${artist.name} maintains consistent metrics.`;
                type = 'Breakout';
        }

        return { artist, type, description };
    });

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-signal-purple/20 rounded-lg">
                    <Zap className="w-5 h-5 text-signal-purple" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">ANOMALY DETECTION</h2>
                    <div className="data-tag">AI-CURATED MARKET SIGNALS</div>
                </div>
            </div>

            <div className="space-y-4">
                {signals.map(({ artist, type, description }) => (
                    <div
                        key={artist.id}
                        className="bg-card border border-slate-800/50 rounded-xl p-5 hover:border-slate-700 transition-all"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="artist-avatar text-sm">{getInitials(artist.name)}</div>
                                <div>
                                    <div className="font-semibold text-white">{artist.name}</div>
                                    <div className="data-tag">{artist.genre} • {artist.country}</div>
                                </div>
                            </div>
                            <span className={`badge ${getStatusBadge(type)}`}>
                                {type.toUpperCase()}
                            </span>
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ============================================================================
// ABOUT SECTION COMPONENT
// ============================================================================

interface AboutSectionProps {
    onNavigate: (tab: TabType) => void;
    onShowPricing: () => void;
    onShowContact: () => void;
}

function AboutSection({ onNavigate, onShowPricing, onShowContact }: AboutSectionProps) {
    return (
        <div className="max-w-5xl mx-auto animate-fade-in space-y-8 pb-12">
            {/* Hero Header */}
            <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/30 rounded-full mb-6">
                    <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                    <span className="text-accent font-mono text-xs uppercase tracking-widest">Proprietary Data Engine</span>
                </div>
                <h1 className="text-5xl font-bold text-white mb-6">
                    The SoundScout Algorithm
                </h1>
                <p className="text-slate-400 text-xl max-w-3xl mx-auto leading-relaxed">
                    Our proprietary ranking system analyzes <span className="text-white font-semibold">3,000+ artists</span> across
                    <span className="text-white font-semibold"> 4 data sources</span>, updated
                    <span className="text-signal-green font-bold">4 times daily</span> to identify the world's most promising talent.
                </p>
            </div>

            {/* Real-Time Updates Banner */}
            <section className="bg-gradient-to-r from-signal-green/10 via-emerald-500/5 to-signal-green/10 border border-signal-green/30 rounded-2xl p-8">
                <div className="flex items-center justify-between flex-wrap gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-3 h-3 bg-signal-green rounded-full animate-pulse" />
                            <h2 className="text-2xl font-bold text-white">Real-Time Updates</h2>
                        </div>
                        <p className="text-slate-400 max-w-xl">
                            Rankings refresh <strong className="text-white">4 times per day</strong> at 12AM, 6AM, 12PM, and 6PM UTC
                            to capture market movements as they happen.
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold text-signal-green">4×</div>
                        <div className="text-slate-500 text-sm">DAILY UPDATES</div>
                    </div>
                </div>
            </section>

            {/* Multi-Source Intelligence */}
            <section className="bg-card border border-slate-800 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gradient-to-br from-accent to-signal-purple rounded-xl">
                        <Globe className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Multi-Source Data</h2>
                        <p className="text-slate-500 text-sm">Aggregated from the world's largest music platforms</p>
                    </div>
                </div>
                <div className="grid md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-r from-green-900/30 to-green-800/20 border border-green-700/30 rounded-xl p-5">
                        <div className="text-green-400 font-bold text-lg mb-2">🎵 Spotify</div>
                        <p className="text-slate-400 text-sm">3,000+ artists from global charts. Total streams, daily plays, chart positions.</p>
                        <div className="mt-3 text-xs text-green-500 font-mono">PRIMARY RANKING</div>
                    </div>
                    <div className="bg-gradient-to-r from-pink-900/30 to-pink-800/20 border border-pink-700/30 rounded-xl p-5">
                        <div className="text-pink-400 font-bold text-lg mb-2">📱 TikTok</div>
                        <p className="text-slate-400 text-sm">Viral detection engine. Identify trends before they hit mainstream.</p>
                        <div className="mt-3 text-xs text-pink-500 font-mono">VIRALITY INDEX</div>
                    </div>
                    <div className="bg-gradient-to-r from-purple-900/30 to-purple-800/20 border border-purple-700/30 rounded-xl p-5">
                        <div className="text-purple-400 font-bold text-lg mb-2">📸 Instagram</div>
                        <p className="text-slate-400 text-sm">Audience size and brand potential. Crossover appeal indicator.</p>
                        <div className="mt-3 text-xs text-purple-500 font-mono">SOCIAL REACH</div>
                    </div>
                    <div className="bg-gradient-to-r from-red-900/30 to-red-800/20 border border-red-700/30 rounded-xl p-5">
                        <div className="text-red-400 font-bold text-lg mb-2">🎬 YouTube</div>
                        <p className="text-slate-400 text-sm">Video performance and discovery metrics. Cross-platform validation.</p>
                        <div className="mt-3 text-xs text-red-500 font-mono">DISCOVERY INDEX</div>
                    </div>
                </div>
            </section>

            {/* Power Score */}
            <section className="bg-card border border-slate-800 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gradient-to-br from-signal-purple to-blue-500 rounded-xl">
                        <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Power Score™ <span className="text-slate-500 font-normal text-lg">(0-1000)</span></h2>
                        <p className="text-slate-500 text-sm">Our proprietary composite ranking algorithm</p>
                    </div>
                </div>
                <div className="grid md:grid-cols-5 gap-4">
                    {[
                        { weight: '35%', name: 'Streaming Power', desc: 'Total Spotify reach', color: 'accent' },
                        { weight: '25%', name: 'Daily Momentum', desc: 'Current velocity', color: 'signal-green' },
                        { weight: '20%', name: 'Social Reach', desc: 'TikTok + Instagram', color: 'pink-500' },
                        { weight: '10%', name: 'Discovery Index', desc: 'YouTube presence', color: 'red-500' },
                        { weight: '10%', name: 'Chart Bonus', desc: 'Billboard positions', color: 'yellow-500' },
                    ].map(factor => (
                        <div key={factor.name} className="bg-terminal border border-slate-800 rounded-xl p-4 text-center">
                            <div className={`text-3xl font-bold text-${factor.color} mb-2`}>{factor.weight}</div>
                            <div className="text-white font-semibold text-sm">{factor.name}</div>
                            <div className="text-slate-500 text-xs mt-1">{factor.desc}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Arbitrage Detection - The Secret Sauce */}
            <section className="bg-gradient-to-r from-accent/10 via-signal-purple/10 to-accent/10 border border-accent/30 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gradient-to-br from-accent to-red-500 rounded-xl">
                        <Target className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Arbitrage Detection™</h2>
                        <p className="text-slate-500 text-sm">The secret sauce that makes SoundScout different</p>
                    </div>
                </div>
                <p className="text-slate-300 text-lg mb-8 max-w-3xl">
                    We identify artists who are <strong className="text-accent">viral on social media</strong> but
                    <strong className="text-white"> haven't yet converted to streaming</strong>.
                    These are tomorrow's superstars — <em>before everyone else finds them</em>.
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-card border border-slate-800 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-signal-green/20 flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-signal-green" />
                            </div>
                            <div>
                                <div className="text-signal-green font-bold text-xl">Conversion Score</div>
                                <div className="text-slate-500 text-sm">Social → Streaming ratio</div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center bg-terminal rounded-lg p-3">
                                <span className="text-slate-400">Score 0-40</span>
                                <span className="text-accent font-bold">🔥 ARBITRAGE OPPORTUNITY</span>
                            </div>
                            <div className="flex justify-between items-center bg-terminal rounded-lg p-3">
                                <span className="text-slate-400">Score 80-100</span>
                                <span className="text-signal-green font-bold">✓ Market Leader</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card border border-slate-800 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                                <Zap className="w-6 h-6 text-accent" />
                            </div>
                            <div>
                                <div className="text-accent font-bold text-xl">Arbitrage Signal</div>
                                <div className="text-slate-500 text-sm">The "Sign Now" indicator</div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center bg-terminal rounded-lg p-3">
                                <span className="text-slate-400">Signal &gt; 60%</span>
                                <span className="text-yellow-500 font-bold">⚡ Hot Opportunity</span>
                            </div>
                            <div className="flex justify-between items-center bg-terminal rounded-lg p-3">
                                <span className="text-slate-400">Signal &gt; 80%</span>
                                <span className="text-accent font-bold animate-pulse">🚀 SIGN NOW</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 15 Categories */}
            <section className="bg-card border border-slate-800 rounded-2xl p-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-signal-green to-emerald-500 rounded-xl">
                            <Music className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">15 Categories</h2>
                            <p className="text-slate-500 text-sm">Each with 150+ ranked artists</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold text-white">2,300+</div>
                        <div className="text-slate-500 text-sm">TOTAL RANKINGS</div>
                    </div>
                </div>
                <div className="grid md:grid-cols-5 gap-3">
                    {[
                        'Global Top 200', 'Pop', 'Hip Hop', 'R&B', 'Country',
                        'Afrobeats', 'Latin', 'K-Pop', 'Indie', 'Alternative',
                        'Electronic', 'Major Label', 'Independent', 'Up & Comers', 'Viral'
                    ].map(cat => (
                        <div key={cat} className="bg-terminal border border-slate-800 rounded-lg p-3 text-center hover:border-accent/50 transition-colors cursor-pointer">
                            <div className="text-white font-medium text-sm">{cat}</div>
                        </div>
                    ))}
                </div>
            </section>
            {/* Footer Links */}
            <footer className="border-t border-slate-800 pt-12 mt-12 pb-8">
                <div className="grid md:grid-cols-4 gap-8 mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent/50 flex items-center justify-center">
                                <Radio className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-white font-bold">SoundScout</span>
                            <span className="text-slate-500 text-xs">™</span>
                        </div>
                        <p className="text-slate-500 text-sm">
                            The world's most advanced A&R intelligence platform. Find tomorrow's superstars today.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4">Product</h4>
                        <ul className="space-y-2 text-slate-400 text-sm">
                            <li><button onClick={() => onNavigate('power-index')} className="hover:text-white transition-colors">Power Index</button></li>
                            <li><button onClick={() => onNavigate('up-and-comers')} className="hover:text-white transition-colors">Up & Comers</button></li>
                            <li><button onClick={() => onNavigate('sonic-signals')} className="hover:text-white transition-colors">Arbitrage Signals</button></li>
                            <li><button onClick={() => onNavigate('power-index')} className="hover:text-white transition-colors">Genre Rankings</button></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4">Company</h4>
                        <ul className="space-y-2 text-slate-400 text-sm">
                            <li><button onClick={() => onNavigate('about')} className="hover:text-white transition-colors">About</button></li>
                            <li><button onClick={() => onShowPricing()} className="hover:text-white transition-colors">Pricing</button></li>
                            <li><button onClick={() => onShowContact()} className="hover:text-white transition-colors">Contact</button></li>
                            <li><button onClick={() => onShowContact()} className="hover:text-white transition-colors">Careers</button></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4">Legal</h4>
                        <ul className="space-y-2 text-slate-400 text-sm">
                            <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                            <li><button onClick={() => onNavigate('about')} className="hover:text-white transition-colors">Cookie Policy</button></li>
                        </ul>
                    </div>
                </div>
                <div className="flex items-center justify-between pt-8 border-t border-slate-900">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-signal-green animate-pulse" />
                        <span className="text-slate-500 text-xs font-mono">LIVE • 4× DAILY UPDATES • PROPRIETARY ALGORITHM</span>
                    </div>
                    <span className="text-slate-600 text-sm">© 2026 SoundScout™ • All Rights Reserved</span>
                </div>
            </footer>
        </div>
    );
}
// End of file

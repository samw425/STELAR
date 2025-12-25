import { useState, useEffect, useMemo } from 'react';
import {
    Search,
    TrendingUp,
    TrendingDown,
    ChevronRight,
    Lock,
    Zap,
    Radio,
    BarChart3,
    ExternalLink,
    Play,
    Bookmark,
    BookmarkCheck,
    X,
    Globe,
    Music,
    Users,
    ArrowUpRight,
    Crown,
    Sparkles,
    Target,
    Star,
    Youtube,
} from 'lucide-react';
import { PowerIndexArtist, searchAllArtists, fetchRankingsData } from './lib/supabase';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
};

const padRank = (rank: number): string => rank.toString().padStart(3, '0');

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

const getInitials = (name: string): string => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

type TabType = 'power-index' | 'sonic-signals' | 'locked-roster' | 'up-and-comers' | 'about';

// ============================================================================
// ONBOARDING COMPONENT
// ============================================================================

function OnboardingModal({ onComplete }: { onComplete: () => void }) {
    const [step, setStep] = useState(0);

    const steps = [
        {
            icon: <Radio className="w-12 h-12 text-accent" />,
            title: "Welcome to SoundScout",
            subtitle: "The A&R Intelligence Terminal",
            description: "Discover the next big artist before anyone else. Our proprietary algorithm scans millions of data points daily to identify emerging talent.",
        },
        {
            icon: <Target className="w-12 h-12 text-signal-green" />,
            title: "Find Arbitrage Opportunities",
            subtitle: "The Secret Sauce",
            description: "We identify artists with HIGH social buzz but LOW streaming numbers. These are tomorrow's superstars — the ones labels are fighting to sign.",
        },
        {
            icon: <BarChart3 className="w-12 h-12 text-signal-purple" />,
            title: "Proprietary Power Score",
            subtitle: "Multi-Source Algorithm",
            description: "Our Power Score combines Spotify, Billboard, Apple Music, YouTube, TikTok, and Instagram data into one definitive ranking. Updated daily.",
        },
        {
            icon: <Crown className="w-12 h-12 text-yellow-500" />,
            title: "Premium Features",
            subtitle: "Unlock Full Intelligence",
            description: "Free users see Top 50. Premium unlocks Top 150 in all categories, real-time alerts, export tools, and API access.",
        },
    ];

    const currentStep = steps[step];

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-slate-800 rounded-2xl max-w-lg w-full p-8 animate-slide-up">
                {/* Progress dots */}
                <div className="flex justify-center gap-2 mb-8">
                    {steps.map((_, i) => (
                        <div
                            key={i}
                            className={`w-2 h-2 rounded-full transition-all ${i === step ? 'bg-accent w-6' : 'bg-slate-700'
                                }`}
                        />
                    ))}
                </div>

                {/* Content */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-6">
                        {currentStep.icon}
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">{currentStep.title}</h2>
                    <p className="text-accent text-sm font-semibold uppercase tracking-wider mb-4">
                        {currentStep.subtitle}
                    </p>
                    <p className="text-slate-400 leading-relaxed">
                        {currentStep.description}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    {step > 0 && (
                        <button
                            onClick={() => setStep(step - 1)}
                            className="btn-secondary flex-1"
                        >
                            Back
                        </button>
                    )}
                    {step < steps.length - 1 ? (
                        <button
                            onClick={() => setStep(step + 1)}
                            className="btn-primary flex-1"
                        >
                            Next
                        </button>
                    ) : (
                        <button
                            onClick={onComplete}
                            className="btn-primary flex-1"
                        >
                            Start Scouting
                        </button>
                    )}
                </div>

                {/* Skip */}
                <button
                    onClick={onComplete}
                    className="w-full text-center text-slate-500 text-sm mt-4 hover:text-white transition-colors"
                >
                    Skip intro
                </button>
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In production, this would send to a backend
        console.log('Waitlist signup:', { email, name, role });
        localStorage.setItem('ss_waitlist', JSON.stringify({ email, name, role, date: new Date().toISOString() }));
        setSubmitted(true);
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
                            Get early access to premium features and exclusive A&R intelligence.
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
                            <option value="ar">A&R Professional</option>
                            <option value="label">Record Label</option>
                            <option value="manager">Artist Manager</option>
                            <option value="artist">Artist</option>
                            <option value="investor">Investor</option>
                            <option value="fan">Music Fan</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 rounded-xl font-bold bg-accent text-white hover:bg-accent/90 transition-colors mt-6"
                    >
                        Join Waitlist
                    </button>
                </form>

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

export default function App() {
    const [activeTab, setActiveTab] = useState<TabType>('power-index');
    const [activeGenre, setActiveGenre] = useState('All');
    const [labelFilter, setLabelFilter] = useState<'All' | 'Major' | 'Indie'>('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [artists, setArtists] = useState<PowerIndexArtist[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedArtist, setSelectedArtist] = useState<PowerIndexArtist | null>(null);
    const [showOnboarding, setShowOnboarding] = useState(() => {
        return !localStorage.getItem('ss_onboarding_complete');
    });
    const [showUpgrade, setShowUpgrade] = useState(false);
    const [showJoin, setShowJoin] = useState(false);
    const [upgradeFeature, setUpgradeFeature] = useState<string>();
    const [watchlist, setWatchlist] = useState<Set<string>>(() => {
        const saved = localStorage.getItem('ss_watchlist_v1');
        return saved ? new Set(JSON.parse(saved)) : new Set();
    });

    const genres = ['All', 'Pop', 'R&B', 'Hip Hop', 'Country', 'Afrobeats', 'Indie', 'Alternative', 'Latin', 'K-Pop', 'Electronic'];

    // User tier (for monetization - can lock down to Pro later once we get traction)
    const userTier = 'free'; // 'free', 'pro', 'enterprise'
    const freeLimit = 150; // ALL 150 artists visible for free during launch

    // Load artists based on active tab
    useEffect(() => {
        async function loadArtists() {
            setLoading(true);

            // Load the rankings data first
            const rankingsData = await fetchRankingsData();

            if (!rankingsData) {
                console.error('Failed to load rankings data');
                setLoading(false);
                return;
            }

            let data: PowerIndexArtist[] = [];

            // Select data based on active tab
            if (activeTab === 'up-and-comers') {
                data = rankingsData.rankings.up_and_comers || [];
            } else if (activeTab === 'sonic-signals') {
                // Sonic signals = arbitrage opportunities
                data = rankingsData.rankings.arbitrage || [];
            } else {
                // Power Index - load by genre
                if (activeGenre === 'All') {
                    data = rankingsData.rankings.global || [];
                } else {
                    // Map genre to category key
                    const genreMap: Record<string, string> = {
                        'Pop': 'pop',
                        'Hip Hop': 'hip_hop',
                        'R&B': 'r_and_b',
                        'Country': 'country',
                        'Afrobeats': 'afrobeats',
                        'Latin': 'latin',
                        'K-Pop': 'k_pop',
                        'Indie': 'indie',
                        'Alternative': 'alternative',
                        'Electronic': 'electronic',
                    };
                    const categoryKey = genreMap[activeGenre] || 'global';
                    data = rankingsData.rankings[categoryKey] || rankingsData.rankings.global;
                }
            }

            setArtists(data);
            setLoading(false);
        }
        loadArtists();
    }, [activeGenre, activeTab]);

    // Global search - searches across ALL 3000+ artists
    const [searchResults, setSearchResults] = useState<PowerIndexArtist[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        const debounce = setTimeout(async () => {
            const results = await searchAllArtists(searchQuery);
            setSearchResults(results);
            setIsSearching(false);
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
    const filteredArtists = useMemo(() => {
        // If searching, use search results
        let result = searchQuery.trim() ? searchResults : artists;

        // Filter by label structure
        if (labelFilter === 'Major') {
            result = result.filter(a => !a.is_independent);
        } else if (labelFilter === 'Indie') {
            result = result.filter(a => a.is_independent);
        }

        // Filter by tab (for locked roster)
        if (activeTab === 'locked-roster') {
            result = result.filter(a => watchlist.has(a.id));
        }

        // Re-rank
        result = result.map((artist, index) => ({
            ...artist,
            rank: index + 1
        }));

        // Apply free tier limit
        const limit = userTier === 'free' ? freeLimit : 150;
        return result.slice(0, limit);
    }, [artists, searchResults, searchQuery, labelFilter, activeTab, watchlist, userTier]);

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

    const openSpotify = (artist: PowerIndexArtist) => {
        window.open(`https://open.spotify.com/search/${encodeURIComponent(artist.name)}`, '_blank');
    };

    const openYouTube = (artist: PowerIndexArtist, track?: string) => {
        const query = track ? `${artist.name} ${track}` : `${artist.name} official music video`;
        window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, '_blank');
    };

    const openTikTok = (artist: PowerIndexArtist) => {
        const handle = artist.tiktok_handle || artist.name.toLowerCase().replace(/\s+/g, '');
        window.open(`https://www.tiktok.com/@${handle}`, '_blank');
    };

    const openInstagram = (artist: PowerIndexArtist) => {
        const handle = artist.instagram_handle || artist.name.toLowerCase().replace(/\s+/g, '');
        window.open(`https://www.instagram.com/${handle}`, '_blank');
    };

    // Stats
    const stats = useMemo(() => {
        const totalListeners = filteredArtists.reduce((sum, a) => sum + a.monthlyListeners, 0);
        const viralCount = filteredArtists.filter(a => a.status === 'Viral').length;
        const arbitrageCount = filteredArtists.filter(a => a.conversionScore < 50).length;
        return { totalListeners, viralCount, arbitrageCount };
    }, [filteredArtists]);

    return (
        <>
            {/* Onboarding Modal */}
            {showOnboarding && <OnboardingModal onComplete={completeOnboarding} />}

            {/* Upgrade Modal */}
            {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} feature={upgradeFeature} />}

            {/* Join Modal */}
            {showJoin && <JoinModal onClose={() => setShowJoin(false)} />}

            <div className="flex h-screen bg-background font-sans overflow-hidden">
                {/* SIDEBAR */}
                <aside className="w-64 flex flex-col border-r border-slate-900 bg-terminal">
                    {/* Logo */}
                    <div className="p-6 border-b border-slate-900">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent/50 flex items-center justify-center">
                                <Radio className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-white font-bold tracking-tight">SOUNDSCOUT</h1>
                                <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">
                                    A&R INTELLIGENCE
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-2 overflow-auto">
                        <div className="data-tag px-2 mb-3">TERMINAL ACCESS</div>

                        <button
                            onClick={() => { setActiveTab('power-index'); setSelectedArtist(null); }}
                            className={`nav-item w-full ${activeTab === 'power-index' ? 'active' : ''}`}
                        >
                            <BarChart3 className="w-4 h-4" />
                            POWER INDEX
                        </button>

                        <button
                            onClick={() => { setActiveTab('up-and-comers'); setSelectedArtist(null); }}
                            className={`nav-item w-full ${activeTab === 'up-and-comers' ? 'active' : ''}`}
                        >
                            <Sparkles className="w-4 h-4" />
                            UP & COMERS
                            <span className="ml-auto text-[10px] text-signal-green font-mono">NEW</span>
                        </button>

                        <button
                            onClick={() => { setActiveTab('sonic-signals'); setSelectedArtist(null); }}
                            className={`nav-item w-full ${activeTab === 'sonic-signals' ? 'active' : ''}`}
                        >
                            <Zap className="w-4 h-4" />
                            SONIC SIGNALS
                        </button>

                        <button
                            onClick={() => { setActiveTab('locked-roster'); setSelectedArtist(null); }}
                            className={`nav-item w-full ${activeTab === 'locked-roster' ? 'active' : ''}`}
                        >
                            <Lock className="w-4 h-4" />
                            LOCKED ROSTER
                            {watchlist.size > 0 && (
                                <span className="ml-auto bg-accent/20 text-accent text-[10px] px-1.5 py-0.5 rounded font-mono">
                                    {watchlist.size}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => { setActiveTab('about'); setSelectedArtist(null); }}
                            className={`nav-item w-full ${activeTab === 'about' ? 'active' : ''}`}
                        >
                            <BarChart3 className="w-4 h-4" />
                            THE ALGORITHM
                        </button>
                    </nav>

                    {/* Upgrade CTA */}
                    <div className="p-4 border-t border-slate-900">
                        <button
                            onClick={() => setShowUpgrade(true)}
                            className="w-full bg-gradient-to-r from-accent to-signal-purple p-4 rounded-xl text-left group hover:opacity-90 transition-opacity"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <Crown className="w-4 h-4 text-white" />
                                <span className="text-white font-bold text-sm">Upgrade to Pro</span>
                            </div>
                            <p className="text-white/70 text-xs">
                                See pricing and features
                            </p>
                        </button>
                    </div>

                    {/* Join Waitlist CTA - subtle */}
                    <div className="p-4 pt-0">
                        <button
                            onClick={() => setShowJoin(true)}
                            className="w-full bg-surface border border-slate-800 p-3 rounded-xl text-left group hover:border-slate-700 transition-all"
                        >
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-slate-400" />
                                <span className="text-slate-300 text-sm">Join Waitlist</span>
                                <ChevronRight className="w-3 h-3 text-slate-500 ml-auto" />
                            </div>
                        </button>
                    </div>

                    {/* Status */}
                    <div className="p-4 border-t border-slate-900">
                        <div className="bg-card rounded-lg p-3 border border-slate-800/50">
                            <div className="data-tag mb-2">DATA STATUS</div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-signal-green animate-pulse" />
                                <span className="text-xs text-slate-400">LIVE • Updated daily</span>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* MAIN CONTENT */}
                <main className="flex-1 flex flex-col overflow-hidden">
                    {/* Header */}
                    <header className="h-16 flex items-center justify-between px-8 border-b border-slate-900 glass">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => { setActiveGenre('All'); setActiveTab('power-index'); setSelectedArtist(null); }}
                                className="text-lg font-bold tracking-tight text-white flex items-center gap-2 hover:text-accent transition-colors"
                            >
                                {activeTab === 'power-index' && 'POWER INDEX'}
                                {activeTab === 'sonic-signals' && 'SONIC SIGNALS'}
                                {activeTab === 'locked-roster' && 'LOCKED ROSTER'}
                                {activeTab === 'up-and-comers' && 'UP & COMERS'}
                                {activeTab === 'about' && 'THE ALGORITHM'}
                            </button>
                            <div className="h-4 w-px bg-slate-800 mx-2" />
                            <div className="live-badge">LIVE DATA</div>
                            <div className="h-4 w-px bg-slate-800 mx-2" />
                            <span className="text-[10px] text-signal-green font-mono">
                                ✓ FULL ACCESS • 150 ARTISTS • UPDATED DAILY
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="relative group">
                                {isSearching ? (
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-slate-500 border-t-accent rounded-full animate-spin" />
                                ) : (
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                                )}
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="SEARCH 3000+ ARTISTS..."
                                    className="bg-terminal border border-slate-800 rounded-lg pl-11 pr-4 py-2 text-sm font-mono w-80 focus:outline-none focus:border-accent/50 transition-colors placeholder:text-slate-600"
                                />
                                {searchQuery && searchResults.length > 0 && (
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-accent font-mono">
                                        {searchResults.length} FOUND
                                    </span>
                                )}
                            </div>
                        </div>
                    </header>

                    {/* Body */}
                    <div className="flex-1 overflow-auto p-8 terminal-scroll">
                        {selectedArtist ? (
                            <ArtistProfile
                                artist={selectedArtist}
                                onClose={() => setSelectedArtist(null)}
                                onToggleWatchlist={toggleWatchlist}
                                isWatched={watchlist.has(selectedArtist.id)}
                                onOpenSpotify={openSpotify}
                                onOpenYouTube={openYouTube}
                                onOpenTikTok={openTikTok}
                                onOpenInstagram={openInstagram}
                            />
                        ) : activeTab === 'sonic-signals' ? (
                            <SonicSignals artists={filteredArtists.slice(0, 10)} />
                        ) : activeTab === 'about' ? (
                            <AboutSection
                                onNavigate={(tab: TabType) => setActiveTab(tab)}
                                onShowPricing={() => setShowUpgrade(true)}
                                onShowContact={() => setShowJoin(true)}
                            />
                        ) : (
                            <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
                                {/* Filters */}
                                <div className="flex items-center justify-between gap-4 pb-2">
                                    <div className="flex items-center gap-2">
                                        {genres.map(genre => (
                                            <button
                                                key={genre}
                                                onClick={() => setActiveGenre(genre)}
                                                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${activeGenre === genre
                                                    ? 'bg-white text-terminal'
                                                    : 'bg-surface text-slate-400 hover:bg-slate-800 border border-slate-800'
                                                    }`}
                                            >
                                                {genre.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-1 bg-surface rounded-lg p-1 border border-slate-800">
                                        {(['All', 'Major', 'Indie'] as const).map(label => (
                                            <button
                                                key={label}
                                                onClick={() => setLabelFilter(label)}
                                                className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${labelFilter === label
                                                    ? label === 'Indie'
                                                        ? 'bg-signal-green/20 text-signal-green'
                                                        : label === 'Major'
                                                            ? 'bg-accent/20 text-accent'
                                                            : 'bg-white text-terminal'
                                                    : 'text-slate-500 hover:text-white'
                                                    }`}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="metric-card">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="p-2 bg-surface rounded-lg text-slate-400">
                                                <Users className="w-5 h-5" />
                                            </div>
                                            <span className="text-signal-green text-xs font-bold font-mono">LIVE</span>
                                        </div>
                                        <div className="text-2xl font-bold text-white mb-1 tracking-tight">
                                            {formatNumber(stats.totalListeners)}
                                        </div>
                                        <div className="data-tag">PLATFORM VOLUME</div>
                                    </div>
                                    <div className="metric-card">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="p-2 bg-surface rounded-lg text-slate-400">
                                                <Zap className="w-5 h-5" />
                                            </div>
                                            <span className="text-signal-purple text-xs font-bold font-mono">+{stats.viralCount}</span>
                                        </div>
                                        <div className="text-2xl font-bold text-white mb-1 tracking-tight">
                                            {filteredArtists.length}
                                        </div>
                                        <div className="data-tag">ACTIVE TRACKED</div>
                                    </div>
                                    <div className="metric-card">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="p-2 bg-surface rounded-lg text-accent">
                                                <ArrowUpRight className="w-5 h-5" />
                                            </div>
                                            <span className="text-accent text-xs font-bold font-mono glow-red">ALPHA</span>
                                        </div>
                                        <div className="text-2xl font-bold text-white mb-1 tracking-tight">
                                            {stats.arbitrageCount}
                                        </div>
                                        <div className="data-tag">ARBITRAGE SIGNALS</div>
                                    </div>
                                </div>

                                {/* Table */}
                                <div className="bg-card border border-slate-800/50 rounded-xl overflow-hidden">
                                    {loading ? (
                                        <div className="p-12 text-center">
                                            <div className="inline-block w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin mb-4" />
                                            <div className="data-tag">HYDRATING DATA STREAM...</div>
                                        </div>
                                    ) : filteredArtists.length === 0 ? (
                                        <div className="p-12 text-center">
                                            <Lock className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                                            <div className="text-slate-400 mb-2">No assets found</div>
                                            <div className="data-tag">ADJUST SEARCH PARAMETERS</div>
                                        </div>
                                    ) : (
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-terminal text-slate-500 text-[10px] uppercase tracking-[0.15em] font-bold border-b border-slate-800">
                                                    <th className="px-6 py-4 w-16">#</th>
                                                    <th className="px-6 py-4">ARTIST</th>
                                                    <th className="px-6 py-4">MONTHLY LISTENERS</th>
                                                    <th className="px-6 py-4">TIKTOK</th>
                                                    <th className="px-6 py-4">
                                                        <div className="flex items-center gap-1">
                                                            CONVERSION
                                                            <span className="text-[8px] bg-accent/20 text-accent px-1 rounded">ALPHA</span>
                                                        </div>
                                                    </th>
                                                    <th className="px-6 py-4">30D VELO</th>
                                                    <th className="px-6 py-4">STRUCTURE</th>
                                                    <th className="px-6 py-4 text-right">ACTION</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-sm">
                                                {filteredArtists.map((artist) => (
                                                    <tr
                                                        key={artist.id}
                                                        onClick={() => setSelectedArtist(artist)}
                                                        className="table-row-hover group"
                                                    >
                                                        <td className="px-6 py-4">
                                                            <span className="rank-number">{padRank(artist.rank)}</span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="artist-avatar relative group/avatar">
                                                                    {getInitials(artist.name)}
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); openYouTube(artist); }}
                                                                        className="absolute inset-0 bg-black/80 rounded-full opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity"
                                                                    >
                                                                        <Play className="w-4 h-4 text-white" />
                                                                    </button>
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="text-white font-semibold">{artist.name}</span>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="data-tag">{artist.genre}</span>
                                                                        {artist.country && (
                                                                            <>
                                                                                <span className="text-slate-700">•</span>
                                                                                <span className="data-tag">{artist.country}</span>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="font-mono text-slate-200">{formatNumber(artist.monthlyListeners)}</span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="font-mono text-slate-200">{formatNumber(artist.tiktokFollowers)}</span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold font-mono ${artist.conversionScore < 50
                                                                ? 'bg-signal-green/10 text-signal-green border border-signal-green/30 glow-green'
                                                                : 'bg-slate-800/50 text-slate-400 border border-slate-700/50'
                                                                }`}>
                                                                {artist.conversionScore.toFixed(1)}%
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className={`flex items-center gap-1 font-mono text-sm ${artist.growthVelocity > 0 ? 'text-signal-green' : 'text-red-400'
                                                                }`}>
                                                                {artist.growthVelocity > 0 ? (
                                                                    <TrendingUp className="w-3 h-3" />
                                                                ) : (
                                                                    <TrendingDown className="w-3 h-3" />
                                                                )}
                                                                {artist.growthVelocity > 0 ? '+' : ''}{artist.growthVelocity.toFixed(1)}%
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`badge ${artist.is_independent ? 'badge-indie' : 'badge-major'}`}>
                                                                {artist.is_independent ? 'INDIE' : 'MAJOR'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); toggleWatchlist(artist.id); }}
                                                                    className={`p-2 rounded-lg transition-all ${watchlist.has(artist.id)
                                                                        ? 'text-accent bg-accent/10'
                                                                        : 'text-slate-600 hover:text-white hover:bg-surface'
                                                                        }`}
                                                                >
                                                                    {watchlist.has(artist.id) ? (
                                                                        <BookmarkCheck className="w-4 h-4" />
                                                                    ) : (
                                                                        <Bookmark className="w-4 h-4" />
                                                                    )}
                                                                </button>
                                                                <button className="p-2 text-slate-600 group-hover:text-white group-hover:bg-surface rounded-lg transition-all">
                                                                    <ChevronRight className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>

                                {/* Premium Footer */}
                                <div className="bg-gradient-to-r from-slate-900/50 to-slate-800/50 border border-slate-800 rounded-xl p-6 mt-8">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent/50 flex items-center justify-center">
                                                <Radio className="w-4 h-4 text-white" />
                                            </div>
                                            <div>
                                                <span className="text-white font-bold">SoundScout</span>
                                                <span className="text-slate-500 text-xs ml-2">™</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs">
                                            <button onClick={() => setActiveTab('about')} className="text-slate-400 hover:text-white transition-colors">How It Works</button>
                                            <button onClick={() => setShowJoin(true)} className="text-slate-400 hover:text-white transition-colors">Join Waitlist</button>
                                            <button onClick={() => setShowUpgrade(true)} className="text-slate-400 hover:text-white transition-colors">Pricing</button>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-signal-green animate-pulse" />
                                            <span className="text-[10px] text-slate-500 font-mono">
                                                LIVE • MULTI-SOURCE INTELLIGENCE • UPDATED DAILY AT 06:00 UTC
                                            </span>
                                        </div>
                                        <span className="text-[10px] text-slate-600">
                                            © 2026 SoundScout™ • A&R Intelligence Platform
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
}

// ============================================================================
// ARTIST PROFILE COMPONENT
// ============================================================================

function ArtistProfile({
    artist,
    onClose,
    onToggleWatchlist,
    isWatched,
    onOpenSpotify,
    onOpenYouTube,
    onOpenTikTok,
    onOpenInstagram,
}: {
    artist: PowerIndexArtist;
    onClose: () => void;
    onToggleWatchlist: (id: string) => void;
    isWatched: boolean;
    onOpenSpotify: (artist: PowerIndexArtist) => void;
    onOpenYouTube: (artist: PowerIndexArtist, track?: string) => void;
    onOpenTikTok: (artist: PowerIndexArtist) => void;
    onOpenInstagram: (artist: PowerIndexArtist) => void;
}) {
    return (
        <div className="max-w-5xl mx-auto animate-slide-up">
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-accent/30 to-signal-purple/30 flex items-center justify-center text-3xl font-bold text-white border border-slate-800">
                        {getInitials(artist.name)}
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-3xl font-bold text-white">{artist.name}</h2>
                            <span className={`badge ${artist.is_independent ? 'badge-indie' : 'badge-major'}`}>
                                {artist.is_independent ? 'INDEPENDENT' : 'MAJOR LABEL'}
                            </span>
                        </div>
                        <div className="flex items-center gap-4 text-slate-400">
                            <span className="flex items-center gap-1">
                                <Globe className="w-4 h-4" />
                                {artist.city}, {artist.country}
                            </span>
                            <span>•</span>
                            <span>{artist.genre}</span>
                            {artist.label_name && (
                                <>
                                    <span>•</span>
                                    <span>{artist.label_name}</span>
                                </>
                            )}
                        </div>
                        <div className="mt-3 text-sm text-slate-500 max-w-lg">
                            <span className="text-accent font-semibold">RANK RATIONALE:</span>{' '}
                            {artist.status === 'Viral' && `Explosive growth of +${artist.growthVelocity.toFixed(0)}% in 30 days positions this artist as a top acquisition target.`}
                            {artist.status === 'Breakout' && `Consistent momentum with strong conversion metrics suggests impending mainstream crossover.`}
                            {artist.status === 'Conversion' && `High social virality with low Spotify conversion creates arbitrage opportunity.`}
                            {artist.status === 'Dominance' && `Market leader in sector with sustained listener base and brand partnerships.`}
                            {artist.status === 'Stable' && `Established audience with consistent performance indicators.`}
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 text-slate-500 hover:text-white hover:bg-surface rounded-lg transition-all">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="metric-card">
                    <div className="data-tag mb-2">MONTHLY LISTENERS</div>
                    <div className="text-2xl font-bold text-white font-mono">{formatNumber(artist.monthlyListeners)}</div>
                    <div className={`flex items-center gap-1 text-xs mt-1 ${artist.growthVelocity > 0 ? 'text-signal-green' : 'text-red-400'}`}>
                        {artist.growthVelocity > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {artist.growthVelocity > 0 ? '+' : ''}{artist.growthVelocity.toFixed(1)}% / 30d
                    </div>
                </div>
                <div className="metric-card">
                    <div className="data-tag mb-2">TIKTOK REACH</div>
                    <div className="text-2xl font-bold text-white font-mono">{formatNumber(artist.tiktokFollowers)}</div>
                </div>
                <div className="metric-card">
                    <div className="data-tag mb-2">INSTAGRAM REACH</div>
                    <div className="text-2xl font-bold text-white font-mono">{formatNumber(artist.instagramFollowers)}</div>
                </div>
                <div className="metric-card border-accent/30">
                    <div className="data-tag mb-2 text-accent">CONVERSION SCORE</div>
                    <div className={`text-2xl font-bold font-mono ${artist.conversionScore < 50 ? 'text-signal-green glow-green' : 'text-white'}`}>
                        {artist.conversionScore.toFixed(1)}%
                    </div>
                    {artist.conversionScore < 50 && (
                        <div className="text-xs text-signal-green mt-1">ARBITRAGE SIGNAL</div>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-8">
                <button onClick={() => onOpenSpotify(artist)} className="btn-primary flex items-center gap-2">
                    <Music className="w-4 h-4" />
                    SPOTIFY
                    <ExternalLink className="w-3 h-3" />
                </button>
                <button onClick={() => onOpenYouTube(artist)} className="btn-secondary flex items-center gap-2">
                    <Youtube className="w-4 h-4" />
                    YOUTUBE
                </button>
                <button onClick={() => onOpenTikTok(artist)} className="btn-secondary flex items-center gap-2">
                    TIKTOK
                </button>
                <button onClick={() => onOpenInstagram(artist)} className="btn-secondary flex items-center gap-2">
                    INSTAGRAM
                </button>
                <button
                    onClick={() => onToggleWatchlist(artist.id)}
                    className={`ml-auto flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition-all ${isWatched
                        ? 'bg-accent text-white'
                        : 'bg-surface text-slate-300 border border-slate-800 hover:bg-slate-800'
                        }`}
                >
                    {isWatched ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                    {isWatched ? 'IN ROSTER' : 'ADD TO ROSTER'}
                </button>
            </div>

            {/* Chart Placeholder */}
            <div className="bg-card border border-slate-800/50 rounded-xl p-6 mb-8">
                <div className="data-tag mb-4">REACH INDEX / 30D</div>
                <div className="h-48 flex items-end justify-between gap-1">
                    {Array.from({ length: 30 }).map((_, i) => {
                        const height = 40 + Math.random() * 50 + (i / 30) * (artist.growthVelocity > 0 ? 30 : -20);
                        return (
                            <div
                                key={i}
                                className="flex-1 bg-gradient-to-t from-accent/20 to-accent/5 rounded-t hover:from-accent/40 hover:to-accent/10 transition-colors"
                                style={{ height: `${Math.max(10, Math.min(100, height))}%` }}
                            />
                        );
                    })}
                </div>
            </div>

            {/* Social Cards */}
            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={() => onOpenTikTok(artist)}
                    className="bg-card border border-slate-800/50 rounded-xl p-6 text-left hover:border-slate-700 transition-all group"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="data-tag">TIKTOK VELOCITY</div>
                        <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
                    </div>
                    <div className="text-3xl font-bold text-white font-mono mb-2">{formatNumber(artist.tiktokFollowers)}</div>
                    <div className="text-sm text-slate-400">View trending sounds & videos</div>
                </button>
                <button
                    onClick={() => onOpenInstagram(artist)}
                    className="bg-card border border-slate-800/50 rounded-xl p-6 text-left hover:border-slate-700 transition-all group"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="data-tag">INSTAGRAM VELOCITY</div>
                        <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
                    </div>
                    <div className="text-3xl font-bold text-white font-mono mb-2">{formatNumber(artist.instagramFollowers)}</div>
                    <div className="text-sm text-slate-400">View engagement metrics</div>
                </button>
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
                    <span className="text-accent font-mono text-xs uppercase tracking-widest">Proprietary Intelligence Engine</span>
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
                        <h2 className="text-2xl font-bold text-white">Multi-Source Intelligence</h2>
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
            <footer className="border-t border-slate-800 pt-12 mt-12">
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
                            <li><a href="https://www.termsfeed.com/live/example" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Privacy Policy</a></li>
                            <li><a href="https://www.termsfeed.com/live/example" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Terms of Service</a></li>
                            <li><button onClick={() => onNavigate('about')} className="hover:text-white transition-colors">Cookie Policy</button></li>
                            <li><button onClick={() => onNavigate('about')} className="hover:text-white transition-colors">GDPR</button></li>
                        </ul>
                    </div>
                </div>
                <div className="flex items-center justify-between pt-8 border-t border-slate-900">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-signal-green animate-pulse" />
                        <span className="text-slate-500 text-xs font-mono">LIVE • 4× DAILY UPDATES • POWERED BY PROPRIETARY ALGORITHM</span>
                    </div>
                    <span className="text-slate-600 text-sm">© 2026 SoundScout™ • All Rights Reserved</span>
                </div>
            </footer>
        </div>
    );
}

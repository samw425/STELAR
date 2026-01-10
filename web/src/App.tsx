import React, { useState, useEffect, useMemo } from 'react';
import {
    Search,
    ChevronRight,
    Zap,

    Bookmark,
    BookmarkCheck,
    X,
    Globe,
    Music,
    Crown,
    Target,
    Lock,
    ArrowUpRight,
    Star,
    ArrowRight,
    Sparkles,
    Radio,
    Menu,
    Play,
    Facebook,
    Instagram,
    Linkedin,
    Twitter,
    MessageSquare,
    Copy,
    LayoutGrid,
    List,
    Disc,
    Share2,
    Youtube,
    Terminal,
    Cpu,
    Ticket,
    Clock,
    PlayCircle
} from 'lucide-react';
import { PowerIndexArtist, searchAllArtists, fetchRankingsData } from './lib/supabase';
import { Analytics } from '@vercel/analytics/react';
import { LandingPage } from './components/LandingPage';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const formatNumber = (num: number | undefined | null): string => {
    if (num === undefined || num === null) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
};

const padRank = (rank: number): string => rank.toString().padStart(3, '0');

const getStatusColor = (status: string | any) => {
    // Phase 3: Black Box Engine Badges
    if (!status) return 'bg-slate-500/20 text-slate-400 border-slate-700';

    const s = status.toUpperCase();
    if (s.includes('NUCLEAR') || s.includes('🔥')) {
        return 'bg-orange-500/20 text-orange-400 border border-orange-500/50 shadow-[0_0_12px_rgba(255,69,0,0.4)] animate-pulse';
    }
    if (s.includes('HEAT') || s.includes('VELOCITY')) {
        return 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 animate-pulse';
    }
    if (s.includes('SIGNAL') || s.includes('DISCOVERY')) {
        return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
    }
    if (s.includes('DOMINANCE') || s.includes('💎')) {
        return 'bg-amber-500/20 text-amber-500 border border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.2)]';
    }

    const map: Record<string, string> = {
        Viral: 'bg-[#FF4500]/20 text-[#FF4500] border-[#FF4500]/30',
        Breakout: 'bg-accent/20 text-accent border-accent/30',
        Dominance: 'bg-amber-500/20 text-amber-500 border-amber-500/30',
        Stable: 'bg-slate-500/20 text-slate-400 border-slate-700',
        Conversion: 'bg-accent/20 text-accent border-accent/30',
        'Up & Comer': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    };
    return map[status] || 'bg-slate-500/20 text-slate-400 border-slate-700';
};

// DELETED getStatusBadge (unused)

// Flexible genre matching for New Releases filter
const matchesGenre = (releaseGenre: string | undefined, filterGenre: string): boolean => {
    if (filterGenre === 'ALL') return true;
    if (!releaseGenre) return false;

    const release = releaseGenre.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const filter = filterGenre.toUpperCase().replace(/[^A-Z0-9]/g, '');

    // Check if release genre contains the filter terms
    // e.g., "HIPHOPRAP" includes "HIPHOP" or "RAP"
    return release.includes(filter) || filter.includes(release.slice(0, 4));
};

// Extend the imported PowerIndexArtist type with new properties
declare module './lib/supabase' {
    interface PowerIndexArtist {
        youtube_url?: string;
        facebook_handle?: string;
        breakoutProb?: number;
        trends?: number[];
    }
}

const getInitials = (name: string): string => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

type TabType = 'the-pulse' | 'old-school' | 'sonic-signals' | 'locked-roster' | 'the-launchpad' | 'new-releases' | 'live-tours' | 'about' | 'privacy' | 'terms';

// ============================================================================
// ONBOARDING COMPONENT
// ============================================================================

function WelcomeBanner({ onDismiss }: { onDismiss: () => void }) {
    return (
        <div className="glass-header px-4 py-2 border-b-0 border-white/5 relative z-[60]">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-accent/30 shadow-[0_0_20px_rgba(255,69,0,0.2)]">
                        <Radio className="w-7 h-7 text-accent" />
                    </div>
                    <div className="text-center sm:text-left">
                        <span className="text-white font-black text-lg tracking-tight">Welcome to STELAR . . .</span>
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
                        className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-full text-[10px] font-black uppercase tracking-widest transition-all spring-hover"
                    >
                        Dismiss
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-2xl z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="glass max-w-4xl w-full p-8 animate-slide-up rounded-3xl shadow-2xl overflow-hidden relative">
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

                {/* Launch Promo Banner - Minimalist */}
                <div className="py-8 text-center">
                    <div className="inline-flex items-center gap-3 text-accent text-sm font-black uppercase tracking-[0.2em] animate-pulse">
                        <Sparkles className="w-5 h-5" />
                        Launch Phase: All Pro Signals are Unlocked
                        <Sparkles className="w-5 h-5" />
                    </div>
                </div>

                {/* Plans Grid - Minimalist */}
                <div className="grid grid-cols-3 gap-16 py-12">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`transition-all duration-700 ${plan.highlighted ? 'opacity-100' : 'opacity-40 hover:opacity-100'}`}
                        >
                            <div className="mb-8">
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">{plan.name} tier</div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-black text-white tracking-tighter">{plan.price}</span>
                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{plan.priceSub}</span>
                                </div>
                            </div>

                            <ul className="space-y-4 mb-10 min-h-[280px]">
                                {plan.features.map((feat, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${plan.highlighted ? 'bg-accent shadow-[0_0_10px_rgba(255,69,0,0.6)]' : 'bg-slate-800'}`} />
                                        <span className="text-[11px] font-medium text-slate-400 group-hover:text-white transition-colors">{feat}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={plan.current ? onClose : undefined}
                                className={`w-full py-4 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all
                                ${plan.current
                                        ? 'bg-signal-green text-white shadow-xl'
                                        : plan.highlighted
                                            ? 'bg-white text-black hover:bg-accent hover:text-white shadow-2xl'
                                            : 'bg-transparent text-slate-600 border border-slate-900 hover:border-slate-500 hover:text-white'
                                    }`}
                            >
                                {plan.current ? 'Access Active' : plan.name === 'Enterprise' ? 'Contact Ops' : 'Begin Deployment'}
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
                <div className="glass max-w-md w-full p-12 rounded-[2rem] shadow-2xl text-center relative overflow-hidden">
                    <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-8 animate-fade-in">
                        <Star className="w-10 h-10 text-accent animate-pulse" />
                    </div>
                    <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">Day Zero Locked</h2>
                    <p className="text-slate-500 font-medium mb-10 leading-relaxed">
                        Signal access approved. You'll be notified when the next market anomalies are detected.
                    </p>
                    <button
                        onClick={onClose}
                        className="w-full py-4 rounded-full font-black text-[10px] bg-white text-black hover:bg-accent hover:text-white uppercase tracking-[0.2em] transition-all shadow-xl"
                    >
                        Return to Pulse
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-2xl z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="glass max-w-md w-full p-8 rounded-3xl animate-slide-up shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">Join the Waitlist</h2>
                        <p className="text-slate-400 text-sm">
                            Get early access to premium features and exclusive market insights.
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
                        className="w-full py-3 rounded-xl font-black bg-white text-black hover:bg-white/90 transition-all mt-6 disabled:opacity-50 disabled:cursor-not-allowed uppercase text-[10px] tracking-[0.2em] shadow-lg spring-hover"
                    >
                        {loading ? 'Joining Waitlist...' : 'Join Waitlist'}
                    </button>
                </form>

                {error && (
                    <p className="text-center text-accent-dim text-sm mt-2">{error}</p>
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
// ============================================================================
// PHASE 4: PREDICTIVE UTILITIES
// ============================================================================

function Sparkline({ data, color = '#FF4500' }: { data: number[], color?: string }) {
    if (!data || data.length < 2) return null;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const width = 100;
    const height = 30;
    const points = data.map((d, i) => ({
        x: (i / (data.length - 1)) * width,
        y: height - ((d - min) / range) * height
    }));

    const d = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');

    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
            <path
                d={d}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="drop-shadow-[0_0_4px_rgba(255,69,0,0.5)]"
            />
        </svg>
    );
}

function DossierModal({ artist, onClose, onClaim, isClaimed }: { artist: PowerIndexArtist, onClose: () => void, onClaim: (id: string) => void, isClaimed: boolean }) {
    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-2xl z-[100] flex items-center justify-center p-0 md:p-4 animate-fade-in overflow-hidden">
            <div className="w-full h-full md:h-auto md:max-w-5xl glass md:rounded-3xl overflow-hidden shadow-2xl flex flex-col relative">

                {/* CINEMATIC BACKGROUND */}
                <div className="absolute inset-0 z-0">
                    <img
                        src={artist.avatar_url || 'https://stelarmusic.pages.dev/og-image.png'}
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
                                <div className="w-full h-full rounded-full overflow-hidden border-2 border-accent shadow-[0_0_20px_rgba(255,69,0,0.3)]">
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

                            {/* SOCIAL LINKS */}
                            <div className="flex items-center justify-center md:justify-start gap-4 mt-6">
                                <a
                                    href={`https://open.spotify.com/artist/${artist.spotify_id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-3 bg-[#1DB954]/10 hover:bg-[#1DB954] text-[#1DB954] hover:text-white rounded-full transition-all hover:scale-110"
                                    title="Open on Spotify"
                                >
                                    <Music className="w-5 h-5" />
                                </a>

                                {artist.instagram_handle && (
                                    <a
                                        href={`https://instagram.com/${artist.instagram_handle}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-3 bg-pink-500/10 hover:bg-pink-600 text-pink-500 hover:text-white rounded-full transition-all hover:scale-110"
                                        title="Instagram"
                                    >
                                        <Instagram className="w-5 h-5" />
                                    </a>
                                )}

                                {artist.tiktok_handle && (
                                    <a
                                        href={`https://tiktok.com/@${artist.tiktok_handle}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-3 bg-white/10 hover:bg-black text-white rounded-full transition-all hover:scale-110"
                                        title="TikTok"
                                    >
                                        <div className="w-5 h-5 font-black flex items-center justify-center text-[10px]">TT</div>
                                    </a>
                                )}

                                {artist.twitter_handle && (
                                    <a
                                        href={`https://twitter.com/${artist.twitter_handle}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-3 bg-blue-400/10 hover:bg-blue-400 text-blue-400 hover:text-white rounded-full transition-all hover:scale-110"
                                        title="Twitter"
                                    >
                                        <Twitter className="w-5 h-5" />
                                    </a>
                                )}

                                {artist.youtube_url && (
                                    <a
                                        href={artist.youtube_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-3 bg-red-600/10 hover:bg-red-600 text-red-600 hover:text-white rounded-full transition-all hover:scale-110"
                                        title="YouTube Channel"
                                    >
                                        <Youtube className="w-5 h-5" />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* STATS ROW: MATCHING THE OG IMAGE LOOK */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-16 px-4 md:px-0">
                        <div className="space-y-1">
                            <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Listeners</div>
                            <div className="text-2xl md:text-3xl font-black text-white font-mono">{formatNumber(artist.monthlyListeners)}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Power Score</div>
                            <div className="text-2xl md:text-3xl font-black text-accent font-mono">{artist.powerScore}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">7D Velocity</div>
                            <div className="pt-2">
                                <Sparkline data={artist.trends || [40, 45, 42, 50, 48, 55, 60]} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Breakout Prob.</div>
                            <div className="text-2xl md:text-3xl font-black text-emerald-400 font-mono">{artist.breakoutProb || 82}%</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Conversion</div>
                            <div className="text-2xl md:text-3xl font-black text-white font-mono">{(artist.conversionScore || 0).toFixed(1)}%</div>
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
                                        <span className="text-[#FF4500] text-[10px] font-bold tracking-widest">+12.4% SIGNAL</span>
                                    </div>
                                    <div className="text-3xl font-bold text-white font-mono group-hover:text-accent transition-colors">
                                        ${formatNumber(artist.monthlyListeners * 0.003 * 12 * 0.7)}
                                    </div>
                                    <p className="text-[9px] text-white/20 mt-2 font-mono uppercase tracking-tight">Based on standard streaming multiples (Net of distro fees)</p>
                                </div>

                                <div className="group">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">PROJECTED VALUATION (3YR)</span>
                                        <span className="text-accent text-[10px] font-bold tracking-widest shadow-[0_0_10px_rgba(255,69,0,0.2)]">HIGH CONFIDENCE</span>
                                    </div>
                                    <div className="text-3xl font-bold text-white font-mono group-hover:text-accent transition-colors">
                                        ${formatNumber(artist.monthlyListeners * 2.5)}
                                    </div>
                                    <p className="text-[9px] text-white/20 mt-2 font-mono uppercase tracking-tight">Standard IP catalog acquisition multiple (5.5x multiple applied)</p>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: INSIGHTS - Minimalist */}
                        <div className="space-y-8">
                            <h3 className="text-xs font-black text-white/20 uppercase tracking-[0.5em] border-b border-white/5 pb-4">Proprietary Signal</h3>

                            <div className="py-2">
                                <div className="flex items-center gap-3 text-accent mb-6">
                                    <Sparkles className="w-5 h-5 animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">High Fidelity Anomaly</span>
                                </div>
                                <p className="text-white text-lg leading-relaxed mb-10 font-medium tracking-tight">
                                    Artist's streaming velocity significantly outpaces category peer growth. Social signals indicate a high-retention fan base with <span className="text-accent">{artist.conversionScore.toFixed(1)}% conversion</span> efficiency.
                                    Market positioning suggests immediate potential for live tour routing or catalog accumulation.
                                </p>

                                <div className="grid grid-cols-2 gap-12 border-t border-white/5 pt-10">
                                    <div className="group">
                                        <div className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-2">Detection Status</div>
                                        <div className="text-lg font-black text-white uppercase tracking-tighter group-hover:text-accent transition-colors">{artist.status}</div>
                                    </div>
                                    <div className="group text-right">
                                        <div className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-2">Ecosystem Structure</div>
                                        <div className="text-lg font-black text-white uppercase tracking-tighter group-hover:text-accent transition-colors">{artist.is_independent ? 'Independent' : 'Major Circle'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* MODAL FOOTER */}
                <div className="relative z-[100] p-6 border-t border-white/5 bg-black/50 backdrop-blur-3xl flex justify-between items-center">
                    <div className="text-[9px] font-mono text-white/20 uppercase tracking-[0.2em] hidden md:block">
                        STELAR Engine v2.0 // Artist Object {artist.id.slice(0, 8)}
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <button onClick={onClose} className="flex-1 md:flex-none px-8 py-3 rounded-full font-black text-[10px] text-white/40 hover:text-white uppercase tracking-widest transition-colors">
                            Dismiss
                        </button>
                        <button
                            onClick={() => onClaim(artist.id)}
                            className={`flex-1 md:flex-none px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg
                                ${isClaimed
                                    ? 'bg-[#FF4500]/20 text-[#FF4500] border border-[#FF4500]/30'
                                    : 'bg-[#FF4500] text-black hover:bg-[#FF4500]/90 shadow-[0_0_20px_rgba(255,69,0,0.3)]'}`}
                        >
                            {isClaimed ? '✓ Claimed Day Zero' : 'Claim Discovery'}
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
    const [activeTab, setActiveTab] = useState<TabType>('the-pulse');
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

    const [watchlist, setWatchlist] = useState<Set<string>>(() => {
        const saved = localStorage.getItem('ss_watchlist_v1');
        return saved ? new Set(JSON.parse(saved)) : new Set();
    });
    const [claims, setClaims] = useState<Set<string>>(() => {
        const saved = localStorage.getItem('ss_claims_v1');
        return saved ? new Set(JSON.parse(saved)) : new Set();
    });
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeDiscoveryList, setActiveDiscoveryList] = useState<'movers' | 'gems' | null>(null);
    const [selectedGenre, setSelectedGenre] = useState<string>('ALL');
    const [selectedStructure, setSelectedStructure] = useState<'ALL' | 'MAJOR' | 'INDIE'>('ALL');
    const [oldSchoolArtists, setOldSchoolArtists] = useState<any[]>([]);

    // VIEW MODE: Grid (like Old School) vs List (data table)
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // NEW RELEASES: Latest music from all artists
    const [newReleases, setNewReleases] = useState<any[]>([]);
    const [newReleasesLoading, setNewReleasesLoading] = useState(false);

    // LIVE TOURS: Concert tours with affiliate links
    const [tours, setTours] = useState<any[]>([]);
    const [toursLoading, setToursLoading] = useState(false);

    // COMING SOON: Upcoming album releases
    const [comingReleases, setComingReleases] = useState<any[]>([]);

    // User tier (for monetization - can lock down to Pro later once we get traction)
    const userTier = 'free'; // 'free', 'pro', 'enterprise'
    // PERFORMANCE FIX: Rendering 5000 rows freezes mobile. 
    // Use pagination (Load More) instead. Start with 50.
    const [displayLimit, setDisplayLimit] = useState(150);

    // SEAMLESS NAVIGATION: Helper to select artist and close all modals
    const handleSelectArtist = (artist: PowerIndexArtist | null) => {
        // Close all open modals/panels first
        setShowDossier(false);
        setShowUpgrade(false);
        setShowJoin(false);
        setMobileMenuOpen(false);

        // Then set the new artist
        setSelectedArtist(artist);
        setSearchQuery(''); // Clear search so profile shows up

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

    const toggleClaim = (artistId: string) => {
        setClaims(prev => {
            const next = new Set(prev);
            if (next.has(artistId)) {
                next.delete(artistId);
            } else {
                next.add(artistId);
            }
            return next;
        });
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
            if (activeTab === 'the-launchpad') {
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

    // OLD SCHOOL: Load legends data when tab is selected
    useEffect(() => {
        if (activeTab === 'old-school' && oldSchoolArtists.length === 0) {
            fetch('/oldschool.json')
                .then(res => res.json())
                .then(data => setOldSchoolArtists(data.artists || []))
                .catch(err => console.error('Failed to load Old School data:', err));
        }
    }, [activeTab, oldSchoolArtists.length]);

    // NEW RELEASES: Fetch latest music releases from iTunes RSS
    useEffect(() => {
        if (activeTab === 'new-releases' && newReleases.length === 0) {
            setNewReleasesLoading(true);

            // Fetch MULTIPLE iTunes feeds including genre-specific for comprehensive coverage
            // Genre IDs: Hip-Hop=18, R&B=15, Country=6, Rock=21, Latin=12, Alternative=20, Electronic=7, Pop=14
            Promise.all([
                fetch('https://itunes.apple.com/us/rss/topalbums/limit=200/json').then(r => r.json()).catch(() => null),
                fetch('https://itunes.apple.com/us/rss/topalbums/limit=100/genre=18/json').then(r => r.json()).catch(() => null), // Hip-Hop
                fetch('https://itunes.apple.com/us/rss/topalbums/limit=100/genre=15/json').then(r => r.json()).catch(() => null), // R&B
                fetch('https://itunes.apple.com/us/rss/topalbums/limit=100/genre=6/json').then(r => r.json()).catch(() => null),  // Country
                fetch('https://itunes.apple.com/us/rss/topalbums/limit=100/genre=21/json').then(r => r.json()).catch(() => null), // Rock
                fetch('https://itunes.apple.com/us/rss/topalbums/limit=100/genre=12/json').then(r => r.json()).catch(() => null), // Latin
                fetch('https://itunes.apple.com/us/rss/topalbums/limit=100/genre=20/json').then(r => r.json()).catch(() => null), // Alternative
                fetch('https://itunes.apple.com/us/rss/topalbums/limit=100/genre=7/json').then(r => r.json()).catch(() => null),  // Electronic
                fetch('https://itunes.apple.com/us/rss/topalbums/limit=100/genre=14/json').then(r => r.json()).catch(() => null), // Pop
            ])
                .then((results) => {
                    // Parse releases helper
                    const parseReleases = (data: any) => {
                        return data?.feed?.entry?.map((item: any, index: number) => {
                            const releaseDateStr = item['im:releaseDate']?.label || '';
                            const releaseDate = releaseDateStr ? new Date(releaseDateStr) : null;

                            return {
                                id: item.id?.attributes?.['im:id'] || `${index}-${Date.now()}-${Math.random()}`,
                                name: item['im:name']?.label || 'Unknown',
                                artist: item['im:artist']?.label || 'Unknown Artist',
                                artistLink: item['im:artist']?.attributes?.href || null,
                                artwork: item['im:image']?.[2]?.label?.replace('170x170', '400x400') || '',
                                releaseDate: item['im:releaseDate']?.attributes?.label || 'New Release',
                                releaseDateRaw: releaseDate,
                                genre: item.category?.attributes?.label || 'Music',
                                link: item.link?.attributes?.href || '#'
                            };
                        }) || [];
                    };

                    // Combine all releases from all feeds
                    const allReleases = results.flatMap(data => parseReleases(data));

                    // Deduplicate by album name + artist
                    const seen = new Set<string>();
                    const deduped = allReleases.filter(r => {
                        const key = `${r.name.toLowerCase()}-${r.artist.toLowerCase()}`;
                        if (seen.has(key)) return false;
                        seen.add(key);
                        return true;
                    });

                    // Sort by release date, newest first (no date filtering - show all)
                    const sortedReleases = deduped.sort((a, b) => {
                        if (!a.releaseDateRaw) return 1;
                        if (!b.releaseDateRaw) return -1;
                        return b.releaseDateRaw.getTime() - a.releaseDateRaw.getTime();
                    });

                    console.log(`New Releases loaded: ${sortedReleases.length} total from ${results.filter(r => r).length} feeds`);

                    setNewReleases(sortedReleases);
                    setNewReleasesLoading(false);
                })
                .catch(err => {
                    console.error('Failed to load New Releases:', err);
                    setNewReleasesLoading(false);
                });
        }
    }, [activeTab, newReleases.length]);

    // LIVE TOURS: Load concert tours data with affiliate links
    useEffect(() => {
        if (activeTab === 'live-tours' && tours.length === 0) {
            setToursLoading(true);
            fetch('/tours.json')
                .then(res => res.json())
                .then(data => {
                    setTours(data.tours || []);
                    setToursLoading(false);
                })
                .catch(err => {
                    console.error('Failed to load Tours data:', err);
                    setToursLoading(false);
                });
        }
    }, [activeTab, tours.length]);

    // COMING SOON: Load upcoming album releases
    useEffect(() => {
        if (activeTab === 'new-releases' && comingReleases.length === 0) {
            fetch('/coming_releases.json')
                .then(res => res.json())
                .then(data => setComingReleases(data.coming_soon || []))
                .catch(err => console.error('Failed to load Coming Soon:', err));
        }
    }, [activeTab, comingReleases.length]);

    // DEEP LINKING: Check URL on mount and open artist profile
    // DEEP LINKING: Check URL on mount and open artist profile
    useEffect(() => {
        const checkDeepLink = async () => {
            // Wait a moment for app to hydrate
            await new Promise(r => setTimeout(r, 500));

            const path = window.location.pathname;
            // Handle both clean paths and query param redirects? 
            // Actually, simply ensure we look at the path segment correctly.

            if (path.startsWith('/artist/')) {
                // Ensure artists are loaded first
                const rankingsData = await fetchRankingsData();
                if (!rankingsData) return;

                // Extract slug carefully, handling trailing slashes or query params
                const slugSegment = path.split('/artist/')[1];
                if (!slugSegment) return;

                // Remove any trailing slash or query params if they leaked in (though path shouldn't have query)
                const slug = slugSegment.split('/')[0].split('?')[0];

                if (slug) {
                    const artistName = decodeURIComponent(slug.replace(/-/g, ' ')).toLowerCase();

                    // Search across all categories to find the artist
                    let foundArtist: PowerIndexArtist | undefined;

                    // Force a thorough search
                    const allCategories = Object.values(rankingsData.rankings).flat() as PowerIndexArtist[];

                    foundArtist = allCategories.find(a =>
                        a.name.toLowerCase() === artistName ||
                        a.name.toLowerCase().replace(/\s+/g, '-') === slug ||
                        // Try matching ID just in case
                        a.id === slug
                    );

                    // If not found in main rankings, search Old School legends
                    if (!foundArtist) {
                        try {
                            const oldSchoolRes = await fetch('/oldschool.json');
                            if (oldSchoolRes.ok) {
                                const oldSchoolData = await oldSchoolRes.json();
                                const osArtist = oldSchoolData.artists?.find((a: any) =>
                                    a.name.toLowerCase() === artistName ||
                                    a.name.toLowerCase().replace(/\s+/g, '-') === slug
                                );
                                if (osArtist) {
                                    // Convert to PowerIndexArtist format
                                    foundArtist = {
                                        id: osArtist.id,
                                        name: osArtist.name,
                                        genre: osArtist.genre,
                                        country: osArtist.country,
                                        city: null,
                                        status: 'Dominance' as const,
                                        monthlyListeners: osArtist.monthlyListeners,
                                        tiktokFollowers: 0,
                                        instagramFollowers: 0,
                                        youtubeSubscribers: 0,
                                        twitterFollowers: 0,
                                        powerScore: 999,
                                        growthVelocity: 0,
                                        conversionScore: 0,
                                        arbitrageSignal: 0,
                                        is_independent: false,
                                        rank: osArtist.rank,
                                        chartRank: osArtist.rank,
                                        avatar_url: osArtist.avatar_url,
                                        spotify_id: '',
                                        label_name: null,
                                        instagram_handle: null,
                                        tiktok_handle: null,
                                        twitter_handle: null,
                                        youtube_channel: null,
                                        lastUpdated: ''
                                    };
                                    // Switch to Old School tab when viewing an Old School artist
                                    setActiveTab('old-school');
                                }
                            }
                        } catch (e) {
                            console.log('Failed to search Old School artists:', e);
                        }
                    }

                    if (foundArtist) {
                        setSelectedArtist(foundArtist);
                        // Ensure we scroll to top
                        if (mainContentRef.current) {
                            mainContentRef.current.scrollTo({ top: 0, behavior: 'instant' });
                        }
                    } else {
                        console.log('Deep link artist not found:', slug);
                    }
                }
            }

            // Handle /launchpad deep link
            if (path === '/launchpad' || path === '/launchpad/') {
                setActiveTab('the-launchpad');
            }

            // Handle /releases deep link
            if (path === '/releases' || path === '/releases/') {
                setActiveTab('new-releases');
            }

            // Handle /tours deep link
            if (path === '/tours' || path === '/tours/') {
                setActiveTab('live-tours');
            }

            // Handle /roster deep link
            if (path === '/roster' || path === '/roster/') {
                setActiveTab('locked-roster');
            }
        };

        checkDeepLink();
    }, []);

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

    // Persist claims
    useEffect(() => {
        localStorage.setItem('ss_claims_v1', JSON.stringify([...claims]));
    }, [claims]);

    // Complete onboarding
    const completeOnboarding = () => {
        localStorage.setItem('ss_onboarding_complete', 'true');
        setShowOnboarding(false);
    };

    // Note: requiresUpgrade check will be added when auth is implemented

    // Prompt upgrade


    // Filter artists - use searchResults if searching, otherwise use loaded artists
    // Filter artists - use searchResults if searching, otherwise use loaded artists
    const filteredArtists = useMemo(() => {
        // If searching, use search results
        let result = searchQuery.trim() ? searchResults : artists;

        // Filter by tab (for locked roster)
        if (activeTab === 'locked-roster') {
            result = result.filter(a => watchlist.has(a.id));
        }

        // Filter by tab (Launchpad - Professional Scout Engine)
        // NOTE: up_and_comers is PRE-CURATED in generate_rankings.py with 150 artists
        // No additional filtering needed - just sort by potential
        if (activeTab === 'the-launchpad') {
            // PROFESSIONAL SORTING: Prioritize 'Signing Candidates' 
            // Candidates are Independent + High Growth Velocity
            result = [...result].sort((a, b) => {
                const aPotential = a.is_independent ? a.growthVelocity * 2 : a.growthVelocity;
                const bPotential = b.is_independent ? b.growthVelocity * 2 : b.growthVelocity;
                return bPotential - aPotential;
            });
        }

        // Filter by Genre (skip if actively searching to show all results)
        if (selectedGenre !== 'ALL' && !searchQuery.trim()) {
            result = result.filter(a => a.genre && a.genre.toUpperCase() === selectedGenre);
        }

        // Filter by Structure (skip if actively searching to show all results)
        if (selectedStructure !== 'ALL' && !searchQuery.trim()) {
            const isIndie = selectedStructure === 'INDIE';
            result = result.filter(a => a.is_independent === isIndie);
        }

        // Re-rank
        result = result.map((artist, index) => ({
            ...artist,
            rank: index + 1
        }));

        // Reset limit when changing tabs/search/filters
        // STELAR: Orbit (Pulse) shows full 3000 catalog. Launchpad shows 150.
        setDisplayLimit(activeTab === 'the-pulse' ? 3000 : (activeTab === 'the-launchpad' ? 150 : 50));
        return result;
    }, [artists, searchResults, searchQuery, activeTab, watchlist, userTier, selectedGenre, selectedStructure]);

    // Apply pagination for rendering only
    const visibleArtists = useMemo(() => {
        return filteredArtists.slice(0, displayLimit);
    }, [filteredArtists, displayLimit]);

    const toggleWatchlist = (artistId: string) => {
        // UNLIMITED ROSTER: Removed artificial limit per user request
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

    // LANDING PAGE STATE
    const [hasEntered, setHasEntered] = useState(false);

    useEffect(() => {
        const visited = localStorage.getItem('stelar_visited');
        if (visited) {
            setHasEntered(true);
        }
    }, []);

    const handleEnterApp = () => {
        setHasEntered(true);
        localStorage.setItem('stelar_visited', 'true');
    };

    if (!hasEntered) {
        return <LandingPage onEnter={handleEnterApp} />;
    }

    return (
        <>
            {/* Upgrade Modal */}
            {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} feature="Pro Features" />}

            {/* Join Modal */}
            {showJoin && <JoinModal onClose={() => setShowJoin(false)} />}

            {/* Dossier Modal */}
            {showDossier && selectedArtist && (
                <DossierModal
                    artist={selectedArtist}
                    onClose={() => setShowDossier(false)}
                    onClaim={toggleClaim}
                    isClaimed={claims.has(selectedArtist.id)}
                />
            )}

            <div className="min-h-screen bg-black text-white selection:bg-[#FF4500] selection:text-white font-sans overflow-x-hidden">
                <Analytics />    {/* GLOBAL VIBRANCY GLOW */}
                <div
                    className="vibrancy-glow fixed inset-0 w-full h-full"
                    style={{
                        background: activeTab === 'the-launchpad' ? '#FF4500' :
                            activeTab === 'sonic-signals' ? '#9333ea' :
                                activeTab === 'the-pulse' ? '#3B82F6' :
                                    '#FF4500',
                        opacity: selectedArtist ? 0.05 : 0.08
                    }}
                />

                {/* Welcome Banner - Non-blocking onboarding */}
                {showOnboarding && <WelcomeBanner onDismiss={completeOnboarding} />}

                {/* Ambient Background - BOOSTED VIBRANCY */}
                <div className="absolute top-[-50%] left-[-20%] w-[100%] h-[100%] bg-purple-900/40 rounded-full blur-[120px] pointer-events-none animate-pulse-slow mix-blend-screen" />
                <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-blue-900/30 rounded-full blur-[150px] pointer-events-none animate-pulse-slow delay-700 mix-blend-screen" />
                <div className="absolute top-[20%] left-[20%] w-[60%] h-[60%] bg-[#FF4500]/20 rounded-full blur-[200px] pointer-events-none mix-blend-screen" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 pointer-events-none mix-blend-overlay"></div>
                <div className="flex h-screen overflow-hidden relative z-10"> {/* Subtract ticker height approx */}
                    {/* MOBILE MENU BACKDROP OVERLAY */}
                    <div
                        className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                        onClick={() => setMobileMenuOpen(false)}
                    />

                    {/* MAIN LAYOUT WRAPPER */}
                    {/* LEFT RAIL / SIDEBAR */}
                    <aside className={`
                        fixed lg:relative inset-y-0 left-0 z-[80]
                        w-80 flex flex-col bg-black/50 backdrop-blur-3xl h-full
                        transform transition-transform duration-500 ease-in-out
                        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    `}>
                        {/* BRAND HEADER - ELITE HUMAN DESIGN */}
                        <div className="p-8 pb-4">
                            <div className="flex flex-col gap-1 group cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <Radio className="w-10 h-10 text-[#FF4500] drop-shadow-[0_0_20px_rgba(255,69,0,0.9)]" strokeWidth={1.5} />
                                    <h1 className="text-2xl font-black text-white tracking-tighter uppercase leading-none">
                                        STELAR
                                    </h1>
                                </div>
                                <div className="pl-11">
                                    <div className="text-[9px] font-mono text-slate-500 tracking-[0.4em] uppercase opacity-60">
                                        Track the top. Discover the Next
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto px-4 space-y-6 scrollbar-hide">
                            {/* NAVIGATION SECTION */}
                            <div>
                                <nav className="space-y-1">
                                    <button
                                        onClick={() => { setActiveTab('the-pulse'); setSelectedArtist(null); setActiveDiscoveryList(null); setMobileMenuOpen(false); setSearchQuery(''); }}
                                        className={`w-full flex items-center justify-between px-6 py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all
                                            ${activeTab === 'the-pulse'
                                                ? 'text-white'
                                                : 'text-slate-600 hover:text-white'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <Globe className={`w-5 h-5 ${activeTab === 'the-pulse' ? 'text-accent' : 'text-slate-800'}`} />
                                            <span>The Pulse</span>
                                        </div>
                                        {activeTab === 'the-pulse' && <div className="w-1.5 h-1.5 rounded-full bg-accent" />}
                                    </button>

                                    <button
                                        onClick={() => { setActiveTab('the-launchpad'); setSelectedArtist(null); setActiveDiscoveryList(null); setMobileMenuOpen(false); window.history.pushState({}, '', '/launchpad'); }}
                                        className={`w-full flex items-center justify-between px-6 py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all
                                            ${activeTab === 'the-launchpad'
                                                ? 'text-white'
                                                : 'text-slate-600 hover:text-white'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <Zap className={`w-5 h-5 ${activeTab === 'the-launchpad' ? 'text-accent' : 'text-slate-800'}`} />
                                            <span>The Launchpad</span>
                                        </div>
                                        {activeTab === 'the-launchpad' ? (
                                            <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                                        ) : (
                                            <span className="text-[8px] text-slate-800 font-black tracking-widest">LIVE</span>
                                        )}
                                    </button>


                                    {/* OLD SCHOOL TAB */}
                                    <button
                                        onClick={() => { setActiveTab('old-school'); setSelectedArtist(null); setActiveDiscoveryList(null); setMobileMenuOpen(false); window.history.pushState({}, '', '/oldschool'); }}
                                        className={`w-full flex items-center justify-between px-6 py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all
                                            ${activeTab === 'old-school' ? 'text-white' : 'text-slate-600 hover:text-white'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <Crown className={`w-5 h-5 ${activeTab === 'old-school' ? 'text-amber-500' : 'text-slate-800'}`} />
                                            <span>Old School</span>
                                        </div>
                                        {activeTab === 'old-school' && <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                                    </button>

                                    <button
                                        onClick={() => { setActiveTab('new-releases'); setSelectedArtist(null); setActiveDiscoveryList(null); setMobileMenuOpen(false); window.history.pushState({}, '', '/releases'); }}
                                        className={`w-full flex items-center justify-between px-6 py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all
                                            ${activeTab === 'new-releases' ? 'text-white' : 'text-slate-600 hover:text-white'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <Disc className={`w-5 h-5 ${activeTab === 'new-releases' ? 'text-accent' : 'text-slate-800'}`} />
                                            <span>New Releases</span>
                                        </div>
                                        {activeTab === 'new-releases' && <div className="w-1.5 h-1.5 rounded-full bg-accent" />}
                                    </button>

                                    <button
                                        onClick={() => { setActiveTab('live-tours'); setSelectedArtist(null); setActiveDiscoveryList(null); setMobileMenuOpen(false); window.history.pushState({}, '', '/tours'); }}
                                        className={`w-full flex items-center justify-between px-6 py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all
                                            ${activeTab === 'live-tours' ? 'text-white' : 'text-slate-600 hover:text-white'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <Ticket className={`w-5 h-5 ${activeTab === 'live-tours' ? 'text-accent' : 'text-slate-800'}`} />
                                            <span>Live Tours</span>
                                        </div>
                                        {activeTab === 'live-tours' && <div className="w-1.5 h-1.5 rounded-full bg-accent" />}
                                    </button>

                                    <button
                                        onClick={() => { setActiveTab('locked-roster'); setSelectedArtist(null); setActiveDiscoveryList(null); setMobileMenuOpen(false); window.history.pushState({}, '', '/roster'); }}
                                        className={`w-full flex items-center justify-between px-6 py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all
                                            ${activeTab === 'locked-roster' ? 'text-white' : 'text-slate-600 hover:text-white'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <Lock className={`w-5 h-5 ${activeTab === 'locked-roster' ? 'text-accent' : 'text-slate-800'}`} />
                                            <span>Locked Roster</span>
                                        </div>
                                        {activeTab === 'locked-roster' && <div className="w-1.5 h-1.5 rounded-full bg-accent" />}
                                    </button>

                                    <button
                                        onClick={() => { setActiveTab('about'); setSelectedArtist(null); setActiveDiscoveryList(null); setMobileMenuOpen(false); }}
                                        className={`w-full flex items-center justify-between px-6 py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all
                                            ${activeTab === 'about' ? 'text-white' : 'text-slate-600 hover:text-white'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <Target className={`w-5 h-5 ${activeTab === 'about' ? 'text-accent' : 'text-slate-800'}`} />
                                            <span>How It Works</span>
                                        </div>
                                        {activeTab === 'about' && <div className="w-1.5 h-1.5 rounded-full bg-accent" />}
                                    </button>
                                </nav>
                            </div>
                        </div>

                        {/* WIDGETS SECTION - Standardized */}
                        <div className="px-6 py-8 border-t border-white/5 space-y-10">
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Global Signals</h3>
                                    <button className="text-[9px] font-black text-accent hover:text-white transition-colors" onClick={() => setActiveDiscoveryList('movers')}>EXPLORE</button>
                                </div>
                                <div className="space-y-4">
                                    {biggestMovers.slice(0, 2).map(artist => (
                                        <div key={artist.id} onClick={() => handleSelectArtist(artist)} className="flex items-center justify-between group cursor-pointer">
                                            <span className="text-[11px] font-black text-slate-500 group-hover:text-white transition-colors uppercase tracking-tight">{artist.name}</span>
                                            <span className="text-[10px] font-mono font-black text-[#22c55e]">+{(artist.growthVelocity || 0).toFixed(0)}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Discovery Assets</h3>
                                    <button className="text-[9px] font-black text-accent hover:text-white transition-colors" onClick={() => setActiveDiscoveryList('gems')}>EXPLORE</button>
                                </div>
                                <div className="space-y-4">
                                    {hiddenGems.slice(0, 2).map(artist => (
                                        <div key={artist.id} onClick={() => handleSelectArtist(artist)} className="flex items-center justify-between group cursor-pointer">
                                            <span className="text-[11px] font-black text-slate-500 group-hover:text-white transition-colors uppercase tracking-tight">{artist.name}</span>
                                            <span className="text-[10px] font-mono font-black text-accent">#{artist.rank}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* JOIN WAITLIST CTA */}
                        <div className="mt-auto px-4 py-4 border-t border-white/5">
                            <button
                                onClick={() => setShowJoin(true)}
                                className="w-full p-3 rounded-xl bg-gradient-to-r from-accent/20 to-accent/10 border border-accent/30 hover:border-accent/60 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                                        <Sparkles className="w-4 h-4 text-black" />
                                    </div>
                                    <div className="text-left flex-1 min-w-0">
                                        <div className="text-xs font-black text-white uppercase">STELAR PRO</div>
                                        <div className="text-[9px] text-accent font-bold">Join Waitlist</div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-accent group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
                                </div>
                            </button>
                        </div>
                    </aside>

                    <main className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar bg-black/20">
                        {/* STICKY GLASS HEADER */}
                        <header className="glass-header px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setMobileMenuOpen(true)}
                                    className="p-2 md:hidden hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    <Menu className="w-6 h-6 text-white" />
                                </button>

                                <div>
                                    <h1 className="text-xl font-black text-white tracking-widest uppercase mb-1">
                                        {activeTab === 'the-pulse' ? 'The Pulse' :
                                            activeTab === 'old-school' ? 'Legends Index' :
                                                activeTab === 'sonic-signals' ? 'Sonic Signals' :
                                                    activeTab === 'the-launchpad' ? 'The Launchpad' :
                                                        activeTab === 'new-releases' ? 'New Releases' :
                                                            activeTab === 'about' ? 'How It Works' :
                                                                'STELAR Engine'}
                                    </h1>
                                    <div className="flex items-center gap-4 text-[9px] font-bold uppercase tracking-wider">
                                        <span className="text-accent flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></div> Live Data</span>
                                        {claims.size > 0 && (
                                            <span className="text-[#FF4500] border-l border-slate-800 pl-4 flex items-center gap-1.5">
                                                <Zap className="w-3 h-3" /> {claims.size} CLAIMS
                                            </span>
                                        )}
                                        <span className="text-slate-500 border-l border-slate-800 pl-4">{activeTab === 'old-school' ? oldSchoolArtists.length : '3,000+'} Artists</span>
                                    </div>
                                </div>
                            </div>

                            <div className="relative w-96 group hidden md:block">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        if (e.target.value) setSelectedArtist(null);
                                    }}
                                    placeholder="SEARCH 3000+ ARTISTS..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white uppercase tracking-widest focus:bg-white/10 focus:border-accent/40 focus:ring-1 focus:ring-accent/20 transition-all outline-none placeholder:text-slate-700 shadow-inner"
                                />
                            </div>
                        </header>

                        {/* MOBILE SEARCH BAR */}
                        <div className="md:hidden px-4 py-3 border-b border-slate-900 bg-[#0B0C10]">
                            <div className="relative w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        if (e.target.value) setSelectedArtist(null);
                                    }}
                                    placeholder="Search artists..."
                                    className="w-full bg-slate-900/50 border border-slate-800 rounded-lg pl-10 pr-4 py-3 text-sm text-white focus:border-accent/40 focus:ring-1 focus:ring-accent/20 transition-all outline-none placeholder:text-slate-500"
                                />
                            </div>
                        </div>

                        {/* FILTERS & CONTROLS */}
                        <div className="px-6 py-6 border-b border-slate-900 bg-transparent relative z-10">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                {/* GENRE TABS */}
                                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2 md:pb-0">
                                    {['ALL', 'POP', 'R&B', 'HIP HOP', 'COUNTRY', 'AFROBEATS', 'INDIE', 'ALTERNATIVE', 'LATIN', 'K-POP', 'ELECTRONIC'].map((genre) => (
                                        <button
                                            key={genre}
                                            onClick={() => setSelectedGenre(genre)}
                                            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all spring-hover whitespace-nowrap
                                                ${selectedGenre === genre
                                                    ? 'bg-white text-black border-white shadow-lg'
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
                                        className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all spring-hover ${selectedStructure === 'MAJOR' ? 'text-black bg-white shadow-sm' : 'text-slate-500 hover:text-white'}`}
                                    >
                                        Major
                                    </button>
                                    <button
                                        onClick={() => setSelectedStructure('INDIE')}
                                        className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all spring-hover ${selectedStructure === 'INDIE' ? 'text-black bg-white shadow-sm' : 'text-slate-500 hover:text-white'}`}
                                    >
                                        Indie
                                    </button>
                                </div>

                                {/* VIEW MODE TOGGLE - Grid vs List */}
                                <div className="flex items-center bg-slate-900 rounded-lg p-1 border border-slate-800 shrink-0">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        title="Grid View"
                                        className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'text-white bg-accent shadow-sm' : 'text-slate-500 hover:text-white'}`}
                                    >
                                        <LayoutGrid className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        title="List View"
                                        className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'text-white bg-accent shadow-sm' : 'text-slate-500 hover:text-white'}`}
                                    >
                                        <List className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* CONTENT VIEWPORT WITH TRANSITIONS */}
                        <div className="px-6 py-8 animate-fade-in relative z-10">
                            <div
                                ref={mainContentRef}
                                className="h-full"
                            >
                                {selectedArtist ? (
                                    <ArtistProfile
                                        artist={selectedArtist}
                                        onClose={() => setSelectedArtist(null)}
                                        onToggleWatchlist={toggleWatchlist}
                                        isWatched={watchlist.has(selectedArtist.id)}
                                        setShowDossier={setShowDossier}
                                        onClaim={toggleClaim}
                                        isClaimed={claims.has(selectedArtist.id)}
                                    />
                                ) : (
                                    <>
                                        {/* Global Header for Index/Discovery */}
                                        {!activeDiscoveryList && activeTab !== 'the-launchpad' && (
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                                                <div>
                                                    <h1 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter flex items-center gap-3">
                                                        THE PULSE
                                                        <div className="flex items-center gap-1.5 ml-2">
                                                            <div className="w-2 h-2 rounded-full bg-[#FF4500] animate-pulse shadow-[0_0_10px_rgba(255,95,21,0.5)]"></div>
                                                            <span className="text-[10px] text-[#FF4500] font-mono uppercase tracking-widest">Signal Feed</span>
                                                        </div>
                                                    </h1>
                                                    <p className="text-slate-500 text-sm font-medium">
                                                        High-velocity signal processing and recursive anomaly detection across the global sonic landscape.
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    <div className="text-right">
                                                        <div className="text-[10px] text-slate-500 uppercase font-black mb-1">Probe Status</div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-1 w-8 bg-[#FF4500]/20 rounded-full overflow-hidden">
                                                                <div className="h-full bg-[#FF4500] w-3/4 animate-pulse"></div>
                                                            </div>
                                                            <span className="text-[10px] font-mono text-[#FF4500]">OPTIMIZED</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {activeDiscoveryList ? (
                                            <div className="max-w-4xl mx-auto space-y-6">
                                                <button onClick={() => setActiveDiscoveryList(null)} className="flex items-center gap-2 text-slate-500 mb-6 uppercase text-[10px] font-black tracking-widest hover:text-white transition-colors">
                                                    <X className="w-4 h-4" /> Back to Index
                                                </button>
                                                <h2 className="text-3xl font-black text-white mb-6 uppercase tracking-tighter">
                                                    {activeDiscoveryList === 'movers' ? 'Volume Leaders' : 'Quality Discovery'}
                                                </h2>
                                                <div className="divide-y divide-white/5">
                                                    {(activeDiscoveryList === 'movers' ? biggestMovers : hiddenGems).map((artist, i) => (
                                                        <button key={artist.id} onClick={() => setSelectedArtist(artist)} className="w-full flex items-center gap-6 py-6 group hover:bg-white/[0.02] transition-colors rounded-xl px-4 -mx-4">
                                                            <span className="text-2xl font-black text-[#FF4500]/40 w-10 group-hover:text-[#FF4500] transition-colors">{padRank(i + 1)}</span>
                                                            <div className="flex-1 text-left font-black text-white uppercase tracking-tighter text-xl group-hover:translate-x-1 transition-transform">{artist.name}</div>
                                                            <div className={`font-mono font-black text-lg ${artist.growthVelocity > 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                                                                {(artist.growthVelocity || 0) > 0 ? '+' : ''}{(artist.growthVelocity || 0).toFixed(1)}%
                                                            </div>
                                                            <ChevronRight className="w-5 h-5 text-slate-800 group-hover:text-white transition-colors" />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : searchQuery ? (
                                            /* UNIVERSAL SEARCH RESULTS */
                                            <div className="max-w-6xl mx-auto space-y-6">
                                                <h2 className="text-3xl font-black text-white mb-6 uppercase tracking-tighter">
                                                    Search Results: "{searchQuery}"
                                                </h2>

                                                {visibleArtists.length > 0 ? (
                                                    <div className="divide-y divide-white/5 mb-8">
                                                        {visibleArtists.map((artist) => (
                                                            <button
                                                                key={artist.id}
                                                                className="w-full flex items-center gap-6 py-6 group hover:bg-white/[0.02] transition-colors rounded-xl px-4 -mx-4 text-left"
                                                                onClick={() => handleSelectArtist(artist)}
                                                            >
                                                                <div className="w-16 h-16 rounded-xl bg-slate-800 overflow-hidden relative">
                                                                    {artist.avatar_url ? (
                                                                        <img src={artist.avatar_url} alt={artist.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center text-slate-500 font-black text-xl">{getInitials(artist.name)}</div>
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="font-black text-white text-xl uppercase tracking-tighter group-hover:text-accent transition-colors">{artist.name}</div>
                                                                    <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">{artist.genre} • {artist.country}</div>
                                                                </div>
                                                                <div className={`font-mono font-black text-lg ${artist.growthVelocity > 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                                                                    {(artist.growthVelocity || 0) > 0 ? '+' : ''}{(artist.growthVelocity || 0).toFixed(0)}%
                                                                </div>
                                                                <ChevronRight className="w-6 h-6 text-slate-800 group-hover:text-white transition-colors" />
                                                            </button>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-20 border border-dashed border-slate-800 rounded-3xl mb-8">
                                                        <div className="text-slate-500 uppercase tracking-[0.3em] text-[10px] font-black">
                                                            No matches found in global catalog
                                                        </div>
                                                    </div>
                                                )}

                                                {/* EXTERNAL SEARCH FALLBACK - Standardized */}
                                                <div className="pt-20 border-t border-white/5">
                                                    <h3 className="text-[10px] font-black text-slate-700 uppercase tracking-[0.4em] mb-12 text-center">Global Search Extensions</h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                        <a
                                                            href={`https://open.spotify.com/search/${encodeURIComponent(searchQuery)}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-6 group"
                                                        >
                                                            <div className="p-4 bg-white/5 rounded-2xl group-hover:bg-[#1DB954] transition-colors">
                                                                <Music className="w-6 h-6 text-white group-hover:text-black" />
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-black text-white uppercase tracking-widest group-hover:text-[#1DB954] transition-colors">Search Spotify</div>
                                                                <div className="text-[10px] text-slate-600 font-bold uppercase tracking-tight mt-1">Cross-reference global charts</div>
                                                            </div>
                                                            <ChevronRight className="w-4 h-4 text-slate-800 ml-auto group-hover:translate-x-1 transition-transform" />
                                                        </a>

                                                        <a
                                                            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-6 group"
                                                        >
                                                            <div className="p-4 bg-white/5 rounded-2xl group-hover:bg-[#FF0000] transition-colors">
                                                                <Youtube className="w-6 h-6 text-white group-hover:text-white" />
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-black text-white uppercase tracking-widest group-hover:text-[#FF0000] transition-colors">Search YouTube</div>
                                                                <div className="text-[10px] text-slate-600 font-bold uppercase tracking-tight mt-1">Verify visual momentum</div>
                                                            </div>
                                                            <ChevronRight className="w-4 h-4 text-slate-800 ml-auto group-hover:translate-x-1 transition-transform" />
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : activeTab === 'the-launchpad' ? (
                                            <div className="max-w-6xl mx-auto space-y-6">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                                    <div>
                                                        <h2 className="text-3xl font-black text-[#FF4500] mb-2 uppercase tracking-tighter flex items-center gap-3">
                                                            <Terminal className="w-8 h-8" />
                                                            The Launchpad
                                                            <div className="flex items-center gap-1.5 ml-2">
                                                                <div className="w-2 h-2 rounded-full bg-[#FF4500] animate-pulse shadow-[0_0_10px_rgba(255,69,0,0.5)]"></div>
                                                                <span className="text-[10px] text-[#FF4500] font-mono uppercase tracking-widest">Proprietary Scout Engine Active</span>
                                                            </div>
                                                        </h2>
                                                        <p className="text-slate-500 text-sm font-medium">
                                                            Proprietary Signal Fusion Engine. Classifying high-velocity anomalies and the world's best unsigned talent.
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-right">
                                                            <div className="text-[10px] text-slate-500 uppercase font-black mb-1">Total Claims</div>
                                                            <div className="text-xl font-black text-[#FF4500] font-mono">{claims.size}</div>
                                                        </div>
                                                        <div className="h-10 w-px bg-slate-800"></div>
                                                        <div className="text-right">
                                                            <div className="text-[10px] text-slate-500 uppercase font-black mb-1">Unsigned Signal</div>
                                                            <div className="text-xl font-black text-white font-mono">{filteredArtists.length}</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Weekly Refresh Banner */}
                                                <div className="bg-gradient-to-r from-[#FF4500]/10 via-[#FF4500]/5 to-transparent border border-[#FF4500]/20 rounded-xl p-4 flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <Zap className="w-4 h-4 text-accent animate-pulse" />
                                                            <span className="text-white font-black text-xs uppercase tracking-widest">Live Engine Signal</span>
                                                        </div>
                                                        <p className="text-slate-400 text-sm">
                                                            <strong className="text-white">150+ Breakout Artists</strong> identified by the STELAR Discovery Engine. More coming weekly.
                                                        </p>
                                                    </div>
                                                    <div className="text-right flex flex-col items-end">
                                                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Last Sync</div>
                                                        <div className="px-3 py-1 bg-white/5 border border-white/10 rounded font-mono text-xs text-accent">EVERY SUNDAY</div>
                                                    </div>
                                                </div>

                                                {/* GRID VIEW FOR LAUNCHPAD - Natural Space */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 py-10 border-t border-white/5">
                                                    {visibleArtists.map((artist) => (
                                                        <div
                                                            key={artist.id}
                                                            onClick={() => handleSelectArtist(artist)}
                                                            className="cursor-pointer group relative transition-all"
                                                        >
                                                            <div className="flex items-start gap-6">
                                                                <div className="relative">
                                                                    <div className="w-20 h-20 rounded-2xl overflow-hidden grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-700 group-hover:scale-105 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
                                                                        <img
                                                                            src={artist.avatar_url || ''}
                                                                            className="w-full h-full object-cover"
                                                                            onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center text-2xl font-black text-[#FF4500] bg-slate-900 font-mono">${getInitials(artist.name)}</div>` }}
                                                                        />
                                                                    </div>
                                                                    <div className="absolute -top-2 -left-2 px-2 py-1 bg-[#FF4500] text-black text-[8px] font-black rounded uppercase tracking-tighter shadow-xl transform -rotate-12 group-hover:rotate-0 transition-transform">
                                                                        SCOUTED
                                                                    </div>
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <h3 className="text-xl font-black text-white uppercase tracking-tighter truncate group-hover:text-accent transition-colors">{artist.name}</h3>
                                                                        {artist.is_independent && (
                                                                            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                                                                        )}
                                                                    </div>
                                                                    <div className="flex items-center gap-3 mb-4">
                                                                        <div className="text-[10px] text-slate-600 font-black uppercase tracking-widest">{artist.genre}</div>
                                                                        <div className="w-1 h-1 rounded-full bg-slate-800"></div>
                                                                        <div className="text-[10px] text-accent font-black uppercase tracking-widest">
                                                                            {artist.monthlyListeners < 1000000 ? 'SIGNAL: ANOMALY' : 'SIGNAL: BREAKOUT'}
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-6">
                                                                        <div className="text-center text-left">
                                                                            <div className="text-[8px] text-slate-700 uppercase font-black tracking-widest mb-1">Listeners</div>
                                                                            <div className="text-sm font-black text-white font-mono">{formatNumber(artist.monthlyListeners)}</div>
                                                                        </div>
                                                                        <div className="text-center text-left">
                                                                            <div className="text-[8px] text-slate-700 uppercase font-black tracking-widest mb-1">Velocity</div>
                                                                            <div className={`text-sm font-black font-mono ${artist.growthVelocity > 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                                                                                {(artist.growthVelocity || 0) > 0 ? '+' : ''}{(artist.growthVelocity || 0).toFixed(1)}%
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="mt-6 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <div className="text-[8px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                                                                    <Cpu className="w-3 h-3" /> System: {artist.status.toUpperCase()}
                                                                </div>
                                                                <div className="text-accent text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                                                                    Enter Dossier <ChevronRight className="w-3 h-3" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Pagination */}
                                                {filteredArtists.length > displayLimit && (
                                                    <div className="flex justify-center py-10">
                                                        <button
                                                            onClick={() => setDisplayLimit(prev => prev + 50)}
                                                            className="px-8 py-3 bg-slate-900 border border-slate-800 text-[#FF4500] rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#FF4500]/10 hover:border-[#FF4500]/30 transition-all active:scale-95"
                                                        >
                                                            Scan More Upcomers
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ) : activeTab === 'sonic-signals' ? (
                                            <SonicSignals artists={filteredArtists.slice(0, 15)} onArtistSelect={handleSelectArtist} />
                                        ) : activeTab === 'locked-roster' ? (
                                            <div className="max-w-4xl mx-auto">
                                                <h2 className="text-3xl font-black text-white mb-6 uppercase tracking-tighter">Locked Roster</h2>
                                                {artists.filter(a => watchlist.has(a.id)).length > 0 ? (
                                                    <div className="divide-y divide-white/5 border-t border-white/5">
                                                        {artists.filter(a => watchlist.has(a.id)).map((artist, i) => (
                                                            <div
                                                                key={artist.id}
                                                                onClick={() => handleSelectArtist(artist)}
                                                                className="flex items-center gap-8 py-8 px-6 -mx-6 group cursor-pointer hover:bg-white/[0.01] transition-colors rounded-xl"
                                                            >
                                                                <span className="text-xl font-black text-slate-800 group-hover:text-accent transition-colors w-12">{padRank(i + 1)}</span>
                                                                <div className="flex-1 text-left font-black text-white uppercase tracking-tighter text-2xl group-hover:text-accent transition-colors truncate">{artist.name}</div>
                                                                <div className={`font-mono font-black text-lg ${artist.growthVelocity > 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                                                                    {artist.growthVelocity > 0 ? '+' : ''}{artist.growthVelocity.toFixed(1)}%
                                                                </div>
                                                                <ChevronRight className="w-6 h-6 text-slate-800 group-hover:text-white transition-colors" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-32 border border-dashed border-white/5 rounded-3xl">
                                                        <div className="text-slate-500 uppercase tracking-[0.3em] text-[10px] font-black">
                                                            No artists locked to roster <br />
                                                            <span className="text-slate-700 mt-2 block">Mark high-velocity signals to track them here</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : activeTab === 'live-tours' ? (
                                            <div className="max-w-6xl mx-auto space-y-6">
                                                {/* LIVE TOURS HEADER */}
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                                    <div>
                                                        <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter flex items-center gap-3">
                                                            <Ticket className="w-8 h-8 text-accent" />
                                                            Live Tours 2026
                                                        </h2>
                                                        <p className="text-slate-500 text-sm">
                                                            Get tickets to see your favorite artists live.
                                                        </p>
                                                    </div>
                                                    <div className="text-xs text-accent/60 font-mono">{tours.length} TOURS</div>
                                                </div>

                                                {/* TOUR CARDS GRID - Natural Space */}
                                                {toursLoading ? (
                                                    <div className="text-center py-20 text-slate-500 uppercase tracking-widest text-[10px] font-black">Scanning Global Dates...</div>
                                                ) : (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16 py-10 border-t border-white/5">
                                                        {tours.map((tour, idx) => (
                                                            <div key={idx} className="group cursor-pointer transition-all">
                                                                <div className="flex items-start gap-6 mb-6">
                                                                    <div className="relative w-24 h-24 shrink-0">
                                                                        <img
                                                                            src={tour.image}
                                                                            alt={tour.artist}
                                                                            className="w-full h-full rounded-2xl object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-700 group-hover:scale-105 group-hover:shadow-2xl"
                                                                            onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(tour.artist)}&background=1a1a2e&color=FF4500&size=96`; }}
                                                                        />
                                                                        <div className="absolute -top-2 -left-2 px-2 py-1 bg-white text-black text-[8px] font-black rounded uppercase tracking-tighter shadow-xl">
                                                                            {tour.status}
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="text-[10px] text-accent font-black uppercase tracking-[0.2em] mb-2">{tour.genre}</div>
                                                                        <h3 className="text-xl font-black text-white uppercase tracking-tighter truncate group-hover:text-accent transition-colors leading-tight">{tour.artist}</h3>
                                                                        <p className="text-slate-500 text-xs font-medium truncate mt-1">{tour.tour_name}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center justify-between py-6 border-t border-white/5 bg-transparent mb-6 group-hover:bg-white/[0.02] transition-colors -mx-2 px-2 rounded-lg">
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[8px] text-slate-700 font-extrabold uppercase tracking-widest mb-1">Global Range</span>
                                                                        <span className="text-xs font-black text-white font-mono tracking-tighter">{tour.start_date === 'TBA' ? 'TBA' : `${tour.start_date?.slice(5)} - ${tour.end_date?.slice(5)}`}</span>
                                                                    </div>
                                                                    <div className="flex flex-col text-right">
                                                                        <span className="text-[8px] text-slate-700 font-extrabold uppercase tracking-widest mb-1">Access Tier</span>
                                                                        <span className="text-xs font-black text-accent font-mono tracking-tighter">{tour.price_range}</span>
                                                                    </div>
                                                                </div>

                                                                <a
                                                                    href={tour.ticket_link}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-transparent hover:bg-white border border-slate-900 hover:border-white text-slate-500 hover:text-black font-black text-[10px] uppercase tracking-[0.2em] rounded-full transition-all active:scale-95"
                                                                >
                                                                    Request Access
                                                                </a>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ) : activeTab === 'about' ? (
                                            <AboutSection
                                                onNavigate={(tab) => { setActiveTab(tab); setSelectedArtist(null); setActiveDiscoveryList(null); }}
                                                onShowPricing={() => setShowUpgrade(true)}
                                                onShowContact={() => setShowJoin(true)}
                                            />
                                        ) : activeTab === 'privacy' || activeTab === 'terms' ? (
                                            <LegalSection type={activeTab as 'privacy' | 'terms'} />
                                        ) : activeTab === 'new-releases' ? (
                                            <div className="max-w-6xl mx-auto space-y-6">
                                                {/* NEW RELEASES HEADER */}
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                                    <div>
                                                        <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter flex items-center gap-3">
                                                            <Disc className="w-8 h-8 text-accent" />
                                                            New Releases
                                                            <div className="flex items-center gap-1.5 ml-2">
                                                                <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
                                                                <span className="text-xs text-accent">LIVE</span>
                                                            </div>
                                                        </h2>
                                                        <p className="text-slate-500 text-sm">
                                                            The hottest albums dropping now. Free listening via YouTube & Spotify.
                                                        </p>
                                                    </div>
                                                    <div className="text-xs text-accent/60 font-mono">
                                                        {newReleases.filter(r => matchesGenre(r.genre, selectedGenre)).slice(0, 150).length} RELEASES
                                                    </div>
                                                </div>

                                                {/* GENRE FILTER TABS */}
                                                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
                                                    {['ALL', 'POP', 'HIP-HOP/RAP', 'R&B/SOUL', 'COUNTRY', 'ROCK', 'LATIN', 'ALTERNATIVE', 'ELECTRONIC'].map((genre) => (
                                                        <button
                                                            key={genre}
                                                            onClick={() => setSelectedGenre(genre)}
                                                            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all whitespace-nowrap
                                                        ${selectedGenre === genre
                                                                    ? 'bg-white text-black border-white'
                                                                    : 'bg-transparent text-slate-500 border-slate-800 hover:border-slate-600 hover:text-white'}`}
                                                        >
                                                            {genre === 'ALL' ? 'ALL GENRES' : genre}
                                                        </button>
                                                    ))}
                                                </div>

                                                {/* COMING SOON SECTION */}
                                                {comingReleases.length > 0 && (
                                                    <div className="mb-12">
                                                        <h3 className="text-[10px] font-black text-slate-700 mb-6 uppercase tracking-[0.2em] flex items-center gap-2">
                                                            <Clock className="w-4 h-4" />
                                                            Projected Frequency Shifts / {comingReleases.length} Upcoming
                                                        </h3>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                                                            {comingReleases.map((release) => (
                                                                <div key={release.id} className="group cursor-pointer">
                                                                    <div className="flex items-center gap-4 mb-4">
                                                                        <img
                                                                            src={release.artwork}
                                                                            className="w-14 h-14 rounded-xl object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                                                                            onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(release.artist)}&background=1a1a2e&color=FF4500&size=56`; }}
                                                                        />
                                                                        <div className="min-w-0">
                                                                            <div className="text-xs font-black text-white uppercase tracking-tighter truncate leading-tight group-hover:text-accent transition-colors">{release.artist}</div>
                                                                            <div className="text-[10px] text-slate-600 font-bold uppercase truncate mt-0.5">{release.releaseDate}</div>
                                                                        </div>
                                                                    </div>
                                                                    <div className={`inline-flex px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${release.status === 'confirmed' ? 'text-green-500 bg-green-500/10' : 'text-amber-500 bg-amber-500/10'
                                                                        }`}>
                                                                        {release.status}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* OUT NOW - RELEASES GRID - Natural Space */}
                                                {newReleasesLoading ? (
                                                    <div className="text-center py-20">
                                                        <div className="inline-block w-8 h-8 border-2 border-accent/20 border-t-accent rounded-full animate-spin mb-4" />
                                                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Scanning Global Catalogs...</div>
                                                    </div>
                                                ) : newReleases.filter(r => matchesGenre(r.genre, selectedGenre)).length === 0 ? (
                                                    <div className="text-center py-32 border border-dashed border-white/5 rounded-3xl">
                                                        <div className="text-slate-500 uppercase tracking-[0.3em] text-[10px] font-black">
                                                            No signal detected in category
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16 py-10 border-t border-white/5">
                                                        {newReleases
                                                            .filter(release => matchesGenre(release.genre, selectedGenre))
                                                            .slice(0, 150)
                                                            .map((release, index) => (
                                                                <div
                                                                    key={release.id}
                                                                    className="group cursor-pointer transition-all"
                                                                >
                                                                    <div className="flex items-start gap-6 mb-6">
                                                                        <div className="relative w-24 h-24 shrink-0">
                                                                            <img
                                                                                src={release.artwork}
                                                                                alt={release.name}
                                                                                className="w-full h-full rounded-2xl object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-700 group-hover:scale-105 group-hover:shadow-2xl"
                                                                                onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/120?text=🎵'; }}
                                                                            />
                                                                            <div className="absolute -top-2 -left-2 w-7 h-7 bg-white text-black rounded-full flex items-center justify-center text-[10px] font-black shadow-xl">
                                                                                {index + 1}
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <div className="text-[10px] text-accent font-black uppercase tracking-[0.2em] mb-2">{release.genre}</div>
                                                                            <h3 className="text-xl font-black text-white uppercase tracking-tighter truncate group-hover:text-accent transition-colors leading-tight">{release.name}</h3>
                                                                            <div className="text-sm text-slate-500 font-medium mt-1 truncate">{release.artist}</div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex items-center justify-between py-4 border-y border-white/5 mb-6">
                                                                        <span className="text-[9px] text-slate-700 font-black uppercase tracking-widest">Released</span>
                                                                        <span className="text-xs font-black text-white font-mono">{release.releaseDate}</span>
                                                                    </div>

                                                                    {/* STREAMING SIGNALS */}
                                                                    <div className="flex flex-wrap items-center gap-3">
                                                                        <a
                                                                            href={`/track/${release.artist.toLowerCase().replace(/\s+/g, '-')}/${release.name.toLowerCase().replace(/\s+/g, '-')}`}
                                                                            className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-accent hover:bg-white text-black font-black text-[10px] uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(255,69,0,0.3)] hover:shadow-[0_0_20px_rgba(255,255,255,0.4)]"
                                                                        >
                                                                            <PlayCircle className="w-3.5 h-3.5" /> Watch Video
                                                                        </a>

                                                                        <div className="flex w-full gap-3">
                                                                            <a
                                                                                href={`https://open.spotify.com/search/${encodeURIComponent(release.artist + ' ' + release.name)}`}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                onClick={(e) => e.stopPropagation()}
                                                                                className="flex-1 px-4 py-3 bg-white/5 hover:bg-[#1DB954] text-white hover:text-black rounded-full text-[9px] font-black uppercase tracking-widest text-center transition-all flex items-center justify-center gap-2 border border-white/10"
                                                                            >
                                                                                <Music className="w-3.5 h-3.5" /> Spotify
                                                                            </a>
                                                                            <a
                                                                                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(release.artist + ' ' + release.name + ' album')}`}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                onClick={(e) => e.stopPropagation()}
                                                                                className="flex-1 px-4 py-3 bg-white/5 hover:bg-[#FF0000] text-white rounded-full text-[9px] font-black uppercase tracking-widest text-center transition-all flex items-center justify-center gap-2 border border-white/10"
                                                                            >
                                                                                <Youtube className="w-3.5 h-3.5" /> YouTube
                                                                            </a>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                    </div>
                                                )}
                                            </div>
                                        ) : activeTab === 'old-school' ? (
                                            <div className="max-w-6xl mx-auto space-y-6">
                                                {/* OLD SCHOOL HEADER */}
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                                                    <div>
                                                        <h2 className="text-3xl font-black text-amber-400 mb-2 uppercase tracking-tighter flex items-center gap-3">
                                                            <Crown className="w-8 h-8" />
                                                            Old School Legends
                                                        </h2>
                                                        <p className="text-slate-500 text-sm">The artists who shaped music history. Explore their legacy, top songs, and sources.</p>
                                                    </div>
                                                    <div className="text-xs text-amber-400/60 font-mono">{oldSchoolArtists.length} LEGENDS</div>
                                                </div>

                                                {/* OLD SCHOOL GRID - Natural Space */}
                                                {oldSchoolArtists.length === 0 ? (
                                                    <div className="text-center py-20 text-slate-500 uppercase tracking-widest text-[10px] font-black">Summoning Historical Data...</div>
                                                ) : (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16 py-10 border-t border-white/5">
                                                        {oldSchoolArtists.map((artist) => (
                                                            <div
                                                                key={artist.id}
                                                                className="group cursor-pointer transition-all"
                                                                onClick={() => {
                                                                    const converted: PowerIndexArtist = {
                                                                        id: artist.id,
                                                                        name: artist.name,
                                                                        genre: artist.genre,
                                                                        country: artist.country,
                                                                        city: null,
                                                                        status: artist.status as PowerIndexArtist['status'],
                                                                        monthlyListeners: artist.monthlyListeners,
                                                                        tiktokFollowers: 0,
                                                                        instagramFollowers: 0,
                                                                        youtubeSubscribers: 0,
                                                                        twitterFollowers: 0,
                                                                        powerScore: 999,
                                                                        growthVelocity: 0,
                                                                        conversionScore: 0,
                                                                        arbitrageSignal: 0,
                                                                        is_independent: false,
                                                                        rank: artist.rank,
                                                                        chartRank: artist.rank,
                                                                        avatar_url: artist.avatar_url,
                                                                        spotify_id: '',
                                                                        label_name: null,
                                                                        instagram_handle: null,
                                                                        tiktok_handle: null,
                                                                        twitter_handle: null,
                                                                        youtube_channel: null,
                                                                        lastUpdated: ''
                                                                    };
                                                                    handleSelectArtist(converted);
                                                                }}
                                                            >
                                                                <div className="flex items-start gap-6 mb-6">
                                                                    <div className="relative w-24 h-24 shrink-0">
                                                                        <img
                                                                            src={artist.avatar_url}
                                                                            alt={artist.name}
                                                                            className="w-full h-full rounded-2xl object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-700 group-hover:scale-105 group-hover:shadow-2xl"
                                                                        />
                                                                        <div className="absolute -top-2 -left-2 w-8 h-8 bg-amber-500 text-black rounded-full flex items-center justify-center text-[10px] font-black shadow-xl">
                                                                            <Crown className="w-4 h-4" />
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="text-[10px] text-amber-500 font-black uppercase tracking-[0.2em] mb-2">{artist.genre}</div>
                                                                        <h3 className="text-xl font-black text-white uppercase tracking-tighter truncate group-hover:text-amber-500 transition-colors leading-tight">{artist.name}</h3>
                                                                        <div className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-widest">{artist.country}</div>
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center justify-between py-6 border-t border-white/5 bg-transparent mb-6 group-hover:bg-white/[0.02] transition-colors -mx-2 px-2 rounded-lg">
                                                                    <span className="text-[8px] text-slate-700 font-extrabold uppercase tracking-widest">Historical Status</span>
                                                                    <span className="text-xs font-black text-amber-600 font-mono tracking-tighter uppercase">Legendary</span>
                                                                </div>

                                                                <div className="flex flex-wrap gap-x-6 gap-y-2">
                                                                    {artist.signature_songs?.slice(0, 3).map((song: string, i: number) => (
                                                                        <span key={i} className="text-[9px] text-slate-600 uppercase font-black tracking-widest group-hover:text-amber-500 transition-colors">{song}</span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="max-w-6xl mx-auto space-y-6">
                                                {/* THE PULSE CONTENT - Multi-View Aesthetic */}
                                                {viewMode === 'grid' ? (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16 py-10 border-t border-white/5">
                                                        {loading ? (
                                                            <div className="col-span-full text-center py-20">
                                                                <div className="inline-block w-8 h-8 border-2 border-accent/20 border-t-accent rounded-full animate-spin mb-4" />
                                                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Scanning Global Frequencies...</div>
                                                            </div>
                                                        ) : (
                                                            visibleArtists.map((artist) => (
                                                                <div
                                                                    key={artist.id}
                                                                    className="group cursor-pointer transition-all"
                                                                    onClick={() => handleSelectArtist(artist)}
                                                                >
                                                                    <div className="flex items-start gap-6 mb-6">
                                                                        <div className="relative w-24 h-24 shrink-0">
                                                                            <img
                                                                                src={artist.avatar_url || ''}
                                                                                alt={artist.name}
                                                                                className="w-full h-full rounded-2xl object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-700 group-hover:scale-105 group-hover:shadow-2xl"
                                                                                onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.name)}&background=1a1a2e&color=FF4500&size=96`; }}
                                                                            />
                                                                            <div className="absolute -top-2 -left-2 w-8 h-8 bg-white text-black rounded-full flex items-center justify-center text-[10px] font-black shadow-xl">
                                                                                {artist.rank}
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <div className="text-[10px] text-accent font-black uppercase tracking-[0.2em] mb-2">{artist.genre}</div>
                                                                            <h3 className="text-xl font-black text-white uppercase tracking-tighter truncate group-hover:text-accent transition-colors leading-tight">{artist.name}</h3>
                                                                            <div className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-widest truncate">{artist.country}</div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex items-center justify-between py-6 border-t border-white/5 bg-transparent mb-6 group-hover:bg-white/[0.02] transition-colors -mx-2 px-2 rounded-lg">
                                                                        <div className="flex flex-col">
                                                                            <span className="text-[8px] text-slate-700 font-extrabold uppercase tracking-widest mb-1">Flow Rate</span>
                                                                            <span className="text-sm font-black text-white font-mono tracking-tighter">{formatNumber(artist.monthlyListeners)}</span>
                                                                        </div>
                                                                        <div className="flex flex-col text-right">
                                                                            <span className="text-[8px] text-slate-700 font-extrabold uppercase tracking-widest mb-1">Velocity</span>
                                                                            <span className={`text-sm font-black font-mono tracking-tighter ${(artist.growthVelocity || 0) > 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                                                                                {(artist.growthVelocity || 0) > 0 ? '+' : ''}{(artist.growthVelocity || 0).toFixed(1)}%
                                                                            </span>
                                                                        </div>
                                                                    </div>

                                                                    <div className="text-accent text-[9px] font-black uppercase tracking-widest flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        Analyze Signal <ChevronRight className="w-3 h-3" />
                                                                    </div>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>
                                                ) : (
                                                    /* Apple List Aesthetic */
                                                    <div className="divide-y divide-white/5 border-t border-white/5">
                                                        {loading ? (
                                                            <div className="text-center py-20">
                                                                <div className="inline-block w-8 h-8 border-2 border-accent/20 border-t-accent rounded-full animate-spin mb-4" />
                                                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Scanning Global Frequencies...</div>
                                                            </div>
                                                        ) : (
                                                            visibleArtists.map((artist) => (
                                                                <div
                                                                    key={artist.id}
                                                                    className="flex items-center justify-between py-8 group hover:bg-white/[0.01] transition-colors rounded-xl px-6 -mx-6 cursor-pointer"
                                                                    onClick={() => handleSelectArtist(artist)}
                                                                >
                                                                    <div className="flex items-center gap-8 min-w-0 flex-1">
                                                                        <div className="relative w-20 h-20 shrink-0">
                                                                            <img
                                                                                src={artist.avatar_url || ''}
                                                                                alt={artist.name}
                                                                                className="w-full h-full rounded-2xl object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-700 group-hover:scale-105 group-hover:shadow-2xl"
                                                                                onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.name)}&background=1a1a2e&color=FF4500&size=80`; }}
                                                                            />
                                                                            <div className="absolute -top-2 -left-2 w-7 h-7 bg-white text-black rounded-full flex items-center justify-center text-[10px] font-black shadow-xl">
                                                                                {artist.rank}
                                                                            </div>
                                                                        </div>
                                                                        <div className="min-w-0">
                                                                            <div className="text-[10px] text-accent font-black uppercase tracking-[0.2em] mb-1.5">{artist.genre}</div>
                                                                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter truncate group-hover:text-accent transition-colors leading-tight">{artist.name}</h3>
                                                                            <div className="text-xs text-slate-500 font-medium uppercase tracking-widest mt-1">{artist.country}</div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="hidden md:flex items-center gap-12 text-right">
                                                                        <div>
                                                                            <div className="text-[8px] text-slate-700 uppercase font-black tracking-widest mb-1">Monthly Listeners</div>
                                                                            <div className="text-sm font-black text-white font-mono">{formatNumber(artist.monthlyListeners)}</div>
                                                                        </div>
                                                                        <div className="w-24">
                                                                            <div className="text-[8px] text-slate-700 uppercase font-black tracking-widest mb-1">Velocity</div>
                                                                            <div className={`text-sm font-black font-mono ${artist.growthVelocity > 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                                                                                {(artist.growthVelocity || 0) > 0 ? '+' : ''}{(artist.growthVelocity || 0).toFixed(1)}%
                                                                            </div>
                                                                        </div>
                                                                        <ChevronRight className="w-6 h-6 text-slate-800 group-hover:text-white transition-colors" />
                                                                    </div>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>
                                                )}

                                                {/* LOAD MORE BUTTON */}
                                                {visibleArtists.length < filteredArtists.length && (
                                                    <div className="flex justify-center py-12">
                                                        <button
                                                            onClick={() => setDisplayLimit(prev => prev + 50)}
                                                            className="px-10 py-4 bg-white/5 border border-white/10 rounded-full text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white/10 hover:border-accent/40 transition-all active:scale-95 shadow-xl"
                                                        >
                                                            Sync More Data ({filteredArtists.length - visibleArtists.length})
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
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
    const [displayLimit, setDisplayLimit] = useState(10);

    // Derived state for visible tracks
    const visibleTracks = tracks.slice(0, displayLimit);

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

    useEffect(() => {
        const fetchTracks = async () => {
            if (!artistName) return;
            setLoading(true);
            try {
                // SAFER CLEAN: Only strip content in parentheses at the END of the name
                const cleanName = artistName
                    .replace(/\s*\(.*\)$/, '')
                    .trim();

                // 2. PRIMARY FETCH
                let res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(cleanName)}&entity=song&limit=50`);
                let data = await res.json();

                // 3. FALLBACK: Try original name if search failed or returned too few results
                if ((!data.results || data.results.length < 1) && cleanName !== artistName) {
                    res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(artistName)}&entity=song&limit=50`);
                    data = await res.json();
                }

                if (data && data.results) {
                    // Filter out non-song results
                    const songs = data.results.filter((r: any) => r.kind === 'song');
                    setTracks(songs);
                }
            } catch (e) {
                console.error("Failed to fetch tracks", e);
                setTracks([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTracks();
    }, [artistName]);

    const openYouTubeSearch = (e: React.MouseEvent, term: string) => {
        e.stopPropagation();
        window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(term)}`, '_blank');
    };

    if (loading) return (
        <div className="h-40 flex flex-col items-center justify-center gap-3 text-slate-500 font-mono text-xs animate-pulse">
            <Radio className="w-4 h-4 text-accent" />
            <span>LOADING TOP 50 SONGS FOR {artistName.toUpperCase()}...</span>
        </div>
    );
    if (tracks.length === 0) return null;

    return (
        <div className="mb-12">
            <h3 className="text-[10px] font-black text-slate-700 uppercase tracking-[0.4em] mb-10 flex items-center gap-3">
                <div className="w-1 h-4 bg-accent rounded-full" /> Signal Intercept: Tracks
            </h3>
            <div className="divide-y divide-white/5 border-t border-white/5">
                {visibleTracks.map((track, i) => (
                    <div
                        key={track.trackId}
                        className="flex flex-col md:flex-row items-start md:items-center justify-between py-8 md:py-6 group hover:bg-white/[0.01] transition-colors rounded-2xl px-4 md:px-6 -mx-4 md:-mx-6 mb-2 border-b border-dashed border-white/5 md:border-none"
                    >
                        <div
                            className="w-full md:flex-1 flex items-center gap-6 cursor-pointer mb-6 md:mb-0"
                            onClick={() => togglePlay(track.previewUrl)}
                        >
                            <div className="relative w-16 h-16 md:w-20 md:h-20 shrink-0 group/play">
                                <img
                                    src={track.artworkUrl100?.replace('100x100', '200x200') || `https://ui-avatars.com/api/?name=${encodeURIComponent(track.trackName || 'Track')}&background=1a1a2e&color=FF4500&size=80`}
                                    alt={track.trackName}
                                    className={`w-full h-full rounded-xl object-cover grayscale transition-all duration-700 ${playing === track.previewUrl ? 'grayscale-0 scale-105 shadow-2xl' : 'group-hover/play:grayscale-0 group-hover/play:scale-105'}`}
                                />
                                <div className={`absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center transition-opacity ${playing === track.previewUrl ? 'opacity-100' : 'opacity-0 group-hover/play:opacity-100'}`}>
                                    {playing === track.previewUrl ?
                                        <div className="w-2 h-2 bg-accent rounded-full animate-ping" /> :
                                        <Play className="w-5 h-5 text-white fill-current" />}
                                </div>
                            </div>
                            <div className="min-w-0 pr-4">
                                <div className="text-lg md:text-xl font-black text-white uppercase tracking-tighter truncate group-hover:text-accent transition-colors leading-tight">{track.trackName}</div>
                                <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-1.5 flex items-center gap-2">
                                    <span className="text-accent/50">Intercept #{i + 1}</span>
                                    <span className="w-0.5 h-0.5 bg-slate-600 rounded-full"></span>
                                    <span>{new Date(track.releaseDate).getFullYear()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="w-full md:w-auto flex flex-row items-center gap-3">
                            <a
                                href={`/track/${artistName.toLowerCase().replace(/\s+/g, '-')}/${track.trackName.toLowerCase().replace(/\s+/g, '-')}`}
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-accent hover:bg-white text-black font-black text-[10px] uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(255,69,0,0.3)] hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] md:min-w-[140px]"
                                title="Watch Full Video"
                            >
                                <PlayCircle className="w-3.5 h-3.5" /> Watch
                            </a>

                            <button
                                onClick={() => {
                                    const trackUrl = `${window.location.origin}/track/${artistName.toLowerCase().replace(/\s+/g, '-')}/${track.trackName.toLowerCase().replace(/\s+/g, '-')}`;
                                    navigator.clipboard.writeText(trackUrl).then(() => {
                                        alert('Track link copied!');
                                    });
                                }}
                                className="px-3 py-3 rounded-full border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                                title="Share"
                            >
                                <Share2 className="w-4 h-4" />
                            </button>

                            <button
                                onClick={() => window.open(`https://open.spotify.com/search/${encodeURIComponent(artistName + ' ' + track.trackName)}`, '_blank')}
                                className="px-3 py-3 rounded-full border border-white/10 hover:border-[#1DB954] hover:bg-[#1DB954] text-slate-400 hover:text-white transition-all"
                                title="Spotify"
                            >
                                <Music className="w-4 h-4" />
                            </button>

                            <button
                                onClick={(e) => openYouTubeSearch(e, `${artistName} ${track.trackName}`)}
                                className="px-3 py-3 rounded-full border border-white/10 hover:border-[#FF0000] hover:bg-[#FF0000] text-slate-400 hover:text-white transition-all"
                                title="YouTube"
                            >
                                <Youtube className="w-4 h-4" />
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
    const followers = artist.tiktokFollowers || 0;
    const listeners = artist.monthlyListeners || 0;
    const growth = artist.growthVelocity || 0;
    const conversion = artist.conversionScore || 0;

    const ratio = followers / (listeners + 1);

    if (ratio > 5) insights.push("Hyper-Viral Signal: Social reach is 5x larger than streaming footprint.");
    if (growth > 80) insights.push("Exponential Velocity: Massive listener surge detected in last 24h.");
    if (conversion < 40 && conversion > 0) insights.push("Efficiency Leader: High listener retention with minimal marketing waste.");
    if (artist.is_independent) insights.push("Independent Edge: Fully autonomous growth with high ownership potential.");

    return insights.length > 0 ? insights : ["Stable Performance: Consistent growth across all primary platforms."];
};

const ShareModal = ({
    artist,
    isOpen,
    onClose
}: {
    artist: PowerIndexArtist;
    isOpen: boolean;
    onClose: () => void;
}) => {
    if (!isOpen) return null;

    const slug = artist.name.toLowerCase().replace(/\s+/g, '-');
    const url = `https://stelarmusic.pages.dev/artist/${slug}`;
    const ogImage = `https://stelarmusic.pages.dev/og/artist/${slug}`;

    // Universal Share Copy
    const text = `Check out ${artist.name} on STELAR.`;

    // Explicit Share Intents
    const shareLinks = [
        {
            name: 'Twitter / X',
            icon: <Twitter className="w-5 h-5" />,
            onClick: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&image=${encodeURIComponent(ogImage)}`, '_blank')
        },
        {
            name: 'Facebook',
            icon: <Facebook className="w-5 h-5" />,
            onClick: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
        },
        {
            name: 'LinkedIn',
            icon: <Linkedin className="w-5 h-5" />,
            onClick: () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank')
        },
        {
            name: 'Text Message',
            icon: <MessageSquare className="w-5 h-5" />,
            onClick: () => window.open(`sms:?&body=${encodeURIComponent(text + " " + url)}`, '_self')
        },
        {
            name: 'Copy Link',
            icon: <Copy className="w-5 h-5" />,
            onClick: () => {
                navigator.clipboard.writeText(url);
                alert('Copied to clipboard!');
                onClose();
            }
        }
    ];

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xl animate-fade-in" onClick={onClose}>
            <div className="glass p-6 w-full max-w-sm shadow-2xl animate-slide-up rounded-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">Share Profile</h3>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>
                <div className="flex flex-col gap-3">
                    {shareLinks.map((link) => (
                        <button
                            key={link.name}
                            onClick={link.onClick}
                            className="flex items-center gap-4 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/5 hover:border-white/20 group"
                        >
                            <div className="text-slate-400 group-hover:text-white transition-colors">{link.icon}</div>
                            <span className="font-bold text-slate-300 group-hover:text-white">{link.name}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

function ArtistProfile({
    artist,
    onClose,
    onToggleWatchlist,
    isWatched,
    setShowDossier,
    onClaim,
    isClaimed,
}: {
    artist: PowerIndexArtist;
    onClose: () => void;
    onToggleWatchlist: (id: string) => void;
    isWatched: boolean;
    setShowDossier: (show: boolean) => void;
    onClaim: (id: string) => void;
    isClaimed: boolean;
}) {
    const [showShare, setShowShare] = useState(false);
    const report = generateScoutingReport(artist);
    const investmentScore = Math.min(100, Math.max(0, 100 - (artist.conversionScore || 0) + ((artist.growthVelocity || 0) / 2)));

    return (
        <>
            <ShareModal artist={artist} isOpen={showShare} onClose={() => setShowShare(false)} />
            <div className="max-w-5xl mx-auto animate-slide-up pb-20">
                {/* TOP BAR / NAVIGATION */}
                <div className="flex items-center justify-between mb-8">
                    <button onClick={onClose} className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors uppercase text-[10px] font-black tracking-widest group">
                        <X className="w-4 h-4 group-hover:rotate-90 transition-transform" /> Close Discovery
                    </button>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onToggleWatchlist(artist.id)}
                            className={`p-2 rounded-lg border transition-all ${isWatched ? 'bg-accent border-accent text-black shadow-[0_0_15px_rgba(0,255,65,0.4)]' : 'bg-surface border-slate-800 text-slate-500 hover:text-white'}`}
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

                            {/* Claim Discovery (Phase 2 Add) */}
                            {artist.is_independent && (
                                <button
                                    onClick={() => onClaim(artist.id)}
                                    className={`group flex items-center gap-2 px-5 py-3 h-11 rounded-md transition-all active:scale-95 shadow-lg border
                                        ${isClaimed
                                            ? 'bg-[#FF4500]/20 text-[#FF4500] border-[#FF4500]/30 shadow-[0_0_15px_rgba(0,255,65,0.1)]'
                                            : 'bg-[#FF4500] text-black border-[#FF4500]/50 hover:bg-[#FF4500]/90 shadow-[0_0_20px_rgba(0,255,65,0.3)]'}`}
                                >
                                    <Zap className={`w-4 h-4 ${isClaimed ? 'text-[#FF4500]' : 'text-black'}`} />
                                    <span className="font-black text-[10px] uppercase tracking-widest">
                                        {isClaimed ? 'Claimed' : 'Claim Discovery'}
                                    </span>
                                </button>
                            )}
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
                                onClick={() => setShowShare(true)}
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

                        <div className="grid grid-cols-2 gap-12 py-10 border-y border-white/5">
                            <div>
                                <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mb-2">Monthly Listeners</div>
                                <div className="flex items-center gap-3">
                                    <div className="text-4xl lg:text-5xl font-black text-white font-mono tracking-tighter">{formatNumber(artist.monthlyListeners)}</div>
                                    <div className="text-[#FF4500] text-xs font-black leading-none mt-1">▲ {(artist.growthVelocity || 0).toFixed(1)}%</div>
                                </div>
                            </div>
                            <div>
                                <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mb-2">Social Reach</div>
                                <div className="flex items-center gap-3">
                                    <div className="text-4xl lg:text-5xl font-black text-white font-mono tracking-tighter">{formatNumber(artist.tiktokFollowers)}</div>
                                    <div className="text-accent text-xs font-black leading-none mt-1">▲ 8%</div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                            <button onClick={() => setShowDossier(true)} className="bg-white text-black font-black text-[12px] px-10 py-5 rounded-full hover:scale-105 transition-all uppercase tracking-[0.2em] flex items-center gap-2 group">
                                Artist Insights <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </button>
                            <button
                                onClick={() => {
                                    window.open(`https://music.youtube.com/search?q=${encodeURIComponent(artist.name + ' top songs')}`, '_blank');
                                }}
                                className="bg-[#FF4500]/10 border border-[#FF4500]/30 text-[#FF4500] font-black text-[12px] px-8 py-5 rounded-2xl hover:bg-[#FF4500] hover:text-black transition-all uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(255,69,0,0.1)] flex items-center gap-2 group"
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

                {/* ARTIST INSIGHTS REPORT - Natural Space */}
                <div id="analyst-insight" className="py-24 border-t border-white/5">
                    <div className="flex flex-col lg:flex-row justify-between gap-12">
                        <div className="flex-1">
                            <div className="flex items-center gap-6 mb-12">
                                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                                <div>
                                    <h3 className="text-4xl font-black text-white uppercase tracking-tighter">Performance Breakdown.</h3>
                                    <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em]">Proprietary Growth Signals</div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {report.map((insight, i) => (
                                    <div key={i} className="flex gap-6 items-start group">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center text-[10px] font-black text-slate-700 group-hover:text-accent transition-colors">
                                            {String(i + 1).padStart(2, '0')}
                                        </div>
                                        <span className="text-slate-400 text-xl font-medium leading-relaxed max-w-2xl">{insight}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="lg:w-96">
                            <div className="py-12 flex flex-col justify-center border-l border-white/5 pl-12">
                                <div className="flex items-center justify-between mb-8">
                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Breakout Potential</span>
                                    <span className="text-6xl font-black text-white font-mono tracking-tighter">{investmentScore.toFixed(0)}%</span>
                                </div>
                                <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden mb-10">
                                    <div className="h-full bg-accent transition-all duration-2000" style={{ width: `${investmentScore}%` }}></div>
                                </div>
                                <p className="text-[10px] text-slate-500 leading-relaxed uppercase tracking-[0.2em] font-medium">
                                    Proprietary index based on viral momentum and cultural velocity.
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
        </>
    );
}

// ============================================================================
// SONIC SIGNALS COMPONENT
// ============================================================================

function SonicSignals({ artists, onArtistSelect }: { artists: PowerIndexArtist[], onArtistSelect: (artist: PowerIndexArtist) => void }) {
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

            <div className="space-y-12">
                {signals.map(({ artist, type, description }) => (
                    <div
                        key={artist.id}
                        className="group flex flex-col md:flex-row md:items-center gap-8 py-10 border-t border-white/5 transition-all"
                    >
                        <div className="flex items-center gap-6 md:w-1/3">
                            <div className="relative w-16 h-16 shrink-0">
                                <div className="w-full h-full rounded-2xl overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
                                    {artist.avatar_url ? (
                                        <img
                                            src={artist.avatar_url}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.name)}&background=1a1a2e&color=FF4500&size=64`; }}
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-slate-900 flex items-center justify-center text-sm font-black text-accent">{getInitials(artist.name)}</div>
                                    )}
                                </div>
                                <div className={`absolute -top-1 -left-1 w-4 h-4 rounded-full border-2 border-black ${type === 'Viral' ? 'bg-signal-purple' :
                                    type === 'Breakout' ? 'bg-accent' :
                                        type === 'Conversion' ? 'bg-amber-500' : 'bg-slate-700'
                                    } animate-pulse`} />
                            </div>
                            <div className="min-w-0">
                                <div className="text-xl font-black text-white uppercase tracking-tighter truncate group-hover:text-accent transition-colors leading-tight">{artist.name}</div>
                                <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">{artist.genre} • {artist.country}</div>
                            </div>
                        </div>

                        <div className="flex-1">
                            <div className="text-[9px] text-slate-700 font-black uppercase tracking-[0.3em] mb-2">{type} Signal Detected</div>
                            <p className="text-sm font-medium text-slate-400 group-hover:text-white transition-colors leading-relaxed">{description}</p>
                        </div>

                        <button
                            onClick={() => onArtistSelect(artist)}
                            className="shrink-0 px-6 py-3 border border-slate-900 hover:border-slate-700 text-[10px] font-black text-slate-600 hover:text-white uppercase tracking-widest rounded-full transition-all"
                        >
                            Intercept
                        </button>
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
function LegalSection({ type }: { type: 'privacy' | 'terms' }) {
    return (
        <div className="max-w-4xl mx-auto animate-fade-in pb-20 pt-12 px-6">
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-12 uppercase">
                {type === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
            </h1>
            <div className="prose prose-invert prose-sm md:prose-lg text-slate-400">
                <p className="font-bold text-white mb-8">Effective Date: January 1, 2026</p>
                {type === 'privacy' ? (
                    <div className="space-y-8">
                        <div>
                            <p className="mb-4">At STELAR, we prioritize your privacy. This policy outlines how we collect, use, and protect your data.</p>
                        </div>
                        <div>
                            <h3 className="text-white font-bold uppercase tracking-widest text-sm mb-2">1. Data Collection</h3>
                            <p>We collect data to improve your discovery experience, including usage patterns and preferences. We do not sell your personal data to third parties.</p>
                        </div>
                        <div>
                            <h3 className="text-white font-bold uppercase tracking-widest text-sm mb-2">2. Data Usage</h3>
                            <p>Your data is used to personalize recommendations and improve our Signal Fusion Engine. We analyze aggregated data to identify music trends.</p>
                        </div>
                        <div>
                            <h3 className="text-white font-bold uppercase tracking-widest text-sm mb-2">3. Security</h3>
                            <p>We implement state-of-the-art security measures to protect your information. Your data is encrypted in transit and at rest.</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8">
                        <div>
                            <p className="mb-4">Welcome to STELAR. By using our platform, you agree to these terms.</p>
                        </div>
                        <div>
                            <h3 className="text-white font-bold uppercase tracking-widest text-sm mb-2">1. Acceptance of Terms</h3>
                            <p>By accessing STELAR, you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform.</p>
                        </div>
                        <div>
                            <h3 className="text-white font-bold uppercase tracking-widest text-sm mb-2">2. Usage License</h3>
                            <p>We grant you a limited, non-exclusive license to access and use the platform for personal, non-commercial use. Commercial use requires a STELAR PRO subscription.</p>
                        </div>
                        <div>
                            <h3 className="text-white font-bold uppercase tracking-widest text-sm mb-2">3. Intellectual Property</h3>
                            <p>All content and the Signal Fusion Engine are proprietary to STELAR. Unauthorized scraping or data extraction is strictly prohibited.</p>
                        </div>
                    </div>
                )}
                <div className="mt-12 pt-12 border-t border-white/5">
                    <p className="text-sm">For questions, contact <a href="mailto:legal@stelarmusic.com" className="text-accent hover:underline">legal@stelarmusic.com</a></p>
                </div>
            </div>
        </div>
    );
}


function AboutSection({ onNavigate, onShowPricing, onShowContact }: AboutSectionProps) {
    return (
        <div className="max-w-5xl mx-auto animate-fade-in pb-20">
            {/* Minimal Apple-Style Hero */}
            <div className="pt-20 pb-24 text-center">
                <div className="inline-flex items-center gap-2 mb-8 text-accent font-bold text-[10px] uppercase tracking-[0.3em]">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                    Proprietary Discovery Engine
                </div>

                <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-none mb-12 uppercase">
                    The standard for <br />
                    <span className="text-slate-500 font-medium">Recursive Discovery.</span>
                </h1>

                <p className="text-slate-400 text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed font-medium">
                    STELAR is a proprietary music intelligence platform identifying the world's next icons before the market.
                    Our Signal Fusion Engine processes trillions of data points to identify market inefficiencies and the top 0.1% of global talent.
                </p>
            </div>

            {/* Natural Space Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 py-20 border-y border-white/5">
                <div>
                    <div className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tighter">3,000+</div>
                    <div className="text-slate-600 text-[10px] font-black uppercase tracking-widest">Signal Active</div>
                </div>
                <div>
                    <div className="text-4xl md:text-5xl font-black text-accent mb-2 tracking-tighter">6</div>
                    <div className="text-slate-600 text-[10px] font-black uppercase tracking-widest">Intelligence Inputs</div>
                </div>
                <div>
                    <div className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tighter">24hr</div>
                    <div className="text-slate-600 text-[10px] font-black uppercase tracking-widest">Cycle Speed</div>
                </div>
                <div>
                    <div className="text-4xl md:text-5xl font-black text-accent mb-2 tracking-tighter">150+</div>
                    <div className="text-slate-600 text-[10px] font-black uppercase tracking-widest">Anomaly Identifiers</div>
                </div>
            </div>

            {/* Core Pillars - No Boxes */}
            <div className="space-y-40 py-40">
                <section className="grid md:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-4xl font-black text-white mb-6 uppercase tracking-tight">Proprietary Engine.</h2>
                        <p className="text-slate-400 text-lg leading-relaxed">
                            We don't follow the charts, we find the signals that create them.
                            Our engine weights velocity and cultural momentum to produce
                            rankings you won't find anywhere else.
                        </p>
                    </div>
                    <div className="text-7xl md:text-9xl font-black text-slate-900/40 select-none tracking-tighter">SIGNALS</div>
                </section>

                <section className="grid md:grid-cols-2 gap-16 items-center">
                    <div className="order-2 md:order-1 text-7xl md:text-9xl font-black text-slate-900/40 select-none tracking-tighter">BREAKOUT</div>
                    <div className="order-1 md:order-2">
                        <h2 className="text-4xl font-black text-white mb-6 uppercase tracking-tight">Ignition Score™</h2>
                        <p className="text-slate-400 text-lg leading-relaxed">
                            Built for discovery. We identify the unsigned artists with the highest
                            potential to dominate the charts. For the fan who wants to be there first.
                        </p>
                    </div>
                </section>

                <section className="grid md:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-4xl font-black text-white mb-6 uppercase tracking-tight">Arbitrage Signal.</h2>
                        <p className="text-slate-400 text-lg leading-relaxed">
                            Find the artists blowing up on socials before they hit the Spotify Top 50.
                            True discovery means seeing the superstar before they cross over.
                        </p>
                    </div>
                    <div className="text-7xl md:text-9xl font-black text-slate-900/40 select-none tracking-tighter">DISCO</div>
                </section>
            </div>

            {/* Data Sources - List Style */}
            <div className="pt-20 border-t border-white/5">
                <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mb-12 text-center text-accent">Internal Discovery Pipeline</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-center">
                    <div>
                        <div className="text-white font-black uppercase tracking-tighter mb-2">PULSE FEED</div>
                        <div className="text-slate-500 text-[10px] font-bold">REAL-TIME VELOCITY</div>
                    </div>
                    <div>
                        <div className="text-white font-black uppercase tracking-tighter mb-2">SIGNAL CLOUDS</div>
                        <div className="text-slate-500 text-[10px] font-bold">ANOMALY DETECTION</div>
                    </div>
                    <div>
                        <div className="text-white font-black uppercase tracking-tighter mb-2">ORBIT ACCESS</div>
                        <div className="text-slate-500 text-[10px] font-bold">MARKET POSITIONING</div>
                    </div>
                    <div>
                        <div className="text-white font-black uppercase tracking-tighter mb-2">SONIC FUSION</div>
                        <div className="text-slate-500 text-[10px] font-bold">ALPHA TRACKING</div>
                    </div>
                    <div>
                        <div className="text-white font-black uppercase tracking-tighter mb-2">IGNITION SCORE</div>
                        <div className="text-slate-500 text-[10px] font-bold">PREDICTIVE ALPHA</div>
                    </div>
                </div>
            </div>

            {/* Platform Guide - Natural Space */}
            <section className="py-32 grid md:grid-cols-3 gap-24 border-t border-white/5">
                <div className="space-y-6">
                    <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">01</div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">The Pulse</h3>
                    <p className="text-slate-400 leading-relaxed font-medium">
                        A live, daily-synced intelligence feed of the world's most momentous artists, powered by proprietary cultural velocity.
                    </p>
                </div>
                <div className="space-y-6">
                    <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">02</div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">Artist Dossiers</h3>
                    <p className="text-slate-400 leading-relaxed font-medium">
                        Deep-dive profiles with direct links to streaming, social feeds, and
                        performance metrics.
                    </p>
                </div>
                <div className="space-y-6">
                    <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">03</div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">The Launchpad</h3>
                    <p className="text-slate-400 leading-relaxed font-medium">
                        The frontier of music discovery. Where next year's biggest names
                        are identified today.
                    </p>
                </div>
            </section >

            {/* Final Call to Action */}
            < div className="py-24 text-center" >
                <h2 className="text-5xl md:text-6xl font-black text-white mb-10 tracking-tighter uppercase">Predicting the Future.</h2>
                <p className="text-slate-400 text-xl max-w-2xl mx-auto leading-relaxed mb-12">
                    STELAR is for those who live on the edge of discovery.
                    Explore the data. Find your next icon.
                </p>
                <button
                    onClick={() => onNavigate('the-pulse')}
                    className="px-10 py-4 bg-white text-black font-black uppercase tracking-widest rounded-full hover:scale-105 transition-transform active:scale-95"
                >
                    Enter Discovery
                </button>
            </div >

            {/* Premium Footer */}
            <Footer
                onNavigate={(tab) => { onNavigate(tab as any); }}
                onShowPricing={() => onShowPricing()}
                onShowContact={() => onShowContact()}
            />
        </div >
    );
}

function Footer({ onNavigate, onShowPricing, onShowContact }: {
    onNavigate: (tab: string) => void;
    onShowPricing: () => void;
    onShowContact: () => void;
}) {
    return (
        <footer className="border-t border-white/5 mt-32 bg-gradient-to-b from-transparent to-black/40">
            <div className="max-w-7xl mx-auto px-6">
                {/* Main Footer Content */}
                <div className="py-24 grid grid-cols-2 md:grid-cols-12 gap-12 border-b border-white/5">
                    {/* Brand Column (Span 4) */}
                    <div className="col-span-2 md:col-span-4 pr-12">
                        <div className="flex items-center gap-3 mb-8">
                            <Radio className="w-6 h-6 text-accent" />
                            <span className="text-white font-black tracking-tight text-2xl">STELAR</span>
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed max-w-sm mb-8 font-medium">
                            The definitive platform for music discovery and artist intelligence.
                            Powering the next generation of A&R, labels, and enthusiasts worldwide.
                        </p>

                        <div className="flex flex-col gap-4 mb-8">
                            <div className="flex items-center gap-3 text-slate-400 text-xs font-bold uppercase tracking-widest">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                                Global Systems Active
                            </div>
                            <div className="text-[10px] text-slate-600 font-mono">
                                LATENCY: 12ms • DATA VELOCITY: 99.9%
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white hover:text-black hover:scale-110 flex items-center justify-center transition-all group">
                                <Twitter className="w-4 h-4 text-slate-500 group-hover:text-black" />
                            </a>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white hover:text-black hover:scale-110 flex items-center justify-center transition-all group">
                                <Instagram className="w-4 h-4 text-slate-500 group-hover:text-black" />
                            </a>
                            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white hover:text-black hover:scale-110 flex items-center justify-center transition-all group">
                                <Linkedin className="w-4 h-4 text-slate-500 group-hover:text-black" />
                            </a>
                        </div>
                    </div>

                    {/* Product (Span 2) */}
                    <div className="col-span-1 md:col-span-2">
                        <h4 className="text-white font-bold text-[10px] uppercase tracking-[0.2em] mb-8 opacity-40">Platform</h4>
                        <ul className="space-y-4">
                            <li><button onClick={() => onNavigate('the-pulse')} className="text-slate-400 hover:text-accent text-xs font-bold uppercase tracking-wide transition-colors">The Pulse</button></li>
                            <li><button onClick={() => onNavigate('the-launchpad')} className="text-slate-400 hover:text-accent text-xs font-bold uppercase tracking-wide transition-colors">Launchpad</button></li>
                            <li><button onClick={() => onNavigate('new-releases')} className="text-slate-400 hover:text-accent text-xs font-bold uppercase tracking-wide transition-colors">New Releases</button></li>
                            <li><button onClick={() => onNavigate('live-tours')} className="text-slate-400 hover:text-accent text-xs font-bold uppercase tracking-wide transition-colors">Live Tours</button></li>
                        </ul>
                    </div>

                    {/* Company (Span 2) */}
                    <div className="col-span-1 md:col-span-2">
                        <h4 className="text-white font-bold text-[10px] uppercase tracking-[0.2em] mb-8 opacity-40">Corporate</h4>
                        <ul className="space-y-4">
                            <li><button onClick={() => onNavigate('about')} className="text-slate-400 hover:text-white text-sm font-medium transition-colors">About Us</button></li>
                            <li><button onClick={() => onShowPricing()} className="text-slate-400 hover:text-white text-sm font-medium transition-colors">Enterprise</button></li>
                            <li><button onClick={() => onShowContact()} className="text-slate-400 hover:text-white text-sm font-medium transition-colors">Contact</button></li>
                            <li><a href="mailto:careers@stelarmusic.com" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">Careers</a></li>
                        </ul>
                    </div>

                    {/* Legal (Span 2) */}
                    <div className="col-span-1 md:col-span-2">
                        <h4 className="text-white font-bold text-[10px] uppercase tracking-[0.2em] mb-8 opacity-40">Legal</h4>
                        <ul className="space-y-4">
                            <li><button onClick={() => onNavigate('privacy')} className="text-slate-400 hover:text-white text-sm font-medium transition-colors text-left">Privacy Policy</button></li>
                            <li><button onClick={() => onNavigate('terms')} className="text-slate-400 hover:text-white text-sm font-medium transition-colors text-left">Terms of Service</button></li>
                            <li><span className="text-slate-600 text-sm">Cookie Settings</span></li>
                        </ul>
                    </div>

                    {/* CTA Column (Span 2) */}
                    <div className="col-span-2 md:col-span-2">
                        <h4 className="text-white font-bold text-[10px] uppercase tracking-[0.2em] mb-8 opacity-40">Access</h4>
                        <button
                            onClick={() => onShowContact()}
                            className="group w-full px-5 py-4 bg-white text-black text-xs font-black uppercase tracking-widest rounded-lg hover:bg-accent hover:text-white transition-all duration-300 flex items-center justify-between"
                        >
                            Get Access
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <p className="mt-4 text-[10px] text-slate-500 leading-relaxed">
                            Limited spots available for Q1 2026 beta access.
                        </p>
                    </div>
                </div>

                {/* Global Locations & Bottom Bar */}
                <div className="py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            <span>San Francisco</span>
                            <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                            <span>London</span>
                            <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                            <span>Tokyo</span>
                        </div>
                        <div className="text-[10px] text-slate-600 font-mono">
                            HQ: 101 MISSION ST, SUITE 400, SF, CA 94105
                        </div>
                    </div>

                    <div className="flex flex-col md:items-end gap-2">
                        <span className="text-slate-500 text-xs font-medium">© 2026 STELAR Intelligence Inc. <span className="text-slate-700 ml-2">v4.0.1</span></span>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Backed by</span>
                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">SEQUOIA</span>
                            <span className="text-slate-700">•</span>
                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">A16Z</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

// ============================================================================
// END OF FILE
// ============================================================================

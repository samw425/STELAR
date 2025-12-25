/**
 * SoundScout Data Layer
 * ======================
 * Fetches REAL artist data from our proprietary rankings.
 * 
 * Data Source: rankings.json (generated daily by Python scraper)
 * - 3000+ artists from Spotify Charts
 * - 15 categories with 150+ artists each
 * - Proprietary Power Score, Conversion Score, Arbitrage Signal
 */

// Types for our data model
export interface PowerIndexArtist {
    id: string;
    name: string;
    genre: string;
    country: string;
    city: string | null;
    spotify_id: string;
    label_name: string | null;
    is_independent: boolean;
    avatar_url: string | null;

    // Social handles
    tiktok_handle: string | null;
    instagram_handle: string | null;
    twitter_handle: string | null;
    youtube_channel: string | null;

    // Metrics
    monthlyListeners: number;
    tiktokFollowers: number;
    instagramFollowers: number;
    youtubeSubscribers: number;
    twitterFollowers: number;

    // Proprietary Scores
    powerScore: number;
    conversionScore: number;
    arbitrageSignal: number;
    growthVelocity: number;
    status: 'Viral' | 'Breakout' | 'Dominance' | 'Stable' | 'Conversion';

    // Ranking
    rank: number;
    chartRank: number;
    lastUpdated: string;
}

export interface RankingsData {
    generated_at: string;
    algorithm_version: string;
    data_source: string;
    total_artists: number;
    rankings: {
        global: PowerIndexArtist[];
        pop: PowerIndexArtist[];
        hip_hop: PowerIndexArtist[];
        r_and_b: PowerIndexArtist[];
        country: PowerIndexArtist[];
        afrobeats: PowerIndexArtist[];
        latin: PowerIndexArtist[];
        k_pop: PowerIndexArtist[];
        indie: PowerIndexArtist[];
        alternative: PowerIndexArtist[];
        electronic: PowerIndexArtist[];
        major: PowerIndexArtist[];
        indie_label: PowerIndexArtist[];
        up_and_comers: PowerIndexArtist[];
        arbitrage: PowerIndexArtist[];
        viral: PowerIndexArtist[];
        [key: string]: PowerIndexArtist[];
    };
}

// Cache for rankings data
let rankingsCache: RankingsData | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch the complete rankings data from our JSON file.
 * This contains 3000+ artists across 15 categories.
 */
export async function fetchRankingsData(): Promise<RankingsData | null> {
    // Check cache
    if (rankingsCache && Date.now() - cacheTimestamp < CACHE_DURATION) {
        return rankingsCache;
    }

    try {
        const response = await fetch('/rankings.json');
        if (!response.ok) {
            console.error('Failed to fetch rankings:', response.status);
            return null;
        }

        const data: RankingsData = await response.json();

        // Cache the data
        rankingsCache = data;
        cacheTimestamp = Date.now();

        console.log(`[SoundScout] Loaded ${data.total_artists} artists from ${data.data_source}`);
        console.log(`[SoundScout] Algorithm version: ${data.algorithm_version}`);
        console.log(`[SoundScout] Generated at: ${data.generated_at}`);

        return data;
    } catch (error) {
        console.error('Error fetching rankings:', error);
        return null;
    }
}

/**
 * Get the timestamp of when rankings data was generated.
 * Returns ISO string or null if not loaded.
 */
export function getDataTimestamp(): string | null {
    return rankingsCache?.generated_at || null;
}

/**
 * Fetch artists for the Power Index.
 * Supports filtering by genre and category.
 */
export async function fetchPowerIndex(
    genre: string = 'All',
    category: string = 'global'
): Promise<PowerIndexArtist[]> {
    const data = await fetchRankingsData();

    if (!data) {
        console.error('No rankings data available');
        return [];
    }

    // Map genre to category key
    let categoryKey = category;

    if (genre !== 'All') {
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
        categoryKey = genreMap[genre] || 'global';
    }

    const artists = data.rankings[categoryKey] || data.rankings.global;

    return artists;
}

/**
 * Fetch Up & Comers - artists with high arbitrage signals.
 * These are the hidden gems about to break.
 */
export async function fetchUpAndComers(): Promise<PowerIndexArtist[]> {
    const data = await fetchRankingsData();
    if (!data) return [];
    return data.rankings.up_and_comers || [];
}

/**
 * Fetch Arbitrage Signals - low conversion, high opportunity.
 */
export async function fetchArbitrageSignals(): Promise<PowerIndexArtist[]> {
    const data = await fetchRankingsData();
    if (!data) return [];
    return data.rankings.arbitrage || [];
}

/**
 * Fetch Viral artists - highest growth velocity.
 */
export async function fetchViralArtists(): Promise<PowerIndexArtist[]> {
    const data = await fetchRankingsData();
    if (!data) return [];
    return data.rankings.viral || [];
}

/**
 * Search ALL artists across all categories.
 * Returns matching artists from the entire database.
 */
export async function searchAllArtists(query: string): Promise<PowerIndexArtist[]> {
    const data = await fetchRankingsData();
    if (!data || !query.trim()) return [];

    const normalizedQuery = query.toLowerCase().trim();
    const allArtists = data.rankings.global; // Global has most comprehensive list

    // Search by name, genre, country
    const matches = allArtists.filter(artist => {
        const nameMatch = artist.name.toLowerCase().includes(normalizedQuery);
        const genreMatch = artist.genre.toLowerCase().includes(normalizedQuery);
        const countryMatch = artist.country?.toLowerCase().includes(normalizedQuery);
        return nameMatch || genreMatch || countryMatch;
    });

    // Sort by relevance (exact matches first)
    matches.sort((a, b) => {
        const aExact = a.name.toLowerCase().startsWith(normalizedQuery) ? 1 : 0;
        const bExact = b.name.toLowerCase().startsWith(normalizedQuery) ? 1 : 0;
        return bExact - aExact;
    });

    return matches;
}

/**
 * Get a single artist by ID.
 */
export async function getArtistById(id: string): Promise<PowerIndexArtist | null> {
    const data = await fetchRankingsData();
    if (!data) return null;

    // Search in global (most comprehensive)
    return data.rankings.global.find(a => a.id === id) || null;
}

/**
 * Get artists by label type (Major or Independent).
 */
export async function fetchByLabelType(type: 'Major' | 'Indie'): Promise<PowerIndexArtist[]> {
    const data = await fetchRankingsData();
    if (!data) return [];

    if (type === 'Major') {
        return data.rankings.major || [];
    } else {
        return data.rankings.indie || [];
    }
}

/**
 * Get all available categories.
 */
export function getCategories(): string[] {
    return [
        'global',
        'pop',
        'hip_hop',
        'r_and_b',
        'country',
        'afrobeats',
        'latin',
        'k_pop',
        'indie',
        'alternative',
        'electronic',
        'major',
        'independent',
        'up_and_comers',
        'arbitrage',
        'viral'
    ];
}

/**
 * Get category display name.
 */
export function getCategoryDisplayName(key: string): string {
    const names: Record<string, string> = {
        'global': 'Global Top 200',
        'pop': 'Pop',
        'hip_hop': 'Hip Hop',
        'r_and_b': 'R&B',
        'country': 'Country',
        'afrobeats': 'Afrobeats',
        'latin': 'Latin',
        'k_pop': 'K-Pop',
        'indie': 'Indie',
        'alternative': 'Alternative',
        'electronic': 'Electronic',
        'major': 'Major Label',
        'independent': 'Independent',
        'up_and_comers': 'Up & Comers',
        'arbitrage': 'Arbitrage Signals',
        'viral': 'Viral'
    };
    return names[key] || key;
}

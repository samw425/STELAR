/**
 * STELAR Data Layer
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

// In-flight promise for deduplication
let activeFetchPromise: Promise<RankingsData | null> | null = null;

/**
 * Fetch the complete rankings data from our JSON file.
 * This contains 3000+ artists across 15 categories.
 * Optimized with caching and request deduplication.
 */
export async function fetchRankingsData(): Promise<RankingsData | null> {
    // 1. Check in-memory cache
    if (rankingsCache && Date.now() - cacheTimestamp < CACHE_DURATION) {
        return rankingsCache;
    }

    // 2. Check if a fetch is already in progress
    if (activeFetchPromise) {
        return activeFetchPromise;
    }

    // 3. Start new fetch
    activeFetchPromise = (async () => {
        try {
            // Cache-busting: Force fresh load with timestamp
            const response = await fetch(`/rankings.json?t=${Date.now()}`);
            if (!response.ok) {
                console.error('Failed to fetch rankings:', response.status);
                activeFetchPromise = null; // Clear on failure
                return null;
            }

            const data: RankingsData = await response.json();

            // Cache the data
            rankingsCache = data;
            cacheTimestamp = Date.now();
            activeFetchPromise = null; // Clear when done

            console.log(`[STELAR] Loaded ${data.total_artists} artists from ${data.data_source}`);
            console.log(`[STELAR] Algorithm version: ${data.algorithm_version}`);
            console.log(`[STELAR] Generated at: ${data.generated_at}`);

            return data;
        } catch (error) {
            console.error('Error fetching rankings:', error);
            activeFetchPromise = null; // Clear on error
            return null;
        }
    })();

    return activeFetchPromise;
}

/**
 * Get the timestamp of when rankings data was generated.
 * Returns ISO string or null if not loaded.
 */
export function getDataTimestamp(): string | null {
    return rankingsCache?.generated_at || null;
}

/**
 * Fetch artists for The Pulse.
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
 * Enhanced: Normalizes names for fuzzy matching (jcole → J. Cole)
 */
// Cache for ALL unique artists (deduplicated)
let allArtistsCache: PowerIndexArtist[] | null = null;

/**
 * Search ALL artists across all categories.
 * Returns matching artists from the entire database.
 * Optimized: Caches the unified artist list to prevent expensive re-aggregation on every keystroke.
 */
export async function searchAllArtists(query: string): Promise<PowerIndexArtist[]> {
    const data = await fetchRankingsData();
    if (!data || !query.trim()) return [];

    // 1. Build the cache if it doesn't exist or data has changed
    // We check if cache exists, if not we build it ONCE.
    if (!allArtistsCache) {
        // Use a Map for O(1) deduplication by ID
        const allArtistsMap = new Map<string, PowerIndexArtist>();

        // Aggregate from ALL categories
        Object.values(data.rankings).forEach(categoryArtists => {
            if (Array.isArray(categoryArtists)) {
                categoryArtists.forEach(artist => {
                    if (artist && artist.id && !allArtistsMap.has(artist.id)) {
                        allArtistsMap.set(artist.id, artist);
                    }
                });
            }
        });

        allArtistsCache = Array.from(allArtistsMap.values());
        console.log(`[STELAR] Search Index Built: ${allArtistsCache.length} unique artists.`);
    }

    const normalizedQuery = query.toLowerCase().trim();
    // Also create a stripped version for fuzzy matching (remove periods, spaces, special chars)
    const strippedQuery = normalizedQuery.replace(/[^a-z0-9]/g, '');

    // 2. Filter the cached list
    const matches = allArtistsCache.filter(artist => {
        if (!artist.name) return false;

        const nameLower = artist.name.toLowerCase();
        const nameStripped = nameLower.replace(/[^a-z0-9]/g, '');

        // Direct match
        const nameMatch = nameLower.includes(normalizedQuery);
        // Fuzzy match (jcole → jcole matches j.cole → jcole)
        const fuzzyMatch = nameStripped.includes(strippedQuery) || (strippedQuery.length > 2 && strippedQuery.includes(nameStripped));

        const genreMatch = artist.genre && artist.genre.toLowerCase().includes(normalizedQuery);

        // Only check country if it exists
        const countryMatch = artist.country && artist.country.toLowerCase().includes(normalizedQuery);

        return nameMatch || fuzzyMatch || genreMatch || countryMatch;
    });

    // 3. Sort by relevance
    matches.sort((a, b) => {
        const aNameLower = a.name.toLowerCase();
        const bNameLower = b.name.toLowerCase();

        // Exact start match gets highest priority
        const aExact = aNameLower.startsWith(normalizedQuery) ? 2 : 0;
        const bExact = bNameLower.startsWith(normalizedQuery) ? 2 : 0;

        if (aExact !== bExact) return bExact - aExact;

        // Then by popularity (powerScore)
        return (b.powerScore || 0) - (a.powerScore || 0);
    });

    // Limit results to top 20 for performance during rendering
    return matches.slice(0, 50);
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

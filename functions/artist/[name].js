/**
 * SoundScout Artist Page Handler
 * ================================
 * Handles /artist/{name} URLs and injects dynamic OG meta tags.
 * Uses the main SoundScout OG image (PNG) since social platforms don't support SVG.
 */

export async function onRequest(context) {
    const { request, env, params } = context;
    const artistSlug = params.name;

    // Decode the artist name from URL
    const artistName = decodeURIComponent(artistSlug.replace(/-/g, ' '));

    try {
        // Fetch rankings data
        const rankingsResponse = await env.ASSETS.fetch(new Request(new URL('/rankings.json', request.url)));
        const oldSchoolResponse = await env.ASSETS.fetch(new Request(new URL('/oldschool.json', request.url)));

        let data = null;
        if (rankingsResponse.ok) {
            data = await rankingsResponse.json();
        }

        // Find artist across all categories
        let artist = null;
        let isLegend = false;

        // Search main rankings
        if (data) {
            const categories = ['global', 'up_and_comers', 'arbitrage', 'pop', 'hip_hop', 'r_and_b', 'country', 'latin', 'kpop', 'indie', 'electronic', 'afrobeats'];
            for (const cat of categories) {
                if (data.rankings[cat]) {
                    const found = data.rankings[cat].find(a =>
                        a.name.toLowerCase() === artistName.toLowerCase() ||
                        a.name.toLowerCase().replace(/\s+/g, '-') === artistSlug.toLowerCase()
                    );
                    if (found) {
                        artist = found;
                        break;
                    }
                }
            }
        }

        // Search Old School legends if not found
        if (!artist && oldSchoolResponse.ok) {
            const oldSchoolData = await oldSchoolResponse.json();
            const found = oldSchoolData.artists?.find(a =>
                a.name.toLowerCase() === artistName.toLowerCase() ||
                a.name.toLowerCase().replace(/\s+/g, '-') === artistSlug.toLowerCase()
            );
            if (found) {
                isLegend = true;
                artist = {
                    name: found.name,
                    genre: found.genre,
                    country: found.country,
                    status: 'Legend',
                    rank: found.rank,
                    monthlyListeners: found.monthlyListeners || 0,
                    powerScore: 999
                };
            }
        }

        if (!artist) {
            return env.ASSETS.fetch(new Request(new URL('/', request.url)));
        }

        // Fetch the base HTML
        const htmlResponse = await env.ASSETS.fetch(new Request(new URL('/', request.url)));
        let html = await htmlResponse.text();

        // Format numbers
        const formatNumber = (num) => {
            if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
            if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
            return num.toString();
        };

        // Use dynamic OG image for artists
        const ogImageUrl = `https://soundscout.pages.dev/og/artist/${artistSlug}`;

        // Dynamic text content
        const dynamicTitle = `${artist.name} | SoundScout`;
        const dynamicDescription = `🎵 ${artist.name} • Rank #${artist.rank} • ${formatNumber(artist.monthlyListeners)} Monthly Listeners • Power Score: ${artist.powerScore} • ${artist.status} • ${artist.genre} | Discover more on SoundScout`;

        // Replace meta tags
        html = html.replace(
            /<meta property="og:title" content="[^"]*"/g,
            `<meta property="og:title" content="${dynamicTitle}"`
        );
        html = html.replace(
            /<meta property="og:description" content="[^"]*"/g,
            `<meta property="og:description" content="${dynamicDescription}"`
        );
        html = html.replace(
            /<meta property="og:image" content="[^"]*"/g,
            `<meta property="og:image" content="${ogImageUrl}"`
        );
        html = html.replace(
            /<meta name="twitter:title" content="[^"]*"/g,
            `<meta name="twitter:title" content="${dynamicTitle}"`
        );
        html = html.replace(
            /<meta name="twitter:description" content="[^"]*"/g,
            `<meta name="twitter:description" content="${dynamicDescription}"`
        );
        html = html.replace(
            /<meta name="twitter:image" content="[^"]*"/g,
            `<meta name="twitter:image" content="${ogImageUrl}"`
        );
        html = html.replace(
            /<meta name="description" content="[^"]*"/g,
            `<meta name="description" content="${dynamicDescription}"`
        );
        html = html.replace(
            /<title>[^<]*<\/title>/g,
            `<title>${dynamicTitle}</title>`
        );

        // Add OG URL for the specific artist
        const artistUrl = `https://soundscout.pages.dev/artist/${artistSlug}`;
        html = html.replace(
            /<meta property="og:url" content="[^"]*"/g,
            `<meta property="og:url" content="${artistUrl}"`
        );

        return new Response(html, {
            headers: {
                'Content-Type': 'text/html;charset=UTF-8',
                'Cache-Control': 'public, max-age=300',
            }
        });

    } catch (error) {
        console.error('Error:', error);
        return env.ASSETS.fetch(new Request(new URL('/', request.url)));
    }
}

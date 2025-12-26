/**
 * SoundScout Dynamic OG Image Generator
 * ======================================
 * Generates dynamic Open Graph images for artist profile sharing.
 * 
 * When someone shares: soundscout.pages.dev/artist/drake
 * The OG image will show Drake's profile info dynamically.
 */

export async function onRequest(context) {
    const { request, env, params } = context;
    const artistSlug = params.name;

    // Decode: "Taylor-Swift" -> "Taylor Swift"
    const artistName = decodeURIComponent(artistSlug.replace(/-/g, ' '));

    return generateArtistOGImage(artistName, artistSlug, env, request);
}

async function generateArtistOGImage(artistName, artistSlug, env, request) {
    try {
        // Use env.ASSETS for faster local fetching
        const [rankingsRes, oldSchoolRes] = await Promise.all([
            env.ASSETS.fetch(new Request(new URL('/rankings.json', request.url))),
            env.ASSETS.fetch(new Request(new URL('/oldschool.json', request.url)))
        ]);

        let artist = null;

        // Search in main rankings first
        if (rankingsRes.ok) {
            const data = await rankingsRes.json();
            if (data.rankings) {
                for (const category of Object.values(data.rankings)) {
                    const found = category.find(a =>
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

        // If not found, search Old School legends
        if (!artist && oldSchoolRes.ok) {
            const oldSchoolData = await oldSchoolRes.json();
            const found = oldSchoolData.artists?.find(a =>
                a.name.toLowerCase() === artistName.toLowerCase() ||
                a.name.toLowerCase().replace(/\s+/g, '-') === artistSlug.toLowerCase()
            );
            if (found) {
                // Convert Old School format to standard format for OG generation
                artist = {
                    name: found.name,
                    genre: found.genre,
                    country: found.country,
                    status: 'Legend',
                    rank: found.rank,
                    monthlyListeners: found.monthlyListeners || 0,
                    powerScore: 999,
                    growthVelocity: 0,
                    avatar_url: found.avatar_url
                };
            }
        }

        if (!artist) {
            console.log(`Artist not found for OG generation: ${artistName} (slug: ${artistSlug})`);
            // Return default OG image if artist not found
            return Response.redirect('https://soundscout.pages.dev/og-image.png', 302);
        }

        // Generate SVG-based OG image (1200x630)
        const svg = generateArtistSVG(artist);

        return new Response(svg, {
            headers: {
                'Content-Type': 'image/svg+xml',
                'Cache-Control': 'public, max-age=3600',
            }
        });

    } catch (error) {
        console.error('Error generating OG image:', error);
        return Response.redirect('https://soundscout.pages.dev/og-image.png', 302);
    }
}

function generateArtistSVG(artist) {
    const formatNumber = (num) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    const statusColors = {
        'Viral': '#A855F7',
        'Breakout': '#FF3366',
        'Dominance': '#F59E0B',
        'Stable': '#64748B',
        'Conversion': '#22C55E',
        'Legend': '#D4AF37'
    };

    const statusColor = statusColors[artist.status] || '#64748B';
    // Ensure avatar URL is properly escaped for XML
    const avatar = (artist.avatar_url || 'https://soundscout.pages.dev/og-image.png').replace(/&/g, '&amp;');

    // Ensure we escape special XML characters in the name (like &)
    const safeName = artist.name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const safeGenre = (artist.genre || 'Unknown').replace(/&/g, '&amp;');
    const safeCountry = (artist.country || 'Global').replace(/&/g, '&amp;');

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <linearGradient id="overlay" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#000000;stop-opacity:0.7"/>
            <stop offset="100%" style="stop-color:#000000;stop-opacity:0.95"/>
        </linearGradient>
        <clipPath id="avatarClip">
            <rect x="0" y="0" width="1200" height="630" />
        </clipPath>
    </defs>
    
    <!-- Background Image (Blurred) -->
    <image href="${avatar}" x="-50" y="-50" width="1300" height="730" preserveAspectRatio="xMidYMid slice" opacity="0.4" style="filter: blur(40px);" />
    
    <!-- Overlay Gradient -->
    <rect width="1200" height="630" fill="url(#overlay)"/>
    
    <!-- Premium Branding Top Left -->
    <text x="80" y="85" font-family="system-ui, -apple-system, sans-serif" font-size="32" font-weight="900" fill="#FFFFFF" letter-spacing="-0.02em">SOUND<tspan fill="#E50914" font-weight="300">SCOUT</tspan></text>
    <rect x="80" y="98" width="50" height="2" fill="#E50914" />
    <text x="145" y="98" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="700" fill="#6B7280" letter-spacing="0.4em">DISCOVERY</text>
    
    <!-- Artist Card -->
    <g transform="translate(80, 160)">
        <!-- Avatar with Glow -->
        <circle cx="150" cy="150" r="155" fill="#E50914" opacity="0.2" />
        <clipPath id="circleClip">
            <circle cx="150" cy="150" r="150" />
        </clipPath>
        <image href="${avatar}" x="0" y="0" width="300" height="300" preserveAspectRatio="xMidYMid slice" clip-path="url(#circleClip)" />
        <circle cx="150" cy="150" r="150" fill="none" stroke="#FFFFFF" stroke-opacity="0.2" stroke-width="2" />
        
        <!-- Info -->
        <g transform="translate(380, 40)">
            <!-- Auto-scale font size for long names -->
            <text font-family="system-ui, -apple-system, sans-serif" font-size="${safeName.length > 15 ? '52' : '72'}" font-weight="900" fill="#FFFFFF">${safeName.toUpperCase()}</text>
            <text y="50" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="500" fill="#9CA3AF" letter-spacing="0.1em">${safeGenre.toUpperCase()} • ${safeCountry.toUpperCase()}</text>
            
            <g transform="translate(0, 100)">
                <rect width="180" height="40" rx="20" fill="${statusColor}" opacity="0.15" />
                <text x="90" y="27" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="700" fill="${statusColor}" text-anchor="middle">${artist.status.toUpperCase()}</text>
                
                <text x="220" y="27" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="800" fill="#FFFFFF" opacity="0.8">RANK #${artist.rank}</text>
            </g>
            
            <!-- Key Performance Indicators -->
            <g transform="translate(0, 170)">
                <g>
                    <text font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="700" fill="#6B7280" letter-spacing="0.1em">MONTHLY LISTENERS</text>
                    <text y="40" font-family="system-ui, -apple-system, sans-serif" font-size="42" font-weight="800" fill="#FFFFFF">${formatNumber(artist.monthlyListeners)}</text>
                </g>
                <g transform="translate(250, 0)">
                    <text font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="700" fill="#6B7280" letter-spacing="0.1em">POWER SCORE</text>
                    <text y="40" font-family="system-ui, -apple-system, sans-serif" font-size="42" font-weight="800" fill="#E50914">${artist.powerScore}</text>
                </g>
                <g transform="translate(480, 0)">
                    <text font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="700" fill="#6B7280" letter-spacing="0.1em">GROWTH</text>
                    <text y="40" font-family="system-ui, -apple-system, sans-serif" font-size="42" font-weight="800" fill="#10B981">+${artist.growthVelocity.toFixed(1)}%</text>
                </g>
            </g>
        </g>
    </g>
    
    <!-- No Footer Tagline -->
</svg>`;
}

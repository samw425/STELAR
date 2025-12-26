/**
 * SoundScout Dynamic OG Image Generator
 * ======================================
 * Generates dynamic Open Graph images for artist profile sharing.
 * 
 * When someone shares: soundscout.pages.dev/artist/drake
 * The OG image will show Drake's profile info dynamically.
 */

export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        // Check if this is an OG image request for an artist
        // Pattern: /og/artist/{artistName}
        if (url.pathname.startsWith('/og/artist/')) {
            const artistName = decodeURIComponent(url.pathname.replace('/og/artist/', ''));
            return generateArtistOGImage(artistName, env);
        }

        // For other requests, pass through to the static site
        return env.ASSETS.fetch(request);
    }
};

async function generateArtistOGImage(artistName, env) {
    // Fetch rankings data to get artist info
    const rankingsUrl = 'https://soundscout.pages.dev/rankings.json';

    try {
        const response = await fetch(rankingsUrl);
        const data = await response.json();

        // Search for artist across all categories
        let artist = null;
        for (const category of Object.values(data.rankings)) {
            const found = category.find(a =>
                a.name.toLowerCase() === artistName.toLowerCase() ||
                a.name.toLowerCase().includes(artistName.toLowerCase())
            );
            if (found) {
                artist = found;
                break;
            }
        }

        if (!artist) {
            // Return default OG image if artist not found
            return Response.redirect('https://soundscout.pages.dev/og-image.png', 302);
        }

        // Generate SVG-based OG image (1200x630)
        const svg = generateArtistSVG(artist);

        // Convert SVG to PNG using Cloudflare's image processing
        // For now, return SVG which works for most platforms
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
        'Conversion': '#22C55E'
    };

    const statusColor = statusColors[artist.status] || '#64748B';
    const avatar = artist.avatar_url || 'https://soundscout.pages.dev/og-image.png';

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
    <text x="80" y="85" font-family="system-ui, -apple-system, sans-serif" font-size="36" font-weight="900" fill="#FFFFFF" letter-spacing="0.2em">STELAR</text>
    <rect x="80" y="95" width="40" height="2" fill="#E50914" />
    
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
            <text font-family="system-ui, -apple-system, sans-serif" font-size="72" font-weight="900" fill="#FFFFFF">${artist.name.toUpperCase()}</text>
            <text y="50" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="500" fill="#9CA3AF" letter-spacing="0.1em">${artist.genre.toUpperCase()} • ${artist.country.toUpperCase()}</text>
            
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

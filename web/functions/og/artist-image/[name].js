/**
 * STELAR Dynamic Artist OG Image Generator
 * =============================================
 * Generates SVG-based OG images for artist profiles.
 * 
 * URL: /og/artist-image/{artistName}
 * Returns: SVG image 1200x630 with artist info
 */

export async function onRequest(context) {
    const { params } = context;
    const artistName = decodeURIComponent(params.name);

    try {
        // Fetch rankings data
        const rankingsResponse = await fetch('https://stelarmusic.pages.dev/rankings.json');
        const data = await rankingsResponse.json();

        // Find artist
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
            return Response.redirect('https://stelarmusic.pages.dev/og-image.png', 302);
        }

        // Generate SVG
        const svg = generateArtistSVG(artist);

        return new Response(svg, {
            headers: {
                'Content-Type': 'image/svg+xml',
                'Cache-Control': 'public, max-age=3600',
            }
        });

    } catch (error) {
        console.error('Error generating OG image:', error);
        return Response.redirect('https://stelarmusic.pages.dev/og-image.png', 302);
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
        'Breakout': '#00FF41',
        'Dominance': '#F59E0B',
        'Stable': '#64748B',
        'Conversion': '#22C55E'
    };

    const statusColor = statusColors[artist.status] || '#64748B';
    const initials = artist.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    // Premium, clean design inspired by Spotify/Netflix
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#000000"/>
            <stop offset="100%" style="stop-color:#0A0A0F"/>
        </linearGradient>
    </defs>
    
    <!-- Background -->
    <rect width="1200" height="630" fill="url(#bgGrad)"/>
    
    <!-- Accent Bar -->
    <rect x="0" y="0" width="6" height="630" fill="#00FF41"/>
    
    <!-- STELAR Branding -->
    <text x="60" y="60" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="900" fill="#00FF41" letter-spacing="0.2em">STELAR</text>
    
    <!-- Artist Initial Circle -->
    <circle cx="160" cy="315" r="100" fill="#1A1A1A" stroke="#333" stroke-width="2"/>
    <text x="160" y="335" font-family="system-ui, -apple-system, sans-serif" font-size="56" font-weight="800" fill="#00FF41" text-anchor="middle">${initials}</text>
    
    <!-- Artist Name (Large) -->
    <text x="300" y="280" font-family="system-ui, -apple-system, sans-serif" font-size="48" font-weight="800" fill="#FFFFFF">${artist.name.length > 20 ? artist.name.slice(0, 20) + '...' : artist.name}</text>
    
    <!-- Genre & Status -->
    <text x="300" y="330" font-family="system-ui, -apple-system, sans-serif" font-size="18" fill="#666666">${artist.genre} • ${artist.country}</text>
    
    <!-- Status Badge -->
    <rect x="300" y="350" width="${artist.status.length * 12 + 40}" height="32" rx="16" fill="${statusColor}" opacity="0.15"/>
    <text x="${300 + (artist.status.length * 6 + 20)}" y="372" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="700" fill="${statusColor}" text-anchor="middle">${artist.status.toUpperCase()}</text>
    
    <!-- Stats Row -->
    <g transform="translate(300, 420)">
        <text x="0" y="0" font-family="system-ui, -apple-system, sans-serif" font-size="11" fill="#666" letter-spacing="0.1em">MONTHLY LISTENERS</text>
        <text x="0" y="32" font-family="ui-monospace, monospace" font-size="28" font-weight="700" fill="#FFFFFF">${formatNumber(artist.monthlyListeners)}</text>
        
        <text x="200" y="0" font-family="system-ui, -apple-system, sans-serif" font-size="11" fill="#666" letter-spacing="0.1em">POWER SCORE</text>
        <text x="200" y="32" font-family="ui-monospace, monospace" font-size="28" font-weight="700" fill="#00FF41">${artist.powerScore}</text>
        
        <text x="360" y="0" font-family="system-ui, -apple-system, sans-serif" font-size="11" fill="#666" letter-spacing="0.1em">GROWTH</text>
        <text x="360" y="32" font-family="ui-monospace, monospace" font-size="28" font-weight="700" fill="#22C55E">+${artist.growthVelocity.toFixed(1)}%</text>
    </g>
    
    <!-- Rank Badge -->
    <g transform="translate(1050, 50)">
        <rect x="0" y="0" width="100" height="50" rx="8" fill="#1A1A1A" stroke="#333" stroke-width="1"/>
        <text x="50" y="20" font-family="system-ui, -apple-system, sans-serif" font-size="10" fill="#666" text-anchor="middle" letter-spacing="0.1em">RANK</text>
        <text x="50" y="42" font-family="ui-monospace, monospace" font-size="20" font-weight="700" fill="#FFFFFF" text-anchor="middle">#${artist.rank}</text>
    </g>
    
    <!-- Footer -->
    <rect x="0" y="580" width="1200" height="50" fill="#0A0A0A"/>
    <text x="1140" y="610" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="#444" text-anchor="end">stelarmusic.pages.dev</text>
</svg>`;
}

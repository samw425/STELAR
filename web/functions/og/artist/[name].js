/**
 * SoundScout Dynamic OG Image Generator (PNG)
 * ============================================
 * Generates dynamic Open Graph PNG images for artist profile sharing.
 * Uses workers-og to generate proper PNG images that Twitter/Facebook can display.
 */

import { ImageResponse } from 'workers-og';

export async function onRequest(context) {
    const { request, env, params } = context;
    const artistSlug = params.name;

    // Decode: "Taylor-Swift" -> "Taylor Swift"
    const artistName = decodeURIComponent(artistSlug.replace(/-/g, ' '));

    return generateArtistOGImage(artistName, artistSlug, env, request);
}

async function generateArtistOGImage(artistName, artistSlug, env, request) {
    try {
        // Fetch both rankings and old school data
        const [rankingsRes, oldSchoolRes] = await Promise.all([
            env.ASSETS.fetch(new Request(new URL('/rankings.json', request.url))),
            env.ASSETS.fetch(new Request(new URL('/oldschool.json', request.url)))
        ]);

        let artist = null;
        let isLegend = false;

        // Search Old School legends FIRST - Legends deserve priority!
        if (oldSchoolRes.ok) {
            const oldSchoolData = await oldSchoolRes.json();
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
                    powerScore: 999,
                    growthVelocity: 0,
                    avatar_url: found.avatar_url
                };
            }
        }

        // If not in Old School, search in main rankings
        if (!artist && rankingsRes.ok) {
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

        if (!artist) {
            // Return default image if artist not found
            return Response.redirect('https://soundscout.pages.dev/og-image.png', 302);
        }

        // Format numbers for display
        const formatNumber = (num) => {
            if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
            if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
            return num.toString();
        };

        // Status colors
        const statusColors = {
            'Viral': '#A855F7',
            'Breakout': '#FF3366',
            'Dominance': '#F59E0B',
            'Stable': '#64748B',
            'Conversion': '#22C55E',
            'Legend': '#D4AF37'
        };
        const statusColor = statusColors[artist.status] || '#64748B';
        const statusEmoji = isLegend ? '👑' : '';

        // Generate PNG image using workers-og
        const html = `
            <div style="display: flex; flex-direction: column; width: 100%; height: 100%; background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%); font-family: system-ui, -apple-system, sans-serif; padding: 60px;">
                
                <!-- Top Branding -->
                <div style="display: flex; align-items: center; margin-bottom: 40px;">
                    <span style="color: white; font-size: 36px; font-weight: 900; letter-spacing: -1px;">SOUND</span>
                    <span style="color: #E50914; font-size: 36px; font-weight: 300; letter-spacing: -1px;">SCOUT</span>
                </div>

                <!-- Main Content -->
                <div style="display: flex; flex: 1; align-items: center;">
                    
                    <!-- Avatar Circle -->
                    <div style="display: flex; width: 280px; height: 280px; border-radius: 50%; overflow: hidden; border: 4px solid ${statusColor}; box-shadow: 0 0 60px ${statusColor}40; margin-right: 50px;">
                        <img src="${artist.avatar_url || 'https://soundscout.pages.dev/og-image.png'}" style="width: 100%; height: 100%; object-fit: cover;" />
                    </div>

                    <!-- Artist Info -->
                    <div style="display: flex; flex-direction: column; flex: 1;">
                        
                        <!-- Name -->
                        <div style="display: flex; color: white; font-size: ${artist.name.length > 15 ? '56px' : '72px'}; font-weight: 900; letter-spacing: -2px; text-transform: uppercase; margin-bottom: 10px;">
                            ${statusEmoji} ${artist.name.toUpperCase()}
                        </div>

                        <!-- Genre & Country -->
                        <div style="display: flex; color: #9CA3AF; font-size: 24px; font-weight: 500; letter-spacing: 2px; margin-bottom: 30px;">
                            ${artist.genre?.toUpperCase() || 'MUSIC'} • ${artist.country?.toUpperCase() || 'GLOBAL'}
                        </div>

                        <!-- Status Badge & Rank -->
                        <div style="display: flex; align-items: center; margin-bottom: 30px;">
                            <div style="display: flex; background: ${statusColor}20; padding: 10px 24px; border-radius: 30px; margin-right: 20px;">
                                <span style="color: ${statusColor}; font-size: 18px; font-weight: 700;">${artist.status.toUpperCase()}</span>
                            </div>
                            <span style="color: white; font-size: 22px; font-weight: 800;">RANK #${artist.rank}</span>
                        </div>

                        <!-- Stats -->
                        <div style="display: flex; gap: 50px;">
                            <div style="display: flex; flex-direction: column;">
                                <span style="color: #6B7280; font-size: 14px; font-weight: 700; letter-spacing: 1px;">MONTHLY LISTENERS</span>
                                <span style="color: white; font-size: 42px; font-weight: 800;">${formatNumber(artist.monthlyListeners)}</span>
                            </div>
                            <div style="display: flex; flex-direction: column;">
                                <span style="color: #6B7280; font-size: 14px; font-weight: 700; letter-spacing: 1px;">POWER SCORE</span>
                                <span style="color: #E50914; font-size: 42px; font-weight: 800;">${artist.powerScore}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        return new ImageResponse(html, {
            width: 1200,
            height: 630,
        });

    } catch (error) {
        console.error('Error generating OG image:', error);
        return Response.redirect('https://soundscout.pages.dev/og-image.png', 302);
    }
}

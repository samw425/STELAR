/**
 * SoundScout Dynamic OG Image Generator (PNG)
 * Uses workers-og for Twitter/Facebook compatible images
 */

import { ImageResponse } from 'workers-og';

export async function onRequest(context) {
    const { request, env, params } = context;
    const artistSlug = params.name;
    const artistName = decodeURIComponent(artistSlug.replace(/-/g, ' '));

    try {
        // Fetch data
        const [rankingsRes, oldSchoolRes] = await Promise.all([
            env.ASSETS.fetch(new Request(new URL('/rankings.json', request.url))),
            env.ASSETS.fetch(new Request(new URL('/oldschool.json', request.url)))
        ]);

        let artist = null;
        let isLegend = false;

        // Search Old School first
        if (oldSchoolRes.ok) {
            const data = await oldSchoolRes.json();
            const found = data.artists?.find(a =>
                a.name.toLowerCase() === artistName.toLowerCase() ||
                a.name.toLowerCase().replace(/\s+/g, '-') === artistSlug.toLowerCase()
            );
            if (found) {
                isLegend = true;
                artist = {
                    name: found.name,
                    genre: found.genre || 'Music',
                    status: 'Legend',
                    rank: found.rank,
                    monthlyListeners: found.monthlyListeners || 0,
                    powerScore: 999,
                    avatar_url: found.avatar_url
                };
            }
        }

        // Then search rankings
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
            return Response.redirect('https://soundscout.pages.dev/og-image.png', 302);
        }

        // Format listeners
        const listeners = artist.monthlyListeners >= 1000000
            ? `${(artist.monthlyListeners / 1000000).toFixed(1)}M`
            : artist.monthlyListeners >= 1000
                ? `${(artist.monthlyListeners / 1000).toFixed(0)}K`
                : `${artist.monthlyListeners}`;

        const badge = isLegend ? '👑 LEGEND' : artist.status?.toUpperCase() || 'ARTIST';
        const avatarUrl = artist.avatar_url || 'https://soundscout.pages.dev/og-image.png';

        // High-end "Netflix-style" HTML template
        return new ImageResponse(
            `<div style="display:flex;flex-direction:column;width:100%;height:100%;background:#000;font-family:sans-serif;position:relative;overflow:hidden">
                <!-- Blurred Background of the Artist -->
                <img src="${avatarUrl}" style="position:absolute;top:-20%;left:-20%;width:140%;height:140%;filter:blur(60px) brightness(0.4);object-fit:cover" />
                
                <!-- Main Container -->
                <div style="display:flex;flex-direction:column;width:100%;height:100%;padding:60px;position:relative;z-index:10;background:rgba(0,0,0,0.3)">
                    <!-- Brand Header -->
                    <div style="display:flex;align-items:center;gap:12px;margin-bottom:40px">
                        <div style="display:flex;width:40px;height:40px;background:#E50914;border-radius:8px;align-items:center;justify-content:center;color:white;font-weight:900;font-size:24px">S</div>
                        <div style="display:flex;color:white;font-size:32px;font-weight:900;letter-spacing:-1px">
                            <span>STELAR</span><span style="color:#E50914">MUSIC</span>
                        </div>
                    </div>

                    <div style="display:flex;flex:1;align-items:center">
                        <!-- Artist Profile Image with Glow -->
                        <div style="display:flex;position:relative;margin-right:60px">
                            <div style="position:absolute;inset:-10px;background:#E50914;border-radius:140px;opacity:0.3;filter:blur(20px)"></div>
                            <img src="${avatarUrl}" width="280" height="280" style="border-radius:140px;border:6px solid white;position:relative;z-index:2;object-fit:cover" />
                        </div>

                        <!-- Artist Info with Glassmorphism Overlay -->
                        <div style="display:flex;flex-direction:column;background:rgba(255,255,255,0.05);padding:40px;border-radius:32px;border:1px solid rgba(255,255,255,0.1);backdrop-filter:blur(10px);flex-grow:1">
                            <div style="display:flex;align-items:center;margin-bottom:15px">
                                <div style="display:flex;background:#E50914;padding:6px 16px;border-radius:30px">
                                    <span style="color:white;font-size:16px;font-weight:900;letter-spacing:1px">${badge}</span>
                                </div>
                                <span style="color:rgba(255,255,255,0.5);font-size:18px;font-weight:700;margin-left:15px;text-transform:uppercase;letter-spacing:2px">RANK #${artist.rank}</span>
                            </div>
                            
                            <div style="display:flex;color:white;font-size:${artist.name.length > 14 ? 64 : 84}px;font-weight:900;line-height:1;margin-bottom:10px;letter-spacing:-2px">${artist.name.toUpperCase()}</div>
                            <div style="display:flex;color:#E50914;font-size:24px;font-weight:700;text-transform:uppercase;letter-spacing:4px;margin-bottom:30px">${artist.genre}</div>
                            
                            <div style="display:flex;gap:50px">
                                <div style="display:flex;flex-direction:column">
                                    <span style="color:rgba(255,255,255,0.4);font-size:14px;font-weight:900;text-transform:uppercase;letter-spacing:2px;margin-bottom:5px">Monthly Listeners</span>
                                    <span style="color:white;font-size:42px;font-weight:900">${listeners}</span>
                                </div>
                                <div style="display:flex;flex-direction:column">
                                    <span style="color:rgba(255,255,255,0.4);font-size:14px;font-weight:900;text-transform:uppercase;letter-spacing:2px;margin-bottom:5px">Power Score</span>
                                    <span style="color:#E50914;font-size:42px;font-weight:900">${artist.powerScore}</span>
                                </div>
                                <div style="display:flex;flex-direction:column">
                                    <span style="color:rgba(255,255,255,0.4);font-size:14px;font-weight:900;text-transform:uppercase;letter-spacing:2px;margin-bottom:5px">Status</span>
                                    <span style="color:white;font-size:40px;font-weight:900">${artist.status === 'Legend' ? '👑' : artist.status}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Bottom Ticker-feel -->
                    <div style="display:flex;margin-top:auto;border-top:1px solid rgba(255,255,255,0.1);padding-top:20px;justify-content:space-between;align-items:center">
                        <span style="color:rgba(255,255,255,0.3);font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:2px">Global Music Intelligence Terminal</span>
                        <div style="display:flex;gap:15px;color:rgba(255,255,255,0.3);font-size:12px;font-weight:900">
                            <span>RANKINGS</span>
                            <span>ANALYTICS</span>
                            <span>DISCOVERY</span>
                        </div>
                    </div>
                </div>
            </div>`,
            { width: 1200, height: 630 }
        );

    } catch (error) {
        console.error('OG Error:', error);
        return Response.redirect('https://soundscout.pages.dev/og-image.png', 302);
    }
}

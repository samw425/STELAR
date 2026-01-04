/**
 * STELAR Dynamic OG Image Generator (PNG)
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
            return Response.redirect('https://stelarmusic.pages.dev/og-image.png', 302);
        }

        // Format listeners
        const listeners = artist.monthlyListeners >= 1000000
            ? `${(artist.monthlyListeners / 1000000).toFixed(1)}M`
            : artist.monthlyListeners >= 1000
                ? `${(artist.monthlyListeners / 1000).toFixed(0)}K`
                : `${artist.monthlyListeners}`;

        const badge = isLegend ? '👑 LEGEND' : artist.status?.toUpperCase() || 'ARTIST';

        // Simple HTML that workers-og can handle
        return new ImageResponse(
            `<div style="display:flex;flex-direction:column;width:100%;height:100%;background:#0B0C10;padding:50px;font-family:sans-serif">
                <div style="display:flex;color:#FF4500;font-size:32px;font-weight:900;letter-spacing:0.1em">
                    STELAR
                </div>
                <div style="display:flex;flex:1;align-items:center;margin-top:30px">
                    <img src="${artist.avatar_url || 'https://stelarmusic.pages.dev/og-image.png'}" width="240" height="240" style="border-radius:120px;border:5px solid #FF4500" />
                    <div style="display:flex;flex-direction:column;margin-left:50px">
                        <div style="display:flex;background:#FF4500;padding:8px 20px;border-radius:20px;margin-bottom:15px">
                            <span style="color:white;font-size:18px;font-weight:bold">${badge}</span>
                        </div>
                        <div style="display:flex;color:white;font-size:${artist.name.length > 14 ? 52 : 72}px;font-weight:900">${artist.name.toUpperCase()}</div>
                        <div style="display:flex;color:#888;font-size:24px;margin-top:10px">${artist.genre} • Rank #${artist.rank}</div>
                        <div style="display:flex;margin-top:30px">
                            <div style="display:flex;flex-direction:column;margin-right:60px">
                                <span style="color:#666;font-size:14px">LISTENERS</span>
                                <span style="color:white;font-size:36px;font-weight:bold">${listeners}</span>
                            </div>
                            <div style="display:flex;flex-direction:column">
                                <span style="color:#666;font-size:14px">POWER</span>
                                <span style="color:#FF4500;font-size:36px;font-weight:bold">${artist.powerScore}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`,
            { width: 1200, height: 630 }
        );

    } catch (error) {
        console.error('OG Error:', error);
        return Response.redirect('https://stelarmusic.pages.dev/og-image.png', 302);
    }
}

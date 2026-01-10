import { ImageResponse } from 'workers-og';

/**
 * STELAR OG Image Generator
 * Supports:
 * - Artist pages (?name=Artist&image=...)
 * - Track pages (?type=track&artist=Artist&song=SongName)
 */

export async function onRequest(context) {
    const { request } = context;
    const { searchParams } = new URL(request.url);

    const type = searchParams.get('type') || 'artist';
    const name = searchParams.get('name') || 'STELAR';
    const image = searchParams.get('image');
    const artist = searchParams.get('artist') || 'Unknown Artist';
    const song = searchParams.get('song') || 'Unknown Track';

    try {
        // Track-specific OG Image - PREMIUM DESIGN
        if (type === 'track') {
            return new ImageResponse(
                `<div style="display:flex;flex-direction:column;width:1200px;height:630px;background:#000000;font-family:-apple-system, BlinkMacSystemFont, sans-serif;position:relative;overflow:hidden;align-items:center;justify-content:center;padding:60px">
                    
                    <!-- Artist Image or STELAR Emblem -->
                    ${image ? `
                    <div style="display:flex;margin-bottom:40px;width:180px;height:180px;border-radius:90px;overflow:hidden;border:4px solid #FF4500;box-shadow: 0 0 30px rgba(255, 69, 0, 0.3)">
                        <img src="${image}" width="180" height="180" style="object-fit:cover" />
                    </div>
                    ` : `
                    <!-- STELAR ((o)) Broadcast Emblem - VECTOR DESIGN -->
                    <div style="display:flex;margin-bottom:40px">
                        <svg width="120" height="120" viewBox="0 0 48 48" fill="none">
                            <circle cx="24" cy="24" r="5" fill="#FF4500"/>
                            <!-- Inner Arcs -->
                            <path d="M18 18 A12 12 0 0 0 18 30" stroke="#FF4500" stroke-width="3" stroke-linecap="round" fill="none" />
                            <path d="M30 18 A12 12 0 0 1 30 30" stroke="#FF4500" stroke-width="3" stroke-linecap="round" fill="none" />
                            <!-- Outer Arcs -->
                            <path d="M12 12 A20 20 0 0 0 12 36" stroke="#FF4500" stroke-width="3" stroke-linecap="round" fill="none" />
                            <path d="M36 12 A20 20 0 0 1 36 36" stroke="#FF4500" stroke-width="3" stroke-linecap="round" fill="none" />
                        </svg>
                    </div>
                    `}
                    
                    <!-- Song Title - Big, Bold, Centered -->
                    <div style="display:flex;color:white;font-size:64px;font-weight:900;letter-spacing:-0.03em;line-height:1;margin-bottom:20px;text-transform:uppercase;text-align:center">
                        ${song.length > 22 ? song.substring(0, 20) + '...' : song}
                    </div>
                    
                    <!-- Artist Name - Prominent Orange -->
                    <div style="display:flex;color:#FF4500;font-size:32px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase">
                        ${artist}
                    </div>
                    
                    <!-- STELAR Branding - Bottom Right, Clean White -->
                    <div style="display:flex;position:absolute;bottom:40px;right:60px;align-items:center;gap:12px">
                        <span style="color:white;font-size:20px;font-weight:900;letter-spacing:0.2em;font-family:system-ui, sans-serif">STELAR</span>
                    </div>
                    
                    <!-- Subtle tagline bottom left -->
                    <div style="display:flex;position:absolute;bottom:44px;left:60px;color:#444;font-size:12px;font-weight:600;letter-spacing:0.15em;text-transform:uppercase">
                        TRACK THE TOP. DISCOVER THE NEXT.
                    </div>
                </div>`,
                { width: 1200, height: 630 }
            );
        }

        // Default: Artist OG Image - PREMIUM DESIGN
        return new ImageResponse(
            `<div style="display:flex;flex-direction:column;width:1200px;height:630px;background:#000000;font-family:-apple-system, BlinkMacSystemFont, sans-serif;position:relative;overflow:hidden;align-items:center;justify-content:center;padding:60px">
                
                <!-- Artist Image Backdrop - Split side -->
                ${image ? `
                <div style="display:flex;position:absolute;top:0;left:0;width:500px;height:630px;overflow:hidden;background:#050505;border-right:3px solid #FF4500">
                    <img src="${image}" width="500" height="630" style="object-fit:cover;opacity:0.8" />
                    <!-- Gradient overlay on image -->
                    <div style="display:flex;position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(to right, transparent 0%, #000 100%)"></div>
                </div>
                ` : ''}

                <!-- STELAR ((o)) Broadcast Emblem -->
                <div style="display:flex;margin-bottom:40px;${image ? 'margin-left:500px;' : ''}">
                    <svg width="100" height="100" viewBox="0 0 48 48" fill="none">
                        <!-- Center dot -->
                        <circle cx="24" cy="24" r="4" fill="#FF4500"/>
                        <!-- Left arcs -->
                        <path d="M16 16 Q8 24 16 32" stroke="#FF4500" stroke-width="3" fill="none" stroke-linecap="round"/>
                        <path d="M10 10 Q-2 24 10 38" stroke="#FF4500" stroke-width="3" fill="none" stroke-linecap="round"/>
                        <!-- Right arcs -->
                        <path d="M32 16 Q40 24 32 32" stroke="#FF4500" stroke-width="3" fill="none" stroke-linecap="round"/>
                        <path d="M38 10 Q50 24 38 38" stroke="#FF4500" stroke-width="3" fill="none" stroke-linecap="round"/>
                    </svg>
                </div>

                <!-- Artist Name -->
                <div style="display:flex;flex-direction:column;align-items:center;${image ? 'margin-left:500px;' : ''}">
                    <div style="display:flex;color:white;font-size:80px;font-weight:900;letter-spacing:-0.03em;text-transform:uppercase;text-align:center">
                        ${name}
                    </div>
                    ${name !== 'STELAR' ? `
                    <div style="display:flex;color:#FF4500;font-size:24px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;margin-top:10px">
                        ARTIST PROFILE
                    </div>
                    ` : `
                    <div style="display:flex;color:#FF4500;font-size:24px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;margin-top:10px">
                        GLOBAL MUSIC PLATFORM
                    </div>
                    `}
                </div>

                <!-- STELAR Branding - Bottom Right -->
                <div style="display:flex;position:absolute;bottom:40px;right:60px;align-items:center;gap:12px">
                    <span style="color:white;font-size:20px;font-weight:900;letter-spacing:0.2em">STELAR</span>
                </div>

                <!-- Subtle tagline bottom left -->
                <div style="display:flex;position:absolute;bottom:44px;left:60px;color:#444;font-size:12px;font-weight:600;letter-spacing:0.15em;text-transform:uppercase">
                    TRACK THE TOP. DISCOVER THE NEXT.
                </div>
            </div>`,
            { width: 1200, height: 630 }
        );
    } catch (e) {
        console.error("OG Error:", e);
        // Fallback to static image
        return Response.redirect('https://stelarmusic.pages.dev/og-image.png', 302);
    }
}


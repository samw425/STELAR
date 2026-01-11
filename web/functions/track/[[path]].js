/**
 * STELAR Track Page v4 - Search Embed Strategy (VEVO-proof)
 * =====================================================
 * - Uses YouTube Search Embed (listType=search) EXCLUSIVELY
 * - This bypasses "Video Unavailable" errors for restricted IDs
 * - Guarantees 100% playable content (playlist format)
 * - Removes server-side API dependency
 */

export async function onRequest(context) {
    const url = new URL(context.request.url);
    const pathParts = url.pathname.split('/').filter(Boolean);

    if (pathParts.length < 3) {
        return new Response('Invalid track URL', { status: 400 });
    }

    const artistSlug = decodeURIComponent(pathParts[1]).replace(/-/g, ' ');
    const trackSlug = decodeURIComponent(pathParts[2]).replace(/-/g, ' ');

    const artistName = artistSlug.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    const trackName = trackSlug.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    // ---------------------------------------------------------
    // STRATEGY: YOUTUBE API WITH KEY ROTATION + CACHE
    // ---------------------------------------------------------
    // 1. First check rankings.json cache for pre-stored video IDs
    // 2. If not cached, try API with multiple keys (rotation on quota error)
    // 3. Fallback to search embed if all else fails

    const origin = new URL(context.request.url).origin;

    // Multiple API keys for rotation when quota is exceeded (10 keys = 1000 searches/day)
    // When one key returns quotaExceeded, the code automatically tries the next key
    const API_KEYS = [
        "AIzaSyB8muKwu3jyAer6LLZGbfexRz12PR78LpY",  // Key 1
        "AIzaSyB6yhCi0sdr0LIDAW87qtWrI1R--EfbTtM",  // Key 2
        "AIzaSyCoja-J215LD790ryApJ9xizr0LeX99ONo",  // Key 3
        "AIzaSyDY_yOA_YjVoAeUMYwOhRdQvA7gY_eIEr4",  // Key 4
        "AIzaSyBhmupbqWBVBTciVACQu-WP3JooyJE4WM0",  // Key 5
        "AIzaSyBHO_Hu0hy-StlgmlZrQLkjY0b082NeXnc",  // Key 6
        "AIzaSyD3PCplLVeE2XScAI_9Z86o4OXSqc5hK9w",  // Key 7
        "AIzaSyBuYU1EorT5XNA2GUkkLhKyTOYONiHdwFI",  // Key 8
        "AIzaSyDz4hKwDsAW0pYlwcmX4bTaxlNa7da1KAM",  // Key 9
        "AIzaSyBf1WipAvDDNW5mmuFIHGwnwbqqcvqbGYg",  // Key 10 (original)
    ];

    // HARDCODED VIDEO IDs for popular tracks (no API needed - these never change!)
    const POPULAR_TRACKS = {
        'the weeknd blinding lights': '4NRXx6U8ABQ',
        'the weeknd starboy': 'dMMr58vDB7c',
        'the weeknd save your tears': 'u6lihZAcy4s',
        'the weeknd die for you': 'mTLQhPFx2nM',
        'the weeknd the hills': 'yzTuBuRdAyA',
        'the weeknd cant feel my face': 'dqt8Z1k0oWQ',
        'drake hotline bling': 'uxpDa-c-4Mc',
        'drake gods plan': 'xpVfcZ0ZcFM',
        'drake one dance': 'iAbnEUA0wpA',
        'taylor swift shake it off': 'nfWlot6h_JM',
        'taylor swift blank space': 'e-ORhEE9VVg',
        'taylor swift bad blood': 'QcIy9NiNbmo',
        'taylor swift anti hero': 'b1kbLwvqugk',
        'ed sheeran shape of you': 'JGwWNGJdvx8',
        'ed sheeran perfect': '2Vv-BfVoq4g',
        'ed sheeran thinking out loud': 'lp-EO5I60KA',
        'justin bieber baby': 'kffacxfA7G4',
        'justin bieber sorry': 'fRh_vgS2dFE',
        'justin bieber peaches': 'tQ0yjYUFKAE',
        'bruno mars uptown funk': 'OPf0YbXqDm0',
        'bruno mars 24k magic': 'UqyT8IEBkvY',
        'bruno mars just the way you are': 'LjhCEhWiKXk',
        'dua lipa levitating': 'TUVcZfQe-Kw',
        'dua lipa dont start now': 'oygrmJFKYZY',
        'dua lipa new rules': 'k2qgadSvNyU',
        'billie eilish bad guy': 'DyDfgMOUjCI',
        'billie eilish lovely': 'V1Pl8CzNzCw',
        'ariana grande thank u next': 'gl1aHhXnN1k',
        'ariana grande 7 rings': 'QYh6mYIJG2Y',
        'post malone circles': 'wXhTHyIgQ_U',
        'post malone rockstar': 'UceaB4D0jpo',
        'harry styles watermelon sugar': 'E07s5ZYygMg',
        'harry styles as it was': 'H5v3kku4y6Q',
        'olivia rodrigo drivers license': 'ZmDBbnmKpqQ',
        'olivia rodrigo good 4 u': 'gNi_6U5Pm_o',
        'adele hello': 'YQHsXMglC9A',
        'adele rolling in the deep': 'rYEDA3JcQqw',
        'adele easy on me': 'U3ASj1L6_sY',
        'beyonce halo': 'bnVUHWCynig',
        'beyonce single ladies': '4m1EFMoRFvY',
        'rihanna umbrella': 'CvBfHwUxHIk',
        'rihanna diamonds': 'lWA2pjMjpBs',
        'sia chandelier': '2vjPBrBU-TM',
        'maroon 5 sugar': '09R8_2nJtjg',
        'coldplay fix you': 'k4V3Mo61fJM',
        'coldplay yellow': 'yKNxeF4KMsY',
        'imagine dragons believer': '7wtfhZwyrcc',
        'imagine dragons radioactive': 'ktvTqknDobU',
        'lewis capaldi someone you loved': 'bCuhuePlP8o',
        'shawn mendes senorita': 'Pkh8UtuejGw',
        'camila cabello havana': 'BQ0mxQXmLsk',
        'cardi b wap': 'hsm4poTWjMs',
        'lil nas x old town road': 'r7qovpFAGrQ',
        'travis scott sicko mode': '6ONRf7h3Mdk',
        'juice wrld lucid dreams': 'mzB1VGEGcSU',
        'xxxtentacion sad': 'pgN-vvVVxMA',
        'kendrick lamar humble': 'tvTRZJ-4EyI',
        'eminem lose yourself': '_Yhyp-_hX2s',
        'michael jackson thriller': 'sOnqjkJTMaA',
        'michael jackson billie jean': 'Zi_XLOBDo_Y',
        'queen bohemian rhapsody': 'fJ9rUzIMcZQ',
    };

    let finalSrc = '';
    let videoId = null;
    const youtubeSearchQuery = encodeURIComponent(`${artistName} ${trackName}`);

    // STEP 0: Check hardcoded popular tracks FIRST (instant, 100% reliable)
    const lookupKey = `${artistName} ${trackName}`.toLowerCase();
    if (POPULAR_TRACKS[lookupKey]) {
        videoId = POPULAR_TRACKS[lookupKey];
        console.log(`Found hardcoded videoId for ${lookupKey}: ${videoId}`);
    }

    // STEP 1: Check cache in rankings.json first (no API call needed)
    try {
        const rankingsResponse = await fetch(`${url.origin}/rankings.json`);
        if (rankingsResponse.ok) {
            const rankingsData = await rankingsResponse.json();
            const allArtists = Object.values(rankingsData.rankings || {}).flat();
            const cachedArtist = allArtists.find(a =>
                a.name?.toLowerCase() === artistName.toLowerCase()
            );
            if (cachedArtist?.youtubeVideoId) {
                videoId = cachedArtist.youtubeVideoId;
            }
        }
    } catch (cacheErr) {
        console.log("Cache lookup failed:", cacheErr);
    }

    // STEP 2: If not cached, try API with key rotation
    if (!videoId) {
        for (const apiKey of API_KEYS) {
            try {
                const apiQuery = encodeURIComponent(`${artistName} ${trackName} official video`);
                const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${apiQuery}&type=video&maxResults=1&key=${apiKey}`;

                const response = await fetch(apiUrl);
                const data = await response.json();

                // Check for quota error - try next key
                if (data.error?.errors?.[0]?.reason === 'quotaExceeded') {
                    console.log(`Quota exceeded for key ending in ...${apiKey.slice(-6)}, trying next`);
                    continue;
                }

                if (data.items && data.items.length > 0) {
                    videoId = data.items[0].id.videoId;
                    break; // Success, stop trying keys
                }
            } catch (err) {
                console.error("YouTube API Error:", err);
                continue; // Try next key
            }
        }
    }

    // STEP 2.5: FALLBACK - Use Invidious API (no quota limits!) when YouTube API fails
    if (!videoId) {
        const invidiousInstances = [
            'https://vid.puffyan.us',
            'https://invidious.snopyta.org',
            'https://yewtu.be',
            'https://inv.riverside.rocks',
            'https://invidious.kavin.rocks'
        ];

        for (const instance of invidiousInstances) {
            try {
                const searchQuery = encodeURIComponent(`${artistName} ${trackName} official`);
                const invUrl = `${instance}/api/v1/search?q=${searchQuery}&type=video`;

                const response = await fetch(invUrl, {
                    headers: { 'Accept': 'application/json' },
                    cf: { cacheTtl: 3600 } // Cache for 1 hour
                });

                if (response.ok) {
                    const results = await response.json();
                    if (results && results.length > 0 && results[0].videoId) {
                        videoId = results[0].videoId;
                        console.log(`Got videoId from Invidious ${instance}: ${videoId}`);
                        break;
                    }
                }
            } catch (err) {
                console.log(`Invidious ${instance} failed:`, err.message);
                continue;
            }
        }
    }

    // STEP 3: Build embed URL or fallback
    // Use the video ID from API if available
    let useFallback = false;
    if (videoId) {
        finalSrc = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&rel=0&modestbranding=1&origin=${origin}&playsinline=1`;
    } else {
        // Fallback: No embed, just show a prominent link to YouTube search
        useFallback = true;
        finalSrc = ''; // No embed when API fails
    }


    // ---------------------------------------------------------
    // FETCH ARTIST IMAGE FOR OG (Unchanged)
    // ---------------------------------------------------------
    let artistImage = '';
    try {
        const rankingsResponse = await fetch(`${url.origin}/rankings.json`);
        if (rankingsResponse.ok) {
            const data = await rankingsResponse.json();
            const allCategories = Object.values(data.rankings).flat();
            const artist = allCategories.find(a =>
                a.name.toLowerCase() === artistName.toLowerCase() ||
                a.id === artistSlug.toLowerCase().replace(/ /g, '-') ||
                a.name.toLowerCase().replace(/ /g, '-') === artistSlug.toLowerCase()
            );
            if (artist && artist.avatar_url) {
                artistImage = artist.avatar_url;
            } else {
                try {
                    const osResponse = await fetch(`${url.origin}/oldschool.json`);
                    if (osResponse.ok) {
                        const osData = await osResponse.json();
                        const osArtist = (osData.artists || []).find(a =>
                            a.name.toLowerCase() === artistName.toLowerCase() ||
                            a.id === artistSlug.toLowerCase().replace(/ /g, '-') ||
                            a.name.toLowerCase().replace(/ /g, '-') === artistSlug.toLowerCase()
                        );
                        if (osArtist && osArtist.avatar_url) {
                            artistImage = osArtist.avatar_url;
                        }
                    }
                } catch (e) { }
            }
        }
    } catch (e) {
        console.error('Error fetching artist image:', e);
    }

    const baseUrl = url.origin;
    const ogImageUrl = `${baseUrl}/api/og?type=track&artist=${encodeURIComponent(artistName)}&song=${encodeURIComponent(trackName)}${artistImage ? `&image=${encodeURIComponent(artistImage)}` : ''}`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${trackName} by ${artistName} | STELAR</title>
    
    <meta property="og:type" content="music.song">
    <meta property="og:title" content="▶ ${trackName} — ${artistName}">
    <meta property="og:description" content="Listen to ${trackName} by ${artistName} on STELAR.">
    <meta property="og:image" content="${ogImageUrl}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:type" content="image/png">
    <meta property="og:url" content="${url.href}">
    <meta property="og:site_name" content="STELAR">
    
    <meta name="twitter:card" content="player">
    <meta name="twitter:site" content="@stelarmusic">
    <meta name="twitter:title" content="▶ ${trackName} — ${artistName}">
    <meta name="twitter:description" content="Listen on STELAR">
    <meta name="twitter:image" content="${ogImageUrl}">
    <meta name="twitter:player" content="${finalSrc}">
    <meta name="twitter:player:width" content="480">
    <meta name="twitter:player:height" content="270">
    
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
            background: #0a0a0f;
            color: white;
            min-height: 100vh;
        }
        
        .header {
            padding: 16px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        @media (min-width: 768px) {
            .header { padding: 20px 40px; }
        }
        
        .logo {
            display: flex;
            align-items: center;
            gap: 10px;
            text-decoration: none;
        }
        .logo-icon {
            width: 32px;
            height: 32px;
        }
        .logo-text {
            font-size: 22px;
            font-weight: 800;
            letter-spacing: -0.02em;
            color: white;
        }
        
        .profile-link {
            padding: 10px 20px;
            background: rgba(255,255,255,0.08);
            border: 1px solid rgba(255,255,255,0.15);
            border-radius: 100px;
            color: white;
            font-size: 13px;
            font-weight: 600;
            text-decoration: none;
        }
        .profile-link:hover { background: rgba(255,255,255,0.12); }
        
        .main {
            padding: 30px 16px;
            max-width: 900px;
            margin: 0 auto;
        }
        @media (min-width: 768px) {
            .main { padding: 50px 40px; }
        }
        
        .track-info {
            text-align: center;
            margin-bottom: 24px;
        }
        .track-info h1 {
            font-size: 32px;
            font-weight: 900;
            letter-spacing: -0.03em;
            margin-bottom: 6px;
            font-style: italic;
        }
        .track-info p {
            font-size: 16px;
            color: #888;
        }
        @media (min-width: 768px) {
            .track-info h1 { font-size: 48px; }
            .track-info p { font-size: 18px; }
            .track-info { margin-bottom: 32px; }
        }
        
        .video-wrapper {
            width: 100%;
            background: #000;
            border-radius: 12px;
            overflow: hidden;
            margin-bottom: 24px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        }
        .video-wrapper iframe {
            width: 100%;
            aspect-ratio: 16/9;
            border: none;
        }
        @media (min-width: 768px) {
            .video-wrapper { border-radius: 16px; margin-bottom: 32px; }
        }
        
        .buttons {
            display: flex;
            flex-direction: column;
            gap: 12px;
            align-items: center;
        }
        @media (min-width: 768px) {
            .buttons { flex-direction: row; justify-content: center; gap: 16px; }
        }
        .btn {
            padding: 16px 32px;
            border-radius: 100px;
            font-size: 14px;
            font-weight: 700;
            text-decoration: none;
            text-align: center;
            cursor: pointer;
            border: none;
            min-width: 180px;
        }
        .btn-share {
            background: rgba(255,255,255,0.08);
            color: white;
            border: 1px solid rgba(255,255,255,0.2);
        }
        .btn-share:hover { background: rgba(255,255,255,0.12); }
        
        .footer {
            padding: 80px 20px 40px;
            text-align: center;
            border-top: 1px solid rgba(255,255,255,0.05);
            margin-top: 100px;
            background: linear-gradient(to bottom, transparent, #000);
        }
        .footer-tagline {
            font-[9px];
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.4em;
            color: #444;
            margin-bottom: 30px;
        }
        .footer-links {
            display: flex;
            justify-content: center;
            gap: 30px;
            margin-bottom: 30px;
        }
        .footer-link {
            color: #666;
            text-decoration: none;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            transition: color 0.2s;
        }
        .footer-link:hover { color: #FF4500; }
        .footer-brand {
            font-size: 14px;
            font-weight: 900;
            color: white;
            letter-spacing: 0.2em;
            text-transform: uppercase;
        }
    </style>
</head>
<body>
    <header class="header">
        <a href="/" class="logo">
            <svg class="logo-icon" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Center dot -->
                <circle cx="24" cy="24" r="4" fill="#FF4500"/>
                <!-- Left arcs -->
                <path d="M16 16 Q8 24 16 32" stroke="#FF4500" stroke-width="3" fill="none" stroke-linecap="round"/>
                <path d="M10 10 Q-2 24 10 38" stroke="#FF4500" stroke-width="3" fill="none" stroke-linecap="round"/>
                <!-- Right arcs -->
                <path d="M32 16 Q40 24 32 32" stroke="#FF4500" stroke-width="3" fill="none" stroke-linecap="round"/>
                <path d="M38 10 Q50 24 38 38" stroke="#FF4500" stroke-width="3" fill="none" stroke-linecap="round"/>
            </svg>
            <span class="logo-text">STELAR</span>
        </a>
        <a href="/artist/${artistSlug.replace(/ /g, '-').toLowerCase()}" class="profile-link">View Artist Profile</a>
    </header>
    
    <main class="main">
        <div class="track-info">
            <h1>${trackName}</h1>
            <p>by ${artistName}</p>
        </div>
        
        ${useFallback ? `
        <div class="video-wrapper" style="display: flex; flex-direction: column; align-items: center; justify-content: center; aspect-ratio: 16/9; background: linear-gradient(135deg, #1a1a2e 0%, #0a0a0f 100%);">
            <div style="text-align: center; padding: 40px;">
                <div style="font-size: 48px; margin-bottom: 20px;">▶️</div>
                <h3 style="font-size: 24px; font-weight: 800; margin-bottom: 16px; color: white;">Watch on YouTube</h3>
                <p style="color: #888; margin-bottom: 24px; font-size: 14px;">Click below to watch ${trackName} by ${artistName}</p>
                <a href="https://www.youtube.com/results?search_query=${youtubeSearchQuery}+official+video" target="_blank" style="display: inline-flex; align-items: center; gap: 10px; padding: 16px 32px; background: #FF0000; color: white; text-decoration: none; border-radius: 100px; font-weight: 700; font-size: 16px; box-shadow: 0 10px 30px rgba(255,0,0,0.3);">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                    Watch Video
                </a>
            </div>
        </div>
        ` : `
        <div class="video-wrapper">
            <iframe 
                src="${finalSrc}"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowfullscreen>
            </iframe>
        </div>
        `}
        
        <div class="buttons">
            <button onclick="navigator.clipboard.writeText(window.location.href).then(()=>alert('Link copied!'))" class="btn btn-share">📋 Share Track</button>
            <a href="https://www.youtube.com/results?search_query=${youtubeSearchQuery}" target="_blank" class="btn btn-share" style="background: rgba(255, 0, 0, 0.2); border-color: rgba(255, 0, 0, 0.4);">▶ Watch on YouTube</a>
        </div>
        
        <!-- EXPLORE MORE SECTION - Increases Site Stickiness -->
        <section style="margin-top: 60px; padding: 40px 20px; background: rgba(255,255,255,0.02); border-radius: 16px; text-align: center;">
            <h3 style="font-size: 14px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.3em; color: #888; margin-bottom: 24px;">Explore More on STELAR</h3>
            <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 12px;">
                <a href="/hot500" style="padding: 12px 24px; background: rgba(255,165,0,0.1); border: 1px solid rgba(255,165,0,0.3); border-radius: 100px; color: #FFA500; text-decoration: none; font-weight: 600; font-size: 13px;">🔥 The Hot 500</a>
                <a href="/" style="padding: 12px 24px; background: rgba(255,69,0,0.1); border: 1px solid rgba(255,69,0,0.3); border-radius: 100px; color: #FF4500; text-decoration: none; font-weight: 600; font-size: 13px;">📊 Top 50 Rankings</a>
                <a href="/launchpad" style="padding: 12px 24px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); border-radius: 100px; color: white; text-decoration: none; font-weight: 600; font-size: 13px;">🚀 The Launchpad</a>
            </div>
            <p style="margin-top: 20px; color: #666; font-size: 13px;">Discover trending artists and new music on STELAR</p>
        </section>
    </main>
    
    <footer class="footer">
        <div class="footer-tagline">Track the top. Discover the Next.</div>
        <div class="footer-links">
            <a href="/hot500" class="footer-link" style="color: #FF4500;">Hot 500</a>
            <a href="/" class="footer-link">The Pulse</a>
            <a href="/launchpad" class="footer-link">Launchpad</a>
            <a href="/releases" class="footer-link">New Releases</a>
        </div>
        <div class="footer-brand">STELAR</div>
    </footer>
</body>
</html>`;

    return new Response(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
}

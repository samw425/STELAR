/**
 * STELAR Track Page v4 - YouTube Data API Integration
 * =====================================================
 * - Searches YouTube for the exact video using the Data API
 * - Embeds the actual video that plays ON the site
 * - Proper STELAR logo SVG
 * - Mobile-responsive
 */

const YOUTUBE_API_KEY = 'AIzaSyD1meCV-e-TW2_JDHJdZ_ODfQlMDeyW1EI';

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

    // Search YouTube for the video
    const searchQuery = `${artistName} ${trackName} official video`;
    let videoId = null;

    try {
        const ytSearchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&maxResults=1&key=${YOUTUBE_API_KEY}`;
        const ytResponse = await fetch(ytSearchUrl);
        const ytData = await ytResponse.json();

        if (ytData.items && ytData.items.length > 0) {
            videoId = ytData.items[0].id.videoId;
        }
    } catch (e) {
        console.error('YouTube API error:', e);
    }

    const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
    const youtubeEmbedUrl = videoId ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1` : null;
    const youtubeWatchUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : youtubeSearchUrl;

    // Fetch artist image from rankings.json if possible
    let artistImage = '';
    try {
        const rankingsResponse = await fetch(`${url.origin}/rankings.json`);
        if (rankingsResponse.ok) {
            const data = await rankingsResponse.json();
            // Flatten all rankings to find the artist (search global first for speed)
            const allArtists = data.rankings.global || [];
            const artist = allArtists.find(a =>
                a.name.toLowerCase() === artistName.toLowerCase() ||
                a.id === artistSlug.toLowerCase().replace(/ /g, '-')
            );
            if (artist && artist.avatar_url) {
                artistImage = artist.avatar_url;
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
    
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:site" content="@stelarmusic">
    <meta name="twitter:title" content="▶ ${trackName} — ${artistName}">
    <meta name="twitter:description" content="Listen on STELAR">
    <meta name="twitter:image" content="${ogImageUrl}">
    <meta name="twitter:image:src" content="${ogImageUrl}">
    
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
        
        .fallback-card {
            background: rgba(255,255,255,0.04);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 16px;
            padding: 50px 30px;
            text-align: center;
            margin-bottom: 24px;
        }
        .play-btn {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #FF0000, #CC0000);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            box-shadow: 0 15px 50px rgba(255,0,0,0.35);
            transition: transform 0.2s;
            text-decoration: none;
        }
        .play-btn:hover { transform: scale(1.05); }
        .play-btn svg { margin-left: 5px; }
        .fallback-card h3 { font-size: 18px; font-weight: 700; margin-bottom: 6px; }
        .fallback-card p { font-size: 13px; color: #666; }
        
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
        .btn-yt {
            background: #FF0000;
            color: white;
        }
        .btn-yt:hover { opacity: 0.9; }
        .btn-share {
            background: rgba(255,255,255,0.08);
            color: white;
            border: 1px solid rgba(255,255,255,0.2);
        }
        .btn-share:hover { background: rgba(255,255,255,0.12); }
        
        .footer {
            padding: 30px 20px;
            text-align: center;
            font-size: 11px;
            color: #333;
            border-top: 1px solid rgba(255,255,255,0.05);
            margin-top: 60px;
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
        
        ${videoId ? `
        <div class="video-wrapper">
            <iframe 
                src="${youtubeEmbedUrl}"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowfullscreen>
            </iframe>
        </div>
        ` : `
        <div class="fallback-card">
            <a href="${youtubeWatchUrl}" target="_blank" class="play-btn">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
            </a>
            <h3>Watch Full Video</h3>
            <p>Opens on YouTube</p>
        </div>
        `}
        
        <div class="buttons">
            <a href="${youtubeWatchUrl}" target="_blank" class="btn btn-yt">▶ Open on YouTube</a>
            <button onclick="navigator.clipboard.writeText(window.location.href).then(()=>alert('Link copied!'))" class="btn btn-share">📋 Share Track</button>
        </div>
    </main>
    
    <footer class="footer">
        © 2026 STELAR · Music Intelligence
    </footer>
</body>
</html>`;

    return new Response(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
}

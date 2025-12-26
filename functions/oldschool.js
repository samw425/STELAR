/**
 * SoundScout Old School - OG Meta Handler
 * Serves custom meta tags for /oldschool page to ensure rich social sharing
 */

export async function onRequest(context) {
    // Get the request URL
    const url = new URL(context.request.url);

    // Create dynamic meta tags for Old School section
    const title = "Old School Legends | SoundScout";
    const description = "149 legendary artists who shaped music history. From Michael Jackson to Tupac, Queen to Nirvana. Explore their legacy, top songs, and sources.";
    const ogImage = `${url.origin}/og-image.png?v=oldschool`;

    // Inject OG tags into the response
    const response = await context.next();

    // Get the HTML
    let html = await response.text();

    // Update meta tags for Old School
    html = html.replace(
        /<title>.*?<\/title>/,
        `<title>${title}</title>`
    );

    html = html.replace(
        /<meta property="og:title" content=".*?"\s*\/?>/,
        `<meta property="og:title" content="${title}" />`
    );

    html = html.replace(
        /<meta property="og:description" content=".*?"\s*\/?>/,
        `<meta property="og:description" content="${description}" />`
    );

    html = html.replace(
        /<meta name="description" content=".*?"\s*\/?>/,
        `<meta name="description" content="${description}" />`
    );

    return new Response(html, {
        headers: {
            'Content-Type': 'text/html;charset=UTF-8',
            'Cache-Control': 'public, max-age=3600'
        }
    });
}

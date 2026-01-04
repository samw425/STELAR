/**
 * STELAR Old School - OG Meta Handler
 * Serves custom meta tags for /oldschool page to ensure rich social sharing
 */

export async function onRequest(context) {
    const { request, env } = context;

    try {
        // Fetch the base HTML
        const htmlResponse = await env.ASSETS.fetch(new Request(new URL('/', request.url)));
        let html = await htmlResponse.text();

        // Create dynamic meta tags for Old School section
        const title = "👑 Old School Legends | 149 Greatest Artists | STELAR";
        const description = "👑 149 legendary artists who shaped music history. Michael Jackson, Tupac, Queen, Nirvana, Bob Marley, Whitney Houston & more. Explore their legacy on STELAR.";
        const ogImage = `https://stelarmusic.pages.dev/og-image.png`;

        // Update title
        html = html.replace(
            /<title>.*?<\/title>/,
            `<title>${title}</title>`
        );

        // Update meta description
        html = html.replace(
            /<meta name="description" content="[^"]*"/g,
            `<meta name="description" content="${description}"`
        );

        // Update OG tags
        html = html.replace(
            /<meta property="og:title" content="[^"]*"/g,
            `<meta property="og:title" content="${title}"`
        );
        html = html.replace(
            /<meta property="og:description" content="[^"]*"/g,
            `<meta property="og:description" content="${description}"`
        );
        html = html.replace(
            /<meta property="og:image" content="[^"]*"/g,
            `<meta property="og:image" content="${ogImage}"`
        );
        html = html.replace(
            /<meta property="og:url" content="[^"]*"/g,
            `<meta property="og:url" content="https://stelarmusic.pages.dev/oldschool"`
        );

        // Update Twitter tags
        html = html.replace(
            /<meta name="twitter:title" content="[^"]*"/g,
            `<meta name="twitter:title" content="${title}"`
        );
        html = html.replace(
            /<meta name="twitter:description" content="[^"]*"/g,
            `<meta name="twitter:description" content="${description}"`
        );
        html = html.replace(
            /<meta name="twitter:image" content="[^"]*"/g,
            `<meta name="twitter:image" content="${ogImage}"`
        );

        return new Response(html, {
            headers: {
                'Content-Type': 'text/html;charset=UTF-8',
                'Cache-Control': 'public, max-age=3600'
            }
        });
    } catch (error) {
        console.error('Error in oldschool handler:', error);
        return env.ASSETS.fetch(request);
    }
}

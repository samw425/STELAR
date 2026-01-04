export async function onRequest(context) {
    const { request, next, params } = context;
    const url = new URL(request.url);

    // 1. Get the original HTML response (index.html)
    const response = await next();
    const html = await response.text();

    // 2. Extract artist slug from the path
    // Route is /artist/[[name]] -> params.name is an array
    // e.g. /artist/taylor-swift -> name=['taylor-swift']
    const slug = params.name?.[0];

    if (!slug) {
        return new Response(html, {
            headers: response.headers,
            status: response.status,
        });
    }

    try {
        // 3. Fetch rankings data to find the artist
        // We can fetch from the live JSON file on the same domain or import if possible, 
        // but fetching is safer for edge functions to get latest data.
        // Use the origin from the request.
        const rankingsUrl = `${url.origin}/rankings.json`;
        const dataReq = await fetch(rankingsUrl);

        if (!dataReq.ok) {
            // If fetch fails, return standard HTML
            return new Response(html, { headers: response.headers });
        }

        const data = await dataReq.json();

        // 4. Find the artist data
        let artist = null;

        // Helper to normalize for comparison
        const normalize = (s) => s?.toLowerCase().replace(/\s+/g, '-');

        if (data && data.rankings) {
            // Search all categories
            Object.values(data.rankings).some(categoryList => {
                const found = categoryList.find(a => normalize(a.name) === slug || a.id === slug);
                if (found) {
                    artist = found;
                    return true;
                }
                return false;
            });
        }

        if (artist) {
            // 5. Inject OG Tags
            // We'll replace the default meta tags in the HTML string

            const title = `${artist.name} | STELAR Rank #${artist.rank || '??'}`;
            const description = `Discover ${artist.name} on STELAR. Global Power Score: ${artist.powerScore}. Track the charts. Spot the next big thing.`;

            // Generate Dynamic OG Image with Neon Orange Theme
            const ogUrl = new URL('https://og.novai.workers.dev/api/og');
            ogUrl.searchParams.set('name', artist.name);
            ogUrl.searchParams.set('rank', artist.rank);
            ogUrl.searchParams.set('score', artist.powerScore);
            ogUrl.searchParams.set('image', artist.avatar_url || '');
            ogUrl.searchParams.set('theme', 'orange'); // NEON ORANGE REQUEST
            const image = ogUrl.toString();

            // Replace Title
            let modifiedHtml = html.replace(
                /<title>.*?<\/title>/,
                `<title>${title}</title>`
            );

            // Replace OG Title
            modifiedHtml = modifiedHtml.replace(
                /<meta property="og:title" content=".*?" \/>/,
                `<meta property="og:title" content="${title}" />`
            );

            // Replace OG Description
            modifiedHtml = modifiedHtml.replace(
                /<meta property="og:description" content=".*?" \/>/,
                `<meta property="og:description" content="${description}" />`
            );

            // Replace OG Image
            modifiedHtml = modifiedHtml.replace(
                /<meta property="og:image" content=".*?" \/>/,
                `<meta property="og:image" content="${image}" />`
            );

            // Replace Twitter Title
            modifiedHtml = modifiedHtml.replace(
                /<meta name="twitter:title" content=".*?" \/>/,
                `<meta name="twitter:title" content="${title}" />`
            );

            // Replace Twitter Description
            modifiedHtml = modifiedHtml.replace(
                /<meta name="twitter:description" content=".*?" \/>/,
                `<meta name="twitter:description" content="${description}" />`
            );

            // Replace Twitter Image
            modifiedHtml = modifiedHtml.replace(
                /<meta name="twitter:image" content=".*?" \/>/,
                `<meta name="twitter:image" content="${image}" />`
            );

            return new Response(modifiedHtml, {
                headers: response.headers,
                status: 200
            });
        }

    } catch (error) {
        // Silently fail to standard HTML on error
        console.error("OG Injection Error:", error);
    }

    // Fallback: return original HTML
    return new Response(html, {
        headers: response.headers,
        status: response.status,
    });
}

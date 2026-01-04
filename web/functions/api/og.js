
import { ImageResponse } from 'workers-og';

export async function onRequest(context) {
    const { request, env } = context;

    try {
        return new ImageResponse(
            `<div style="display:flex;flex-direction:column;width:100%;height:100%;background:#050505;padding:50px;font-family:sans-serif">
                <div style="display:flex;align-items:center;justify-content:center;height:100%;flex-direction:column">
                    <div style="display:flex;color:#FF4500;font-size:80px;font-weight:900;letter-spacing:0.1em;text-transform:uppercase">
                        STELAR
                    </div>
                    <div style="display:flex;color:white;font-size:30px;font-weight:bold;margin-top:20px;letter-spacing:0.2em">
                        THE PULSE
                    </div>
                    <div style="display:flex;margin-top:40px;align-items:center;background:#FF4500;padding:10px 30px;border-radius:30px">
                        <span style="color:white;font-size:24px;font-weight:bold">GLOBAL FEED LIVE</span>
                    </div>
                </div>
                <div style="display:flex;position:absolute;bottom:40px;right:50px;align-items:center">
                    <div style="width:15px;height:15px;background:#FF4500;border-radius:50%;margin-right:10px"></div>
                    <span style="color:#666;font-size:20px">UPDATED HOURLY</span>
                </div>
            </div>`,
            { width: 1200, height: 630 }
        );
    } catch (e) {
        console.error("OG Generation Failed:", e);
        // Fallback to static image if generation fails
        return Response.redirect('https://stelarmusic.pages.dev/og-image.png', 302);
    }
}

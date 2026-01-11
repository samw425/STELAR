// Cloudflare Pages Function to handle feedback submissions
// Uses Resend API to send email notifications

interface Env {
    RESEND_API_KEY: string;
}

interface FeedbackData {
    name: string;
    email: string;
    feedbackType: string;
    message: string;
    rating: number;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    // CORS headers
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    try {
        const data: FeedbackData = await context.request.json();
        const { name, email, feedbackType, message, rating } = data;

        // Validate required fields
        if (!email || !feedbackType || !message) {
            return new Response(
                JSON.stringify({ error: 'Missing required fields' }),
                { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            );
        }

        // Get API key from environment
        const apiKey = context.env.RESEND_API_KEY;

        if (!apiKey) {
            console.error('RESEND_API_KEY not configured');
            return new Response(
                JSON.stringify({ error: 'Email service not configured' }),
                { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            );
        }

        // Rating stars display
        const ratingStars = rating ? '⭐'.repeat(rating) + '☆'.repeat(5 - rating) : 'Not rated';

        // Send notification email via Resend
        const resendResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: 'STELAR <onboarding@resend.dev>',
                to: ['saziz4250@gmail.com'],
                subject: `📝 STELAR Feedback: ${feedbackType} from ${name || 'Anonymous'}`,
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0B0C10; color: #fff; border-radius: 12px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #00FF41; margin: 0; font-weight: 900; letter-spacing: 0.1em;">STELAR</h1>
              <p style="color: #94a3b8; margin: 5px 0;">User Feedback</p>
            </div>
            
            <div style="background: #1e293b; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #3b82f6; margin-top: 0;">New Feedback Received!</h2>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; color: #94a3b8; border-bottom: 1px solid #334155;">Name</td>
                  <td style="padding: 10px 0; color: #fff; border-bottom: 1px solid #334155; font-weight: bold;">${name || 'Anonymous'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #94a3b8; border-bottom: 1px solid #334155;">Email</td>
                  <td style="padding: 10px 0; color: #fff; border-bottom: 1px solid #334155;">${email}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #94a3b8; border-bottom: 1px solid #334155;">Type</td>
                  <td style="padding: 10px 0; color: #00FF41; border-bottom: 1px solid #334155; font-weight: bold;">${feedbackType}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #94a3b8; border-bottom: 1px solid #334155;">Rating</td>
                  <td style="padding: 10px 0; color: #fbbf24; border-bottom: 1px solid #334155; font-size: 18px;">${ratingStars}</td>
                </tr>
              </table>
              
              <div style="margin-top: 20px; padding: 15px; background: #0f172a; border-radius: 8px; border-left: 4px solid #3b82f6;">
                <p style="color: #94a3b8; margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase;">Feedback Message</p>
                <p style="color: #fff; margin: 0; line-height: 1.6;">${message}</p>
              </div>
            </div>
            
            <div style="text-align: center; color: #64748b; font-size: 12px;">
              <p>This notification was sent from STELAR Feedback Form</p>
              <p>Timestamp: ${new Date().toISOString()}</p>
            </div>
          </div>
        `,
            }),
        });

        if (!resendResponse.ok) {
            const errorText = await resendResponse.text();
            console.error('Resend API error:', errorText);
            return new Response(
                JSON.stringify({ error: 'Failed to send email', details: errorText }),
                { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            );
        }

        const result = await resendResponse.json();

        return new Response(
            JSON.stringify({
                success: true,
                message: 'Thank you for your feedback!',
                id: result.id
            }),
            { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );

    } catch (error) {
        console.error('Feedback error:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
    }
};

// Handle CORS preflight
export const onRequestOptions: PagesFunction = async () => {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
};

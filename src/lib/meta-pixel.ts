import crypto from 'crypto';

const PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;
const ACCESS_TOKEN = process.env.FB_ACCESS_TOKEN;

function hashData(data: string): string {
    return crypto.createHash('sha256').update(data.toLowerCase().trim()).digest('hex');
}

export type MetaEventData = {
    eventName: string;
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    fbc?: string;
    fbp?: string;
    clientIpAddress?: string;
    clientUserAgent?: string;
    customData?: Record<string, any>;
    eventSourceUrl?: string;
};

/**
 * Send an event to Meta Conversion API (CAPI).
 * This should only be called from the server.
 */
export async function sendMetaEvent({
    eventName,
    email,
    phone,
    firstName,
    lastName,
    fbc,
    fbp,
    clientIpAddress,
    clientUserAgent,
    customData,
    eventSourceUrl,
}: MetaEventData) {
    if (!PIXEL_ID || !ACCESS_TOKEN) {
        console.warn('[Meta CAPI] Missing Pixel ID or Access Token');
        return;
    }

    const userData: any = {
        client_ip_address: clientIpAddress || null,
        client_user_agent: clientUserAgent || null,
    };

    if (email) userData.em = [hashData(email)];
    if (phone) userData.ph = [hashData(phone)];
    if (firstName) userData.fn = [hashData(firstName)];
    if (lastName) userData.ln = [hashData(lastName)];
    if (fbc) userData.fbc = fbc;
    if (fbp) userData.fbp = fbp;

    const event = {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        event_source_url: eventSourceUrl,
        user_data: userData,
        custom_data: customData,
    };

    try {
        const response = await fetch(`https://graph.facebook.com/v19.0/${PIXEL_ID}/events`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                data: [event],
                access_token: ACCESS_TOKEN,
            }),
        });

        const result = await response.json();
        if (result.error) {
            console.error('[Meta CAPI] Error:', result.error);
        } else {
            console.log(`[Meta CAPI] Event "${eventName}" sent successfully:`, result);
        }
    } catch (error) {
        console.error('[Meta CAPI] Fetch Failed:', error);
    }
}

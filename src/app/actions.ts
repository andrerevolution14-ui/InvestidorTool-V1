"use server";

import { createSimulationLead, updateSimulationLead } from "@/lib/supabase";

/**
 * Called on page load.
 * Receives all Meta Instant Form params (name, email, phone) + tracking params from the URL.
 * Creates the Supabase row and returns the row id so the client can update it later.
 */
export async function initLeadAction(params: {
    name?: string;
    email?: string;
    phone?: string;
    fb_lead_id?: string;
    fbclid?: string;
    utm_source?: string;
    utm_campaign?: string;
}) {
    try {
        const id = await createSimulationLead({
            name: params.name || null,
            email: params.email || null,
            phone: params.phone || null,
            fb_lead_id: params.fb_lead_id || null,
            fbclid: params.fbclid || null,
            utm_source: params.utm_source || null,
            utm_campaign: params.utm_campaign || null,
            step_reached: "hero",
            completed: false,
        });
        return { success: true, id };
    } catch (error) {
        console.error("Supabase initLead error:", error);
        return { success: false, id: null };
    }
}

/** Called after each quiz answer / step navigation to update the same row */
export async function updateLeadAction(
    id: string,
    data: {
        capital?: string;
        horizonte?: string;
        preferencia?: string;
        step_reached?: string;
        completed?: boolean;
    }
) {
    if (!id) return { success: false };
    try {
        await updateSimulationLead(id, data);
        return { success: true };
    } catch (error) {
        console.error("Supabase updateLead error:", error);
        return { success: false };
    }
}

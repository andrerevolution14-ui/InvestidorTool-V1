"use server";

import { createSimulationLead, updateSimulationLead } from "@/lib/supabase";

/** Called on page load — creates the lead row and returns the Supabase row id */
export async function initLeadAction(params: {
    fb_lead_id?: string;
    fbclid?: string;
    utm_source?: string;
    utm_campaign?: string;
}) {
    try {
        const id = await createSimulationLead({
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

/** Called after each quiz answer / step reached */
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

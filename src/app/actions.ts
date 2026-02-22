"use server";

import { createSimulationLead, updateSimulationLead } from "@/lib/supabase";

/**
 * Called on page load.
 * Captures ALL Meta Instant Form data (name, email, phone) + tracking params
 * from the URL and inserts a single Supabase row.
 *
 * Configure the Meta Instant Form "Thank You URL" as:
 * https://yoursite.com?first_name={{first_name}}&email={{email}}&phone_number={{phone_number}}&lead_id={{lead_id}}
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
        // Strip non-numeric chars so phone fits the `numeric` column
        const phoneNum = params.phone
            ? Number(params.phone.replace(/\D/g, "")) || null
            : null;

        const id = await createSimulationLead({
            Name: params.name || null,
            Email: params.email || null,
            Phone: phoneNum,
            fb_lead_id: params.fb_lead_id || null,
            fbclid: params.fbclid || null,
            utm_source: params.utm_source || null,
            utm_campaign: params.utm_campaign || null,
            status: false,              // DO NOT change — bool column
        });

        return { success: true, id };
    } catch (error) {
        console.error("Supabase initLead error:", error);
        return { success: false, id: null };
    }
}

/**
 * Called after each quiz answer to update the existing row.
 * Maps internal field names → exact Supabase column names.
 */
export async function updateLeadAction(
    id: number,
    data: {
        capital?: string;      // → Capital
        horizonte?: string;    // → Retorno
        preferencia?: string;  // → Gestão
        completed?: boolean;   // → status (bool — DO NOT change type)
    }
) {
    if (!id) return { success: false };
    try {
        await updateSimulationLead(id, {
            ...(data.capital !== undefined && { Capital: data.capital }),
            ...(data.horizonte !== undefined && { Retorno: data.horizonte }),
            ...(data.preferencia !== undefined && { "Gestão": data.preferencia }),
            ...(data.completed !== undefined && { status: data.completed }),
        });
        return { success: true };
    } catch (error) {
        console.error("Supabase updateLead error:", error);
        return { success: false };
    }
}

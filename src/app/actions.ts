"use server";

import { createSimulationLead, updateSimulationLead } from "@/lib/supabase";

/**
 * Called on PAGE LOAD.
 * Inserts contact data from Meta Instant Form immediately.
 * quiz = false (quiz not yet completed).
 * Returns the row id so the client can update it after Q3.
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
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    console.log("[Supabase] URL set:", !!url, "| KEY set:", !!key && key !== "COLOCA_AQUI_A_TUA_ANON_KEY");

    try {
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
            quiz: false,   // will be set to true after Q3
        });

        console.log("[Supabase] Lead created with id:", id);
        return { success: true, id };
    } catch (error) {
        console.error("[Supabase] initLead FAILED:", JSON.stringify(error));
        return { success: false, id: null };
    }
}

/**
 * Called after Q3 is answered.
 * Updates the existing row with quiz answers and sets quiz = true.
 */
export async function completeLeadAction(
    id: number,
    data: {
        capital: string;    // → Capital
        horizonte: string;  // → Retorno
        preferencia: string; // → Gestão
    }
) {
    if (!id) return { success: false };
    try {
        await updateSimulationLead(id, {
            Capital: data.capital,
            Retorno: data.horizonte,
            "Gestão": data.preferencia,
            quiz: true,   // quiz completed
        });
        console.log("[Supabase] Lead completed, id:", id);
        return { success: true };
    } catch (error) {
        console.error("[Supabase] completeLead FAILED:", JSON.stringify(error));
        return { success: false };
    }
}

"use server";

import { createSimulationLead, updateSimulationLead } from "@/lib/supabase";

type MetaParams = {
    name?: string;
    email?: string;
    phone?: string;
    fb_lead_id?: string;
    fbclid?: string;
    utm_source?: string;
    utm_campaign?: string;
};

function sanitizePhone(phone?: string): number | null {
    if (!phone) return null;
    return Number(phone.replace(/\D/g, "")) || null;
}

/**
 * Called after 10 minutes if the user hasn't completed Q3.
 * Inserts a partial lead with quiz = false.
 */
export async function savePartialLeadAction(params: MetaParams) {
    try {
        const id = await createSimulationLead({
            Name: params.name || null,
            Email: params.email || null,
            Phone: sanitizePhone(params.phone),
            fb_lead_id: params.fb_lead_id || null,
            fbclid: params.fbclid || null,
            utm_source: params.utm_source || null,
            utm_campaign: params.utm_campaign || null,
            quiz: false,
        });
        console.log("[Supabase] Partial lead saved (quiz=false), id:", id);
        return { success: true, id };
    } catch (error) {
        console.error("[Supabase] savePartialLead FAILED:", JSON.stringify(error));
        return { success: false, id: null };
    }
}

/**
 * Called immediately when Q3 is completed (timer not yet fired).
 * Inserts a complete lead with all data and quiz = true.
 */
export async function saveCompleteLeadAction(
    params: MetaParams & { capital: string; horizonte: string; preferencia: string }
) {
    try {
        const id = await createSimulationLead({
            Name: params.name || null,
            Email: params.email || null,
            Phone: sanitizePhone(params.phone),
            fb_lead_id: params.fb_lead_id || null,
            fbclid: params.fbclid || null,
            utm_source: params.utm_source || null,
            utm_campaign: params.utm_campaign || null,
            Capital: params.capital,
            Retorno: params.horizonte,
            "Gestão": params.preferencia,
            quiz: true,
        });
        console.log("[Supabase] Complete lead saved (quiz=true), id:", id);
        return { success: true, id };
    } catch (error) {
        console.error("[Supabase] saveCompleteLead FAILED:", JSON.stringify(error));
        return { success: false, id: null };
    }
}

/**
 * Called when Q3 is completed AFTER the 10-min timeout already inserted a partial row.
 * Updates the existing partial row with quiz answers and sets quiz = true.
 */
export async function upgradeLeadAction(
    id: number,
    data: { capital: string; horizonte: string; preferencia: string }
) {
    try {
        await updateSimulationLead(id, {
            Capital: data.capital,
            Retorno: data.horizonte,
            "Gestão": data.preferencia,
            quiz: true,
        });
        console.log("[Supabase] Partial lead upgraded to complete (quiz=true), id:", id);
        return { success: true };
    } catch (error) {
        console.error("[Supabase] upgradeLead FAILED:", JSON.stringify(error));
        return { success: false };
    }
}

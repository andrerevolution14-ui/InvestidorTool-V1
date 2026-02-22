"use server";

import { createSimulationLead } from "@/lib/supabase";

/**
 * Called ONCE after Q3 is answered — inserts a single complete row into Supabase.
 * All data (Meta contact + quiz answers) is written at the same time,
 * so automations always see a fully populated row.
 */
export async function saveCompleteLeadAction(data: {
    // Meta Instant Form contact data (from URL params)
    name?: string;
    email?: string;
    phone?: string;
    fb_lead_id?: string;
    fbclid?: string;
    utm_source?: string;
    utm_campaign?: string;
    // Quiz answers (full labels)
    capital: string;
    horizonte: string;
    preferencia: string;
}) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    console.log("[Supabase] URL set:", !!url, "| KEY set:", !!key && key !== "COLOCA_AQUI_A_TUA_ANON_KEY");

    try {
        const phoneNum = data.phone
            ? Number(data.phone.replace(/\D/g, "")) || null
            : null;

        const id = await createSimulationLead({
            Name: data.name || null,
            Email: data.email || null,
            Phone: phoneNum,
            fb_lead_id: data.fb_lead_id || null,
            fbclid: data.fbclid || null,
            utm_source: data.utm_source || null,
            utm_campaign: data.utm_campaign || null,
            Capital: data.capital,
            Retorno: data.horizonte,
            "Gestão": data.preferencia,
            status: false,
        });

        console.log("[Supabase] Complete lead saved with id:", id);
        return { success: true, id };
    } catch (error) {
        console.error("[Supabase] saveCompleteLead FAILED:", JSON.stringify(error));
        return { success: false, id: null };
    }
}

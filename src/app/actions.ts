"use server";

import { createSimulationLead, updateSimulationLead } from "@/lib/supabase";
import { sendMetaEvent } from "@/lib/meta-pixel";
import { headers, cookies } from "next/headers";

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

        // Meta CAPI
        if (params.email || params.phone) {
            const head = await headers();
            const cookieStore = await cookies();
            const sourceUrl = head.get("referer") || "";
            const userAgent = head.get("user-agent") || "";
            const ip = head.get("x-forwarded-for")?.split(",")[0] || head.get("x-real-ip") || "";
            const fbp = cookieStore.get("_fbp")?.value;

            await sendMetaEvent({
                eventName: "Lead",
                email: params.email,
                phone: params.phone,
                firstName: params.name,
                fbc: params.fbclid ? `fb.1.${Math.floor(Date.now() / 1000)}.${params.fbclid}` : undefined,
                fbp,
                clientIpAddress: ip,
                clientUserAgent: userAgent,
                eventSourceUrl: sourceUrl,
                customData: {
                    quiz_completed: false,
                    lead_id: id
                }
            });
        }

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

        // Meta CAPI
        const head = await headers();
        const cookieStore = await cookies();
        const sourceUrl = head.get("referer") || "";
        const userAgent = head.get("user-agent") || "";
        const ip = head.get("x-forwarded-for")?.split(",")[0] || head.get("x-real-ip") || "";
        const fbp = cookieStore.get("_fbp")?.value;

        await sendMetaEvent({
            eventName: "Lead",
            email: params.email,
            phone: params.phone,
            firstName: params.name,
            fbc: params.fbclid ? `fb.1.${Math.floor(Date.now() / 1000)}.${params.fbclid}` : undefined,
            fbp,
            clientIpAddress: ip,
            clientUserAgent: userAgent,
            eventSourceUrl: sourceUrl,
            customData: {
                quiz_completed: true,
                capital: params.capital,
                lead_id: id
            }
        });

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
    data: MetaParams & { capital: string; horizonte: string; preferencia: string }
) {
    try {
        await updateSimulationLead(id, {
            Capital: data.capital,
            Retorno: data.horizonte,
            "Gestão": data.preferencia,
            quiz: true,
        });
        console.log("[Supabase] Partial lead upgraded to complete (quiz=true), id:", id);

        // Meta CAPI
        const head = await headers();
        const cookieStore = await cookies();
        const sourceUrl = head.get("referer") || "";
        const userAgent = head.get("user-agent") || "";
        const ip = head.get("x-forwarded-for")?.split(",")[0] || head.get("x-real-ip") || "";
        const fbp = cookieStore.get("_fbp")?.value;

        await sendMetaEvent({
            eventName: "Lead",
            email: data.email,
            phone: data.phone,
            firstName: data.name,
            fbc: data.fbclid ? `fb.1.${Math.floor(Date.now() / 1000)}.${data.fbclid}` : undefined,
            fbp,
            clientIpAddress: ip,
            clientUserAgent: userAgent,
            eventSourceUrl: sourceUrl,
            customData: {
                quiz_completed: true,
                capital: data.capital,
                lead_id: id,
                upgraded: true
            }
        });

        return { success: true };
    } catch (error) {
        console.error("[Supabase] upgradeLead FAILED:", JSON.stringify(error));
        return { success: false };
    }
}

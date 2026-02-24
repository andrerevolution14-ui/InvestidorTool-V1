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

/**
 * Returns a number for Supabase int8. If invalid, returns 0 to avoid PK null error.
 */
function sanitizePhoneToNumber(phone?: string): number {
    if (!phone) return 0;
    const clean = phone.replace(/\D/g, "");
    return Number(clean) || 0;
}

/**
 * Called quickly after landing or after timeout.
 * Inserts a partial lead with quiz = false.
 */
export async function savePartialLeadAction(params: MetaParams) {
    // 1. Validation: If all we have are placeholders or nothing, STOP.
    const isPlaceholder = (val?: string) => !val || (val.startsWith("{{") && val.endsWith("}}"));

    if (isPlaceholder(params.name) && isPlaceholder(params.email) && isPlaceholder(params.phone)) {
        console.log("[Supabase] Aborting save: No real data provided (only Meta placeholders or empty values).");
        return { success: false, id: null };
    }

    console.log("[Supabase] Real data detected, attempting save:", { email: params.email, name: params.name });

    try {
        const id = await createSimulationLead({
            Name: isPlaceholder(params.name) ? "Sem Nome" : params.name!,
            Email: isPlaceholder(params.email) ? null : params.email!,
            Phone: sanitizePhoneToNumber(params.phone),
            fb_lead_id: params.fb_lead_id || null,
            fbclid: params.fbclid || null,
            utm_source: params.utm_source || null,
            utm_campaign: params.utm_campaign || null,
            quiz: false,
        });
        console.log("[Supabase] Lead saved successfully, id:", id);

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
        console.error("[Supabase] savePartialLead FAILED:", {
            message: (error as any).message,
            code: (error as any).code,
            details: (error as any).details,
            hint: (error as any).hint
        });
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
    console.log("[Supabase] Attempting to save complete lead (immediate submission)");

    try {
        const id = await createSimulationLead({
            Name: params.name || "Interessado Aveiro",
            Email: params.email || null,
            Phone: sanitizePhoneToNumber(params.phone),
            fb_lead_id: params.fb_lead_id || null,
            fbclid: params.fbclid || null,
            utm_source: params.utm_source || null,
            utm_campaign: params.utm_campaign || null,
            Capital: params.capital,
            Retorno: params.horizonte,
            "Gestão": params.preferencia,
            quiz: true,
        });
        console.log("[Supabase] Complete lead saved successfully, id:", id);

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
        console.error("[Supabase] saveCompleteLead FAILED:", {
            message: (error as any).message,
            code: (error as any).code,
            details: (error as any).details,
            hint: (error as any).hint
        });
        return { success: false, id: null };
    }
}

/**
 * Called when Q3 is completed AFTER the partial row was already inserted.
 * Updates the existing partial row with quiz answers and sets quiz = true.
 */
export async function upgradeLeadAction(
    id: number,
    data: MetaParams & { capital: string; horizonte: string; preferencia: string }
) {
    console.log("[Supabase] Attempting to upgrade partial lead to complete, id:", id);

    try {
        await updateSimulationLead(id, {
            Capital: data.capital,
            Retorno: data.horizonte,
            "Gestão": data.preferencia,
            quiz: true,
        });
        console.log("[Supabase] Partial lead upgraded successfully, id:", id);

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
        console.error("[Supabase] upgradeLead FAILED:", {
            message: (error as any).message,
            code: (error as any).code,
            details: (error as any).details,
            hint: (error as any).hint
        });
        return { success: false };
    }
}

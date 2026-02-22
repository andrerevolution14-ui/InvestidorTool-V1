"use server";

import { createSimulationLead, updateSimulationLead } from "@/lib/supabase";

/**
 * Called on page load.
 * Receives contact data from Meta Instant Form passed as URL query params.
 * Creates the Supabase row and returns the row id so the client
 * can update it with each subsequent quiz answer.
 *
 * Configure the Meta form "Thank You URL" as:
 * https://yoursite.com?first_name={{first_name}}&email={{email}}&phone_number={{phone_number}}
 */
export async function initLeadAction(params: {
    name?: string;
    email?: string;
    phone?: string;
}) {
    try {
        // Strip non-numeric chars from phone so it fits the numeric column
        const phoneNum = params.phone
            ? Number(params.phone.replace(/\D/g, "")) || null
            : null;

        const id = await createSimulationLead({
            Name: params.name || null,
            Email: params.email || null,
            Phone: phoneNum,
            status: false,
        });

        return { success: true, id };
    } catch (error) {
        console.error("Supabase initLead error:", error);
        return { success: false, id: null };
    }
}

/**
 * Called after each quiz answer to update the existing row.
 * Maps our internal field names to the Supabase column names.
 */
export async function updateLeadAction(
    id: number,
    data: {
        capital?: string;    // → Capital
        horizonte?: string;  // → Retorno
        preferencia?: string; // → Gestão
        completed?: boolean; // → status
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

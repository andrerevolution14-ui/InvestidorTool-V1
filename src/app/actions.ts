"use server";

import { createLead } from "@/lib/pocketbase";

export async function saveLeadAction(formData: {
    capital: string;
    horizonte: string;
    preferencia: string;
}) {
    try {
        const record = await createLead({
            capital: formData.capital,
            horizonte: formData.horizonte,
            preferencia: formData.preferencia,
            timestamp: new Date().toISOString(),
        });

        return { success: true, id: record.id };
    } catch (error) {
        console.error("Failed to save lead:", error);
        return { success: false, error: "Failed to save" };
    }
}

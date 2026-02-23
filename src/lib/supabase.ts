import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Matches "Investidores Database" table schema exactly as per screenshot
export interface SimulationLead {
    // Contact data (Capitalized in DB)
    Name: string;      // Marked as Primary, cannot be null
    Phone: number;    // Marked as Primary, cannot be null
    Email?: string | null;

    // Quiz answers (Capitalized in DB)
    Capital?: string | null;
    Retorno?: string | null;
    "Gestão"?: string | null;

    // Status bits (Lowercase in DB)
    status?: boolean;
    quiz?: boolean;

    // Meta tracking (Lowercase in DB)
    fb_lead_id?: string | null;
    fbclid?: string | null;
    utm_source?: string | null;
    utm_campaign?: string | null;

    // Timestamps
    updated_at?: string;
}

/** Insert a new lead row on page load. Returns the row id. */
export async function createSimulationLead(data: any): Promise<number> {
    console.log("[Supabase SDK] Data to insert:", JSON.stringify(data));

    const { data: result, error } = await supabase
        .from("Investidores Database")
        .insert([data])
        .select("id");

    if (error) {
        console.error("[Supabase SDK] INSERT FAILED!", {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
        });
        throw error;
    }

    if (!result || result.length === 0) {
        console.warn("[Supabase SDK] Insert succeeded but select returned no data. Returning ID 0.");
        return 0;
    }

    console.log("[Supabase SDK] SUCCESS, ID:", result[0].id);
    return result[0].id as number;
}

/** Update an existing lead row by id. */
export async function updateSimulationLead(id: number, data: Partial<SimulationLead>): Promise<void> {
    const { error } = await supabase
        .from("Investidores Database")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", id);

    if (error) {
        console.error("[Supabase SDK] UPDATE FAILED!", error);
        throw error;
    }
}

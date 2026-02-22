import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface SimulationLead {
    id?: string;
    // Meta Instant Form tracking
    fb_lead_id?: string | null;
    fbclid?: string | null;
    utm_source?: string | null;
    utm_campaign?: string | null;
    // Quiz answers
    capital?: string | null;
    horizonte?: string | null;
    preferencia?: string | null;
    // Funnel progress
    step_reached?: string | null;
    completed?: boolean;
    // Metadata
    created_at?: string;
    updated_at?: string;
}

/** Create a new lead row at funnel entry, returns the row id */
export async function createSimulationLead(data: Omit<SimulationLead, "id" | "created_at" | "updated_at">) {
    const { data: row, error } = await supabase
        .from("simulation_leads")
        .insert({ ...data, created_at: new Date().toISOString() })
        .select("id")
        .single();

    if (error) throw error;
    return row.id as string;
}

/** Update an existing lead row with new partial data */
export async function updateSimulationLead(id: string, data: Partial<SimulationLead>) {
    const { error } = await supabase
        .from("simulation_leads")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", id);

    if (error) throw error;
}

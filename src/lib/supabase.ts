import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Matches "Investidores Database" table schema
export interface SimulationLead {
    // Contact data from Meta Instant Form (URL params)
    Name?: string | null;
    Phone?: number | null;
    Email?: string | null;

    // Meta tracking
    fb_lead_id?: string | null;
    fbclid?: string | null;
    utm_source?: string | null;
    utm_campaign?: string | null;

    // Quiz answers (set after Q3)
    Capital?: string | null;
    Retorno?: string | null;
    "Gestão"?: string | null;

    // status bool — user manages manually, never touched by code
    status?: boolean;

    // Quiz completion flag — false on insert, true after Q3
    quiz?: boolean;

    // Timestamps
    updated_at?: string;
}

/** Insert a new lead row on page load. Returns the row id. */
export async function createSimulationLead(data: SimulationLead): Promise<number> {
    const { data: row, error } = await supabase
        .from("Investidores Database")
        .insert(data)
        .select("id")
        .single();

    if (error) throw error;
    return row.id as number;
}

/** Update an existing lead row by id. */
export async function updateSimulationLead(id: number, data: Partial<SimulationLead>): Promise<void> {
    const { error } = await supabase
        .from("Investidores Database")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", id);

    if (error) throw error;
}

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Exactly matches the Supabase table "simulation_leads" (id: 17452)
// Run the following SQL in Supabase to add the tracking columns:
//
// ALTER TABLE simulation_leads
//   ADD COLUMN IF NOT EXISTS fb_lead_id   text,
//   ADD COLUMN IF NOT EXISTS fbclid        text,
//   ADD COLUMN IF NOT EXISTS utm_source    text,
//   ADD COLUMN IF NOT EXISTS utm_campaign  text,
//   ADD COLUMN IF NOT EXISTS updated_at    timestamptz;

export interface SimulationLead {
    // Contact data — passed by Meta Instant Form via URL params
    Name?: string | null;   // text
    Phone?: number | null;   // numeric
    Email?: string | null;   // text

    // Meta tracking — passed via URL params
    fb_lead_id?: string | null;  // text (new column)
    fbclid?: string | null;  // text (new column)
    utm_source?: string | null;  // text (new column)
    utm_campaign?: string | null; // text (new column)

    // Quiz answers
    Capital?: string | null; // text
    Retorno?: string | null; // text — Q2: horizonte de retorno
    Gestão?: string | null; // text — Q3: preferência de gestão

    // Status (DO NOT change — bool column, default false)
    status?: boolean;

    // Timestamps
    updated_at?: string;
}

/** Insert a new lead row. Returns the generated int8 id. */
export async function createSimulationLead(data: SimulationLead): Promise<number> {
    const { data: row, error } = await supabase
        .from("simulation_leads")
        .insert(data)
        .select("id")
        .single();

    if (error) throw error;
    return row.id as number;
}

/** Update an existing lead row by id. */
export async function updateSimulationLead(id: number, data: Partial<SimulationLead>): Promise<void> {
    const { error } = await supabase
        .from("simulation_leads")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", id);

    if (error) throw error;
}

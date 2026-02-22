import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Matches exactly the table schema in Supabase (table id: 17452)
export interface SimulationLead {
    // Contact data from Meta Instant Form (passed via URL params)
    Name?: string | null;    // text — first_name from Meta form
    Phone?: number | null;   // numeric — phone_number from Meta form
    Email?: string | null;   // text — email from Meta form
    // Quiz answers
    Capital?: string | null; // text — Q1: capital disponível
    Retorno?: string | null; // text — Q2: horizonte de retorno
    Gestão?: string | null;  // text — Q3: preferência de gestão
    // Funnel state
    status?: boolean;        // bool (default false) — true when quiz completed
}

/** Insert a new lead row. Returns the generated id. */
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
        .update(data)
        .eq("id", id);

    if (error) throw error;
}

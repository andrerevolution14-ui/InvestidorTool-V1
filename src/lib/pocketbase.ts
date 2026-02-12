import PocketBase from "pocketbase";

const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://76.13.11.36:8090";

const pb = new PocketBase(PB_URL);

export default pb;

export interface LeadData {
    capital: string;
    horizonte: string;
    preferencia: string;
    fb_lead_id?: string;
    timestamp: string;
}

export async function createLead(data: LeadData) {
    try {
        const record = await pb.collection("simulation_leads").create(data);
        return record;
    } catch (error) {
        console.error("PocketBase error:", error);
        throw error;
    }
}

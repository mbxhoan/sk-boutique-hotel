import { createSupabaseServiceClient } from "./lib/supabase/service";
import "dotenv/config";

async function run() {
  const { data } = await createSupabaseServiceClient().from("reservations").select("*").order("created_at", { ascending: false }).limit(5);
  console.log("Reservations:", data?.map(r => ({ id: r.id, booking: r.booking_code, cid: r.customer_id, avid: r.availability_request_id })));
}
run();

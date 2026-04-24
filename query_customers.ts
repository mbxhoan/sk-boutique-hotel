import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { createSupabaseServiceClient } from "./lib/supabase/service";

async function run() {
  const supabase = createSupabaseServiceClient();

  // 1. Get reservation
  const { data: reservation } = await supabase.from("reservations").select("*").eq("booking_code", "RES-5e39f8bfd5").single();
  console.log("Reservation:", { id: reservation?.id, customer_id: reservation?.customer_id });

  // 2. Get customer by reservation customer_id
  if (reservation?.customer_id) {
    const { data: customer1 } = await supabase.from("customers").select("*").eq("id", reservation.customer_id).single();
    console.log("Customer from reservation:", { id: customer1?.id, email: customer1?.email, full_name: customer1?.full_name, auth_user_id: customer1?.auth_user_id });
  }

  // 3. Get customers by email
  const { data: customers } = await supabase.from("customers").select("*").eq("email", "mbxhoan001@gmail.com");
  console.log("Customers with email mbxhoan001@gmail.com:");
  customers?.forEach(c => console.log(" -", { id: c.id, email: c.email, full_name: c.full_name, auth_user_id: c.auth_user_id }));
  
}
run();

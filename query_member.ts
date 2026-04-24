import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { loadMemberHistoryDashboardByUser } from "./lib/supabase/queries/member-history";

async function run() {
  const authUserId = "f4c40be5-4d7f-4b64-ab57-0a149845a6c5";
  const authUserEmail = "mbxhoan001@gmail.com";
  
  const data = await loadMemberHistoryDashboardByUser(authUserId, authUserEmail);
  console.log("Customer:", data?.customer);
  console.log("Reservations count:", data?.reservations.length);
  if (data?.reservations.length) {
    console.log("Reservations:", data.reservations.map(r => r.booking_code));
  }
}
run();

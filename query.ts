import { getReservationByBookingCode } from "./lib/supabase/queries/reservations";
import { createSupabaseServiceRoleClient } from "./lib/supabase/server";

async function run() {
  const reservation = await getReservationByBookingCode("RES-5e39f8bfd5");
  console.log("Reservation:", reservation);
  if (reservation) {
    const { data: customer } = await createSupabaseServiceRoleClient().from("customers").select("*").eq("id", reservation.customer_id).single();
    console.log("Reservation Customer:", customer);
  }
}
run();

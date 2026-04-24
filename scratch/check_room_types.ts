import { createSupabaseServiceClient } from "@/lib/supabase/service";

async function checkData() {
  const client = createSupabaseServiceClient();
  const { data, error } = await client.from("room_types").select("*");
  if (error) {
    console.error(error);
    return;
  }
  console.log(JSON.stringify(data, null, 2));
}

checkData();

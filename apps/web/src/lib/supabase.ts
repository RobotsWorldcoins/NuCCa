import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { optionalServerEnv } from "@/lib/env";

let adminClient: SupabaseClient | null = null;

export function getSupabaseAdmin() {
  const url = optionalServerEnv("SUPABASE_URL");
  const key = optionalServerEnv("SUPABASE_SERVICE_ROLE_KEY");

  if (!url || !key) {
    return null;
  }

  if (!adminClient) {
    adminClient = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  return adminClient;
}

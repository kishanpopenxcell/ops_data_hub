import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Service-role client -- bypasses RLS. Only for trusted server-side sync/ingestion
 * code (webhook handlers, backfill jobs). Never import this from client components
 * or expose SUPABASE_SERVICE_ROLE_KEY to the browser bundle.
 */
export function createServiceRoleClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

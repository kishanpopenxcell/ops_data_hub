import { createServiceRoleClient } from "./service-role";

/**
 * Auth is mocked (see src/lib/auth/mock-session.ts) -- there is never a real
 * Supabase Auth session, so RLS policies keyed on auth.uid() would block
 * every dashboard read. Server-side data fetching uses the service-role
 * client instead; role-based scoping that used to come from RLS is applied
 * explicitly in application code (see src/lib/queries/kpi-trend.ts).
 */
export async function createClient() {
  return createServiceRoleClient();
}

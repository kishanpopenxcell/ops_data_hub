import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { runDrillThroughQuery } from "@/lib/queries/drill-through";
import type { DrillThroughQuery } from "@/lib/drill-through";
import { getMockSession } from "@/lib/auth/session.server";

export async function POST(request: Request) {
  const session = await getMockSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const query = (await request.json()) as DrillThroughQuery;
  const supabase = createServiceRoleClient();

  try {
    const result = await runDrillThroughQuery(supabase, query);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load records";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

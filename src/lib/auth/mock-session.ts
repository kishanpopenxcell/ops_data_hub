import type { Role } from "@/types/models";

/**
 * Auth is mocked for demo purposes -- no real Supabase Auth session is ever
 * created. This cookie is the sole source of truth for "who is logged in."
 * Middleware and server data-fetching both read it instead of
 * supabase.auth.getClaims().
 */
export const SESSION_COOKIE = "demo_session";

export interface MockSession {
  role: Role;
  email: string;
}

export interface DemoUser {
  role: Role;
  email: string;
  password: string;
  label: string;
}

export const DEMO_USERS: DemoUser[] = [
  { role: "admin", email: "admin@metrichub.com", password: "MetricHub2026!", label: "Admin" },
  { role: "manager", email: "manager@metrichub.com", password: "MetricHub2026!", label: "Manager" },
  { role: "rep", email: "rep@metrichub.com", password: "MetricHub2026!", label: "Rep" },
];

export function findDemoUser(email: string, password: string): DemoUser | null {
  return (
    DEMO_USERS.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password,
    ) ?? null
  );
}

export function encodeSession(session: MockSession): string {
  return Buffer.from(JSON.stringify(session), "utf-8").toString("base64url");
}

export function decodeSession(value: string | undefined | null): MockSession | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf-8"));
    if (
      parsed &&
      typeof parsed.email === "string" &&
      (parsed.role === "admin" || parsed.role === "manager" || parsed.role === "rep")
    ) {
      return { role: parsed.role, email: parsed.email };
    }
    return null;
  } catch {
    return null;
  }
}

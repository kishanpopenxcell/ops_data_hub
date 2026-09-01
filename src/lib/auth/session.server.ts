import { cookies } from "next/headers";
import { decodeSession, SESSION_COOKIE, type MockSession } from "./mock-session";

export async function getMockSession(): Promise<MockSession | null> {
  const cookieStore = await cookies();
  return decodeSession(cookieStore.get(SESSION_COOKIE)?.value);
}

import { redirect } from "next/navigation";
import { readSession, type SessionPayload } from "@/lib/session";
import { db } from "@/lib/db";

export async function getSession() {
  return readSession();
}

export async function getCurrentUser() {
  const session = await readSession();
  if (!session) return null;
  return db.user.findUnique({ where: { id: session.userId } });
}

export async function requireSession(redirectTo = "/login"): Promise<SessionPayload> {
  const session = await readSession();
  if (!session) redirect(redirectTo);
  return session;
}

export async function requireRole(
  role: SessionPayload["role"],
  redirectTo = "/login"
): Promise<SessionPayload> {
  const session = await readSession();
  if (!session) redirect(redirectTo);
  if (session.role !== role) redirect("/");
  return session;
}

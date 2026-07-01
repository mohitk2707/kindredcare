import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSession } from "@/lib/session";
import type { Role } from "@prisma/client";

export async function GET(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }
  const url = new URL(req.url);
  const phone = url.searchParams.get("phone") ?? "";
  const role = (url.searchParams.get("role") ?? "FAMILY") as Role;
  if (!phone) return NextResponse.json({ error: "phone required" }, { status: 400 });

  const user = await db.user.upsert({
    where: { phone },
    update: {},
    create: { phone, role },
  });
  await createSession({ userId: user.id, role: user.role, phone: user.phone });
  return NextResponse.json({ ok: true, userId: user.id, role: user.role });
}

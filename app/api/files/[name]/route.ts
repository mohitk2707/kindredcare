import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { readSession } from "@/lib/session";
import { uploadDir, isSafeName, CONTENT_TYPES } from "@/lib/uploads";

export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const session = await readSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "CAREGIVER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name } = await params;
  if (!isSafeName(name)) return NextResponse.json({ error: "Bad request" }, { status: 400 });

  try {
    const buf = await readFile(path.join(uploadDir(), name));
    const ext = name.split(".").pop()?.toLowerCase() ?? "";
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": CONTENT_TYPES[ext] ?? "application/octet-stream",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

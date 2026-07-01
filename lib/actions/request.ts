"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { resolveArea } from "@/lib/geo";
import { generateLeads } from "@/lib/discovery";
import type { Qualification } from "@prisma/client";

async function draftFor(userId: string) {
  const existing = await db.careRequest.findFirst({
    where: { familyId: userId, status: "DRAFT" },
    orderBy: { createdAt: "desc" },
  });
  if (existing) return existing;
  return db.careRequest.create({ data: { familyId: userId, status: "DRAFT", categories: [], tasks: [] } });
}

export async function ensureDraft(): Promise<string> {
  const session = await requireSession("/login?next=/request/new");
  const draft = await draftFor(session.userId);
  return draft.id;
}

export async function saveRecipient(formData: FormData): Promise<void> {
  const session = await requireSession();
  const draft = await draftFor(session.userId);
  const recipient = String(formData.get("recipient") ?? "").trim();
  await db.careRequest.update({ where: { id: draft.id }, data: { schedule: draft.schedule, notes: mergeRecipient(draft.notes, recipient) } });
  redirect("/request/new?step=2");
}

function mergeRecipient(notes: string | null, recipient: string): string {
  const body = (notes ?? "").replace(/^\[For: [^\]]*\]\n?/, "");
  return recipient ? `[For: ${recipient}]\n${body}`.trim() : body;
}

export async function saveCareType(formData: FormData): Promise<void> {
  const session = await requireSession();
  const draft = await draftFor(session.userId);
  const categories = formData.getAll("categories").map(String);
  const tasks = formData.getAll("tasks").map(String);
  const qRaw = String(formData.get("qualification") ?? "");
  const qualification = qRaw ? (qRaw as Qualification) : null;
  await db.careRequest.update({ where: { id: draft.id }, data: { categories, tasks, qualification } });
  redirect("/request/new?step=3");
}

export async function saveSchedule(formData: FormData): Promise<void> {
  const session = await requireSession();
  const draft = await draftFor(session.userId);
  const schedule = String(formData.get("schedule") ?? "").trim();
  await db.careRequest.update({ where: { id: draft.id }, data: { schedule: schedule || null } });
  redirect("/request/new?step=4");
}

export async function saveLocation(formData: FormData): Promise<void> {
  const session = await requireSession();
  const draft = await draftFor(session.userId);
  const area = String(formData.get("area") ?? "").trim();
  const budgetMin = parseInt(String(formData.get("budgetMin") ?? ""), 10) || null;
  const budgetMax = parseInt(String(formData.get("budgetMax") ?? ""), 10) || null;
  const notesExtra = String(formData.get("notes") ?? "").trim();
  const coords = resolveArea(area);
  await db.careRequest.update({
    where: { id: draft.id },
    data: {
      area: area || null,
      city: "Bengaluru",
      lat: coords.lat,
      lng: coords.lng,
      budgetMin,
      budgetMax,
      notes: appendNotes(draft.notes, notesExtra),
    },
  });
  redirect("/request/new?step=5");
}

function appendNotes(notes: string | null, extra: string): string | null {
  const base = (notes ?? "").replace(/\n?— [\s\S]*$/, "").trim();
  if (!extra) return base || null;
  return `${base}\n— ${extra}`.trim();
}

export async function postRequest(): Promise<void> {
  const session = await requireSession();
  const draft = await db.careRequest.findFirst({
    where: { familyId: session.userId, status: "DRAFT" },
    orderBy: { createdAt: "desc" },
  });
  if (!draft) redirect("/request/new?step=1");

  await db.careRequest.update({ where: { id: draft.id }, data: { status: "OPEN" } });
  await ensureFamilyProfile(session.userId, draft.area);
  await generateLeads(draft.id);
  redirect(`/request/${draft.id}/matches`);
}

async function ensureFamilyProfile(userId: string, area: string | null) {
  await db.familyProfile.upsert({
    where: { userId },
    update: { area: area ?? undefined },
    create: { userId, area: area ?? undefined, city: "Bengaluru" },
  });
}

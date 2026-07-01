"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import type { Qualification, CredentialType } from "@prisma/client";

async function myProfileId(): Promise<string> {
  const session = await requireRole("CAREGIVER", "/login?intent=caregiver&next=/onboarding/caregiver");
  const existing = await db.caregiverProfile.findUnique({ where: { userId: session.userId } });
  if (existing) return existing.id;
  const created = await db.caregiverProfile.create({
    data: { userId: session.userId, qualification: "ATTENDANT", onboardingStep: 1 },
  });
  return created.id;
}

export async function ensureCaregiverProfile(): Promise<void> {
  await myProfileId();
}

function advance(current: number, to: number): number {
  return Math.max(current, to);
}

export async function saveAccount(formData: FormData): Promise<void> {
  const session = await requireRole("CAREGIVER");
  const name = String(formData.get("name") ?? "").trim();
  const pid = await myProfileId();
  await db.user.update({ where: { id: session.userId }, data: { name: name || null } });
  const p = await db.caregiverProfile.findUniqueOrThrow({ where: { id: pid } });
  await db.caregiverProfile.update({ where: { id: pid }, data: { onboardingStep: advance(p.onboardingStep, 2) } });
  redirect("/onboarding/caregiver?step=2");
}

export async function saveProfile(formData: FormData): Promise<void> {
  const pid = await myProfileId();
  const qualification = String(formData.get("qualification") ?? "ATTENDANT") as Qualification;
  const experienceYears = parseInt(String(formData.get("experienceYears") ?? "0"), 10) || 0;
  const area = String(formData.get("area") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const languages = formData.getAll("languages").map(String);
  const p = await db.caregiverProfile.findUniqueOrThrow({ where: { id: pid } });
  await db.caregiverProfile.update({
    where: { id: pid },
    data: {
      qualification,
      experienceYears,
      area: area || null,
      bio: bio || null,
      languages,
      city: "Bengaluru",
      onboardingStep: advance(p.onboardingStep, 3),
    },
  });
  redirect("/onboarding/caregiver?step=3");
}

export async function saveCredentials(formData: FormData): Promise<void> {
  const pid = await myProfileId();
  const councilName = String(formData.get("councilName") ?? "").trim();
  const councilRegNo = String(formData.get("councilRegNo") ?? "").trim();

  const uploads: { type: CredentialType; label: string; field: string }[] = [
    { type: "AADHAAR", label: "Aadhaar / Govt ID", field: "file_aadhaar" },
    { type: "COUNCIL_REG", label: "Nursing council registration", field: "file_council" },
    { type: "POLICE", label: "Police verification", field: "file_police" },
    { type: "CERTIFICATE", label: "Additional certificate", field: "file_cert" },
  ];

  const p = await db.caregiverProfile.findUniqueOrThrow({ where: { id: pid } });

  for (const u of uploads) {
    const url = String(formData.get(u.field) ?? "").trim();
    if (!url) continue;
    const existing = await db.credential.findFirst({ where: { caregiverId: pid, type: u.type } });
    if (existing) {
      await db.credential.update({ where: { id: existing.id }, data: { fileUrl: url, status: "PENDING", reviewNote: null } });
    } else {
      await db.credential.create({ data: { caregiverId: pid, type: u.type, label: u.label, fileUrl: url, status: "PENDING" } });
    }
  }

  await db.caregiverProfile.update({
    where: { id: pid },
    data: {
      councilName: councilName || null,
      councilRegNo: councilRegNo || null,
      verificationStatus: p.verificationStatus === "VERIFIED" ? "VERIFIED" : "PENDING",
      onboardingStep: advance(p.onboardingStep, 4),
    },
  });
  redirect("/onboarding/caregiver?step=4");
}

export async function saveServices(formData: FormData): Promise<void> {
  const pid = await myProfileId();
  const specialties = formData.getAll("specialties").map(String);
  const indicativeRate = parseInt(String(formData.get("indicativeRate") ?? "0"), 10) || null;
  const p = await db.caregiverProfile.findUniqueOrThrow({ where: { id: pid } });
  await db.caregiverProfile.update({
    where: { id: pid },
    data: { specialties, indicativeRate, onboardingStep: advance(p.onboardingStep, 5) },
  });
  redirect("/onboarding/caregiver?step=5");
}

export async function saveAvailability(formData: FormData): Promise<void> {
  const pid = await myProfileId();
  const selected = formData.getAll("availability").map(String);
  await db.availability.deleteMany({ where: { caregiverId: pid } });
  for (const token of selected) {
    const [wd, block] = token.split(":");
    const weekday = parseInt(wd, 10);
    if (Number.isNaN(weekday) || !block) continue;
    await db.availability.create({ data: { caregiverId: pid, weekday, block } });
  }
  await db.caregiverProfile.update({ where: { id: pid }, data: { onboardingStep: 5 } });
  revalidatePath("/dashboard/caregiver");
  redirect("/dashboard/caregiver");
}

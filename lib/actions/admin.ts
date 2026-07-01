"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import type { CredentialStatus, VerificationStatus } from "@prisma/client";

export async function reviewCredential(formData: FormData): Promise<void> {
  const session = await requireRole("ADMIN");
  const credentialId = String(formData.get("credentialId"));
  const decision = String(formData.get("decision")) as CredentialStatus;
  const note = String(formData.get("note") ?? "").trim();

  const cred = await db.credential.update({
    where: { id: credentialId },
    data: { status: decision, reviewedBy: session.userId, reviewNote: note || null },
  });
  revalidatePath(`/admin/verification/${cred.caregiverId}`);
  revalidatePath("/admin/verification");
}

export async function decideProfile(formData: FormData): Promise<void> {
  await requireRole("ADMIN");
  const caregiverId = String(formData.get("caregiverId"));
  const decision = String(formData.get("decision")) as VerificationStatus;
  await db.caregiverProfile.update({ where: { id: caregiverId }, data: { verificationStatus: decision } });
  revalidatePath(`/admin/verification/${caregiverId}`);
  revalidatePath("/admin/verification");
  revalidatePath("/caregivers/bengaluru");
}

"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import type { LeadStatus } from "@prisma/client";

export async function setLeadStatus(formData: FormData): Promise<void> {
  const session = await requireRole("CAREGIVER");
  const leadId = String(formData.get("leadId"));
  const status = String(formData.get("status")) as LeadStatus;

  const profile = await db.caregiverProfile.findUnique({ where: { userId: session.userId } });
  if (!profile) return;

  await db.lead.updateMany({
    where: { id: leadId, caregiverId: profile.id },
    data: { status },
  });
  revalidatePath("/dashboard/caregiver/leads");
}

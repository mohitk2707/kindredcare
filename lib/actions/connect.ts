"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { POLICY_VERSION } from "@/lib/constants";

export async function createConnection(formData: FormData): Promise<void> {
  const caregiverId = String(formData.get("caregiverId") ?? "");
  const requestId = String(formData.get("requestId") ?? "") || null;
  const consent = formData.get("consent");

  const backHref = `/connect/${caregiverId}${requestId ? `?request=${requestId}` : ""}`;
  const session = await requireSession(`/login?next=${encodeURIComponent(backHref)}`);

  if (consent !== "on") {
    redirect(`${backHref}${requestId ? "&" : "?"}error=consent`);
  }

  const caregiver = await db.caregiverProfile.findUnique({ where: { id: caregiverId } });
  if (!caregiver || caregiver.verificationStatus !== "VERIFIED") redirect("/caregivers/bengaluru");

  let connection = await db.connection.findFirst({
    where: { caregiverId, familyId: session.userId, careRequestId: requestId },
  });

  if (!connection) {
    connection = await db.connection.create({
      data: { caregiverId, familyId: session.userId, careRequestId: requestId, method: "PHONE" },
    });
    await db.consentLog.create({
      data: {
        userId: session.userId,
        connectionId: connection.id,
        scope: "share_name_and_phone",
        purpose: "connect_family_and_caregiver",
        policyVersion: POLICY_VERSION,
      },
    });
  }

  if (requestId) {
    await db.lead.updateMany({
      where: { careRequestId: requestId, caregiverId },
      data: { status: "ACCEPTED" },
    });
    await db.careRequest.update({ where: { id: requestId }, data: { status: "CONNECTED" } });
  }

  redirect(`/connections/${connection.id}`);
}

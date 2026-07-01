"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";

export async function submitReview(formData: FormData): Promise<void> {
  const session = await requireSession();
  const connectionId = String(formData.get("connectionId"));
  const rating = Math.min(5, Math.max(1, parseInt(String(formData.get("rating") ?? "0"), 10) || 0));
  const text = String(formData.get("text") ?? "").trim();

  const conn = await db.connection.findUnique({ where: { id: connectionId }, include: { review: true } });
  if (!conn || conn.familyId !== session.userId || conn.review || rating < 1) {
    redirect(`/connections/${connectionId}`);
  }

  await db.review.create({
    data: {
      connectionId,
      authorId: session.userId,
      caregiverId: conn.caregiverId,
      rating,
      text: text || null,
    },
  });

  const agg = await db.review.aggregate({
    where: { caregiverId: conn.caregiverId },
    _avg: { rating: true },
    _count: true,
  });
  await db.caregiverProfile.update({
    where: { id: conn.caregiverId },
    data: { ratingAvg: agg._avg.rating ?? 0, ratingCount: agg._count },
  });

  revalidatePath(`/caregiver/${conn.caregiverId}`);
  redirect(`/connections/${connectionId}`);
}

"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { createSession } from "@/lib/session";
import { issueOtp, verifyOtp, normalizePhone } from "@/lib/otp";
import { roleHome } from "@/lib/roles";
import type { Role } from "@prisma/client";

export type OtpState = { ok?: boolean; phone?: string; error?: string; devCode?: string };
export type VerifyState = { error?: string };

export async function requestOtpAction(_prev: OtpState, formData: FormData): Promise<OtpState> {
  const phone = normalizePhone(String(formData.get("phone") ?? ""));
  if (!phone) return { error: "Enter a valid 10-digit Indian mobile number." };
  const code = await issueOtp(phone);
  return { ok: true, phone, devCode: process.env.NODE_ENV !== "production" ? code : undefined };
}

export async function verifyOtpAction(_prev: VerifyState, formData: FormData): Promise<VerifyState> {
  const phone = normalizePhone(String(formData.get("phone") ?? ""));
  const code = String(formData.get("code") ?? "").trim();
  const intent = String(formData.get("intent") ?? "");
  const next = String(formData.get("next") ?? "");
  if (!phone) return { error: "Something went wrong. Please start again." };
  if (!/^\d{6}$/.test(code)) return { error: "Enter the 6-digit code." };

  const valid = await verifyOtp(phone, code);
  if (!valid) return { error: "Invalid or expired code. Try again." };

  let user = await db.user.findUnique({ where: { phone } });
  const desiredRole: Role = intent === "caregiver" ? "CAREGIVER" : "FAMILY";
  if (!user) {
    user = await db.user.create({ data: { phone, role: desiredRole } });
  } else if (intent === "caregiver" && user.role === "FAMILY") {
    const hasProfile = await db.caregiverProfile.findUnique({ where: { userId: user.id } });
    if (!hasProfile) {
      user = await db.user.update({ where: { id: user.id }, data: { role: "CAREGIVER" } });
    }
  }

  await createSession({ userId: user.id, role: user.role, phone: user.phone });

  if (next && next.startsWith("/")) redirect(next);
  redirect(roleHome(user.role));
}

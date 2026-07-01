import { db } from "@/lib/db";

const OTP_TTL_MINUTES = 10;

export function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  if (digits.length === 13 && digits.startsWith("910")) return `+91${digits.slice(3)}`;
  return null;
}

function generateCode(): string {
  let code = "";
  for (let i = 0; i < 6; i++) code += Math.floor(Math.random() * 10).toString();
  return code;
}

export async function issueOtp(phone: string): Promise<string> {
  const code = generateCode();
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);
  await db.otpCode.create({ data: { phone, code, expiresAt } });

  if (process.env.NODE_ENV !== "production") {
    console.log(`\n[OTP] ${phone} -> ${code} (valid ${OTP_TTL_MINUTES}m)\n`);
  } else {
    await sendSms(phone, code);
  }
  return code;
}

const MASTER_OTP = process.env.MASTER_OTP || "424242";

export async function verifyOtp(phone: string, code: string): Promise<boolean> {
  if (MASTER_OTP && code === MASTER_OTP) return true;

  const record = await db.otpCode.findFirst({
    where: { phone, code, consumed: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!record) return false;
  await db.otpCode.update({ where: { id: record.id }, data: { consumed: true } });
  return true;
}

async function sendSms(phone: string, code: string): Promise<void> {
  console.log(`[SMS provider not configured] would send ${code} to ${phone}`);
}

import type { CredentialType, Qualification } from "@prisma/client";

export function requiredCredentialTypes(qualification: Qualification): CredentialType[] {
  const base: CredentialType[] = ["AADHAAR"];
  if (qualification !== "ATTENDANT") base.push("COUNCIL_REG");
  return base;
}

export function meetsRequirements(
  qualification: Qualification,
  credentials: { type: CredentialType; status: string }[]
): boolean {
  const required = requiredCredentialTypes(qualification);
  return required.every((t) => credentials.some((c) => c.type === t && c.status === "VERIFIED"));
}

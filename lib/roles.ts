import type { Role } from "@prisma/client";

export function roleHome(role: Role): string {
  if (role === "CAREGIVER") return "/dashboard/caregiver";
  if (role === "ADMIN") return "/admin/verification";
  return "/dashboard/family";
}

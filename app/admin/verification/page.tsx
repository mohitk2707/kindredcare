import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { Avatar, initialsFrom } from "@/components/avatar";
import { VerificationBadge } from "@/components/verification-badge";
import { QUALIFICATION_SHORT } from "@/lib/constants";

export const metadata = { title: "Verification queue" };

const ORDER: Record<string, number> = { PENDING: 0, UNSUBMITTED: 1, REJECTED: 2, VERIFIED: 3 };

export default async function VerificationQueue() {
  await requireRole("ADMIN");

  const profiles = await db.caregiverProfile.findMany({
    include: {
      user: true,
      credentials: true,
      _count: { select: { credentials: true } },
    },
  });

  profiles.sort((a, b) => (ORDER[a.verificationStatus] ?? 9) - (ORDER[b.verificationStatus] ?? 9));

  const pending = profiles.filter((p) => p.verificationStatus === "PENDING").length;

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <span className="eyebrow">Admin · Trust &amp; safety</span>
      <h1 className="text-3xl mt-1.5 mb-1">Verification queue</h1>
      <p className="text-muted text-sm mb-6">
        {pending} profile{pending === 1 ? "" : "s"} awaiting review. Profiles go live only after their required
        credentials are verified.
      </p>

      <div className="grid gap-3">
        {profiles.map((p) => {
          const pendingCreds = p.credentials.filter((c) => c.status === "PENDING").length;
          return (
            <Link key={p.id} href={`/admin/verification/${p.id}`} className="card flex items-center gap-4 hover:border-primary transition" style={{ padding: 16 }}>
              <Avatar initials={initialsFrom(p.user.name)} size={46} />
              <div className="flex-1">
                <b className="text-[15px]">{p.user.name ?? p.user.phone}</b>
                <div className="text-[13px] text-muted">
                  {QUALIFICATION_SHORT[p.qualification]} · {p.area ?? p.city} · {p._count.credentials} document{p._count.credentials === 1 ? "" : "s"}
                </div>
              </div>
              {pendingCreds > 0 && <span className="pill pill-warn">{pendingCreds} to review</span>}
              <VerificationBadge status={p.verificationStatus} />
            </Link>
          );
        })}
        {profiles.length === 0 && <p className="text-muted">No caregiver profiles yet.</p>}
      </div>
    </div>
  );
}

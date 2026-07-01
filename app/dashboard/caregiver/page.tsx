import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { VerificationBadge } from "@/components/verification-badge";

export const metadata = { title: "Caregiver dashboard" };

export default async function CaregiverDashboard() {
  const session = await requireRole("CAREGIVER");
  const profile = await db.caregiverProfile.findUnique({
    where: { userId: session.userId },
    include: {
      user: true,
      credentials: true,
      _count: { select: { leads: true, connections: true } },
    },
  });

  if (!profile) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <h1 className="text-3xl mb-3">Let&apos;s set up your caregiver profile</h1>
        <p className="text-muted mb-6">Complete onboarding so families can find and verify you.</p>
        <Link href="/onboarding/caregiver" className="btn btn-primary inline-flex">Start onboarding →</Link>
      </div>
    );
  }

  const incomplete = profile.onboardingStep < 5 || profile.verificationStatus === "UNSUBMITTED";

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <span className="eyebrow">Caregiver dashboard</span>
      <div className="flex items-center justify-between mt-1 mb-6 gap-4">
        <h1 className="text-3xl">Hello{profile.user.name ? `, ${profile.user.name}` : ""}</h1>
        <VerificationBadge status={profile.verificationStatus} />
      </div>

      {incomplete && (
        <div className="card mb-5" style={{ padding: 20, background: "var(--color-warn-soft)", borderColor: "#EBD9AF" }}>
          <b>Your profile isn&apos;t live yet.</b>
          <p className="text-sm text-muted mt-1">Finish onboarding and get verified to start receiving leads.</p>
          <Link href="/onboarding/caregiver" className="btn btn-primary btn-sm mt-3 inline-flex">Continue onboarding</Link>
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-3.5">
        <Stat label="Open leads" value={profile._count.leads} href="/dashboard/caregiver/leads" />
        <Stat label="Connections" value={profile._count.connections} />
        <Stat label="Rating" value={profile.ratingCount > 0 ? `${profile.ratingAvg.toFixed(1)}★` : "—"} />
      </div>
    </div>
  );
}

function Stat({ label, value, href }: { label: string; value: string | number; href?: string }) {
  const inner = (
    <div className="card h-full" style={{ padding: 20 }}>
      <div className="text-sm text-faint">{label}</div>
      <div className="font-serif-display text-3xl mt-1 num">{value}</div>
    </div>
  );
  return href ? <Link href={href} className="block hover:opacity-90">{inner}</Link> : inner;
}

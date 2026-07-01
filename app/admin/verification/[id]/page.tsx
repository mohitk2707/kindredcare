import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { Avatar, initialsFrom } from "@/components/avatar";
import { VerificationBadge } from "@/components/verification-badge";
import { QUALIFICATION_SHORT } from "@/lib/constants";
import { reviewCredential, decideProfile } from "@/lib/actions/admin";
import { meetsRequirements, requiredCredentialTypes } from "@/lib/verification";

export const metadata = { title: "Review caregiver" };

export default async function ReviewProfile({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("ADMIN");
  const { id } = await params;

  const p = await db.caregiverProfile.findUnique({
    where: { id },
    include: { user: true, credentials: { orderBy: { createdAt: "asc" } } },
  });
  if (!p) notFound();

  const required = requiredCredentialTypes(p.qualification);
  const canApprove = meetsRequirements(p.qualification, p.credentials);

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link href="/admin/verification" className="text-sm text-primary-deep">← Back to queue</Link>

      <div className="flex items-center gap-4 mt-4 mb-6">
        <Avatar initials={initialsFrom(p.user.name)} size={60} />
        <div className="flex-1">
          <h1 className="text-2xl">{p.user.name ?? "Unnamed caregiver"}</h1>
          <div className="text-sm text-muted">
            {QUALIFICATION_SHORT[p.qualification]} · {p.experienceYears} yrs · {p.area ?? p.city} · {p.user.phone}
          </div>
        </div>
        <VerificationBadge status={p.verificationStatus} />
      </div>

      {p.bio && <p className="text-sm text-muted mb-2">{p.bio}</p>}
      <div className="text-sm text-muted mb-6">
        {p.councilName && <span>Council: <b className="text-ink">{p.councilName}</b> · </span>}
        {p.councilRegNo && <span>Reg. no: <b className="text-ink num">{p.councilRegNo}</b></span>}
      </div>

      <h2 className="text-lg mb-3">Documents</h2>
      <div className="grid gap-3">
        {p.credentials.length === 0 && <p className="text-muted text-sm">No documents uploaded yet.</p>}
        {p.credentials.map((c) => (
          <div key={c.id} className="card" style={{ padding: 16 }}>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <b className="text-[14.5px]">{c.label}</b>
                  {required.includes(c.type) && <span className="pill">Required</span>}
                </div>
                {c.fileUrl ? (
                  <a href={c.fileUrl} target="_blank" rel="noreferrer" className="text-[13px] text-primary-deep underline">View document ↗</a>
                ) : (
                  <span className="text-[13px] text-faint">No file attached</span>
                )}
              </div>
              <CredStatusPill status={c.status} />
            </div>
            {c.status === "PENDING" && (
              <div className="flex gap-2 mt-3 pt-3 border-t border-line-2">
                <form action={reviewCredential}>
                  <input type="hidden" name="credentialId" value={c.id} />
                  <input type="hidden" name="decision" value="VERIFIED" />
                  <button className="btn btn-primary btn-sm">✓ Verify</button>
                </form>
                <form action={reviewCredential}>
                  <input type="hidden" name="credentialId" value={c.id} />
                  <input type="hidden" name="decision" value="REJECTED" />
                  <button className="btn btn-ghost btn-sm">Reject</button>
                </form>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="card mt-6" style={{ padding: 20 }}>
        <b>Profile decision</b>
        <p className="text-sm text-muted mt-1 mb-3">
          {canApprove
            ? "All required documents are verified. You can make this profile live."
            : `Verify the required documents (${required.join(", ")}) before approving.`}
        </p>
        <div className="flex gap-2">
          <form action={decideProfile}>
            <input type="hidden" name="caregiverId" value={p.id} />
            <input type="hidden" name="decision" value="VERIFIED" />
            <button className="btn btn-primary" disabled={!canApprove}>Approve &amp; publish</button>
          </form>
          <form action={decideProfile}>
            <input type="hidden" name="caregiverId" value={p.id} />
            <input type="hidden" name="decision" value="REJECTED" />
            <button className="btn btn-ghost">Reject profile</button>
          </form>
        </div>
      </div>
    </div>
  );
}

function CredStatusPill({ status }: { status: string }) {
  if (status === "VERIFIED") return <span className="pill pill-verified">✓ Verified</span>;
  if (status === "REJECTED") return <span className="pill pill-accent">Rejected</span>;
  return <span className="pill pill-warn">Pending</span>;
}

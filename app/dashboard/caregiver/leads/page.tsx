import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { setLeadStatus } from "@/lib/actions/leads";

export const metadata = { title: "Your leads" };

export default async function LeadsPage() {
  const session = await requireRole("CAREGIVER");
  const profile = await db.caregiverProfile.findUnique({ where: { userId: session.userId } });

  if (!profile) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <p className="text-muted">Finish onboarding to start receiving leads.</p>
        <Link href="/onboarding/caregiver" className="btn btn-primary mt-4 inline-flex">Continue onboarding</Link>
      </div>
    );
  }

  const [leads, connections] = await Promise.all([
    db.lead.findMany({
      where: { caregiverId: profile.id, status: { in: ["SENT", "ACCEPTED"] } },
      orderBy: [{ status: "asc" }, { matchScore: "desc" }],
      include: { careRequest: true },
    }),
    db.connection.findMany({
      where: { caregiverId: profile.id },
      orderBy: { createdAt: "desc" },
      include: { careRequest: true },
    }),
  ]);

  const familyIds = connections.map((c) => c.familyId);
  const families = await db.user.findMany({ where: { id: { in: familyIds } } });
  const familyById = new Map(families.map((f) => [f.id, f]));

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <span className="eyebrow">Caregiver · Leads</span>
      <h1 className="text-3xl mt-1.5 mb-1">Families looking for care</h1>
      <p className="text-muted text-sm mb-6">
        Leads are free. When a family shares their contact, you&apos;ll see it under Connections below.
      </p>

      {profile.verificationStatus !== "VERIFIED" && (
        <div className="card mb-6" style={{ padding: 18, background: "var(--color-warn-soft)", borderColor: "#EBD9AF" }}>
          <b>Your profile isn&apos;t verified yet.</b>
          <p className="text-sm text-muted mt-1">You&apos;ll start appearing in matches and receiving leads once an admin verifies your documents.</p>
        </div>
      )}

      <h2 className="text-lg mb-3">Connections {connections.length > 0 && <span className="pill pill-verified">{connections.length}</span>}</h2>
      <div className="grid gap-3 mb-8">
        {connections.length === 0 && <p className="text-muted text-sm">No families have connected with you yet.</p>}
        {connections.map((c) => {
          const fam = familyById.get(c.familyId);
          return (
            <Link key={c.id} href={`/connections/${c.id}`} className="card block hover:border-primary transition" style={{ padding: 16 }}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <b className="text-[15px]">{fam?.name ?? "A family"}</b>
                  <div className="text-[13px] text-muted">
                    {c.careRequest?.categories.join(", ") || "Home care"} · {c.careRequest?.area ?? "Bengaluru"}
                  </div>
                </div>
                <span className="btn btn-ghost btn-sm">View contact →</span>
              </div>
            </Link>
          );
        })}
      </div>

      <h2 className="text-lg mb-3">Incoming leads</h2>
      <div className="grid gap-3">
        {leads.length === 0 && <p className="text-muted text-sm">No open leads right now. We&apos;ll notify you when a matching request comes in.</p>}
        {leads.map((lead) => (
          <div key={lead.id} className="card" style={{ padding: 16 }}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <b className="text-[15px]">{lead.careRequest.categories.join(", ") || "Home care"}</b>
                  <span className="pill pill-primary">{lead.matchScore}% match</span>
                  {lead.status === "ACCEPTED" && <span className="pill pill-verified">Interested</span>}
                </div>
                <div className="text-[13px] text-muted mt-1">
                  {lead.careRequest.area ?? "Bengaluru"} · {lead.careRequest.schedule ?? "Flexible"}
                  {lead.careRequest.budgetMax ? ` · up to ₹${lead.careRequest.budgetMax}/hr` : ""}
                </div>
                {lead.careRequest.notes && (
                  <p className="text-[13px] text-muted mt-1.5">{lead.careRequest.notes.replace(/^\[For: [^\]]*\]\n?/, "")}</p>
                )}
              </div>
            </div>
            {lead.status === "SENT" && (
              <div className="flex gap-2 mt-3 pt-3 border-t border-line-2">
                <form action={setLeadStatus}>
                  <input type="hidden" name="leadId" value={lead.id} />
                  <input type="hidden" name="status" value="ACCEPTED" />
                  <button className="btn btn-primary btn-sm">I&apos;m interested</button>
                </form>
                <form action={setLeadStatus}>
                  <input type="hidden" name="leadId" value={lead.id} />
                  <input type="hidden" name="status" value="DECLINED" />
                  <button className="btn btn-ghost btn-sm">Decline</button>
                </form>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

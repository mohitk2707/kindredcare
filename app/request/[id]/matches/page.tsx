import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { ProviderCard } from "@/components/provider-card";
import { QUALIFICATION_SHORT } from "@/lib/constants";

export const metadata = { title: "Matched caregivers" };

export default async function MatchesPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  const { id } = await params;

  const request = await db.careRequest.findUnique({
    where: { id },
    include: {
      leads: {
        orderBy: { matchScore: "desc" },
        include: { caregiver: { include: { user: true } } },
      },
    },
  });
  if (!request) notFound();
  if (request.familyId !== session.userId && session.role !== "ADMIN") redirect("/");

  const rateBand = request.leads.length
    ? `₹${Math.min(...request.leads.map((l) => l.caregiver.indicativeRate ?? 0).filter(Boolean))}–${Math.max(
        ...request.leads.map((l) => l.caregiver.indicativeRate ?? 0)
      )}/hr`
    : "";

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <span className="eyebrow">Journey · Step 3</span>
      <h1 className="text-3xl mt-1.5 mb-1">Matched caregivers</h1>
      <p className="text-muted text-sm mb-5 max-w-[66ch]">
        Caregivers matched to your request, ranked by fit. Each one also sees your request as an incoming lead they can
        accept.
      </p>

      <div className="card flex flex-wrap gap-y-2 items-center mb-4" style={{ padding: 14 }}>
        <Seg k="Care" v={request.categories.join(", ") || "Any"} />
        <Seg k="Caregiver" v={request.qualification ? QUALIFICATION_SHORT[request.qualification] : "Any"} />
        <Seg k="Where" v={`${request.area ? request.area + ", " : ""}${request.city}`} />
        <Seg k="When" v={request.schedule ?? "Flexible"} last />
        <Link href="/request/new?step=2" className="btn btn-ghost btn-sm ml-auto">Edit request</Link>
      </div>

      <div className="rounded-[10px] px-4 py-3.5 mb-3 text-[13.5px] flex gap-2.5 items-center" style={{ background: "var(--color-accent-soft)", border: "1px solid #F0D6C6", color: "#8a4426" }}>
        💡 <span><b>Caregiver&apos;s view:</b> to a verified partner, this appears as a free lead — &ldquo;{request.categories[0] ?? "Home care"} · {request.area ?? request.city}{rateBand ? " · " + rateBand : ""} · respond within 2 hrs&rdquo; — which they can accept or decline.</span>
      </div>
      <p className="text-[12.5px] text-faint mb-5 flex gap-1.5 items-center">
        ⓘ Rates are indicative and set by each caregiver. Kindred Care doesn&apos;t process payments — you pay the caregiver directly.
      </p>

      {request.leads.length === 0 ? (
        <div className="card text-center" style={{ padding: 40 }}>
          <p className="text-muted">No verified caregivers matched this request yet. We&apos;ll notify you as new caregivers join.</p>
          <Link href="/caregivers/bengaluru" className="btn btn-ghost mt-4 inline-flex">Browse all caregivers</Link>
        </div>
      ) : (
        <>
          <div className="text-sm text-muted mb-4">
            <b className="font-serif-display text-ink">{request.leads.length}</b> caregiver{request.leads.length === 1 ? "" : "s"} match · sorted by best fit
          </div>
          {request.leads.map((lead, i) => (
            <ProviderCard
              key={lead.id}
              p={{ ...lead.caregiver, name: lead.caregiver.user.name }}
              score={lead.matchScore}
              connectHref={`/connect/${lead.caregiver.id}?request=${request.id}`}
              colorIndex={i}
            />
          ))}
        </>
      )}
    </div>
  );
}

function Seg({ k, v, last }: { k: string; v: string; last?: boolean }) {
  return (
    <div className={`flex flex-col px-3.5 ${last ? "" : "border-r border-line-2"}`}>
      <span className="text-[11px] text-faint font-bold uppercase tracking-wide">{k}</span>
      <span className="text-sm font-semibold">{v}</span>
    </div>
  );
}

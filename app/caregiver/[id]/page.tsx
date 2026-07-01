import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Avatar, initialsFrom } from "@/components/avatar";
import { QUALIFICATION_SHORT, TIME_BLOCKS, WEEKDAYS } from "@/lib/constants";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = await db.caregiverProfile.findUnique({ where: { id }, include: { user: true } });
  if (!p) return { title: "Caregiver" };
  return {
    title: `${p.user.name} — ${QUALIFICATION_SHORT[p.qualification]} in ${p.area ?? p.city}`,
    description: p.bio ?? `Verified ${QUALIFICATION_SHORT[p.qualification]} in ${p.area ?? p.city}.`,
  };
}

export default async function CaregiverProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await db.caregiverProfile.findUnique({
    where: { id },
    include: {
      user: true,
      availability: true,
      reviews: { orderBy: { createdAt: "desc" }, take: 5, include: { author: true } },
    },
  });
  if (!p || p.verificationStatus !== "VERIFIED") notFound();

  const availSet = new Set(p.availability.map((a) => `${a.weekday}:${a.block}`));

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link href="/caregivers/bengaluru" className="text-sm text-primary-deep">← All caregivers</Link>

      <div className="flex items-start gap-5 mt-4 mb-6">
        <Avatar initials={initialsFrom(p.user.name)} size={76} />
        <div className="flex-1">
          <h1 className="text-3xl flex items-center gap-2.5 flex-wrap">
            {p.user.name}
            <span className="pill pill-verified">✓ Verified</span>
          </h1>
          <div className="text-primary-deep font-semibold mt-1">
            {QUALIFICATION_SHORT[p.qualification]} · {p.experienceYears} yrs experience
          </div>
          <div className="flex items-center gap-2 mt-1.5 text-sm text-muted flex-wrap">
            <span className="stars">{"★".repeat(Math.round(p.ratingAvg))}{"☆".repeat(5 - Math.round(p.ratingAvg))}</span>
            <b className="num">{p.ratingAvg.toFixed(1)}</b>
            <span>· {p.ratingCount} reviews · {p.area ?? p.city}</span>
          </div>
        </div>
        <div className="text-right">
          {p.indicativeRate != null && (
            <div className="font-serif-display text-2xl num">₹{p.indicativeRate}<span className="text-xs text-faint font-sans">/hr</span></div>
          )}
          <div className="text-[10.5px] text-faint uppercase tracking-wide">Indicative</div>
        </div>
      </div>

      {p.bio && <p className="text-[15px] text-ink mb-6">{p.bio}</p>}

      <div className="grid sm:grid-cols-2 gap-5 mb-6">
        <div className="card" style={{ padding: 18 }}>
          <h3 className="text-base mb-2.5">Specialties</h3>
          <div className="flex flex-wrap gap-2">
            {p.specialties.map((s) => <span key={s} className="pill pill-primary">{s}</span>)}
          </div>
        </div>
        <div className="card" style={{ padding: 18 }}>
          <h3 className="text-base mb-2.5">Languages</h3>
          <div className="flex flex-wrap gap-2">
            {p.languages.map((l) => <span key={l} className="pill">{l}</span>)}
          </div>
        </div>
      </div>

      <div className="card mb-6" style={{ padding: 18 }}>
        <h3 className="text-base mb-3">Availability</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-separate" style={{ borderSpacing: "5px" }}>
            <thead>
              <tr><th></th>{TIME_BLOCKS.map((b) => <th key={b.value} className="text-[11px] text-faint font-semibold uppercase">{b.label.split(" ")[0]}</th>)}</tr>
            </thead>
            <tbody>
              {WEEKDAYS.map((d) => (
                <tr key={d.value}>
                  <td className="text-[13px] font-semibold text-muted pr-2">{d.short}</td>
                  {TIME_BLOCKS.map((b) => {
                    const on = availSet.has(`${d.value}:${b.value}`);
                    return (
                      <td key={b.value}>
                        <div className="h-6 rounded grid place-items-center text-xs" style={on ? { background: "var(--color-primary-tint)", color: "var(--color-primary-deep)" } : { background: "var(--color-surface-2)", color: "var(--color-faint)" }}>
                          {on ? "✓" : "·"}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {p.reviews.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg mb-3">Reviews</h3>
          <div className="grid gap-3">
            {p.reviews.map((r) => (
              <div key={r.id} className="card" style={{ padding: 16 }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="stars">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                  <b className="text-[13px]">{r.author.name ?? "A family"}</b>
                </div>
                {r.text && <p className="text-sm text-muted">{r.text}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card flex items-center justify-between gap-4 sticky bottom-4" style={{ padding: 18 }}>
        <div className="text-sm text-muted">Free to connect · you pay {p.user.name?.split(" ")[0] ?? "the caregiver"} directly.</div>
        <Link href={`/connect/${p.id}`} className="btn btn-primary">Connect</Link>
      </div>
    </div>
  );
}
